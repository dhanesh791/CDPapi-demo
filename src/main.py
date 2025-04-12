# main.py
from fastapi import APIRouter, FastAPI, HTTPException, Body
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from sqlalchemy import create_engine, Column, String, Integer, JSON, select, text, func, and_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi.responses import JSONResponse
from models import Base
import uvicorn
from fastapi import FastAPI, HTTPException
from batch_clean import batch_clean
from fastapi import FastAPI, UploadFile, File, Query
from bulk_ingest import handle_bulk_ingest
from typing import List
import pandas as pd
from api.user_details_api import router as user_router
from api.cohort_users_api import router as cohort_router
from api.cohort_prediction_api import router as prediction_router
from cohort_prediction import predict_cohort, load_model
from api.segment_user_api import router as segment_router
#from kafka_routes import router as kafka_router
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from api.user_details_api import router as user_router
from fastapi import Depends
from auth import verify_user
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
from jose import JWTError, jwt
from auth import router as auth_router
from datetime import timedelta, datetime



app = FastAPI()
templates = Jinja2Templates(directory="templates") 
router = APIRouter()


app = FastAPI()

# --- SQLAlchemy Setup ---
DATABASE_URL = "sqlite:///./user_profiles.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

with engine.connect() as conn:
    result = conn.execute("PRAGMA table_info(user_profiles)")
    columns = [row[1] for row in result.fetchall()]
    if 'segments' not in columns:
        conn.execute("ALTER TABLE user_profiles ADD COLUMN segments ")
# --- SQLAlchemy Model ---
class UserProfile(Base):
    __tablename__ = "user_profiles"

    cookie = Column(String, primary_key=True, index=True)
    email = Column(String, index=True, nullable=True)
    phone_number = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)
    age = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    income = Column(String, nullable=True)
    education = Column(String, nullable=True)
    interests = Column(String, nullable=True)
    cohorts = Column(String, nullable=True)
    segments = Column(String, nullable=True)
   # created_at = Column(String, nullable=True)


# --- Pydantic Model ---
class UserProfileInput(BaseModel):
    cookie: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    income: Optional[str] = None
    education: Optional[str] = None
    interests: Optional[str] = None
    cohorts: Optional[str] = None
    segments: Optional[str]= None
    


# --- Helper to merge data ---
def merge_profiles(existing: UserProfile, incoming: UserProfileInput):
    for field in ['phone_number', 'city', 'state', 'country', 'age', 'gender', 'income', 'education']:
        value = getattr(incoming, field)
        if value:
            setattr(existing, field, value)

    existing_interests = set(existing.interests or [])
    new_interests = set(incoming.interests or [])
    existing.interests = list(existing_interests.union(new_interests))
    return existing

# auth






@app.get("/")
def root():
    db = SessionLocal()
    try:
        total_users = db.query(func.count(UserProfile.cookie)).scalar()
        total_cohorts = db.query(func.count(UserProfile.cohorts)).scalar()
        total_segments = db.query(func.count(UserProfile.segments)).scalar()
        total_predictions = '45'
        # You can add more stats as needed
        return {
            "totalUsers": total_users,
            "totalCohorts": total_cohorts,
            "totalSegments": total_segments, 
            "predictionsRun": total_predictions
        }
    except Exception as e:
            print(f"Error in /api/stats: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/api/secure-users")
def secure_users(user: str = Depends(verify_user)):
    return {"message": f"Hello {user}, access granted to secure endpoint."}
app.include_router(auth_router)

@app.get("/clean-users")
def clean_users():
    try:
        batch_clean()
        return {"message": "Batch cleaning completed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# main.py

@app.post("/bulk-ingest")
async def bulk_ingest_endpoint(
    file: UploadFile = File(...),
    dry_run: bool = Query(False, description="Set to true to validate without saving")
):
    """
    Ingest a CSV file in batch.
    Supports raw file storage and chunked async processing.
    """
    return await handle_bulk_ingest(file, dry_run)

app.include_router(user_router)
app.include_router(cohort_router)

@app.post("/ingest-single/bulk-json ingest")
def ingest_bulk_users(users: List[UserProfileInput]):
    errors = []
    records_processed = 0
    db = SessionLocal()
    try:
        for data in users:
            profile = db.query(UserProfile).filter(UserProfile.cookie == data.cookie).first()

            if profile:
                updated = merge_profiles(profile, data)
                db.add(updated)
            elif data.email:
                email_profile = db.query(UserProfile).filter(UserProfile.email == data.email).first()
                if email_profile:
                    updated = merge_profiles(email_profile, data)
                    updated.cookie = data.cookie
                    db.add(updated)
                else:
                    new_profile = UserProfile(**data.dict())
                    db.add(new_profile)
            else:
                new_profile = UserProfile(**data.dict())
                db.add(new_profile)
            records_processed += 1
            db.commit()



    finally:
        db.close()
    return {
        "status": "success",
        "records_processed": records_processed,
        "errors": errors
    }
# --- Other Endpoints ---
#dashboard

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#ML

class InterestInput(BaseModel):
    interests: List[str]



app.include_router(prediction_router)

app.include_router(segment_router)

#app.include_router(kafka_router)   


app.include_router(user_router)

@app.get("/api/stats")
def get_stats():
    db = SessionLocal()
    try:
        total_users = db.query(func.count(UserProfile.cookie)).scalar()
        total_cohorts = db.query(func.count(UserProfile.cohorts)).scalar()
        total_segments = db.query(func.count(UserProfile.segments)).scalar()
        total_predictions = '45'
        # You can add more stats as needed
        return {
            "totalUsers": total_users,
            "totalCohorts": total_cohorts,
            "totalSegments": total_segments, 
            "predictionsRun": total_predictions
        }
    except Exception as e:
            print(f"Error in /api/stats: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# Get all users with pagination
@app.get("/api/users")
def get_users(skip: int = 0, limit: int = 1000):
    db = SessionLocal()
    try:
        users = db.query(UserProfile).offset(skip).limit(limit).all()
        total = db.query(func.count(UserProfile.cookie)).scalar()
        
        # Convert SQLAlchemy objects to dictionaries
        user_list = []
        for user in users:
            user_dict = {c.name: getattr(user, c.name) for c in user.__table__.columns}
            # Parse string fields that should be lists
            if user.interests:
                user_dict["interests"] = user.interests.split(",")
            if user.cohorts:
                user_dict["cohorts"] = user.cohorts.split(",")
            if user.segments:
                user_dict["segments"] = user.segments.split(",")
            user_list.append(user_dict)
            
        return {"users": user_list, "total": total}
    finally:
        db.close()
@app.post("/train")
def train_model():
    import subprocess
    result = subprocess.run(["python", "src/train_segmentation_model.py"], capture_output=True, text=True)
    if result.returncode == 0:
        return {"message": "Model trained successfully"}
    else:
        return {"error": result.stderr}
    

# --- Run ---
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
