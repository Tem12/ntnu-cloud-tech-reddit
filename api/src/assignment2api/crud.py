from sqlalchemy import desc
from sqlalchemy.orm import Session

from . import models, schemas


def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, create_user: schemas.UserCreate):
    user = models.User(email=create_user.email, password=create_user.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_email(db: Session, update_user_id: int, new_email: str):
    db_user = (
        db.query(models.User).filter(models.User.id == update_user_id).one_or_none()
    )

    if db_user is not None:
        db_user.email = new_email

        db.commit()
        print(f"User {update_user_id} updated with email {new_email}")
    else:
        print(f"No user with id {update_user_id} found")


def update_user_password(db: Session, update_user_id: int, new_hashed_password: str):
    db_user = (
        db.query(models.User).filter(models.User.id == update_user_id).one_or_none()
    )

    if db_user is not None:
        db_user.password = new_hashed_password

        db.commit()
        print(f"User {update_user_id} updated with password {new_hashed_password}")
    else:
        print(f"No user with id {update_user_id} found")


def delete_user(db: Session, delete_user_id: int):
    db.query(models.User).filter(models.User.id == delete_user_id).delete()
    db.commit()


def get_user_posts(db: Session, user_id: int):
    return (
        db.query(models.Post)
        .filter(models.Post.owner_id == user_id)
        .order_by(desc(models.Post.created_at))
        .limit(10)
        .all()
    )


def get_category_posts(db: Session, category_id: int):
    return (
        db.query(models.Post)
        .filter(models.Post.category_id == category_id)
        .order_by(desc(models.Post.created_at))
        .limit(10)
        .all()
    )


def create_post(db: Session, create_post: schemas.PostCreate):
    post = models.Post(
        title=create_post.title,
        category_id=create_post.category_id,
        content=create_post.content,
        owner_id=create_post.owner_id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def get_categories(db: Session):
    return db.query(models.Category).all()


def create_category(db: Session, create_category: schemas.CategoryCreate):
    category = models.Category(name=create_category.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
