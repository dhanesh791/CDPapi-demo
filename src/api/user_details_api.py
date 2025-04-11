# user_details_api.py
from fastapi import APIRouter, HTTPException, Query
from database import SessionLocal
from models import UserProfile
import ast

router = APIRouter()

@router.get("/api/user")
def get_user_profile(cookie: str = Query(None), email: str = Query(None)):
    db = SessionLocal()
    try:
        if not cookie and not email:
            raise HTTPException(status_code=400, detail="Either 'cookie' or 'email' must be provided.")

        query = db.query(UserProfile)
        if cookie:
            profile = query.filter(UserProfile.cookie == cookie).first()
        elif email:
            profile = query.filter(UserProfile.email == email).first()

        if not profile:
            raise HTTPException(status_code=404, detail="User not found.")

        location = ", ".join(filter(None, [profile.city, profile.state, profile.country]))
        demographics = {
            "age": profile.age if profile.age else None,
            "gender": profile.gender
        }

        try:
            if isinstance(profile.interests, str):
                if profile.interests.startswith("["):
                    interests = ast.literal_eval(profile.interests)
                else:
                    interests = [s.strip() for s in profile.interests.split(",")]
            elif isinstance(profile.interests, list):
                interests = profile.interests
            else:
                interests = []
        except Exception:
                interests = []
        cohorts = profile.cohorts.split(",") if profile.cohorts else []

        return {
            "user_profile": {
                "cookie": profile.cookie,
                "email": profile.email,
                "location": location,
                "interests": interests,
                "cohorts": [c.strip() for c in cohorts]
            }
        }
    finally:
        db.close()
