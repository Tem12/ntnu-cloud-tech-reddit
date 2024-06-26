# -------------------------------------------------------------
# Project: IDG2001 Cloud Technologies - assignment 2
# File: main.py
# Brief: FastAPI routes handler
# Author: Tomas Hladky <tomashl@stud.ntnu.no>
# Date: May 20th, 2024
# -------------------------------------------------------------

import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import redis
import os

import schemas
from fastapi import FastAPI

# Setup logger
logger = logging.getLogger(__name__)
stream_handler = logging.StreamHandler(sys.stderr)
log_formatter = logging.Formatter("%(asctime)s | %(name)s: %(message)s")
stream_handler.setFormatter(log_formatter)
logger.addHandler(stream_handler)

app = FastAPI()

load_dotenv()
REDIS_HOST = os.getenv("REDIS_HOST")

r = redis.Redis(host=REDIS_HOST, port=6379, db=0)


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


def setup():
    pass


setup()


@app.post("/get-likes")
def get_likes(post_ids: schemas.LikePosts):
    likes = {}

    for id in post_ids.post_ids:
        # Check if post exists in case of adding new entry from user
        if int(r.exists(id)) == 0:
            r.set(id, 0)

        post_likes_num = int(r.get(id))
        likes[id] = post_likes_num
    return {"likes": likes}


@app.post("/like-post/{post_id}")
def increment_likes(post_id: int):
    r.incr(post_id)
    return {"success": True}
