# cohort_users_api.py
from fastapi import APIRouter, Query, HTTPException
from database import SessionLocal
from models import UserProfile
import ast
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

router = APIRouter()

@router.get("/api/cohort/users")
def get_similar_users(
    cohort: str = Query(...),
    limit: int = Query(10),
    offset: int = Query(0)
):
    db = SessionLocal()
    try:
        profiles = db.query(UserProfile).all()
        data = []
        for p in profiles:
            cohorts = p.cohorts.split(",") if p.cohorts else []
            if any(cohort.lower() in c.lower() for c in cohorts):
                try:
                    if isinstance(p.interests, str):
                        if p.interests.startswith("["):
                            interests = ast.literal_eval(p.interests)
                        else:
                            interests = [s.strip() for s in p.interests.split(",")]
                    elif isinstance(p.interests, list):
                        interests = p.interests
                    else:
                        interests = []
                except Exception:
                        interests = []
                data.append({
                    "email": p.email,
                    "interests": " ".join(interests)
                })

        if not data:
            raise HTTPException(status_code=404, detail=f"No users found for cohort '{cohort}'.")

        df = pd.DataFrame(data)
        tfidf = TfidfVectorizer()
        tfidf_matrix = tfidf.fit_transform(df["interests"])

        sim_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix).flatten()
        df["similarity_score"] = sim_scores

        result = df.sort_values("similarity_score", ascending=False).iloc[offset:offset+limit][["email", "similarity_score"]]

        return {
            "cohort": cohort,
            "users": result.to_dict(orient="records")
        }
    finally:
        db.close()
