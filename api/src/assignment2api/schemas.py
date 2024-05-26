from datetime import datetime
from pydantic import BaseModel


class PostBase(BaseModel):
    text: str


class PostCreate(PostBase):
    category_id: int
    owner_id: int


class Post(PostBase):
    likes: int
    created_at: datetime


class PostWithOwnerName:
    Post: Post
    username: str


class UserBase(BaseModel):
    username: str


class UserLogin(UserBase):
    password: str


class UserCreate(UserBase):
    email: str
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


class UserEditUsername(BaseModel):
    new_username: str


class UserEditPassword(BaseModel):
    new_password: str


class UserEditEmail(BaseModel):
    new_email: str
