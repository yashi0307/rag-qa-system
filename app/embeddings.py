# embeddings.py
from sklearn.feature_extraction.text import HashingVectorizer
import numpy as np

vectorizer = HashingVectorizer(n_features=512, alternate_sign=False)

def get_embeddings(texts):
    if isinstance(texts, str):
        texts = [texts]

    X = vectorizer.transform(texts)
    emb = X.toarray().astype("float32")

    norms = np.linalg.norm(emb, axis=1, keepdims=True)
    norms[norms == 0] = 1
    return emb / norms