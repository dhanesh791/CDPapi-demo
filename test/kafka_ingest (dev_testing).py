from kafka import KafkaConsumer
import json
import sqlite3
from rules_engine import segment_user
from cohort_prediction import predict_cohort

DB_PATH = "user_profiles.db"
KAFKA_TOPIC = "user-events"
KAFKA_BOOTSTRAP_SERVERS = ["localhost:9092"]


def update_user_profile(data):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cookie = data.get("cookie")
        if not cookie:
            print("❌ Skipping: No cookie provided.")
            return

        # Segment and predict cohorts
        segments = segment_user(data)
        cohorts = predict_cohort(data.get("interests", []))

        # Prepare updates
        segments_str = ", ".join(segments)
        cohorts_str = ", ".join(cohorts)

        # Update statement
        cursor.execute("""
            UPDATE user_profiles
            SET segments = ?, cohorts = ?
            WHERE cookie = ?
        """, (segments_str, cohorts_str, cookie))

        conn.commit()
        print(f"✅ Updated user {cookie} with segments + cohorts.")
    except Exception as e:
        print(f"❌ Error updating user {data.get('cookie')}: {e}")
    finally:
        conn.close()


def run_kafka_consumer():
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        auto_offset_reset="latest",
        enable_auto_commit=True
    )

    print("🚀 Kafka consumer started. Waiting for messages...")
    for message in consumer:
        user_data = message.value
        print(f"📥 Received: {user_data.get('cookie')}")
        update_user_profile(user_data)


if __name__ == "__main__":
    run_kafka_consumer()
