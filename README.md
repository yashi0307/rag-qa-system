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
2. Chunk + embed
3. Store in FAISS
4. Query → retrieve relevant chunks
5. Generate answer using LLM

## Setup Instructions
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload



