# batch_clean.py
from sqlalchemy.orm import Session
from database import SessionLocal
from models import UserProfile
from cleaning_utils import DataCleaner


def batch_clean():
    db: Session = SessionLocal()
    try:
        users = db.query(UserProfile).all()
        updated_count = 0

        for user in users:
            cleaner = DataCleaner(user)
            cleaned = cleaner.clean()

            # Check if any values actually changed
            changed = False
            for key, value in cleaned.items():
                if getattr(user, key) != value:
                    setattr(user, key, value)
                    changed = True

            if changed:
                updated_count += 1

        db.commit()
        print(f" Cleaned and updated {updated_count} user profiles.")
    finally:
        db.close()


if __name__ == "__main__":
    batch_clean()
