from starlette.responses import Content
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List

class UserRegister(BaseModel):
    email: EmailStr
    name: str= Field(min_length=3, max_length=50)
    password: str= Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str= "bearer"

class UserOut(BaseModel):
    id: str
    email: str
    username: str
    created_at: datetime

    class config:
        from_attributes= True

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ConversationOut(BaseModel):
    id: str
    title:str
    created_at: datetime
    updated_at: datetime

    class config:
        from_attributes = True


class MessageCreate(BaseModel):
    content: str = Field(min_length=1)

class MessageOut(BaseModel):
    content: str
    id : str
    role: str
    created_at: datetime

    class Config:
        from_attributes= True

class DocumentOut(BaseModel):
    id: str
    filename : str
    file_type: str
    file_size: str
    chunk_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes= True

class LearningHistoryOut(BaseModel):
    id: str
    topic: str
    interaction_count: int
    last_interaction: datetime
    proficiency_score= float

    class Config:
        from_attributes= True
        

class LearningStatsOut(BaseModel):
    total_conversations: int 
    total_documents: int
    total_messages: int
    topic: List[LearningHistoryOut]

