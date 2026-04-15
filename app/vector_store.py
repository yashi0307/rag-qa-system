import faiss
import numpy as np
import pickle
import os
import threading
from app.config import FAISS_INDEX_PATH, FAISS_DOCS_PATH

index = None
documents = []
_lock = threading.Lock()

def _init_index(dim):
    global index
    print("[DEBUG] Initializing FAISS with dim:", dim)
    index = faiss.IndexFlatIP(dim)

def add_embeddings(embeddings, chunks, doc_id):
    global index, documents

    if len(embeddings) == 0:
        raise ValueError("Empty embeddings")

    with _lock:
        if index is None:
            _init_index(embeddings.shape[1])

        index.add(embeddings)

        for chunk in chunks:
            documents.append({"text": chunk, "doc_id": str(doc_id)})

        print("[INFO] FAISS size:", index.ntotal)

def save_index():
    os.makedirs(os.path.dirname(FAISS_INDEX_PATH), exist_ok=True)

    with _lock:
        faiss.write_index(index, FAISS_INDEX_PATH)
        with open(FAISS_DOCS_PATH, "wb") as f:
            pickle.dump(documents, f)


def load_index():
    global index, documents
    if index is not None:
        return  # already loaded, don't overwrite
    if os.path.exists(FAISS_INDEX_PATH):
        index = faiss.read_index(FAISS_INDEX_PATH)
        with open(FAISS_DOCS_PATH, "rb") as f:
            documents = pickle.load(f)


def search(query_embedding, doc_id, k=3):
    global index, documents

    if index is None or len(documents) == 0:
        print("[DEBUG] Empty index")
        return []

    query_embedding = np.array([query_embedding], dtype="float32")

    print("[DEBUG] Searching FAISS...")

    distances, indices = index.search(query_embedding, k)

    print("[DEBUG] Indices:", indices)

    results = []
    for i in indices[0]:
        if i < len(documents):
            if documents[i]["doc_id"] == str(doc_id):
                results.append(documents[i]["text"])

    return results