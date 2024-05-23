from datetime import datetime
from pydantic import BaseModel


class PostBase(BaseModel):
    text: str


class PostCreate(PostBase):
    category_id: int
    owner_id: int


class Post(PostBase):
    text: str
    likes: int
    created_at: datetime


class PostWithOwnerName():
    Post: Post
    username: str


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    username: str
    password: str


class User(UserBase):
    id: int
    username: str
    posts: list[Post]
    created_at: datetime


class CategoryBase(BaseModel):
    pass


class CategoryCreate(CategoryBase):
    name: str


class Category(CategoryBase):
    id: int
    name: str
