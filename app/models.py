from typing import Text
import uuid
from datetime import datetime
from sqlalchemy import (Column, Enum, String, Boolean, ForeignKey, Integer, DateTime, Float)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ ="users"

    id=Column(UUID(as_uuid= False), primary_key=True, default= generate_uuid)
    email=Column(String(50), unique=True, nullable=False, index= True)
    username= Column(String(100), unique=True, nullable=False, index=True)
    hashed_password= Column(String(20), nullable= False)
    created_at=Column(DateTime, default=datetime.utcnow)
    is_active=Column(Boolean, default=True)

    conversation=relationship("conversation", back_populates="user",cascade="all,delete-orphan")
    documents= relationship("documents",back_populates="user", cascade="all, delete-orphan")
    learning_history=relationship("Learninghostory", back_populates="user", cascade="all, delete-orphan")

class Conversation(Base):
    __tablename__= "conversations"

    id= Column(UUID(as_uuid=False), primary_key=True, default= generate_uuid)
    user_id=Column(UUID(as_uuid=False), ForeignKey("user.id"), nullable=False)
    title=Column(String(200), default="New Conversation")
    created_at=Column(DateTime,default=datetime.utcnow)
    updated_at=Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan",
                            order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    conversation_id = Column(UUID(as_uuid=False), ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)       
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)     
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    chunk_count = Column(Integer, default=0)
    status = Column(String(20), default="processing")   
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")


class LearningHistory(Base):
    __tablename__ = "learning_history"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    topic = Column(String(255), nullable=False)
    interaction_count = Column(Integer, default=1)
    last_interaction = Column(DateTime, default=datetime.utcnow)
    proficiency_score = Column(Float, default=0.0)     
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="learning_history")