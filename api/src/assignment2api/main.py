# -------------------------------------------------------------
# Project: IDG2001 Cloud Technologies - assignment 2
# File: main.py
# Brief: FastAPI routes handler
# Author: Tomas Hladky <tomashl@stud.ntnu.no>
# Date: May 20th, 2024
# -------------------------------------------------------------

import sys
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Cookie, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import crud, models, schemas, password_utils, jwt_utils, validation
from likebatch import LikeBatch
from database import SessionLocal, engine

# Setup logger
logger = logging.getLogger(__name__)
stream_handler = logging.StreamHandler(sys.stderr)
log_formatter = logging.Formatter("%(asctime)s | %(name)s: %(message)s")
stream_handler.setFormatter(log_formatter)
logger.addHandler(stream_handler)

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

# Start LikeBatcher sync service
like_batch = LikeBatch()
like_batch.schedule_sync()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Enable cors
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:8001",
    "http://localhost:3000",

    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8001",

    "http://129.114.26.177",
    "http://129.114.26.177:8000",
    "http://129.114.26.177:8001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

load_dotenv()


def setup():
    pass


setup()


@app.post("/login")
def login_user(
    user: schemas.UserLogin, response: Response, db: Session = Depends(get_db)
):
    db_user = crud.get_user_by_username(db, user.username)

    # Check if user exists in DB
    if db_user is None:
        raise HTTPException(status_code=400, detail="Invalid login credentials")

    # Check user's password
    if not password_utils.check_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid login credentials")

    # User successfully signed in, now generate JWT token for further auth
    token = jwt_utils.generate_token(db_user.id)

    response.set_cookie(key="token", value=token, httponly=True)

    return {"success": True, "user_id": db_user.id}


@app.post("/create-user")
def register_user(
    user: schemas.UserCreate, response: Response, db: Session = Depends(get_db)
):
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

    check_user = crud.get_user_by_email(db, user.email)
    if check_user is not None:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    check_user = crud.get_user_by_username(db, user.username)
    if check_user is not None:
        raise HTTPException(
            status_code=400, detail="User with this username already exists"
        )

    try:
        db_user = crud.create_user(db, user, hashed_password)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error while registrying user")

    # User successfully signed up, now generate JWT token for further auth
    token = jwt_utils.generate_token(db_user.id)

    response.set_cookie(key="token", value=token, httponly=True)

    return {"success": True, "user_id": db_user.id}


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


@app.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="token")
    return {}


@app.post("/get-categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@app.post("/get-category-name/{category_id}")
def get_category_name(category_id: int, db: Session = Depends(get_db)):
    category_name = crud.get_category_name(db, category_id)

    if category_name is None:
        raise HTTPException(status_code=400, detail="Invalid category id")

    return category_name


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


@app.post("/create-post")
def create_post(
    create_post: schemas.PostCreate,
    token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
):
    if token is None:
        raise HTTPException(status_code=400, detail="Missing user token")

    # Validate existing user JWT token
    user_id = jwt_utils.validate_token(token)

    # Validation that only logged in user can create post for themselves
    if user_id != create_post.owner_id:
        raise HTTPException(status_code=400, detail="Invalid user id")

    valid, reason = validation.valid_post_text(create_post.text)
    if not valid:
        raise HTTPException(status_code=400, detail=reason)

    existing_category = crud.find_category_by_id(db, create_post.category_id)
    if existing_category is None:
        raise HTTPException(status_code=400, detail="Invalid category id")

    existing_user = crud.get_user_by_id(db, create_post.owner_id)
    if existing_user is None:
        raise HTTPException(status_code=400, detail="Invalid user id")

    # Create entry in database
    try:
        crud.create_post(db, create_post)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="Error while creating post")

    return {}


@app.post("/like-post/{post_id}")
def like_post(post_id: int, db: Session = Depends(get_db)):
    post_liked = crud.increment_post_likes(post_id, db)

    if post_liked is None:
        raise HTTPException(status_code=400, detail="Invalid post id")

    return {}


