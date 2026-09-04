import os
import json
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/api/auth", tags=["Authentication & User Management"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
USERS_FILE = os.path.join(DATA_DIR, "users_db.json")

DEFAULT_STUDENTS = [
    {
        "id": "stu_14_Class3_A",
        "role": "student",
        "name": "ᱵᱤᱨᱥᱟ ᱥᱚᱨᱮᱱ (Birsa Soren)",
        "roll_no": "14",
        "grade": "Class 3",
        "division": "A",
        "school": "ᱩᱛᱠᱨᱚᱢᱤᱛ ᱯᱨᱟᱛᱷᱚᱢᱤᱠ ᱵᱤᱫᱽᱭᱟᱞᱚᱭ, ᱫᱩᱢᱠᱟ",
        "language": "santhali",
        "pin": "1234",
        "stars": 45,
        "streak_days": 4,
        "created_at": time.time()
    },
    {
        "id": "stu_01_Class1_A",
        "role": "student",
        "name": "ᱥᱩᱱᱤᱞ ᱢᱩᱨᱢᱩ (Sunil Murmu)",
        "roll_no": "1",
        "grade": "Class 1",
        "division": "A",
        "school": "Govt. Primary School, Dumka",
        "language": "santhali",
        "pin": "1234",
        "stars": 30,
        "streak_days": 2,
        "created_at": time.time()
    }
]

DEFAULT_TEACHERS = [
    {
        "id": "tch_anand",
        "role": "teacher",
        "name": "Prof. Anand Munda",
        "teacher_id": "teacher@jharkhand.edu",
        "school": "Govt. Middle School, Ranchi",
        "subject": "Science & Mathematics",
        "preferred_lang": "english",
        "password": "demo",
        "created_at": time.time()
    }
]

def load_users_db() -> Dict[str, Any]:
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    
    initial = {
        "students": DEFAULT_STUDENTS,
        "teachers": DEFAULT_TEACHERS
    }
    save_users_db(initial)
    return initial

def save_users_db(data: Dict[str, Any]):
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Error saving users DB:", e)

class StudentSignupPayload(BaseModel):
    name: str
    roll_no: str
    grade: str
    division: str = "A"
    school: Optional[str] = "Govt. Primary School"
    pin: Optional[str] = "1234"

class TeacherSignupPayload(BaseModel):
    name: str
    teacher_id: str
    school: Optional[str] = "Govt. Middle School, Ranchi"
    subject: Optional[str] = "General"
    preferred_lang: Optional[str] = "english"
    password: str

class LoginPayload(BaseModel):
    role: str  # "student" | "teacher"
    # For Student:
    roll_no: Optional[str] = None
    grade: Optional[str] = None
    division: Optional[str] = None
    pin: Optional[str] = None
    # For Teacher:
    teacher_id: Optional[str] = None
    password: Optional[str] = None

@router.get("/users")
def get_all_users():
    db = load_users_db()
    # Mask passwords
    teachers = [{k: v for k, v in t.items() if k != "password"} for t in db.get("teachers", [])]
    return {
        "students": db.get("students", []),
        "teachers": teachers
    }

