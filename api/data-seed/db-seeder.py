import os
import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.sql import text

load_dotenv()

DB_URL = os.getenv("DB_URL")
engine = create_engine(DB_URL)

with engine.connect() as conn:
    categories = (
        {"id": 1, "name": "Science"},
        {"id": 2, "name": "Books"},
        {"id": 3, "name": "Space-Around-Us"},
    )
    users = (
        {
            "id": 1,
            "username": "john",
            "email": "john@example.com",
            "password": "$2b$12$Lbka3TD9/mKQUDKTRqfUUu1..tVItNv.nfbI5crGkB6ApbAlVKg/W",
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 2,
            "username": "alexander",
            "email": "alexander@example.com",
            "password": "$2b$12$Lbka3TD9/mKQUDKTRqfUUu1..tVItNv.nfbI5crGkB6ApbAlVKg/W",
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 3,
            "username": "MrBig",
            "email": "mrbig@example.com",
            "password": "$2b$12$Lbka3TD9/mKQUDKTRqfUUu1..tVItNv.nfbI5crGkB6ApbAlVKg/W",
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 4,
            "username": "GuyWithCrazyUsername",
            "email": "example@example.com",
            "password": "$2b$12$Lbka3TD9/mKQUDKTRqfUUu1..tVItNv.nfbI5crGkB6ApbAlVKg/W",
            "created_at": datetime.datetime.now(),
        },
    )
    posts = (
        {
            "id": 1,
            "category_id": 1,
            "text": "New electric circuit",
            "owner_id": 1,
            "likes": 5,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 2,
            "category_id": 1,
            "text": "Parrots love playing iPad games",
            "owner_id": 1,
            "likes": 451,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 3,
            "category_id": 1,
            "text": "Science is magic, mark my words",
            "owner_id": 2,
            "likes": 2,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 4,
            "category_id": 1,
            "text": "Apes working out",
            "owner_id": 3,
            "likes": 20,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 5,
            "category_id": 2,
            "text": "Harry Potter will always be my favourite",
            "owner_id": 2,
            "likes": 14,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 6,
            "category_id": 2,
            "text": "1948 is nice book",
            "owner_id": 3,
            "likes": 25,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 7,
            "category_id": 1,
            "text": "Red engineer created blue engine on green grass with yellow wrench and threw it over purple bridge on cyan carpet with pink dots",
            "owner_id": 1,
            "likes": 758,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 8,
            "category_id": 2,
            "text": "Have you read Hobit?",
            "owner_id": 3,
            "likes": 5,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 9,
            "category_id": 3,
            "text": "Earth is Flat. Change my mind.",
            "owner_id": 3,
            "likes": 86,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 10,
            "category_id": 3,
            "text": "Pluto is far away",
            "owner_id": 3,
            "likes": 2,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 11,
            "category_id": 2,
            "text": "Read People Like a Book. My favourite one this year.",
            "owner_id": 2,
            "likes": 56,
            "created_at": datetime.datetime.now(),
        },
        {
            "id": 12,
            "category_id": 2,
            "text": "Python for Dummies. You won't believe it, but this book saved my career",
            "owner_id": 3,
            "likes": 156,
            "created_at": datetime.datetime.now(),
        },
    )

    sql_insert_categories = text("INSERT INTO categories(id, name) VALUES(:id, :name)")
    sql_insert_users = text(
        "INSERT INTO users(id, username, email, password, created_at) VALUES(:id, :username, :email, :password, :created_at)"
    )
    sql_insert_posts = text(
        "INSERT INTO posts(id, category_id, text, owner_id, likes, created_at) VALUES (:id, :category_id, :text, :owner_id, :likes, :created_at)"
    )

    for line in categories:
        conn.execute(sql_insert_categories, line)

    for line in users:
        conn.execute(sql_insert_users, line)

    for line in posts:
        conn.execute(sql_insert_posts, line)

    # Modify auto-increment for ids
    conn.execute(text("SELECT setval(pg_get_serial_sequence('categories', 'id'), :val)"), {"val": 3})
    conn.execute(text("SELECT setval(pg_get_serial_sequence('users', 'id'), :val)"), {"val": 4})
    conn.execute(text("SELECT setval(pg_get_serial_sequence('posts', 'id'), :val)"), {"val": 12})
    
    conn.commit()

    print("Database successfully seeded")
