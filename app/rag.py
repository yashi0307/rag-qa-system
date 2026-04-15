from app.embeddings import get_embeddings
from app.vector_store import search, load_index
from groq import Groq
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)


def generate_answer(query, doc_id):
    try:
        load_index()  # IMPORTANT FIX

        query_embedding = get_embeddings([query])[0]
        docs = search(query_embedding, doc_id)

        if not docs:
            return {"answer": "No relevant content found."}

        context = "\n\n".join(docs)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Answer only from context."},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"}
            ],
            temperature=0.2,
        )

        return {"answer": response.choices[0].message.content.strip()}

    except Exception as e:
        return {"answer": str(e)}