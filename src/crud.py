from models import UserProfile
from schema import UserProfileCreate
from sqlalchemy.orm import Session
from cleaning_utils import DataCleaner
import logging
import os
import json
import ast
from rules_engine import segment_user
from cohort_prediction import predict_cohort

logger = logging.getLogger("profile_logger")
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)
handler = logging.FileHandler(os.path.join(log_dir, "profile_changes.log"))
formatter = logging.Formatter('[%(asctime)s] %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

def normalize_fields(data: dict) -> dict:
    # Ensure interests is JSON string
    if isinstance(data.get("interests"), list):
        data["interests"] = json.dumps(data["interests"])
    elif isinstance(data.get("interests"), str):
        try:
            parsed = json.loads(data["interests"])
            if isinstance(parsed, list):
                data["interests"] = json.dumps(parsed)
        except:
            data["interests"] = json.dumps([data["interests"]])

    # Predict cohorts and segments
    try:
        parsed_interests = json.loads(data["interests"])
        cohort_result = predict_cohort(parsed_interests)
        data["cohorts"] = ", ".join(map(str, cohort_result)) if cohort_result else "Mixed/Other"
    except:
        data["cohorts"] = "Mixed/Other"

    try:
        segment_result = segment_user(data)
        data["segments"] = ", ".join(map(str, segment_result)) if segment_result else "General"
    except:
        data["segments"] = "General"

    return data

def create_or_update_user(db: Session, user: UserProfileCreate) -> str:
    cleaner = DataCleaner(user)
    cleaned_data = cleaner.clean()
    cleaned_data = normalize_fields(cleaned_data)

    cookie = cleaned_data.get("cookie")
    email = cleaned_data.get("email")
    action = ""
    updated_fields = []
    existing_user = None

    if cookie:
        existing_user = db.query(UserProfile).filter_by(cookie=cookie).first()

    if not existing_user and email:
        existing_user = db.query(UserProfile).filter_by(email=email).first()
        if existing_user:
            try:
                if existing_user and isinstance(existing_user.interests, str):
                    existing_user_interests = set(json.loads(existing_user.interests))
                else:
                    existing_user_interests = set()
                new_interests = set(json.loads(cleaned_data.get("interests", "[]")))
                merged_interests = list(existing_user_interests.union(new_interests))
                cleaned_data["interests"] = json.dumps(merged_interests)
            except:
                cleaned_data["interests"] = json.dumps([])

            for key, value in cleaned_data.items():
                setattr(existing_user, key, value)

            db.add(existing_user)
            db.commit()
            print(f"[{cookie}] 🔄 Merged with existing email ({email}).")
            return "merged by email"

    if existing_user:
        for key, value in cleaned_data.items():
            setattr(existing_user, key, value)
        db.add(existing_user)
        db.commit()
        print(f"[{cookie}] 🔁 Updated existing user profile.")
        return "updated"

    # --- New user creation ---
    new_user = UserProfile(**cleaned_data)
    db.add(new_user)
    db.commit()
    print(f"[{cookie}] 🆕 Created new user.")

    logger.info(f"{action}: cookie={cookie}, email={email}\nUpdated fields: {', '.join(updated_fields)}")
    return action.lower()
