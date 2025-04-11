# kafka_producer.py

from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

def send_user_to_kafka(topic: str, user_data: dict):
    producer.send("user-profiles", user_data)
    producer.flush()
