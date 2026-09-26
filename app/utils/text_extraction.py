from app.models import Document
from io import Reader
import logging
import io 
from pathlib import Path

logger = logging.getLogger(__name__)


def extract_pdf(file_path: str) -> str:
    """ Extract text from pdf file using pypdf2 """
    from PyPDF2 import PdfReader

    reader= PdfReader(file_path)
    pages=[]
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
        full_text = "\n\n".join(pages)
        logger.info(f"extracted {len(full_text)} chars from PDF ({len(reader.pages)}pages)")
        return full_text

def extract_docx(file_path: str) -> str:
    """ Extract text fr(om a DOCX file using python-docx"""
    doc = Document(file_path)
    paragraphs= [p.text for p in doc.paragraphs if p.text.strip()]
    full_text= "\n\n".join(paragraphs)
    logger.info(f"Extracted{ len(full_text)} chars from DOCX ({len(paragraphs)} paragraphs)")
    return full_text


def extract_txt(file_path: str) -> str:
    """ read a file """
    text= Path(file_path).read_text(encoding="utf-8", errors="ignore")
    logger.info(f"read {len(text)} chars from TXT")
    return text

def extract_text(file_path: str, file_type: str) -> str:
    """Route extraction based on file type."""
    extractors = {
        "pdf": extract_pdf,
        "docx": extract_docx,
        "txt": extract_txt,
    }
    extractor = extractors.get(file_type)
    if extractor is None:
        raise ValueError(f"Unsupported file type: {file_type}")
    return extractor(file_path)