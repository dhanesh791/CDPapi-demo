# schema.py
from pydantic import BaseModel
from typing import Optional, List

class UserProfileCreate(BaseModel):
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
    interests: Optional[List[str]] = None  # MUST be list
    cohorts: Optional[str] = None
    segments: Optional[str] = None