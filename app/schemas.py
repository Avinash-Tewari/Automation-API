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



