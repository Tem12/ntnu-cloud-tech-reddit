from sqlalchemy import desc, select, case, literal
from sqlalchemy.orm import Session
from datetime import datetime

import models, schemas


def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, create_user: schemas.UserCreate, hashed_password: str):
    user = models.User(
        username=create_user.username, email=create_user.email, password=hashed_password
    )
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
        return True
    else:
        print(f"No user with id {update_user_id} found")
        return False


def update_username(db: Session, update_user_id: int, new_username: str):
    db_user = (
        db.query(models.User).filter(models.User.id == update_user_id).one_or_none()
    )

    if db_user is not None:
        db_user.username = new_username

        db.commit()
        print(f"User {update_user_id} updated with username {new_username}")
        return True
    else:
        print(f"No user with id {update_user_id} found")
        return False


def update_user_password(db: Session, update_user_id: int, new_hashed_password: str):
    db_user = (
        db.query(models.User).filter(models.User.id == update_user_id).one_or_none()
    )

    if db_user is not None:
        db_user.password = new_hashed_password

        db.commit()
        print(f"User {update_user_id} updated with password {new_hashed_password}")
        return True
    else:
        print(f"No user with id {update_user_id} found")
        return False


def get_user_basic_info_with_email(db: Session, username: str):
    return (
        db.execute(
            select(
                models.User.id,
                models.User.email,
                models.User.created_at,
            ).filter(models.User.username == username)
        )
        .mappings()
        .first()
    )


def get_user_basic_info_without_email(db: Session, username: str):
    return (
        db.execute(
            select(
                models.User.id,
                models.User.created_at,
            ).filter(models.User.username == username)
        )
        .mappings()
        .first()
    )


def delete_user(db: Session, delete_user_id: int):
    # Delete all user's posts first
    db.query(models.Post).filter(models.Post.owner_id == delete_user_id).delete()
    db.commit()

    # Delete the user
    db.query(models.User).filter(models.User.id == delete_user_id).delete()
    db.commit()


def get_count_of_user_posts(db: Session, user_id: int):
    return db.query(models.Post).filter(models.Post.owner_id == user_id).count()


def get_user_posts(db: Session, user_id: int, offset: int):
    return (
        db.query(models.Post)
        .filter(models.Post.owner_id == user_id)
        .order_by(desc(models.Post.created_at))
        .offset(offset)
        .limit(10)
        .all()
    )


def get_all_posts(db: Session):
    return db.query(models.Post).all()


def update_post_likes(update_post_id: int, new_likes: int, db: Session):
    db_post = (
        db.query(models.Post).filter(models.Post.id == update_post_id).one_or_none()
    )

    if db_post is not None:
        db_post.likes = new_likes

        db.commit()
        print(f"Likes for post {update_post_id} updated to {new_likes}")
    else:
        print(f"No post with id {update_post_id} found")


def increment_post_likes(update_post_id: int, db: Session):
    db_post = (
        db.query(models.Post).filter(models.Post.id == update_post_id).one_or_none()
    )

    if db_post is not None:
        db_post.likes = db_post.likes + 1

        db.commit()

    return db_post


def get_category_name(db: Session, category_id: int):
    return (
        db.execute(
            select(models.Category.name).filter(models.Category.id == category_id)
        )
        .mappings()
        .first()
    )


def get_count_of_category_posts(db: Session, category_id: int):
    return db.query(models.Post).filter(models.Post.category_id == category_id).count()


def get_category_posts(db: Session, category_id: int, offset: int):
    return (
        db.execute(
            select(models.Post, models.User.username)
            .join(models.User, models.Post.owner_id == models.User.id)
            .filter(models.Post.category_id == category_id)
            .order_by(desc(models.Post.created_at))
            .offset(offset)
            .limit(10)
        )
        .mappings()
        .all()
    )


def create_post(db: Session, create_post: schemas.PostCreate):
    post = models.Post(
        text=create_post.text,
        category_id=create_post.category_id,
        owner_id=create_post.owner_id,
        likes=0,
        created_at=datetime.now(),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def get_categories(db: Session):
    return db.query(models.Category).all()


def find_category_by_id(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def create_category(db: Session, create_category: schemas.CategoryCreate):
    category = models.Category(name=create_category.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
