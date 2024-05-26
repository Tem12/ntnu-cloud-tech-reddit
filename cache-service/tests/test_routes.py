# -------------------------------------------------------------
# Project: IDG2001 Cloud Technologies - assignment 2
# File: test_routes.py
# Brief: Cache service routes tests
# Author: Tomas Hladky <tomashl@stud.ntnu.no>
# Date: May 25th, 2024
# -------------------------------------------------------------

from fastapi.testclient import TestClient

from assignment2cache.main import app

client = TestClient(app)


def test_get_likes():
    response = client.post("/get-likes", json={"post_ids": [4, 5, 6]})
    assert response.status_code == 200
    assert response.json() == {"likes": {"4": 20, "5": 14, "6": 25}}


def test_send_like():
    response = client.post("/like-post/4")
    assert response.status_code == 200
    assert response.json() == {"success": True}


def test_check_like_commit():
    response = client.post("/get-likes", json={"post_ids": [4]})
    assert response.status_code == 200
    assert response.json() == {"likes": {"4": 21}}
