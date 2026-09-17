from fastapi import FastAPI
import os 
import logging 
from fastapi.middleware.cors import CORSmiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db

logging.basicConfig(
    level = logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.get-logger("rag-assistant")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting the RAG application")

    os.makedirs(settings.UPLOAD_DIR, exist_ok= True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "documents"), exist_ok= True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "images"), exist_ok= True)

    await init_db()
    logger.info("Database Tables intialised")
    logger.info("Application Ready")
    yield
    logger.info("Shutting down")



app = FastAPI(
    title = "RAG based API",
    description= "Multimodal RAG-powered adaptive learning platform",
    version= "1.0",
    lifespan= lifespan
)

app.add_middleware(
    CORSmiddleware,
    allow_origin= settings.cors_origin_list,
    allow_credential=True,
    allow_methods=["*"],
    allow_header=["*"]
)