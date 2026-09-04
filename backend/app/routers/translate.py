from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.nlp_engine import nlp_engine

router = APIRouter(prefix="/api/translate", tags=["Translation"])

class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "hindi"
    target_lang: str = "santhali"

class TranslationResponse(BaseModel):
    source_text: str
    target_lang: str
    translation_olchiki: str
    translation_devanagari: str
    phonetic: str
    english: str
    category: str
    latency_ms: float
    confidence: float
    match_type: str

@router.post("", response_model=TranslationResponse)
def translate_text(req: TranslationRequest):
    result = nlp_engine.translate(
        text=req.text,
        source_lang=req.source_lang,
        target_lang=req.target_lang
    )
    return result

@router.get("/phrases")
def get_phrases(category: Optional[str] = Query(None)):
    return nlp_engine.get_all_phrases(category=category)

@router.get("/vocab")
def get_vocab(category: Optional[str] = Query(None)):
    return nlp_engine.get_all_vocab(category=category)
