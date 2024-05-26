from pydantic import BaseModel
from typing import List

class LikePosts(BaseModel):
    post_ids: List[int] = list()