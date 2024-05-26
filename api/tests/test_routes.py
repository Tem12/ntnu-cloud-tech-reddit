# -------------------------------------------------------------
# Project: IDG2001 Cloud Technologies - assignment 2
# File: test_routes.py
# Brief: API routes tests
# Author: Tomas Hladky <tomashl@stud.ntnu.no>
# Date: March 29th, 2024
# -------------------------------------------------------------

import httpx
from fastapi.testclient import TestClient

from assignment2api.main import app

client = TestClient(app)


def test_refresh_token_without_cookie():
    response = client.post("/refresh-token")
    assert response.status_code == 400


# Test already seeded data
def test_login():
    # Unexisting user
    response = client.post(
        "/login", json={"username": "invalid_name", "password": "password"}
    )
    assert response.status_code == 400

    # Invalid password
    response = client.post(
        "/login", json={"username": "john", "password": "invalid_password"}
    )
    assert response.status_code == 400

    response = client.post("/login", json={"username": "john", "password": "asdfgh"})
    assert response.status_code == 200
    assert response.json() == {"success": True, "user_id": 1}


def test_create_user():
    # Existing username
    response = client.post(
        "/create-user",
        json={
            "username": "john",
            "email": "max@example.com",
            "password": "password",
        },
    )
    assert response.status_code == 400

    # Existing email
    response = client.post(
        "/create-user",
        json={
            "username": "max",
            "email": "john@example.com",
            "password": "password",
        },
    )
    assert response.status_code == 400

    # Valid user
    response = client.post(
        "/create-user",
        json={
            "username": "max",
            "email": "max@example.com",
            "password": "password",
        },
    )
    assert response.status_code == 200


def test_refresh_token_with_cookie():
    response = client.post("/refresh-token")
    assert response.status_code == 200


def test_get_posts_data():
    response = client.post("/get-categories")
    assert response.status_code == 200

    # Invalid category
    response = client.post("/get-category-name/999")
    assert response.status_code == 400

    # Valid category
    response = client.post("/get-category-name/1")
    assert response.status_code == 200

    # Get category post count
    response = client.post("/get-category-post-count/1")
    assert response.status_code == 200

    # Get category posts
    response = client.post("/get-category-posts/1", params={"offset": 1})
    assert response.status_code == 200

    # Get user post count
    response = client.post("/get-user-post-count/1")
    assert response.status_code == 200

    # Get user posts
    response = client.post("/get-user-posts/1", params={"offset": 1})
    assert response.status_code == 200


def test_create_post():
    # Relogin as another user
    response = client.post("/login", json={"username": "john", "password": "asdfgh"})
    assert response.status_code == 200

    # Owner id that does not belong to logged in user
    response = client.post(
        "/create-post",
        json={"text": "Pytest for Dummies", "category_id": 2, "owner_id": 2},
    )
    assert response.status_code == 400

    # Unexisting owner id
    response = client.post(
        "/create-post",
        json={"text": "Pytest for Dummies", "category_id": 2, "owner_id": 999},
    )
    assert response.status_code == 400

    # Invalid post text
    response = client.post(
        "/create-post", json={"text": "", "category_id": 2, "owner_id": 2}
    )
    assert response.status_code == 400

    # Unexisting category
    response = client.post(
        "/create-post",
        json={"text": "Pytest for Dummies", "category_id": 999, "owner_id": 2},
    )
    assert response.status_code == 400

    # Valid post
    response = client.post(
        "/create-post",
        json={"text": "Pytest for Dummies", "category_id": 2, "owner_id": 1},
    )
    assert response.status_code == 200


def test_like_post():
    # Unexisting post
    response = client.post("/like-post/999")
    assert response.status_code == 400

    response = client.post("/like-post/1")
    assert response.status_code == 200


def test_user_info():
    # Unexisting user
    response = client.post("/user/jake/info")
    assert response.status_code == 400

    # Not logged-in user
    response = client.post("/user/alexander/info")
    assert response.status_code == 200
    assert "email" not in response.json()

    # Get as currently logged in user
    response = client.post("/user/john/info")
    assert response.status_code == 200
    assert "email" in response.json()


