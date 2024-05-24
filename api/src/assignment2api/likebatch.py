import schedule
import time

import models, crud
import redis
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)
r = redis.Redis(host="localhost", port=6379, db=0)


def sync_likes_with_db():
    print("Updating post likes...")
    db = SessionLocal()
    all_posts = crud.get_all_posts(db)

    for post in all_posts:
        redis_post_likes = int(r.get(post.id))
        print(f"Likes for {post.id} in Redis: {redis_post_likes}")
        print(f"Likes for {post.id} in DB: {post.likes}")
        if post.likes != redis_post_likes:
            crud.update_post_likes(db, post.id, redis_post_likes)

    db.close()


schedule.every(10).minutes.do(sync_likes_with_db)

while True:
    schedule.run_pending()
    time.sleep(1)
