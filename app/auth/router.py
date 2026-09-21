from sqlalchemy.engine import result
import email
from sqlalchemy.ext.asyncio import AsyncSession
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

@router.post("/register", response_model= UserOut,status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    existing= await db.execute(
        select(User).where((User.email == payload.email) | (User.user == payload.username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code = 400, detail ="Email or username already registered")

    user = User(
        email = payload.email,
        username= payload.username,
        hashed_password= pwd_context.hash(payload.password),

    )

    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user 

@router.post("/login", response_model= TokenResponse)
async def login(payload: UserLogin, db: AsyncSession= Depends(get_db)):
    result= await db.execute(select(User).where(User.email == payload.email))
    user= result.scalar_one_or_none()

    if not user or not pwd_context.verify(payload.password, user.hashed_password):
        raise HTTPException(status_code = 401, detail="Invalid Credential")

    token = create_access_token({"sub": user.id, "email":user.email})
    return TokenResponse(access_token=token)
