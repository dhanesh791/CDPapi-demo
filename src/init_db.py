from database import engine, Base
from models import UserProfile
import sqlite3

# This will create the tables if they don't already exist
print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Done.")

