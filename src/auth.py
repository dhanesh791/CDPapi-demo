# src/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from fastapi import APIRouter

SECRET_KEY = "admindemo"
ALGORITHM = "HS256"
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
@router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Simple fake user check - replace this with real DB logic
    if form_data.username == "admin" and form_data.password == "admin123":
        token_data = {
            "sub": form_data.username,
            "exp": datetime.utcnow() + timedelta(minutes=30)
        }
        token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")