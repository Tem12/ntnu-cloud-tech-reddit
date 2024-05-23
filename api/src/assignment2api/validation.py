import re
from typing import Tuple


def valid_email(email: str) -> Tuple[bool, str]:
    if len(email) >= 255:
        return False, "Email address is too long"
    
    email_regex_pattern = re.compile(
        r"(^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
    )
    # Use the match function to check if the email matches the pattern
    if not email_regex_pattern.match(email):
        return False, "Invalid email format"

    return True, ""


def valid_username(username: str) -> Tuple[bool, str]:
    if len(username) >= 32:
        return False, "Username is too long"

    return True, ""


def valid_password(password: str) -> Tuple[bool, str]:
    if len(password) >= 255:
        return False, "Password is too long"

    return True, ""


def valid_post_text(title: str) -> Tuple[bool, str]:
    if len(title) >= 512:
        return False, "Title of the post is too long"

    return True, ""
