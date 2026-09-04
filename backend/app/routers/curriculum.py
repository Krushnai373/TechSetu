from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.rag_curriculum import rag_engine

router = APIRouter(prefix="/api/curriculum", tags=["Curriculum"])

class LessonGenerateRequest(BaseModel):
    grade_id: str = "balvatika"
    topic_id: str = "topic_b1"
    target_lang: str = "santhali"

@router.get("/grades")
def get_grades():
    return rag_engine.get_grades()

@router.get("/topics/{grade_id}")
def get_topics(grade_id: str):
    return rag_engine.get_topics_by_grade(grade_id)

@router.post("/generate-lesson")
def generate_lesson(req: LessonGenerateRequest):
    return rag_engine.generate_lesson_plan(
        grade_id=req.grade_id,
        topic_id=req.topic_id,
        target_lang=req.target_lang
    )
