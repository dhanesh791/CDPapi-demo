from kafka import KafkaConsumer
import json
from crud import create_or_update_user
from schema import UserProfileCreate
from database import SessionLocal

consumer = KafkaConsumer(
    'user-profiles',
    bootstrap_servers='localhost:9092',
    auto_offset_reset='earliest',
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    group_id='user-profile-group'
)

print("🎧 Listening for new user profiles on 'user-profiles'...")

for message in consumer:
    user_data = message.value
    print("📥 Received:", user_data)

    db = SessionLocal()
    try:
        # Only clean and store basic info up to interests
        schema = UserProfileCreate(**user_data)
        create_or_update_user(db, schema)
        db.commit()
        print("✅ Saved to DB")
    except Exception as e:
        print("❌ Error processing message:", e)
    finally:
        db.close()