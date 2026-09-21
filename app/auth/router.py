from sys import prefix
from fastapi import APIRouter,Depends, HTTPException,status
from sqlalchemy.ext.asyncio import async_session
from sqlalchemy import select
from passlib.context import CryptContext

from app.models import User
from app.database import get_db
from app.schemas import UserLogin,UserOut,UserRegister, TokenResponse
from app.auth.jwt import create_access_token

router= APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context= CryptContext(schemes=["bcrypt"], deprecated="auto")