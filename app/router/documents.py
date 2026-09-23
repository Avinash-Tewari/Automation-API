
"""
Document upload & management endpoints.
"""

from sqlalchemy.engine import result
from fastapi import Depends
import logging 
from fastapi import APIRouter, HTTPException, UploadFile,File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User, Document
from app.schemas import DocumentOut
from app.services.document_service import process_document
from app.services import vector_store 

router= APIRouter(prefix="/documents", tags=["Document"])
logger = logging.getLogger(__name__)

ALLOWED_TYPES ={"pdf","docx", "txt"}
MAX_FILE_SIZE= 50*1024*1024

@router.post("/upload", response_model= DocumentOut, status_code=201)
async def upload_document(
    file: UploadFile= File(...),
    user: User= Depends(get_current_user),
    db: AsyncSession= Depends(get_db),
):
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else ""
    if ext not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Allowed: {ALLOWED_TYPES}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code= 400 , detail="File too large(Max 50MB)")

    doc= Document(
        user_id = user.id,
        filename = file.filename,
        file_type= ext,
        file_path= "",
        file_size = len(content),
        status = "processing",
    )

    db.add(doc)
    await db.flush()
    await db.refresh(doc)

    try:
        file_path, chunk_count = await process_document(content, file.filename, ext, user.id)
        doc.file_path = file_path
        doc.chunk_count = chunk_count
        doc.status = "ready"
    except Exception as e:
        logger.error(f"Document processing error: {e}")
        doc.status = "error"

    await db.flush()
    await db.refresh(doc)
    return doc

