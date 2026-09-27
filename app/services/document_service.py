"""
Document processing pipeline:
  save file → extract text → chunk → embed → store vectors → update DB metadata.
"""

from logging import warning
from pydantic_core.core_schema import uuid_schema
import os 
import logging
import uuid 
from typing import Tuple

from app.config import settings
from app.utils.text_extraction import extract_text
from app.utils.chunks import chunk_text
from app.services.embedding_service import embed_texts 
from app.services import vector_store

logger= logging.getLogger(__name__)


async def process_document(file_bytes: bytes, filename:str, file_type: str,user_id: str)-> Tuple[str,int]:
    """Full document processing pipeline
        returns: 
        (file_path, chunk_count)
    """

    doc_dir= os.path.join(settings.UPLOAD_DIR, "documents ", user_id)
    os.makedirs(doc_dir, exist_ok= True)
    safe_name= f"{uuid.uuid4().hex}_{filename}"
    file_path= os.path.join(doc_dir, safe_name)
    with open(file_path,"wb") as f:
        f.write(file_bytes)
    logger.info(f"saved_document:{file_path}({len(file_bytes)} bytes)")


    raw_text= extract_text(file_path, file_type)
    if not raw_text.strip():
        logger.warning(f"No text extracted file {filename}")
        return file_path, 0


    chunks= chunk_text(raw_text)
    if not chunks:
        return file_path, 0


    embedings= embed_texts(chunks)

    doc_id= uuid.uuid4().hex
    ids= [f"{doc_id}_chunk_" for i in range(len(chunks))]
    metadata= [
        {
            "user_id": user_id,
            "document_id": doc_id,
            "filename": filename,
            "file_type": file_type,
            "chunk_index": i,
        
        }
        for i in range(len(chunks))
    ]
    vector_store.add_documents(ids= ids, embeddings= embedings, documents= chunks, metadata= metadata)

    logger.info(f"indexed{len(chunks)} chunks for document'{filename}'")
    return file_path, len(chunks)