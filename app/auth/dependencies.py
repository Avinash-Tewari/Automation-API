"""
FastAPI dependency to extract and validate the current user from JWT.
"""

from sqlalchemy import select
import token
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.auth.jwt import verify_token


security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db : AsyncSession= Depends(get_db),
) -> User:
        token= credentials.credentials
        payload = verify_token(token)
        if payload is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail= "invalid token payload")

            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user is None or not user.is_active:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

        return user