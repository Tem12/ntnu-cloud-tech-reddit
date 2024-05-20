# -------------------------------------------------------------
# Project: IDG2001 Cloud Technologies - assignment 2
# File: main.py
# Brief: FastAPI routes handler
# Author: Tomas Hladky <tomashl@stud.ntnu.no>
# Date: May 20th, 2024
# -------------------------------------------------------------

import os
import sys
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine

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

@app.post("/", response_model=schemas.User)
def a(db: Session = Depends(get_db)):
    users = crud.get_user_by_id(db, 0)
    return users
