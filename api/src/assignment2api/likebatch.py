import schedule
import time
import os
import threading
from dotenv import load_dotenv
import models, crud
import redis
from database import SessionLocal, engine


class LikeBatch:
    def __init__(self):
        models.Base.metadata.create_all(bind=engine)
        load_dotenv()
        REDIS_HOST = os.getenv("REDIS_HOST")

        self.r = redis.Redis(host=REDIS_HOST, port=6379, db=0)

    def _schedule_sync(self):
        schedule.every(5).minutes.do(self.sync_likes_with_db)

        while True:
            schedule.run_pending()
            time.sleep(1)

    def schedule_sync(self):
        thread = threading.Thread(target=self._schedule_sync)
        thread.start()

    def sync_likes_with_db(self):
        print("Updating post likes...")
        db = SessionLocal()
        all_posts = crud.get_all_posts(db)
        for post in all_posts:
            redis_post_likes = int(self.r.get(post.id))
            print(f"Likes for {post.id} in Redis: {redis_post_likes}")
            print(f"Likes for {post.id} in DB: {post.likes}")
            if post.likes != redis_post_likes:
                crud.update_post_likes(post.id, redis_post_likes, db)
        db.close()
