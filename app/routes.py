from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse
import os, uuid, shutil
from app.config import UPLOAD_DIR, ALLOWED_EXTENSIONS
from app.ingest import process_file, status
from app.rag import generate_answer
from app.rate_limiter import check_rate_limit
from pydantic import BaseModel

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx"}
MAX_FILE_SIZE_MB = 50


class QueryRequest(BaseModel):
    question: str
    doc_id: str


@router.post("/upload")
async def upload(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Allowed: {ALLOWED_EXTENSIONS}")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Read and validate file size
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=413, detail=f"File too large: {size_mb:.1f}MB. Max allowed: {MAX_FILE_SIZE_MB}MB")

    # Save with unique name to avoid conflicts
    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    doc_id = str(uuid.uuid4())
    status[doc_id] = "processing"

    # Use FastAPI BackgroundTasks instead of raw threading
    background_tasks.add_task(process_file, file_path, doc_id)

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "size_mb": round(size_mb, 2),
        "status": "processing"
    }


@router.get("/status/{doc_id}")
def get_status(doc_id: str):
    current = status.get(doc_id)
    if current is None:
        raise HTTPException(status_code=404, detail="doc_id not found")
    return {
        "doc_id": doc_id,
        "status": current  # "processing" | "done" | "error"
    }


@router.post("/query")
async def query(req: QueryRequest, request: Request):
    # Rate limiting
    client_ip = request.client.host
    if not check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")

    # Validate doc_id exists
    doc_status = status.get(req.doc_id)
    if doc_status is None:
        raise HTTPException(status_code=404, detail="doc_id not found. Please upload a document first.")

    # Guard: not ready yet
    if doc_status == "processing":
        return JSONResponse(status_code=202, content={
            "answer": None,
            "status": "processing",
            "message": "Document is still being indexed. Please wait and retry."
        })

    # Guard: ingestion failed
    if doc_status == "error":
        raise HTTPException(status_code=500, detail="Document ingestion failed. Please re-upload.")

    # Validate question
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    if len(question) > 1000:
        raise HTTPException(status_code=400, detail="Question too long. Max 1000 characters.")

    result = generate_answer(question, req.doc_id)
    return {
        "doc_id": req.doc_id,
        "question": question,
        "answer": result.get("answer"),
        "status": "done"
    }


@router.delete("/document/{doc_id}")
async def delete_document(doc_id: str):
    if doc_id not in status:
        raise HTTPException(status_code=404, detail="doc_id not found")
    del status[doc_id]
    return {"message": f"Document {doc_id} removed from session."}


@router.get("/health")
def health():
    return {"status": "ok", "indexed_docs": len(status)}