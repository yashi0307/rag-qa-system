# Explanation - RAG QA System

## 1. Chunking Strategy

Chunk size: 500 characters with 50 overlap.

Reason:
Smaller chunks improve retrieval precision, while overlap ensures that context is not lost between adjacent chunks. This improves answer quality during retrieval.

---

## 2. Retrieval Failure Case

Failure Case:
When asking broad or conceptual questions, the system sometimes retrieves less relevant chunks instead of the most informative sections.

Reason:
The HashingVectorizer used for embeddings does not capture deep semantic relationships between words.

Improvement:
Using transformer-based embeddings or hybrid retrieval methods could improve semantic understanding and retrieval accuracy.

---

## 3. Metric Tracked

Metric: Latency

Average response time: ~700ms

Breakdown:
- Embedding generation: ~50ms  
- FAISS similarity search: ~5ms  
- LLM response generation: ~600ms  

This metric was tracked to ensure the system remains efficient and responsive.
