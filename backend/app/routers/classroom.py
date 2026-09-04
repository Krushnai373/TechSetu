import os
import json
import time
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.nlp_engine import nlp_engine
from app.services.gemini_service import backend_gemini

router = APIRouter(prefix="/api/classroom", tags=["Classroom Database & Context"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_FILE = os.path.join(DATA_DIR, "classroom_db.json")

INITIAL_ASSIGNED_LECTURES = [
    {
        "id": "lec_c1_lang",
        "grade": "Class 1",
        "division": "A",
        "subject_id": "c1_lang",
        "subject_name": "संथाली भाषा एवं वर्णमाला",
        "name_en": "Santhali Language & Ol Chiki",
        "santhali_subject": "ᱥᱟᱱᱛᱟᱲᱤ ᱯᱟᱹᱨᱥᱤ ᱟᱨ ᱚᱞ ᱪᱤᱠᱤ",
        "icon": "📖",
        "topic": "ᱚᱞ ᱪᱤᱠᱤ ᱟᱠᱷᱚᱨ ᱩᱯᱨᱩᱢ (Introduction to Ol Chiki Letters)",
        "teacher_name": "Prof. Anand Munda",
        "time_slot": "09:00 AM - 09:45 AM",
        "status": "live",
        "attendees": [
            {"student_id": "stu_01_c1", "name": "ᱥᱩᱱᱤᱞ ᱢᱩᱨᱢᱩ (Sunil Murmu)", "roll_no": "1", "grade": "Class 1", "division": "A", "join_time": "09:05 AM", "status": "Present"},
            {"student_id": "stu_02_c1", "name": "ᱨᱟᱹᱱᱤ ᱦᱟᱸᱥᱫᱟᱜ (Rani Hansda)", "roll_no": "2", "grade": "Class 1", "division": "A", "join_time": "09:07 AM", "status": "Present"}
        ]
    },
    {
        "id": "lec_c1_math",
        "grade": "Class 1",
        "division": "A",
        "subject_id": "c1_math",
        "subject_name": "बुनियादी गणित और गिनती (1-20)",
        "name_en": "Basic Math & Numbers",
        "santhali_subject": "ᱮᱞᱠᱷᱟ ᱟᱨ ᱞᱮᱠᱷᱟ (᱑-᱒᱐)",
        "icon": "🔢",
        "topic": "ᱢᱤᱫ ᱠᱷᱚᱱ ᱜᱮᱞ ᱞᱮᱠᱷᱟ (Numbers 1 to 10 with visuals)",
        "teacher_name": "Prof. Anand Munda",
        "time_slot": "10:00 AM - 10:45 AM",
        "status": "scheduled",
        "attendees": []
    },
    {
        "id": "lec_c2_lang",
        "grade": "Class 2",
        "division": "A",
        "subject_id": "c2_lang",
        "subject_name": "भाषा एवं लोककथाएं",
        "name_en": "Language & Folktales",
        "santhali_subject": "ᱥᱟᱱᱛᱟᱲᱤ ᱠᱟᱹᱦᱱᱤ ᱟᱨ ᱯᱟᱹᱨᱥᱤ",
        "icon": "📚",
        "topic": "ᱪᱮᱬᱮ ᱟᱨ ᱦᱟᱹᱛᱤ ᱠᱟᱹᱦᱱᱤ (The Bird and Elephant Story)",
        "teacher_name": "Prof. Anand Munda",
        "time_slot": "09:00 AM - 09:45 AM",
        "status": "scheduled",
        "attendees": []
    },
    {
        "id": "lec_c2_math",
        "grade": "Class 2",
        "division": "A",
        "subject_id": "c2_math",
        "subject_name": "गणित: जोड़ और घटाव",
        "name_en": "Math: Addition & Subtraction",
        "santhali_subject": "ᱮᱞᱠᱷᱟ: ᱢᱮᱥᱟ ᱟᱨ ᱵᱷᱮᱜᱟᱨ",
        "icon": "📐",
        "topic": "ᱵᱟᱨ ᱮᱞᱠᱷᱟ ᱢᱮᱥᱟ (Two Digit Addition)",
        "teacher_name": "Prof. Anand Munda",
        "time_slot": "10:00 AM - 10:45 AM",
        "status": "scheduled",
        "attendees": []
    },
    {
        "id": "lec_c3_sci",
        "grade": "Class 3",
        "division": "A",
        "subject_id": "c3_sci",
        "subject_name": "सामान्य विज्ञान: पौधे एवं प्रकाश संश्लेषण",
        "name_en": "Science: Plants & Photosynthesis",
        "santhali_subject": "ᱥᱟᱬᱮᱥ: ᱫᱟᱨᱮ ᱟᱨ ᱡᱚᱢᱟᱜ ᱵᱮᱱᱟᱣ",
        "icon": "🔬",
        "topic": "ᱫᱟᱨᱮ ᱠᱚ ᱪᱮᱫ ᱞᱮᱠᱟ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ? (How Plants Make Food)",
        "teacher_name": "Prof. Anand Munda",
        "time_slot": "09:00 AM - 09:45 AM",
        "status": "live",
        "attendees": [
            {"student_id": "stu_14_Class3_A", "name": "ᱵᱤᱨᱥᱟ ᱥᱚᱨᱮᱱ (Birsa Soren)", "roll_no": "14", "grade": "Class 3", "division": "A", "join_time": "09:02 AM", "status": "Present"},
            {"student_id": "stu_05_c3", "name": "ᱥᱟᱹᱱᱛᱤ ᱴᱩᱰᱩ (Shanti Tudu)", "roll_no": "5", "grade": "Class 3", "division": "A", "join_time": "09:06 AM", "status": "Present"},
            {"student_id": "stu_09_c3", "name": "ᱢᱟᱞᱚᱛᱤ ᱢᱩᱨᱢᱩ (Malati Murmu)", "roll_no": "9", "grade": "Class 3", "division": "A", "join_time": "09:10 AM", "status": "Present"}
        ]
    },
    {
        "id": "lec_c3_math",
        "grade": "Class 3",
        "division": "A",
        "subject_id": "c3_math",
        "subject_name": "गणित: पहाड़े और गुणन",
        "name_en": "Math: Multiplication & Tables",
        "santhali_subject": "ᱮᱞᱠᱷᱟ: ᱜᱩᱬᱟᱹᱣ ᱟᱨ ᱞᱮᱠᱷᱟ",
        "icon": "🧮",
        "topic": "ᱯᱮ ᱟᱨ ᱯᱳᱱ ᱨᱮᱱᱟᱜ ᱜᱩᱬᱟᱹᱣ (Tables of 3 and 4)",
        "teacher_name": "Prof. Anand Munda",
        "time_slot": "10:00 AM - 10:45 AM",
        "status": "scheduled",
        "attendees": []
    },
    {
        "id": "lec_c3_soc",
        "grade": "Class 3",
        "division": "A",
        "subject_id": "c3_soc",
        "subject_name": "झारखंड संस्कृति व हमारा समाज",
        "name_en": "Social Studies & Tribal Culture",
        "santhali_subject": "ᱥᱟᱶᱛᱟ ᱥᱟᱬᱮᱥ ᱟᱨ ᱦᱮᱨᱤᱴᱮᱡᱽ",
        "icon": "🏛️",
        "topic": "ᱵᱤᱨᱥᱟ ᱢᱩᱱᱰᱟ ᱟᱨ ᱥᱟᱨᱦᱩᱞ ᱯᱟᱨᱵᱚ (Birsa Munda & Sarhul Festival)",
        "teacher_name": "Prof. Anand Munda",
        "time_slot": "11:00 AM - 11:45 AM",
        "status": "scheduled",
        "attendees": []
    },
    {
        "id": "lec_c4_evs",
        "grade": "Class 4",
        "division": "A",
        "subject_id": "c4_evs",
        "subject_name": "पर्यावरण विज्ञान: जल व वन संरक्षण",
        "name_en": "EVS: Water & Forest Conservation",
        "santhali_subject": "ᱯᱚᱨᱤᱵᱮᱥ ᱥᱟᱬᱮᱥ: ᱫᱟᱜ ᱟᱨ ᱵᱤᱨ ᱵᱟᱧᱪᱟᱣ",
        "icon": "🌍",
        "topic": "ᱡᱟᱞ ᱜᱮ ᱡᱤᱣᱤ ᱠᱟᱱᱟ (Water Conservation in Jharkhand)",
        "teacher_name": "Prof. Anand Munda",
        "time_slot": "09:00 AM - 09:45 AM",
        "status": "scheduled",
        "attendees": []
    },
    {
        "id": "lec_c4_math",
        "grade": "Class 4",
        "division": "A",
        "subject_id": "c4_math",
        "subject_name": "गणित: भाग एवं ज्यामितीय आकृतियाँ",
        "name_en": "Math: Division & Shapes",
        "santhali_subject": "ᱮᱞᱠᱷᱟ: ᱦᱟᱹᱴᱤᱧ ᱟᱨ ᱨᱩᱯ",
        "icon": "📐",
        "topic": "ᱦᱟᱹᱴᱤᱧ ᱟᱨ ᱯᱮᱠᱳᱬ (Division and Triangles)",
        "teacher_name": "Prof. Anand Munda",
        "time_slot": "10:00 AM - 10:45 AM",
        "status": "scheduled",
        "attendees": []
    },
    {
        "id": "lec_c5_sci",
        "grade": "Class 5",
        "division": "A",
        "subject_id": "c5_sci",
        "subject_name": "सामान्य विज्ञान: मानव शरीर व स्वास्थ्य",
        "name_en": "Science: Human Body & Health",
        "santhali_subject": "ᱥᱟᱬᱮᱥ: ᱦᱚᱲᱢᱚ ᱟᱨ ᱦᱚᱲᱢᱚ ᱱᱟᱯᱟᱭ",
        "icon": "🧬",
        "topic": "ᱦᱚᱲᱢᱚ ᱨᱮᱱᱟᱜ ᱢᱩᱬ ᱚᱝᱜᱚ (Major Organ Systems of Body)",
        "teacher_name": "Prof. Anand Munda",
        "time_slot": "09:00 AM - 09:45 AM",
        "status": "live",
        "attendees": [
            {"student_id": "stu_01_c5", "name": "ᱚᱨᱡᱩᱱ ᱦᱮᱢᱵᱽᱨᱚᱢ (Arjun Hembrom)", "roll_no": "1", "grade": "Class 5", "division": "A", "join_time": "09:01 AM", "status": "Present"}
        ]
    }
]

def load_db() -> Dict[str, Any]:
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "lectures" not in data:
                    data["lectures"] = INITIAL_ASSIGNED_LECTURES
                return data
        except Exception:
            pass
    return {
        "messages": [],
        "questions": [],
        "lectures": INITIAL_ASSIGNED_LECTURES
    }

def save_db(data: Dict[str, Any]):
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Error saving classroom DB:", e)

class MessagePayload(BaseModel):
    id: Optional[str] = None
    speaker: str = "teacher"
    teacher_name: str = "Teacher"
    hindi_text: str
    santhali_script: Optional[str] = None
    phonetic: Optional[str] = None
    subject: Optional[str] = "General"
    timestamp: Optional[float] = None
    time_string: Optional[str] = None

class QuestionPayload(BaseModel):
    id: Optional[str] = None
    student_id: Optional[str] = "1"
    student_name: str = "Student"
    roll_no: Optional[str] = "1"
    grade: Optional[str] = "Class 3"
    division: Optional[str] = "A"
    school: Optional[str] = "Govt. School"
    language: str = "santhali"
    question_text: str
    translated_hindi: Optional[str] = None
    time_string: Optional[str] = None

class AnswerPayload(BaseModel):
    question_id: str
    teacher_name: str = "Teacher"
    reply_hindi: str
    reply_tribal: str
    phonetic: Optional[str] = ""
    language: str = "santhali"
    concept_referenced: Optional[str] = "Previous Lesson"

class DoubtRequest(BaseModel):
    question_text: str
    student_name: Optional[str] = "Student"
    grade: Optional[str] = "Class 3"

class LecturePayload(BaseModel):
    id: Optional[str] = None
    grade: str = "Class 3"
    division: str = "A"
    target_class: Optional[str] = None
    section: Optional[str] = None
    subject_id: str
    subject_name: str
    name_en: Optional[str] = ""
    santhali_subject: Optional[str] = ""
    icon: str = "📖"
    topic: str
    teacher_name: str = "Prof. Anand Munda"
    date: Optional[str] = None
    start_time: Optional[str] = "09:00 AM"
    end_time: Optional[str] = "09:45 AM"
    time_slot: Optional[str] = "09:00 AM - 09:45 AM"
    status: str = "live"

class AttendancePayload(BaseModel):
    lecture_id: str
    student_id: str
    student_name: str
    roll_no: str
    grade: str
    division: str = "A"
    join_time: Optional[str] = None
    leave_time: Optional[str] = None
    duration_seconds: Optional[int] = 0
    status: Optional[str] = "Present"
    threshold_percent: Optional[float] = 80.0

# ----------------- Messages Endpoints -----------------

@router.get("/messages")
def get_messages(limit: int = Query(30)):
    db = load_db()
    messages = db.get("messages", [])
    return messages[-limit:]

@router.post("/messages")
def save_message(msg: MessagePayload):
    db = load_db()
    entry = msg.dict()
    if not entry.get("id"):
        entry["id"] = f"msg_{int(time.time() * 1000)}"
    if not entry.get("timestamp"):
        entry["timestamp"] = time.time()
    if not entry.get("time_string"):
        entry["time_string"] = time.strftime("%I:%M %p")

    if not entry.get("santhali_script") and entry.get("hindi_text"):
        tr = nlp_engine.translate(entry["hindi_text"], "hindi", "santhali")
        entry["santhali_script"] = tr["translation_olchiki"]
        entry["phonetic"] = tr["phonetic"]

    db["messages"].append(entry)
    db["messages"] = db["messages"][-200:]
    save_db(db)
    return {"status": "saved", "message": entry}

def parse_time_to_minutes(time_str: str) -> int:
    """Parses '09:00 AM', '11:30', '11:45 PM' into minutes from midnight."""
    if not time_str:
        return 0
    clean = str(time_str).strip().upper()
    is_pm = "PM" in clean
    is_am = "AM" in clean
    clean = clean.replace("AM", "").replace("PM", "").strip()
    try:
        parts = clean.split(":")
        hours = int(parts[0])
        mins = int(parts[1]) if len(parts) > 1 else 0
        if is_pm and hours < 12:
            hours += 12
        elif is_am and hours == 12:
            hours = 0
        return hours * 60 + mins
    except Exception:
        return 0

# ----------------- Lectures Endpoints -----------------

@router.get("/lectures")
def get_lectures(grade: Optional[str] = Query(None), division: Optional[str] = Query(None)):
    db = load_db()
    lectures = db.get("lectures", [])
    today_str = time.strftime("%Y-%m-%d")
    now_mins = int(time.strftime("%H")) * 60 + int(time.strftime("%M"))
    
    modified = False
    filtered = []

    for l in lectures:
        # Check if lecture has expired (past date, or today and end_time passed)
        l_date = l.get("date", today_str)
        l_end = parse_time_to_minutes(l.get("end_time") or (l.get("time_slot", "").split("-")[-1] if "-" in l.get("time_slot", "") else "11:59 PM"))
        
        if l.get("status") in ["live", "scheduled"]:
            if l_date < today_str or (l_date == today_str and l_end > 0 and now_mins > l_end):
                l["status"] = "completed"
                modified = True

        l_grade = l.get("target_class") or l.get("grade")
        l_div = l.get("section") or l.get("division")
        
        if grade and grade != "all" and l_grade != grade:
            continue
        if division and division != "all" and l_div != division:
            continue
        filtered.append(l)

    if modified:
        save_db(db)

    return filtered

@router.post("/lectures")
def assign_lecture(lec: LecturePayload):
    db = load_db()
    entry = lec.dict()
    if not entry.get("id"):
        entry["id"] = f"lec_{int(time.time() * 1000)}"
    
    # Normalize fields
    if not entry.get("target_class"):
        entry["target_class"] = entry.get("grade", "Class 3")
    if not entry.get("section"):
        entry["section"] = entry.get("division", "A")
    if entry.get("start_time") and entry.get("end_time"):
        entry["time_slot"] = f"{entry['start_time']} - {entry['end_time']}"
    if not entry.get("date"):
        entry["date"] = time.strftime("%Y-%m-%d")
    if not entry.get("santhali_subject"):
        entry["santhali_subject"] = entry.get("subject_name", "")

    start_min = parse_time_to_minutes(entry.get("start_time", "09:00 AM"))
    end_min = parse_time_to_minutes(entry.get("end_time", "09:45 AM"))
    if end_min <= start_min:
        end_min = start_min + 45

    # Check for slot collision with existing active or scheduled lectures on same date for same class & section
    for ex in db.get("lectures", []):
        if ex.get("id") == entry.get("id") or ex.get("status") == "completed":
            continue
        ex_grade = ex.get("target_class") or ex.get("grade")
        ex_div = ex.get("section") or ex.get("division")
        ex_date = ex.get("date") or time.strftime("%Y-%m-%d")

        if ex_grade == entry["target_class"] and ex_div == entry["section"] and ex_date == entry["date"]:
            ex_start = parse_time_to_minutes(ex.get("start_time", "09:00 AM"))
            ex_end = parse_time_to_minutes(ex.get("end_time", "09:45 AM"))
            if ex_end <= ex_start:
                ex_end = ex_start + 45

            # Collision check: intervals overlap if start1 < end2 and start2 < end1
            if start_min < ex_end and ex_start < end_min:
                raise HTTPException(
                    status_code=409,
                    detail=f"Slot Conflict! {entry['target_class']} - Section {entry['section']} is already booked on {entry['date']} for '{ex.get('topic')}' ({ex.get('start_time')} - {ex.get('end_time')}). Please choose a different time slot or date."
                )

    entry["attendees"] = []

    db["lectures"].insert(0, entry)
    save_db(db)
    return {"status": "assigned", "lecture": entry}

@router.post("/lectures/end/{lecture_id}")
def end_lecture(lecture_id: str):
    db = load_db()
    for l in db.get("lectures", []):
        if l.get("id") == lecture_id:
            l["status"] = "completed"
            l["ended_at"] = time.time()
            save_db(db)
            return {"status": "ended", "lecture_id": lecture_id}
    raise HTTPException(status_code=404, detail="Lecture not found")

# ----------------- Attendance Endpoints -----------------

@router.post("/attendance")
def mark_attendance(att: AttendancePayload):
    db = load_db()
    lectures = db.get("lectures", [])
    for l in lectures:
        if l.get("id") == att.lecture_id:
            attendees = l.setdefault("attendees", [])
            existing_idx = next((i for i, a in enumerate(attendees) if a.get("roll_no") == att.roll_no and a.get("grade") == att.grade), None)
            
            now_str = time.strftime("%I:%M %p")
            duration = att.duration_seconds or 0

            # Determine attendance status based on duration threshold (default >= 80% of class or minimum 10 min)
            status = att.status or "Present"
            if duration > 0:
                # If duration is reported, check threshold
                status = "Present" if duration >= 600 or (att.threshold_percent and att.threshold_percent <= 80) else "Partial"

            if existing_idx is not None:
                # Update existing record
                record = attendees[existing_idx]
                record["leave_time"] = att.leave_time or now_str
                record["duration_seconds"] = max(record.get("duration_seconds", 0), duration)
                record["duration_minutes"] = round(record["duration_seconds"] / 60, 1)
                record["status"] = status
                save_db(db)
                return {"status": "updated", "record": record, "total_attended": len(attendees)}
            else:
                attendee_record = {
                    "student_id": att.student_id,
                    "name": att.student_name,
                    "roll_no": att.roll_no,
                    "grade": att.grade,
                    "division": att.division,
                    "join_time": att.join_time or now_str,
                    "leave_time": att.leave_time or "-",
                    "duration_seconds": duration,
                    "duration_minutes": round(duration / 60, 1),
                    "status": status
                }
                attendees.append(attendee_record)
                save_db(db)
                return {"status": "marked", "record": attendee_record, "total_attended": len(attendees)}
    
    return {"status": "lecture_not_found"}

@router.get("/attendance/{lecture_id}")
def get_attendance(lecture_id: str):
    db = load_db()
    lectures = db.get("lectures", [])
    for l in lectures:
        if l.get("id") == lecture_id:
            return {
                "lecture_id": lecture_id,
                "topic": l.get("topic"),
                "grade": l.get("target_class") or l.get("grade"),
                "division": l.get("section") or l.get("division"),
                "subject": l.get("subject_name"),
                "date": l.get("date", time.strftime("%Y-%m-%d")),
                "time_slot": l.get("time_slot"),
                "attendees": l.get("attendees", []),
                "total": len(l.get("attendees", []))
            }
    return {"lecture_id": lecture_id, "attendees": [], "total": 0}

@router.get("/attendance/export/{lecture_id}")
def export_attendance_csv(lecture_id: str):
    db = load_db()
    lectures = db.get("lectures", [])
    target = next((l for l in lectures if l.get("id") == lecture_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    attendees = target.get("attendees", [])
    csv_lines = [
        "Student ID,Student Name,Roll No,Grade,Section,Join Time,Leave Time,Duration (Mins),Status"
    ]
    for a in attendees:
        dur = a.get("duration_minutes", round(a.get("duration_seconds", 0) / 60, 1))
        line = f'"{a.get("student_id")}","{a.get("name")}","{a.get("roll_no")}","{a.get("grade")}","{a.get("division")}","{a.get("join_time")}","{a.get("leave_time")}","{dur}","{a.get("status")}"'
        csv_lines.append(line)
    
    return {
        "lecture_id": lecture_id,
        "topic": target.get("topic"),
        "date": target.get("date", time.strftime("%Y-%m-%d")),
        "class_section": f"{target.get('target_class') or target.get('grade')} - {target.get('section') or target.get('division')}",
        "csv_content": "\n".join(csv_lines),
        "total_present": sum(1 for a in attendees if a.get("status") == "Present"),
        "total_records": len(attendees)
    }

# ----------------- Questions & Doubts Endpoints -----------------

@router.get("/questions")
def get_questions():
    db = load_db()
    return db.get("questions", [])

@router.post("/ask")
def ask_question(q: QuestionPayload):
    db = load_db()
    entry = q.dict()
    if not entry.get("id"):
        entry["id"] = f"q_{int(time.time() * 1000)}"
    if not entry.get("time_string"):
        entry["time_string"] = time.strftime("%I:%M %p")
    entry["status"] = "pending"
    entry["reply"] = None
    entry["timestamp"] = time.time()

    db["questions"].append(entry)
    save_db(db)
    return {"status": "created", "question": entry}

@router.post("/answer")
def answer_question(ans: AnswerPayload):
    db = load_db()
    questions = db.get("questions", [])
    found = None
    for q in questions:
        if q["id"] == ans.question_id:
            q["status"] = "answered"
            q["reply"] = {
                "teacher_name": ans.teacher_name,
                "reply_hindi": ans.reply_hindi,
                "reply_tribal": ans.reply_tribal,
                "phonetic": ans.phonetic,
                "language": ans.language,
                "concept_referenced": ans.concept_referenced,
                "time_string": time.strftime("%I:%M %p")
            }
            found = q
            break

    if found:
        save_db(db)
        return {"status": "answered", "question": found}
    raise HTTPException(status_code=404, detail="Question ID not found")

@router.post("/resolve-doubt")
def resolve_doubt(req: DoubtRequest):
    """Context-aware doubt resolution using chronological lessons saved in DB"""
    db = load_db()
    messages = db.get("messages", [])
    teacher_lessons = [m for m in messages if m.get("speaker") == "teacher"][-8:]

    context_lines = []
    for l in teacher_lessons:
        context_lines.append(f"Teacher taught: {l.get('hindi_text', '')} (Santhali: {l.get('santhali_script', '')})")
    context_str = "\n".join(context_lines)

    matched_lesson = teacher_lessons[-1] if teacher_lessons else None
    topic_title = matched_lesson.get("subject", "Previous Lesson") if matched_lesson else "Previous Lesson"
    lesson_hindi = matched_lesson.get("hindi_text", "पौधे सूर्य के प्रकाश और पानी से भोजन बनाते हैं।") if matched_lesson else ""

    q_lower = req.question_text.lower()
    if "भोजन" in q_lower or "खाना" in q_lower or "पौध" in q_lower or "पेड़" in q_lower:
        reply_hindi = "हाँ बच्चों! जैसा हमने अभी पढ़ा: पौधे सूर्य के प्रकाश (धूप), पानी और हवा से पत्तियों में अपना भोजन बनाते हैं।"
        reply_tribal = "ᱫᱟᱨᱮ ᱠᱚᱫᱚ ᱵᱮᱲᱟ ᱨᱮᱱᱟᱜ ᱢᱟᱨᱥᱟᱞ, ᱫᱟᱜ ᱟᱨ ᱦᱚᱭ ᱛᱮ ᱟᱠᱚᱣᱟᱜ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ᱾"
        phonetic = "Dare kodo bera renag marsal, daag ar hoy te akowag jomag ko benawa."
        topic_title = "Science - Photosynthesis & Plant Food"
    elif "पानी" in q_lower or "जल" in q_lower:
        reply_hindi = "पानी सभी जीवों और पेड़-पौधों के लिए बहुत जरूरी है। जल ही जीवन है।"
        reply_tribal = "ᱫᱟᱜ ᱜᱮ ᱡᱤᱣᱤ ᱠᱟᱱᱟ! ᱥᱟᱱᱟᱢ ᱡᱤᱭᱟᱹᱞᱤ ᱟᱨ ᱫᱟᱨᱮ ᱞᱟᱹᱜᱤᱫ ᱫᱟᱜ ᱫᱚᱨᱠᱟᱨ᱾"
        phonetic = "Daag ge jiwi kana! Sanam jiyali ar dare lagid daag dorkar."
        topic_title = "Science - Water & Life"
    elif "समझ" in q_lower or "नहीं" in q_lower or "दोबारा" in q_lower:
        reply_hindi = f"कोई बात नहीं! पाठ के अनुसार: {lesson_hindi} इसे अपनी कॉपी में लिख लें।"
        tr = nlp_engine.translate(f"कोई बात नहीं, इसे ध्यान से समझें। {lesson_hindi}", "hindi", "santhali")
        reply_tribal = tr["translation_olchiki"]
        phonetic = tr["phonetic"]
    else:
        reply_hindi = f"पाठ के अनुसार: {lesson_hindi}। बहुत अच्छा सवाल पूछा आपने!"
        tr = nlp_engine.translate(f"बहुत अच्छा सवाल! {lesson_hindi}", "hindi", "santhali")
        reply_tribal = tr["translation_olchiki"]
        phonetic = tr["phonetic"]

    return {
        "reply_tribal": reply_tribal,
        "reply_devanagari": reply_hindi,
        "reply_hindi": reply_hindi,
        "phonetic": phonetic,
        "concept_referenced": topic_title,
        "source": "database_lesson_history"
    }
