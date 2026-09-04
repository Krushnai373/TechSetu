from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.nlp_engine import nlp_engine

router = APIRouter(prefix="/api/worksheets", tags=["Worksheets & Flashcards"])

class WorksheetGenerateRequest(BaseModel):
    grade: str = "Grade 1"
    subject: str = "Literacy"
    target_lang: str = "santhali"
    worksheet_type: str = "matching"  # matching, fill_blank, counting, picture_naming

@router.post("/generate")
def generate_worksheet(req: WorksheetGenerateRequest):
    vocab = nlp_engine.get_all_vocab()
    
    if req.worksheet_type == "matching":
        # Create matching pairs (Hindi word & Tribal word/icon)
        items = vocab[:6]
        pairs = []
        for it in items:
            pairs.append({
                "id": it["id"],
                "icon": it.get("icon", "📝"),
                "hindi": it["hindi"],
                "tribal_script": it.get("santhali_olchiki") if req.target_lang == "santhali" else it.get(f"{req.target_lang}_devanagari", it.get("santhali_devanagari")),
                "tribal_devanagari": it.get(f"{req.target_lang}_devanagari", it.get("santhali_devanagari")),
                "phonetic": it.get("santhali_phonetic", "")
            })
        return {
            "title": f"Bilingual Word Matching Worksheet ({req.grade} - {req.target_lang.capitalize()})",
            "instructions": "चित्र देखकर सही संथाली / हो / मुंडारी शब्द से रेखा खींचकर मिलान करें।",
            "type": "matching",
            "pairs": pairs,
            "max_score": len(pairs) * 10
        }

    elif req.worksheet_type == "counting":
        numbers = [v for v in vocab if v.get("category") == "numbers"][:5]
        counting_items = []
        for n in numbers:
            counting_items.append({
                "id": n["id"],
                "icon": "🍃",  # Sal leaves
                "count": int(n["english"].lower() == "one" and 1 or n["english"].lower() == "two" and 2 or n["english"].lower() == "three" and 3 or n["english"].lower() == "four" and 4 or 5),
                "hindi": n["hindi"],
                "tribal_script": n.get("santhali_olchiki", ""),
                "phonetic": n.get("santhali_phonetic", "")
            })
        return {
            "title": f"FLN Numeracy Counting Worksheet ({req.grade})",
            "instructions": "पत्तियों को गिनें और सही संथाली संख्या लिखें / चुनें।",
            "type": "counting",
            "items": counting_items,
            "max_score": len(counting_items) * 10
        }

    else:
        # Flashcard set
        items = vocab[:8]
        return {
            "title": f"Tribal Visual Flashcards ({req.target_lang.capitalize()})",
            "cards": items
        }
