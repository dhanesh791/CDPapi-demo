# In main.py or a new segment_user_api.py

from fastapi import APIRouter, HTTPException
from schema import UserProfileCreate
from cleaning_utils import DataCleaner
from rules_engine import segment_user  # import your segmentation logic
import sqlite3
import ast
import pandas as pd
router = APIRouter()

@router.post("/segment-user")
def segment_user_endpoint(user: UserProfileCreate):
    try:
        # Clean the incoming data
        cleaner = DataCleaner(user)
        cleaned = cleaner.clean()

        # Apply segmentation rules
        segment = segment_user(cleaned)

        return {
            "segment": segment,
            "user_data": cleaned
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/segment/bulk-update")
def segment_all_users():
    try:
        conn = sqlite3.connect("user_profiles.db")
        cursor = conn.cursor()

        cursor.execute("SELECT cookie, email, phone_number, city, state, country, age, gender, income, education, interests FROM user_profiles")
        rows = cursor.fetchall()

        updated = 0

        for row in rows:
            cookie, email, phone, city, state, country, age, gender, income, education, interests = row

            try:
                interests = ast.literal_eval(interests) if interests else []
            except:
                interests = []

            try:
                income_val = int(income)
            except:
                income_val = 0

            user_data = {
                "cookie": cookie,
                "email": email,
                "phone_number": phone,
                "city": city,
                "state": state,
                "country": country,
                "age": int(age) if age and str(age).isdigit() else None,
                "gender": gender,
                "income": income_val,
                "education": education,
                "interests": interests,
            }

            segments = segment_user(user_data)
            segments_str = ', '.join(segments)

            cursor.execute("UPDATE user_profiles SET segments = ? WHERE cookie = ?", (segments_str, cookie))
            updated += 1

        conn.commit()
        conn.close()
        return {"message": f"✅ Segments updated for {updated} users."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
