# app/models.py

from sqlalchemy import Column, String,Integer, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    cookie = Column(String, primary_key=True, index=True)
    email = Column(String, index=True, nullable=True)
    phone_number = Column(String, nullable=True)
    city = Column(String)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)
    age = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    income = Column(String, nullable=True)
    education = Column(String, nullable=True)
    interests = Column(String, nullable=True)
    cohorts = Column(String, nullable=True)
    segments = Column(String, nullable=True)
    
