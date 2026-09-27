import logging
from typing import List
from functools import lru_cache

logger= logging.getLogger(__name__)

_model= None


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        from app.config import settings
        logger.info(f"loading embedding model: {settings.EMBEDDING_MODEL}")
        _model= SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded")
    return _model


def embed_texts(texts: List[str]) -> List[List[float]]:
    """ Generate embeddings for a list of texts"""
    model= _get_model()
    embeddings = model.encode(texts, show_progress_bar= False, convert_to_numpy= True)
    return embeddings.tolist()

def embed_query(text: str) -> List[float]:
    """generate an embedding for a single query string"""

    return embed_texts([text])[0]