@app.post("/user/{username}/info")
def get_user_info(
    username: str, token: Optional[str] = Cookie(None), db: Session = Depends(get_db)
):
    reques_all_info = False

    # Validate user's token
    if token is not None:
        user_id = jwt_utils.validate_token(token)
    else:
        user_id = None

    if user_id is not None:
        # Request all info if username is same as logged in user
        id_user = crud.get_user_by_id(db, user_id)

        if id_user is not None and id_user.username == username:
            info = crud.get_user_basic_info_with_email(db, username)
        else:
            info = crud.get_user_basic_info_without_email(db, username)
    else:
        info = crud.get_user_basic_info_without_email(db, username)

    if info is None:
        raise HTTPException(status_code=400, detail="Invalid username")

    return info


@app.post("/user/{user_id}/change-username")
def change_user_password(
    user_id: int,
    user: schemas.UserEditUsername,
    token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
):
    if token is None:
        raise HTTPException(status_code=400, detail="Missing user token")

    # Validate existing user JWT token
    user_id_token = jwt_utils.validate_token(token)

    # Check if id in url belongs to the authenticated user
    if user_id_token != user_id:
        raise HTTPException(status_code=400, detail="Invalid user URL")

    valid, reason = validation.valid_username(user.new_username)
    if not valid:
        raise HTTPException(status_code=400, detail=reason)

    existing_username = crud.get_user_by_username(db, user.new_username)
    if existing_username is not None:
        raise HTTPException(status_code=400, detail="This username already exists")

    update_operation = crud.update_username(db, user_id, user.new_username)

    if not update_operation:
        raise HTTPException(status_code=400, detail="Invalid user id")

    return {}


@app.post("/user/{user_id}/change-password")
def change_user_password(
    user_id: int,
    user: schemas.UserEditPassword,
    token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
):
    if token is None:
        raise HTTPException(status_code=400, detail="Missing user token")

    # Validate existing user JWT token
    user_id_token = jwt_utils.validate_token(token)

    # Check if id in url belongs to the authenticated user
    if user_id_token != user_id:
        raise HTTPException(status_code=400, detail="Invalid user URL")

    valid, reason = validation.valid_password(user.new_password)
    if not valid:
        raise HTTPException(status_code=400, detail=reason)

    hashed_password = password_utils.create_hashed_password(user.new_password)

    update_operation = crud.update_user_password(db, user_id, hashed_password)

    if not update_operation:
        raise HTTPException(status_code=400, detail="Invalid user id")

    return {}


@app.post("/user/{user_id}/change-email")
def change_user_password(
    user_id: int,
    user: schemas.UserEditEmail,
    token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
):
    if token is None:
        raise HTTPException(status_code=400, detail="Missing user token")

    # Validate existing user JWT token
    user_id_token = jwt_utils.validate_token(token)

    # Check if id in url belongs to the authenticated user
    if user_id_token != user_id:
        raise HTTPException(status_code=400, detail="Invalid user URL")

    valid, reason = validation.valid_email(user.new_email)
    if not valid:
        raise HTTPException(status_code=400, detail=reason)

    existing_email = crud.get_user_by_email(db, user.new_email)
    if existing_email is not None:
        raise HTTPException(status_code=400, detail="This email already exists")

    update_operation = crud.update_user_email(db, user_id, user.new_email)

    if not update_operation:
        raise HTTPException(status_code=400, detail="Invalid user id")

    return {}


@app.post("/user/{user_id}/remove-account")
def remove_user_account(
    user_id: int, token: Optional[str] = Cookie(None), db: Session = Depends(get_db)
):
    if token is None:
        raise HTTPException(status_code=400, detail="Missing user token")

    # Validate existing user JWT token
    user_id_token = jwt_utils.validate_token(token)

    # Check id in url belongs to the authenticated user
    if user_id_token != user_id:
        raise HTTPException(status_code=400, detail="Invalid user URL")

    if crud.get_user_by_id(db, user_id) is None:
        raise HTTPException(status_code=400, detail="Invalid user id")

    crud.delete_user(db, user_id)

    return {}
