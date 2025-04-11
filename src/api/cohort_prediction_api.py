# cohort_prediction_api.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import joblib
import sqlite3
import pandas as pd
import ast
from cohort_prediction import predict_cohort
import os

router = APIRouter()

# Load model components once
model = joblib.load("models/interest_segment_model.pkl")
vectorizer = joblib.load("models/interest_vectorizer.pkl")
mlb = joblib.load("models/interest_label_binarizer.pkl")

# Request model
class InterestInput(BaseModel):
    interests: List[str]


@router.post("/bulk-predict")
def batch_predict_and_update():
    try:
        db_path = "user_profiles.db"
        if not os.path.exists(db_path):
            raise HTTPException(status_code=404, detail="Database not found")

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Add 'cohorts' column if needed
        cursor.execute("PRAGMA table_info(user_profiles)")
        columns = [col[1] for col in cursor.fetchall()]
        if 'cohorts' not in columns:
            cursor.execute("ALTER TABLE user_profiles ADD COLUMN cohorts TEXT")

        df = pd.read_sql_query("SELECT * FROM user_profiles", conn)

        # Parse interests properly
        df['interests'] = df['interests'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else x)

        # Predict cohorts for each user
        df['cohorts'] = df['interests'].apply(lambda x: list(predict_cohort(x)) if x else [])
        df['cohorts'] = df['cohorts'].apply(lambda x: ', '.join(map(str, list(x))) if isinstance(x, (list, tuple)) else str(x))

        # Write back to DB
        for _, row in df.iterrows():
            cursor.execute("UPDATE user_profiles SET cohorts = ? WHERE cookie = ?", (str(row['cohorts']), row['cookie']))

        conn.commit()
        conn.close()
        return {"message": "✅ Cohorts updated in user_profiles table."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
