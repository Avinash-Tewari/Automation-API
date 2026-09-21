import json
import logging
from fastapi import APIRouter,Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User,Conversation, Message
from app.schemas import ConversationCreate, ConversationOut, MessageCreate, MessageOut
from app.services.rag_service import stream_rag_response

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger(__name__)

@router.post("/conversations", response_model= ConversationOut, status_code=201)
async def create_conversation(
    payload: ConversationCreate,
    user: User= Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    convo= Conversation(user_id=user.id, title= payload.title)
    db.add(convo)
    await db.flush()
    await db.refresh(convo)
    return convo 





