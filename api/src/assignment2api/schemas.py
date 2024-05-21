from datetime import datetime
from typing import Union
from pydantic import BaseModel


class PostBase(BaseModel):
    title: str


class PostCreate(PostBase):
    category_id: int
    content: str
    owner_id: int


class Post(PostBase):
    likes: int
    created_at: datetime


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    username: str
    password: str


class User(UserBase):
    id: int
    posts: list[Post]
    created_at: datetime


class CategoryBase(BaseModel):
    pass


class CategoryCreate(CategoryBase):
    name: str


class Category(CategoryBase):
    id: int
