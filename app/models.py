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

    id=
    email=
    username=

