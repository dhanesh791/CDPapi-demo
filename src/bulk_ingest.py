# bulk_ingest.py

import csv
import json
from io import StringIO, BytesIO
import datetime
import asyncio
import pandas as pd
from fastapi import UploadFile
from fastapi.responses import JSONResponse
from models import UserProfile
from database import SessionLocal
from schema import UserProfileCreate
from crud import create_or_update_user
import os
from database import engine, Base

CHUNK_SIZE = 100  # adjustable batch size


RAW_UPLOAD_DIR = "raw_uploads"

async def store_raw_file(file: UploadFile) -> str:
    os.makedirs(RAW_UPLOAD_DIR, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    path = os.path.join(RAW_UPLOAD_DIR, filename)

    contents = await file.read()
    with open(path, "wb") as f:
        f.write(contents)
    
    return path, contents
def detect_file_type(filename: str) -> str:
    if filename.endswith(".csv"):
        return "csv"
    elif filename.endswith(".json"):
        return "json"
    elif filename.endswith(".xls") or filename.endswith(".xlsx"):
        return "excel"
    else:
        raise ValueError("Unsupported file type.")


def parse_file(filetype: str, contents: bytes):
    if filetype == "csv":
        decoded = contents.decode("utf-8")
        return list(csv.DictReader(StringIO(decoded)))

    elif filetype == "json":
        decoded = contents.decode("utf-8")
        data = json.loads(decoded)
        return data if isinstance(data, list) else [data]

    elif filetype == "excel":
        df = pd.read_excel(BytesIO(contents))
        return df.to_dict(orient="records")

    else:
        raise ValueError("Unsupported file format.")


def transform_row(row: dict):
    interests_raw = row.get("interests", "")
    interests_cleaned = [
        i.strip().lower() for i in str(interests_raw).replace("[", "").replace("]", "").replace("'", "").replace('"', "").replace(",", "|").split("|")
        if i.strip()
    ]

    return {
        "cookie": row.get("cookie"),
        "email": row.get("email") or None,
        "phone_number": row.get("phone_number") or None,
        "state": row.get("state") or None,
        "city": row.get("city") or None,
        "country": row.get("country") or None,
        "age": int(row["age"]) if row.get("age") and str(row["age"]).isdigit() else None,
        "gender": row.get("gender") or None,
        "income": row.get("income") or None,
        "education": row.get("education") or None,
        "interests": interests_cleaned
    }



async def process_chunk(chunk, db, dry_run, failed_rows, success_counter, failed_counter):
    for idx, row in chunk:
        try:
            schema = UserProfileCreate(**transform_row(row))
            if not dry_run:
                create_or_update_user(db, schema)
            success_counter[0] += 1
        except Exception as e:
            failed_counter[0] += 1
            failed_rows.append({
                "row_number": idx,
                "error": str(e),
                "data": row
            })


async def handle_bulk_ingest(file: UploadFile, dry_run: bool = False):
    path, contents = await store_raw_file(file)

    filetype = detect_file_type(file.filename)
    rows = parse_file(filetype, contents)

    Base.metadata.create_all(bind=engine)   
    db = SessionLocal()
    success_counter = [0]
    failed_counter = [0]
    failed_rows = []

    chunk = []
    for idx, row in enumerate(rows, start=1):
        chunk.append((idx, row))
        if len(chunk) >= CHUNK_SIZE:
            await process_chunk(chunk, db, dry_run, failed_rows, success_counter, failed_counter)
            chunk = []
    if chunk:
        await process_chunk(chunk, db, dry_run, failed_rows, success_counter, failed_counter)

    if not dry_run:
        db.commit()
    db.close()

    if failed_rows:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        with open(f"failed_ingest_log_{timestamp}.csv", "w", newline='', encoding='utf-8') as log_file:
            writer = csv.DictWriter(log_file, fieldnames=["row_number", "error", "data"])
            writer.writeheader()
            for fr in failed_rows:
                writer.writerow(fr)

    return JSONResponse(content={
        "summary": {
            "total": success_counter[0] + failed_counter[0],
            "success": success_counter[0],
            "failed": failed_counter[0],
            "dry_run": dry_run
        },
        "failed_log": f"{len(failed_rows)} rows logged." if failed_rows else "No failures."
    })
