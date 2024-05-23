from fastapi import HTTPException
import jwt
import datetime
import os
from dotenv import load_dotenv
from typing import Dict

JWT_SECRET = os.getenv("JWT_SECRET")

if JWT_SECRET is None:
    load_dotenv()
    JWT_SECRET = os.getenv("JWT_SECRET")


def generate_token(user_id: int):
    expiration_date = datetime.datetime.now(
        tz=datetime.timezone.utc
    ) + datetime.timedelta(days=5)
    return jwt.encode(
        {"user_id": user_id, "exp": expiration_date}, JWT_SECRET, algorithm="HS256"
    )


def validate_token(token: str):
    try:
        user_obj: Dict[str, int] | None = jwt.decode(
            token, JWT_SECRET, algorithms=["HS256"]
        )
        return user_obj["user_id"]
    except Exception as _:
        raise HTTPException(status_code=400, detail="Invalid user token")