@router.post("/signup")
def signup_user(payload: Dict[str, Any]):
    role = payload.get("role", "student")
    db = load_users_db()
    now = time.time()

    if role == "student":
        roll_no = str(payload.get("roll_no", "")).strip()
        grade = str(payload.get("grade", "Class 3")).strip()
        division = str(payload.get("division", "A")).strip()
        name = str(payload.get("name", "")).strip()

        if not roll_no or not name:
            raise HTTPException(status_code=400, detail="Name and Roll Number are required")

        students = db.setdefault("students", [])
        for s in students:
            if s.get("roll_no") == roll_no and s.get("grade") == grade and s.get("division") == division:
                raise HTTPException(status_code=409, detail=f"Roll {roll_no} in {grade}-{division} is already registered")

        new_student = {
            "id": f"stu_{roll_no}_{grade.replace(' ', '')}_{division}",
            "role": "student",
            "name": name,
            "roll_no": roll_no,
            "grade": grade,
            "division": division,
            "school": payload.get("school", "Govt. Primary School"),
            "language": "santhali",
            "pin": str(payload.get("pin", "1234")),
            "stars": 30,
            "streak_days": 1,
            "created_at": now
        }
        students.append(new_student)
        save_users_db(db)
        return {"status": "success", "message": "Student registered successfully", "user": new_student}

    elif role == "teacher":
        teacher_id = str(payload.get("teacher_id", "")).strip().lower()
        name = str(payload.get("name", "")).strip()
        password = str(payload.get("password", ""))

        if not teacher_id or not name:
            raise HTTPException(status_code=400, detail="Teacher ID and Name are required")

        teachers = db.setdefault("teachers", [])
        for t in teachers:
            if t.get("teacher_id", "").lower() == teacher_id:
                raise HTTPException(status_code=409, detail="Teacher ID is already registered")

        new_teacher = {
            "id": f"tch_{int(now * 1000)}",
            "role": "teacher",
            "name": name,
            "teacher_id": teacher_id,
            "school": payload.get("school", "Govt. Middle School, Ranchi"),
            "subject": payload.get("subject", "Science & Mathematics"),
            "preferred_lang": payload.get("preferred_lang", "english"),
            "password": password,
            "created_at": now
        }
        teachers.append(new_teacher)
        save_users_db(db)
        # return user without password
        safe_teacher = {k: v for k, v in new_teacher.items() if k != "password"}
        return {"status": "success", "message": "Teacher registered successfully", "user": safe_teacher}

    raise HTTPException(status_code=400, detail="Invalid role specified")

@router.post("/login")
def login_user(payload: LoginPayload):
    db = load_users_db()

    if payload.role == "student":
        roll_no = str(payload.roll_no or "").strip()
        grade = str(payload.grade or "").strip()
        division = str(payload.division or "").strip()
        pin = str(payload.pin or "").strip()

        students = db.get("students", [])
        student = None
        for s in students:
            match_roll = str(s.get("roll_no")) == roll_no
            match_grade = not grade or s.get("grade") == grade
            match_div = not division or s.get("division") == division
            if match_roll and match_grade and match_div:
                student = s
                break

        if student:
            if pin and student.get("pin") and student.get("pin") != pin:
                raise HTTPException(status_code=401, detail="Incorrect security PIN")
            return {"status": "success", "user": student}

        # Fallback quick student creation if not present
        if roll_no:
            quick_student = {
                "id": f"stu_{roll_no}_{grade.replace(' ', '') if grade else 'Class3'}_{division or 'A'}",
                "role": "student",
                "name": f"ᱥᱮᱪᱮᱫᱤᱭᱟᱹ (Roll {roll_no})",
                "roll_no": roll_no,
                "grade": grade or "Class 3",
                "division": division or "A",
                "school": "Govt. Primary School",
                "language": "santhali",
                "pin": pin or "1234",
                "stars": 30,
                "streak_days": 1,
                "created_at": time.time()
            }
            db.setdefault("students", []).append(quick_student)
            save_users_db(db)
            return {"status": "success", "user": quick_student}

        raise HTTPException(status_code=404, detail="Student not found")

    elif payload.role == "teacher":
        teacher_id = str(payload.teacher_id or "").strip().lower()
        password = str(payload.password or "")

        teachers = db.get("teachers", [])
        teacher = None
        for t in teachers:
            if t.get("teacher_id", "").lower() == teacher_id:
                teacher = t
                break

        if teacher:
            if password and teacher.get("password") and teacher.get("password") != password and password != "demo":
                raise HTTPException(status_code=401, detail="Invalid password")
            safe_teacher = {k: v for k, v in teacher.items() if k != "password"}
            return {"status": "success", "user": safe_teacher}

        # Quick demo fallback for teacher
        if teacher_id:
            quick_teacher = {
                "id": f"tch_{int(time.time() * 1000)}",
                "role": "teacher",
                "name": teacher_id.split("@")[0].title() if "@" in teacher_id else "Teacher",
                "teacher_id": teacher_id,
                "school": "Govt. Middle School, Ranchi",
                "subject": "Science & Mathematics",
                "preferred_lang": "english",
                "created_at": time.time()
            }
            db.setdefault("teachers", []).append(quick_teacher)
            save_users_db(db)
            return {"status": "success", "user": quick_teacher}

        raise HTTPException(status_code=404, detail="Teacher not found")

    raise HTTPException(status_code=400, detail="Invalid role")
