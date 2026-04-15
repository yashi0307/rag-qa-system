# RAG-Based Question Answering System

## Overview
This project implements a Retrieval-Augmented Generation (RAG) system that allows users to upload documents and ask questions based on them.

## Features
- Upload PDF and TXT documents
- Chunking and embedding
- FAISS vector database
- Semantic retrieval
- LLM-based answer generation
- Background ingestion

## Tech Stack
- FastAPI
- FAISS
- scikit-learn (HashingVectorizer)
- Groq API

## How It Works
1. Upload document
2. Background ingestion processes it
3. Chunks stored in FAISS
4. Query retrieves top-k chunks
5. LLM generates final answer

## Setup Instructions
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload



