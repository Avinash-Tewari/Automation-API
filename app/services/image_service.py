from torch import embedding
import os 
import logging
import uuid
from typing import Tuple

from app.config import settings
from app.utils.chunks import chunk_text
from app.services.embedding_service import embed_texts
from app.services import vector_store 

logger= logging.getLogger(__name__)


def get_ocr(image_path: str) -> str:
    try:
        from PIL import Image
        import pytesseract

        img= Image.open(image_path)
        text= pytesseract.image_to_string(img)
        logger.info(f"OCR extracted {len(text)} chars from {image_path}")
        return text
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        return ""


async def process_image(file_bytes, filename: str, user_id: str) -> Tuple[str, int]:

    img_dir= os.path.join(settings.UPLOAD_DIR,"images", user_id)
    os.makedirs(img_dir, exist_ok= True)
    safe_name = f"{uuid.uuid4().hex}_{filename}"
    file_path= os.path.join(img_dir, safe_name)
    with open(file_path,"wb") as f:
        f.write(file_bytes)
    logger.info(f"saved Image:{file_path}")

    raw_text= get_ocr(file_path)
    if not raw_text.strip():
        logger.warning(f"No text extracted from image {filename}")
        return file_path, 0

    chunks= chunk_text(raw_text)
    if not chunks:
        return file_path, 0

    embeddings= embed_texts(chunks)

    doc_id= uuid.uuid4().hex
    ids= [f"img_{doc_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas= [
        {
            "user_id": user_id,
            "document_id": doc_id,
            "filename" : filename,
            "file_type": "image",
            "chunk_index": i,
        }
        for i in range(len(chunks))

    ]
    vector_store.add_documents(ids= ids, embeddings= embeddings, documents= chunks, meatadatas= metadatas)

    logger.info(f"indexed {len(chunks)} chunks from image '{filename}'")
    return file_path, len(chunks)
    