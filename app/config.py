import os
from dotenv import load_dotenv

load_dotenv()

UPLOAD_DIR = "data/uploads"
FAISS_INDEX_PATH = "data/faiss_index/index.faiss"
FAISS_DOCS_PATH = "data/faiss_index/docs.pkl"

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx"}
