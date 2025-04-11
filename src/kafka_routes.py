# kafka_routes.py
from fastapi import APIRouter, HTTPException
from kafka_producer import send_user_to_kafka
from schema import UserProfileCreate

router = APIRouter()

@router.post("/api/kafka/send")
def send_to_kafka(user: UserProfileCreate):
    try:
        send_user_to_kafka("user-profiles", user.dict())
        return {"message": f"User {user.cookie} sent to Kafka"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))