from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://raguser:ragpass@localhost:5432/ragdb"

    JWT_SECRET_KEY: str = "change-me-to-a-strong-random-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    OPENAI_API_KEY: str = "sk-no-key"
    OPENAI_API_BASE: str = "http://localhost:11434/v1"
    LLM_MODEL: str = "llama3"

    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    CHROMA_PERSIST_DIR: str = "./chroma_data"
    CHROMA_COLLECTION_NAME: str = "rag_documents"

    UPLOAD_DIR: str = "./uploads"

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive =True

settings = Settings() 
