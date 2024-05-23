# -------------------------------------------------------------
# Project: IDG2001 Cloud Technologies - assignment 2
# File: main.py
# Brief: FastAPI routes handler
# Author: Tomas Hladky <tomashl@stud.ntnu.no>
# Date: May 20th, 2024
# -------------------------------------------------------------

import os
import sys
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Cookie, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import crud, models, schemas, password_utils, jwt_utils, validation
from database import SessionLocal, engine

# Setup logger
logger = logging.getLogger(__name__)
stream_handler = logging.StreamHandler(sys.stderr)
log_formatter = logging.Formatter("%(asctime)s | %(name)s: %(message)s")
stream_handler.setFormatter(log_formatter)
logger.addHandler(stream_handler)

models.Base.metadata.create_all(bind=engine)
app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Enable cors
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()


def setup():
    pass


setup()


@app.post("/login")
def login_user(
    user: schemas.UserCreate, response: Response, db: Session = Depends(get_db)
):
    db_user = crud.get_user_by_email(db, user.email)

    # Check if user exists in DB
    if db_user is None:
        raise HTTPException(status_code=400, detail="Invalid login credentials")

    # Check user's password
    if not password_utils.check_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid login credentials")

    # User successfully signed in, now generate JWT token for further auth
    token = jwt_utils.generate_token(db_user.id)

    response.set_cookie(key="token", value=token, httponly=True)

    return {"success": True}


@app.post("/create-user")
def register_user(
    user: schemas.UserCreate, response: Response, db: Session = Depends(get_db)
):
    db_user = crud.get_user_by_email(db, user.email)

    if db_user is not None:
        raise HTTPException(
            status_code=409, detail="User with this email already exists"
        )

    hashed_password = password_utils.create_hashed_password(user.password)

    valid, reason = validation.valid_username(user.username)
    if not valid:
        raise HTTPException(status_code=400, detail=reason)

    valid, reason = validation.valid_email(user.email)
    if not valid:
        raise HTTPException(status_code=400, detail=reason)

    valid, reason = validation.valid_password(user.password)
    if not valid:
        raise HTTPException(status_code=400, detail=reason)

    try:
        db_user = crud.create_user(db, user, hashed_password)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error while registrying user")

    # User successfully signed up, now generate JWT token for further auth
    token = jwt_utils.generate_token(db_user.id)

    response.set_cookie(key="token", value=token, httponly=True)

    return {}


@app.post("/refresh-token")
def refresh_jwt_token(response: Response, token: Optional[str] = Cookie(None)):
    if token is None:
        raise HTTPException(status_code=400, detail="Missing user token")

    # Validate existing user JWT token
    user_id = jwt_utils.validate_token(token)

    # User successfully authenticated, now generate new JWT token
    token = jwt_utils.generate_token(user_id)

    response.set_cookie(key="token", value=token, httponly=True)

    return {}


@app.post("/get-categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@app.post("/get-category-post-count/{category_id}")
def get_category_post_count(category_id: int, db: Session = Depends(get_db)):
    return {"posts_count": crud.get_count_of_category_posts(db, category_id)}


@app.post("/get-category-posts/{category_id}")
def get_category_posts(category_id: int, offset: int, db: Session = Depends(get_db)):
    return crud.get_category_posts(db, category_id, offset)


@app.post("/get-user-post-count/{user_id}")
def get_user_posts_count(user_id: int, db: Session = Depends(get_db)):
    return {
        "posts_count": crud.get_count_of_user_posts(db, user_id),
    }


@app.post("/get-user-posts/{user_id}")
def get_user_posts(offset: int, user_id: int, db: Session = Depends(get_db)):
    return crud.get_user_posts(db, user_id, offset)
