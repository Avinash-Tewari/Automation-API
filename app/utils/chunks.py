from sqlalchemy.sql.operators import regexp_replace_op
import logging
from typing import List

logger = logging.getLogger(__name__)

CHUNK_SIZE= 1000
CHUNK_OVERLAP= 200
SEPARATORS = ["\n\n", "\n", ". ", " ", ""]

def chunk_text(text: str, chunk_size: int= CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP) -> List[str]:
    """
    Split text into overlapping chunks using a recursive character strategy.
    Tries to split on natural boundaries (paragraphs, sentences) before
    falling back to character-level splits.
    """

    if not text or not text.strip():
        return[]

    chunks= _recursive_split(text,SEPARATORS, chunk_size, chunk_overlap)
    chunks= [c.strip() for c in chunks if c.strip()]
    logger.info(f"chunked text into {len(chunks)} chunks (size={chunk_size}, overlap={chunk_overlap})")
    return chunks

def _recursive_split(text: str, separators: List[str], chunk_size: int, chunk_overlap: int) -> List[str]:
    """Recursively split text using the first effective separator."""
    if len(text) <= chunk_size:
        return [text]

    # Find the best separator that actually exists in the text
    separator = ""
    for sep in separators:
        if sep in text:
            separator = sep
            break

    # Split by chosen separator
    parts = text.split(separator) if separator else list(text)

    chunks: List[str] = []
    current_chunk = ""

    for part in parts:
        candidate = current_chunk + (separator if current_chunk else "") + part

        if len(candidate) <= chunk_size:
            current_chunk = candidate
        else:
            if current_chunk:
                chunks.append(current_chunk)
            # If a single part exceeds chunk_size, recursively split it
            if len(part) > chunk_size:
                remaining_seps = separators[separators.index(separator) + 1:] if separator in separators else separators[1:]
                chunks.extend(_recursive_split(part, remaining_seps or [""], chunk_size, chunk_overlap))
                current_chunk = ""
            else:
                # Start new chunk with overlap from the end of previous chunk
                if chunks:
                    overlap_text = chunks[-1][-chunk_overlap:] if len(chunks[-1]) > chunk_overlap else chunks[-1]
                    current_chunk = overlap_text + separator + part
                else:
                    current_chunk = part

    if current_chunk:
        chunks.append(current_chunk)

    return chunks