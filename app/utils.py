import os
from app.config import ALLOWED_EXTENSIONS

def is_valid_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS