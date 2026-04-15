import fitz
from app.embeddings import get_embeddings
from app.vector_store import add_embeddings, save_index

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

status = {}




def extract_text(file_path):
    text = ""
    doc = fitz.open(file_path)
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def chunk_text(text):
    chunks = []
    step = CHUNK_SIZE - CHUNK_OVERLAP

    for i in range(0, len(text), step):
        chunk = text[i:i + CHUNK_SIZE]
        if chunk.strip():
            chunks.append(chunk.strip())

    return chunks


def process_file(file_path, doc_id):
    try:
        print("\n===== START INGEST =====")

        print("[STEP] Reading file:", file_path)
        text = extract_text(file_path)
        print("[STEP] Text length:", len(text))

        if not text:
            raise Exception("No text extracted from file")

        print("[STEP] Chunking...")
        chunks = chunk_text(text)
        print("[STEP] Total chunks:", len(chunks))

        if len(chunks) == 0:
            raise Exception("Chunking failed")

        print("[STEP] Creating embeddings...")
        embeddings = get_embeddings(chunks)
        print("[STEP] Embedding shape:", embeddings.shape)

        print("[STEP] Adding to FAISS...")
        add_embeddings(embeddings, chunks, doc_id)

        print("[STEP] Saving index...")
        save_index()

        status[doc_id] = "done"
        print("===== SUCCESS =====\n")

    except Exception as e:
        status[doc_id] = "error"
        print("===== ERROR =====")
        print("ERROR TYPE:", type(e))
        print("ERROR MESSAGE:", str(e))
        print("=================\n")