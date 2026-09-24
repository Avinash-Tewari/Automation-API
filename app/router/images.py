"""
Image upload & OCR processing endpoints.
"""

import logging
from fastapi import HTTPException, APIRouter, Depends, File,UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User, Document
from app.schemas import DocumentOut
from app.services.image_service import process_image

router= APIRouter(prefix="/images", tags=["Images"])
logger = logging.getLogger(__name__)

ALLOWED_IMAGE_TYPES= {"png", "jpg", "jpeg", "bmp", "tiff"}
MAX_SIZE =  20 * 1024 * 1024

@router.post("/upload", response_model= DocumentOut, status_code=201)
async def upload_image(
    file: UploadFile= File(...),
    user: User= Depends(get_current_user),
    db: AsyncSession= Depends(get_db),
):
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else ""
    if ext not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code= 400, detail= f"Unsupported image type: {ext}")

    content= await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code= 400, detail= f"images size too large")
    
    doc= Document(
        user_id= user.id,
        filename= file.filename,
        file_type= "image",
        file_path= "",
        file_size= len(content),
        status= "processing",
    )
    db.add(doc)
    await db.flush()
    await db.refresh(doc)

    try:
        file_path, chunk_count= await process_image(content , file.filename, user.id)
        doc.file_path = file_path
        doc.chunk_count= chunk_count
        doc.status = "ready"

    except Exception as e: 
        logger.error (f"Image processing error : {e}")
        doc.status = "error"

    await db.flush()
    await db.refresh(doc)
    return doc