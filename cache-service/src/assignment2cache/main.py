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

from fastapi import FastAPI, HTTPException

# Setup logger
logger = logging.getLogger(__name__)
stream_handler = logging.StreamHandler(sys.stderr)
log_formatter = logging.Formatter("%(asctime)s | %(name)s: %(message)s")
stream_handler.setFormatter(log_formatter)
logger.addHandler(stream_handler)

app = FastAPI()

r = redis.Redis(host="localhost", port=6379, db=0)


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


@app.post("/get-likes/{post_id}")
def get_likes(post_id: int):
    likes = int(r.get(post_id))
    return {"likes": likes}


@app.post("increment-likes/{post_id}")
def increment_likes(post_id: int):
    r.incr(post_id)
    return {"success": True}
