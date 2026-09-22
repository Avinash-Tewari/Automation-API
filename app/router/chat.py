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

@router.get("/conversation", response_model=list[ConversationOut])
async def list_documentation(
    user: User =Depends(get_current_user),
    db: AsyncSession= Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user.id)
        .order_by(desc(Conversation.updated_at))
    )
    return result.scalars().all()

@router.get("/conversation/{conversation_id}/messages", response_model=list[MessageOut])
async def get_messages(
    conversation_id: str,
    user: User= Depends(get_current_user),
    db: AsyncSession= Depends(get_db),
):

    convo = await _get_conversation(conversation_id, user.id, db)
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == convo.id)
        .order_by(Message.created_at)
    )
    return result.scalars().all()

@router.post("/conversation/{conversation_id}/messages")
async def send_messages(
    conversation_id : str,
    payload: MessageCreate,
    user : User= Depends(get_current_user),
    db: AsyncSession= Depends(get_db),
):

    convo = await _get_conversation(conversation_id, user.id, db)

    async def event_stream():
        try:
            async for token in stream_rag_response(
                conversation_id=convo.id,
                user_id=user.id,
                user_query=payload.content,
                db=db,
            ):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    convo = await _get_conversation(conversation_id, user.id, db)
    await db.delete(convo)
    await db.flush()

    

async def _get_conversation(conversation_id: str, user_id: str, db: AsyncSession) -> Conversation:
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
    )
    convo = result.scalar_one_or_none()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo

