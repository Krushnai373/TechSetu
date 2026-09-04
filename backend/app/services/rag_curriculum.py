import json
import os
from typing import Dict, Any, List, Optional
from app.services.nlp_engine import nlp_engine

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
FLN_FILE = os.path.join(DATA_DIR, "nipun_fln_data.json")

try:
    with open(FLN_FILE, "r", encoding="utf-8") as f:
        FLN_DATA = json.load(f)
except Exception:
    FLN_DATA = {"grades": []}

class FLNCurriculumRAG:
    def __init__(self):
        self.curriculum = FLN_DATA

    def get_grades(self) -> List[Dict[str, Any]]:
        return self.curriculum.get("grades", [])

    def get_topics_by_grade(self, grade_id: str) -> List[Dict[str, Any]]:
        for grade in self.curriculum.get("grades", []):
            if grade["grade_id"] == grade_id:
                topics = []
                for domain in grade.get("domains", []):
                    for topic in domain.get("topics", []):
                        topics.append({
                            **topic,
                            "domain_name": domain.get("domain_name"),
                            "nipun_code": domain.get("nipun_code"),
                            "competency": domain.get("competency")
                        })
                return topics
        return []

    def generate_lesson_plan(self, grade_id: str, topic_id: str, target_lang: str = "santhali") -> Dict[str, Any]:
        topics = self.get_topics_by_grade(grade_id)
        selected = None
        for t in topics:
            if t["topic_id"] == topic_id:
                selected = t
                break
        
        if not selected and topics:
            selected = topics[0]

        if not selected:
            return {"error": "Topic not found"}

        # Enrich with bilingual prompts using NLP engine
        teacher_phrases = [
            "नमस्ते बच्चों, आज हम एक नया पाठ पढ़ेंगे।",
            "कृपया अपनी किताब खोलिए।",
            "श्यामपट्ट की ओर देखो।",
            "बहुत बढ़िया! आपने बहुत अच्छा किया।"
        ]

        bilingual_dialogue = []
        for p in teacher_phrases:
            tr = nlp_engine.translate(p, target_lang=target_lang)
            bilingual_dialogue.append({
                "hindi": p,
                "tribal_script": tr["translation_olchiki"],
                "tribal_devanagari": tr["translation_devanagari"],
                "phonetic": tr["phonetic"]
            })

        return {
            "grade_id": grade_id,
            "topic_id": selected.get("topic_id"),
            "topic_title": selected.get("title"),
            "nipun_code": selected.get("nipun_code"),
            "competency": selected.get("competency"),
            "target_language": target_lang,
            "pedagogy_objectives": [
                f"मातृभाषा ({target_lang.capitalize()}) के माध्यम से समझ विकसित करना।",
                "चित्रों और स्थानीय परिवेश की वस्तुओं द्वारा सम्प्रत्यय स्पष्टीकरण।",
                "NIPUN Bharat FLN अधिगम प्रतिफलों (Learning Outcomes) की प्राप्ति।"
            ],
            "step_by_step_teacher_guide": [
                {
                    "step": 1,
                    "title": "आरंभ एवं रुचि जाग्रति (Warm-up & Ice Breaking)",
                    "instruction": selected.get("teacher_guide", "मातृभाषा में संवाद से कक्षा शुरू करें।"),
                    "suggested_dialogue": bilingual_dialogue[0]
                },
                {
                    "step": 2,
                    "title": "सचित्र अवधारणा शिक्षण (Concept Delivery with Visuals)",
                    "instruction": f"चित्र और स्थानीय संदर्भ का उपयोग करके '{selected.get('title')}' समझाएं।",
                    "suggested_dialogue": bilingual_dialogue[1]
                },
                {
                    "step": 3,
                    "title": "बाल-केन्द्रित गतिविधि (Interactive Activity)",
                    "instruction": selected.get("activity", "समूह गतिविधि आयोजित करें।"),
                    "suggested_dialogue": bilingual_dialogue[2]
                },
                {
                    "step": 4,
                    "title": "मूल्यांकन एवं प्रतिपुष्टि (FLN Assessment & Feedback)",
                    "instruction": selected.get("assessment", "बच्चों की समझ की जांच करें।"),
                    "suggested_dialogue": bilingual_dialogue[3]
                }
            ],
            "bilingual_dialogue_cues": bilingual_dialogue
        }

rag_engine = FLNCurriculumRAG()