def test_username_change():
    # Invalid user
    response = client.post(
        "/user/999/change-username", json={"new_username": "john_is_best"}
    )
    assert response.status_code == 400

    # Not logged in user
    response = client.post(
        "/user/2/change-username", json={"new_username": "john_is_best"}
    )
    assert response.status_code == 400

    # Occupied username
    response = client.post(
        "/user/1/change-username", json={"new_username": "alexander"}
    )
    assert response.status_code == 400

    # Invalid username
    response = client.post("/user/1/change-username", json={"new_username": ""})
    assert response.status_code == 400

    # Valid username change
    response = client.post(
        "/user/1/change-username", json={"new_username": "john_is_best"}
    )
    assert response.status_code == 200


def test_email_change():
    # Invalid user
    response = client.post(
        "/user/999/change-email", json={"new_email": "john@microsoft.com"}
    )
    assert response.status_code == 400

    # Not logged in user
    response = client.post(
        "/user/2/change-email", json={"new_email": "john@microsoft.com"}
    )
    assert response.status_code == 400

    # Occupied email
    response = client.post(
        "/user/1/change-email", json={"new_email": "alexander@example.com"}
    )
    assert response.status_code == 400

    # Invalid email
    response = client.post("/user/1/change-email", json={"new_email": ""})
    assert response.status_code == 400

    # Valid email change
    response = client.post(
        "/user/1/change-email", json={"new_email": "john@microsoft.com"}
    )
    assert response.status_code == 200


def test_password_change():
    # Invalid user
    response = client.post("/user/999/change-password", json={"new_password": "123456"})
    assert response.status_code == 400

    # Not logged in user
    response = client.post("/user/2/change-password", json={"new_password": "123456"})
    assert response.status_code == 400

    # Invalid password
    response = client.post("/user/1/change-password", json={"new_password": ""})
    assert response.status_code == 400

    # Valid password change
    response = client.post("/user/1/change-password", json={"new_password": "123456"})
    assert response.status_code == 200


def test_remove_account():
    # Invalid user
    response = client.post("/user/999/remove-account")
    assert response.status_code == 400

    # Not logged in user
    response = client.post("/user/2/remove-account")
    assert response.status_code == 400

    # Valid password change
    response = client.post("/user/1/remove-account")
    assert response.status_code == 200


def test_logout():
    response = client.post("/logout")
    assert response.status_code == 200


def test_create_more_posts():
    # Relogin as another user
    response = client.post("/login", json={"username": "MrBig", "password": "asdfgh"})
    assert response.status_code == 200

    response = client.post(
        "/create-post",
        json={"text": "Deep Thinking 1", "category_id": 2, "owner_id": 3},
    )
    assert response.status_code == 200

    response = client.post(
        "/create-post",
        json={
            "text": "Lord of the Rings vol. 1 is great",
            "category_id": 2,
            "owner_id": 3,
        },
    )
    assert response.status_code == 200

    response = client.post(
        "/create-post",
        json={
            "text": "Lord of the Rings vol. 2 is even better",
            "category_id": 2,
            "owner_id": 3,
        },
    )
    assert response.status_code == 200

    response = client.post(
        "/create-post",
        json={
            "text": "Lord of the Rings vol. 3 is best",
            "category_id": 2,
            "owner_id": 3,
        },
    )
    assert response.status_code == 200

    response = client.post(
        "/create-post",
        json={"text": "My new book arrived home", "category_id": 2, "owner_id": 3},
    )
    assert response.status_code == 200

    response = client.post(
        "/create-post",
        json={"text": "Does anyone read these posts?", "category_id": 2, "owner_id": 3},
    )
    assert response.status_code == 200

    response = client.post(
        "/create-post", json={"text": "MyBook1", "category_id": 2, "owner_id": 3}
    )
    assert response.status_code == 200

    response = client.post(
        "/create-post",
        json={"text": "JWT token book for beginners", "category_id": 2, "owner_id": 3},
    )
    assert response.status_code == 200

    response = client.post(
        "/create-post", json={"text": "Lion king", "category_id": 2, "owner_id": 3}
    )
    assert response.status_code == 200

    response = client.post(
        "/create-post",
        json={"text": "Dishwasher manual", "category_id": 2, "owner_id": 3},
    )
    assert response.status_code == 200
