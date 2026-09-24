from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import async_session
from sqlalchemy import select, func, desc

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import Conversation,Message,Document, User,LearningHistory
from app.schemas import UserOut, LearningHistoryOut,LearningStatsOut

router = APIRouter(prefix="/users", tags=["User"])

@router.get("/me", response_model= UserOut)
async def get_profile(
    user: User= Depends(get_current_user)
    ):
    return user

@router.get("/me/learning-stats", response_model=LearningStatsOut)
async def get_learning_stats(
    user: User= Depends(get_current_user),
    db: AsyncSession= Depends(get_db)
):

    conv_result= await db.execute(
        select(func.count(Conversation.id)).where(Conversation.user_id==user.id)
    )
    total_conversation= conv_result.scalar() or 0

    doc_result= await db.execute(
        select(func.count(Document)).where(Document.user_id==user.id)
    )
    total_documents= doc_result.scalar() or 0

    msg_result= await db.execute(
        select(func.count(Message.id))
        .join(Conversation,Message.conversation_id == Conversation.id)
        .where(Conversation.user_id == user.id)
    )
    total_messages= msg_result.scalar() or 0


    topic_result= await db.execute(
        select(LearningHistory)
        .where(LearningHistory.user_id == user.id)
        .order_by(desc(LearningHistory.last_interaction))
        .limit(20)
    )
    topics= topic_result.scalars().all()

    return LearningStatsOut(
        total_conversations=total_conversation,
        total_documents=total_documents,
        total_messages=total_messages,
        topics=[LearningHistoryOut.model_validate(t) for t in topics],
    )