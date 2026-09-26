import os 
import logging
import uuid 
from typing import Tuple

from app.config import settings
from app.utils.text_extraction import extract_text
from app.utils.chunks import chunk_text
from app.services.embedding_service import embed_texts 