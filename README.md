# TechSetu 🌺
### Multilingual Vernacular Education & Real-Time Classroom Translation Platform
*Mother Tongue-Based Multilingual Education (MTB-MLE) for Primary & Middle Schools in Jharkhand*

---

## 📌 1. Executive Summary & Problem Statement

In rural and tribal regions of Jharkhand, thousands of primary school children enter classrooms speaking tribal mother tongues such as **Santhali (ᱥᱟᱱᱛᱟᱲᱤ)**, **Ho (ᱦᱳ)**, or **Mundari (मुण्डारी)**, whereas textbook materials and classroom instructions are predominantly presented in **Hindi** or **English**. This linguistic barrier causes severe learning loss, early dropouts, and low foundational literacy rates.

**TechSetu (PALASH)** solves this issue by providing an offline-first, AI-assisted **Mother Tongue-Based Multilingual Education (MTB-MLE)** platform. It enables:
1. **Real-time live voice translation**: As the teacher speaks in Hindi, students hear and read the lesson in their tribal mother tongue (rendered in native scripts like Ol Chiki `ᱚᱞ ᱪᱤᱠᱤ` or Devanagari).
2. **Two-way classroom communication**: Students can ask questions in Santhali/Ho/Mundari via voice or text, which auto-translates to Hindi for the teacher.
3. **NIPUN Bharat FLN & RAG Pedagogy Planner**: AI-assisted creation of structured 4-step lesson plans, bilingual worksheets, and printable flashcards aligned with national educational standards.
4. **Offline-First Resilience**: Full operational capability in remote rural schools without active internet using client-side translation matrices, IndexedDB, and local speech engines.

---

## 🏗️ 2. High-Level Architecture & End-to-End Workflow

```
               +-------------------------------------------------------+
               |                  FRONTEND (React 18 + Vite)           |
               |                                                       |
               |   Teacher Dashboard            Student Dashboard      |
               |  (Live Classroom, Notes      (Live Subtitles, Quiz,   |
               |   Planner, Worksheets)        Voice Buddy, Reader)    |
               +---------------------------+---------------------------+
                                           |
                    HTTP REST API          |  WebSocket Connection
                   (Axios / Fetch)         |  (ws://localhost:8000/ws/voice-stream)
                                           v
               +-------------------------------------------------------+
               |                  BACKEND (FastAPI / Python)           |
               |                                                       |
               |  +------------------+           +------------------+  |
               |  |  Auth & Users    |           |  Classroom DB    |  |
               |  |  Router          |           |  Router          |  |
               |  +------------------+           +------------------+  |
               |  |  Curriculum RAG  |           |  Translate &     |  |
               |  |  Router          |           |  Worksheets      |  |
               |  +------------------+           +------------------+  |
               +---------------------------+---------------------------+
                                           |
               +---------------------------+---------------------------+
               |                 SERVICES & LINGUISTIC CORE            |
               |                                                       |
               |  1. Offline NLP Engine (Regex Tokenizer + Ol Chiki)    |
               |  2. FLN Curriculum RAG Engine (NIPUN Knowledge Base)  |
               |  3. Gemini AI LLM Service (Cloud Translation Fallback) |
               |  4. Persistent JSON Document Database Engine          |
               +-------------------------------------------------------+
```

### End-to-End Data Flow (Step-by-Step):

1. **Teacher Speech Input**: The teacher speaks into the microphone in Hindi within `MeetingRoom.jsx` or `LiveTranslator.jsx`.
2. **Speech Recognition**: The browser's `Web Speech API` (via `speechService.js`) captures live audio and converts it to Hindi text in real-time.
3. **Dual Translation Dispatch**:
   - **Fast Path (Offline / Sub-50ms)**: Processed directly in `offlineTranslation.js` using local dictionary lookup and Unicode transliteration (`\u1C50-\u1C7F` for Ol Chiki).
   - **Live Stream Path (WebSocket / Sub-100ms)**: Text is sent over `/ws/voice-stream` WebSocket to backend `main.py`, calling `nlp_engine.translate()`.
   - **LLM Deep Context Path (Gemini AI Fallback)**: If a sentence is complex or missing from local dictionary, `gemini_service.py` calls Google Gemini 1.5/2.0 Flash to return structured JSON.
4. **Student Audio & Visual Delivery**: The translated response (Ol Chiki script, Devanagari script, and Roman Phonetics) is sent to all connected students. The browser's speech synthesis reads out the native audio.
5. **Student Question Reverse Flow**: A student submits a question in Santhali/Ho/Mundari. `classroom.py` receives the payload, saves it to `classroom_db.json`, auto-translates it to Hindi, and pushes it directly into the Teacher's Inbox feed with student details (Name, Roll No, Class, Division).

---

## 💡 3. Deep Dive into Key Technical Concepts

### 🧠 A. Natural Language Processing (NLP) in TechSetu
- **What is NLP?**: Natural Language Processing is the domain of AI that enables computers to understand, parse, translate, and generate human language.
- **How TechSetu implements NLP**:
  - **Rule-Based & Dictionary Tokenization**: The backend (`nlp_engine.py`) and frontend (`offlineTranslation.js`) maintain tokenized dictionary matrices for Santhali, Ho, and Mundari classroom vocabulary.
  - **Regex Phrase Pattern Matching**: Normalizes Hindi input text (stripping diacritics, case variations, punctuation) and evaluates similarity scores to find exact or nearest matching native phrases.
  - **Unicode Script Transliteration (`transliterate_to_olchiki`)**: Maps Devanagari phonemes directly to Santhali Ol Chiki Unicode characters (`\u1C50-\u1C7F`). For example, `क -> ᱠ`, `त -> ᱛ`, `म -> ᱢ`.

### 📚 B. Retrieval-Augmented Generation (RAG) in TechSetu
- **What is RAG?**: Retrieval-Augmented Generation combines structured information retrieval from a domain knowledge base with generative AI. Instead of relying solely on an LLM's static memory, RAG first *retrieves* relevant curriculum standards, then *augments* the prompt with this context to *generate* grounded, accurate output.
- **How TechSetu implements RAG**:
  - **Knowledge Base (`nipun_fln_data.json`)**: Contains NIPUN Bharat Foundational Literacy and Numeracy (FLN) domain competencies, learning outcomes, and activity templates for Grades 1 to 5.
  - **Retrieval Phase (`rag_curriculum.py`)**: When a teacher requests a lesson plan for a specific Grade and Topic (e.g., Grade 1 Math - "Numbers 1-10"), the RAG engine queries `nipun_fln_data.json` to pull exact NIPUN codes and pedagogical objectives.
  - **Augmentation Phase**: The engine injects localized bilingual teacher dialogue cues by querying `nlp_engine.translate()` for Santhali, Ho, or Mundari script translations.
  - **Generation Phase**: Produces a complete 4-step teaching guide:
    1. *Warm-up & Ice Breaking*
    2. *Visual Concept Delivery*
    3. *Interactive Activity*
    4. *FLN Assessment & Feedback*

### 🤖 C. Google Gemini LLM Integration
- **Backend Service (`gemini_service.py`)**: Calls Gemini REST API (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`) with strict JSON schema prompts.
- **Frontend Service (`geminiService.js`)**: Direct fallback service for client-side AI story generation, flashcard creation, and interactive Voice Buddy Q&A when backend is unreachable.

### 🔊 D. Speech Engine (TTS & STT)
- **STT (Speech-to-Text)**: Web Speech Recognition API (`webkitSpeechRecognition`) configured for continuous speech capture with `hi-IN` language code.
- **TTS (Text-to-Speech)**: Web Speech Synthesis API combined with backend fallback audio (`tts_service.py`). Includes custom phonetic transliteration so standard speech engines can pronounce Santhali/Ho/Mundari accurately using Roman phonetic strings.

### ⚡ E. How Sub-3-Second Latency is Achieved
TechSetu achieves sub-3-second end-to-end translation latency (typically **<100ms - 500ms**) using a 5-tier latency minimization strategy:
1. **Client-Side Instant Offline Engine (<50ms)**: Synchronous JavaScript lookup in `offlineTranslation.js` executes dictionary matching directly in browser memory without network calls.
2. **Persistent WebSockets (`/ws/voice-stream`) (<100ms)**: Eliminates HTTP handshake/TLS overhead by maintaining a continuous full-duplex WebSocket connection for real-time speech token streaming.
3. **RAM Pre-Indexed Pattern Matrix (<150ms)**: `nlp_engine.py` pre-loads and sorts dictionaries into RAM during application startup (`__init__`), providing $O(1)$ hash table lookups and pre-compiled regex matching.
4. **Optimized Gemini AI LLM Prompts**: Sets `temperature: 0.2`, strict `maxOutputTokens: 600`, low-latency model target (`gemini-1.5-flash`), and a hard `3.5s` timeout with automatic fallback to local RAM dictionaries.
5. **Asynchronous Non-Blocking FastAPI Core**: Built on Starlette/Uvicorn ASGI event loops to handle high-concurrency requests without thread blocking.

---

## 📂 4. Complete Directory & File-by-File Breakdown

### 🐍 Backend Structure (`backend/`)

| File Path | Role & Purpose | Why & How It Works |
| :--- | :--- | :--- |
| `run.py` | Application Launcher | Programmatic entry point that executes Uvicorn ASGI server on `0.0.0.0:8000` with hot reload support. |
| `app/main.py` | FastAPI Core Application | Initializes `FastAPI()`, configures CORS middleware for frontend origin requests, mounts API routers, and defines the `/ws/voice-stream` real-time WebSocket endpoint. |
| `app/routers/auth.py` | Auth & User Management Router | Handles Student/Teacher registration and login endpoints (`/api/auth/signup/student`, `/api/auth/login`). Persists users to `users_db.json`. |
| `app/routers/classroom.py` | Classroom State & Q&A Router | Core real-time classroom hub (`/api/classroom/*`). Manages live lecture state, teacher voice speech broadcasts, student incoming Q&A messages, teacher replies, scheduled timetable slots, custom published notes, and attendance. |
| `app/routers/curriculum.py` | Curriculum & RAG Router | Serves multi-subject curriculum data (`/api/curriculum/subjects`, `/api/curriculum/fln-lesson-plan`). Calls `rag_curriculum.py` for NIPUN FLN lesson generation. |
| `app/routers/translate.py` | Real-time Translation Router | Provides HTTP POST `/api/translate/live` endpoint. Receives source text & target language, runs through `nlp_engine.py`, and returns Ol Chiki/Devanagari translations. |
| `app/routers/worksheets.py` | Worksheet Studio Router | Generates structured bilingual worksheets and practice questions (`/api/worksheets/generate`) based on FLN competencies. |
| `app/routers/sync.py` | Sync Engine Router | Manages offline-to-online data sync status and data conflict resolution for remote schools (`/api/sync/status`). |
| `app/services/nlp_engine.py` | Offline Translation & NLP Core | Contains regex pattern matching, dictionary lookup routines, and Devanagari-to-Ol Chiki transliteration logic (`DEVANAGARI_TO_OLCHIKI`). |
| `app/services/rag_curriculum.py` | FLN RAG Engine | Reads `nipun_fln_data.json`, constructs NIPUN-compliant lesson plans, and enriches guides with bilingual teacher-student dialogues. |
| `app/services/gemini_service.py` | Cloud Gemini AI Service | Communicates with Google Gemini API models (`gemini-1.5-flash`, `gemini-2.0-flash`) as an LLM translation fallback engine with JSON parsing. |
| `app/services/tts_service.py` | Speech Synthesis Service | Provides server-side Text-to-Speech audio fallback metadata and phonetic audio generation helpers. |
| `app/data/users_db.json` | User Database | Persistent JSON file storing registered students (Roll No, Grade, Division, PIN, Stars, Streak) and teachers. |
| `app/data/classroom_db.json` | Classroom Database | Persistent JSON file storing active/scheduled lectures, attendance records, live broadcast states, teacher published notes, and student Q&A message threads. |
| `app/data/nipun_fln_data.json` | FLN Curriculum Knowledge Base | Domain framework for NIPUN Bharat literacy & numeracy standards (Grades 1–5). |
| `app/data/tribal_dictionary.json` | Local Dictionary DB | Multilingual vocabulary and classroom phrase translation entries for Santhali, Ho, and Mundari. |

---

### ⚛️ Frontend Structure (`frontend/src/`)

| File Path | Role & Purpose | Why & How It Works |
| :--- | :--- | :--- |
| `main.jsx` | React Entry Point | Boots the React DOM root element and wraps `App.jsx` in necessary top-level context providers. |
| `App.jsx` | Main Router & State Container | Holds application view state (`activeTab`), user authentication state (`currentUser`, `role`), active lecture sessions, theme settings, and modal triggers. |
| `index.css` / `App.css` | Global Styling & Design Tokens | Custom CSS variables, glassmorphism utilities, dark mode tokens, keyframe animations, and Ol Chiki font styling. |
| `components/Navbar.jsx` | Top Navigation Header | Displays branding, active user badge (Role, Roll No, Class, Division), live star count, role switcher, quick test-profile login buttons, and navigation links. |
| `components/MeetingRoom.jsx` | Live Virtual Classroom | Interactive live classroom view featuring video canvas grids, live audio microphone toggles, real-time translated subtitle bar, student Q&A drawer, and audio broadcast controls. |
| `components/LiveCaptionOverlay.jsx` | Subtitle & Speech Banner | Overlay display showing teacher Hindi voice input side-by-side with tribal Ol Chiki/Devanagari script translation and TTS speech playback button. |
| `components/AuthPortal.jsx` | Unified Auth Portal Page | Modal/page container allowing students to register or log in with Grade/Division/Roll No/PIN, and teachers with Teacher ID. |
| `components/RoleAuthModal.jsx` | Student & Teacher Login Modal | Detailed login forms with pre-filled demo accounts for instant testing during presentations and evaluations. |
| `components/ScheduleSlotModal.jsx` | Timetable Slot Manager | Modal for teachers to schedule new live lectures by Grade, Division, Subject, and Time Slot. |
| `pages/Teacher/LiveTranslator.jsx` | Teacher Real-Time Studio | Main workspace for teachers to deliver live translated voice lessons, view live audio waveforms, broadcast speech, and respond to incoming student Q&A messages. |
| `pages/Teacher/LessonPlanner.jsx` | FLN RAG Lesson Creator | UI for generating NIPUN Bharat 4-step lesson plans with auto-translated teacher dialogues. |
| `pages/Teacher/SubjectNotesManager.jsx` | Lecture Publisher Studio | Allows teachers to write custom lecture notes, auto-translate them into Santhali/Ho/Mundari, add practice quiz questions, and publish to students. |
| `pages/Teacher/WorksheetStudio.jsx` | Printable Worksheet Studio | Generates visual bilingual worksheets with printable high-resolution layout and export options. |
| `pages/Teacher/FlashcardDeck.jsx` | Bilingual Flashcard Deck | Interactive visual flashcards for vocabulary building in Ol Chiki and Warang Citi scripts. |
| `pages/Teacher/Analytics.jsx` | Classroom Insights & Attendance | Visual charts for student attendance rates, language usage metrics, quiz performance, and active engagement. |
| `pages/Student/StudentHome.jsx` | Student Welcome Dashboard | Personalized student hub showing enrolled subjects, active live classroom alerts, daily star streaks, and quick action cards. |
| `pages/Student/LiveClassroom.jsx` | Student Live Lesson View | View where students attend live lectures, view real-time translated subtitles, listen to auto-played native audio, and ask questions to the teacher. |
| `pages/Student/SubjectNotes.jsx` | Multilingual Notes Reader | Interactive reader for studying teacher-published lecture notes across Science, Math, EVS, Social Studies, and Folktales with language toggle and TTS playback. |
| `pages/Student/VoiceBuddy.jsx` | Bal-Mitra AI Voice Companion | Conversational AI companion for children to practice speaking and listening in tribal languages with star gamification rewards. |
| `pages/Student/QuizZone.jsx` | Gamified Quiz Arena | Interactive multi-choice review quizzes with immediate reward feedback and star accumulation. |
| `pages/Student/InteractiveGames.jsx` | Vernacular Learning Games | Educational mini-games including word-picture matching, sound identification, and script tracing. |
| `pages/System/Diagnostics.jsx` | System Health Monitor | System diagnostics page monitoring backend REST status, WebSocket latency, speech engine availability, and offline IndexedDB cache storage. |
| `services/api.js` | Axios HTTP Client | Configures Axios instance (`baseURL: http://localhost:8000`), handles requests/responses, and exports API methods for Auth, Translation, RAG, and Notes. |
| `services/classroomService.js` | Classroom State Manager | Comprehensive frontend service managing active lecture state, polling backend API for live Q&A messages, sending speech broadcasts, and handling attendance. |
| `services/offlineTranslation.js` | Client Offline Engine | 100% offline client translation matrix containing built-in Santhali, Ho, and Mundari dictionaries and regex fallback algorithms. |
| `services/speechService.js` | Speech API Wrapper | Encapsulates browser `SpeechRecognition` and `SpeechSynthesis` engines for audio recording, voice stream continuous capture, and voice playback. |
| `services/storageService.js` | LocalStorage & IndexedDB Engine | Wrapper for persisting multi-student profiles, offline message queues, star counts, and cached lecture notes on the user's browser. |

---

## 💾 5. Database Architecture & Data Persistence

TechSetu uses a dual-layer persistence model optimized for both server-side persistence and client-side offline operation:

```
                               DATA PERSISTENCE MODEL
  
   +------------------------------------+    +------------------------------------+
   |     BACKEND JSON DB ENGINE         |    |     FRONTEND CLIENT DB ENGINE      |
   |   (backend/app/data/*.json)        |    |   (IndexedDB + LocalStorage)       |
   |                                    |    |                                    |
   |  - users_db.json                   |    |  - techsetu_current_user           |
   |    (Students, Teachers, Credentials) |    |  - techsetu_student_profiles       |
   |  - classroom_db.json               |    |  - techsetu_offline_notes_cache    |
   |    (Lectures, Q&A, Speech, Notes)  |    |  - techsetu_stars_and_streaks      |
   |  - nipun_fln_data.json             |    |  - techsetu_pending_sync_queue     |
   |    (NIPUN Curriculum & Objectives) |    |                                    |
   |  - tribal_dictionary.json          |    |                                    |
   |    (Vocabulary & Phrase Matrices)  |    |                                    |
   +------------------------------------+    +------------------------------------+
```

### Backend JSON Database Schemas:

#### 1. `users_db.json` (Student & Teacher Profiles)
```json
{
  "students": [
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
      "streak_days": 4
    }
  ],
  "teachers": [
    {
      "id": "tch_anand",
      "role": "teacher",
      "name": "Prof. Anand Munda",
      "teacher_id": "teacher@jharkhand.edu",
      "school": "Govt. Middle School, Ranchi",
      "subject": "Science & Mathematics"
    }
  ]
}
```

#### 2. `classroom_db.json` (Lectures, Notes & Student Q&A Threads)
```json
{
  "assigned_lectures": [ ... ],
  "published_notes": [ ... ],
  "qa_messages": [
    {
      "id": "qa_1725450000",
      "lecture_id": "lec_c3_sci",
      "student_id": "stu_14_Class3_A",
      "student_name": "ᱵᱤᱨᱥᱟ ᱥᱚᱨᱮᱱ (Birsa Soren)",
      "roll_no": "14",
      "grade": "Class 3",
      "division": "A",
      "original_text": "ᱫᱟᱨᱮ ᱠᱚᱫᱚ ᱪᱮᱫ ᱞᱮᱠᱟᱛᱮ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ?",
      "hindi_text": "पौधे भोजन कैसे बनाते हैं?",
      "target_lang": "santhali",
      "teacher_reply": "पौधे सूर्य के प्रकाश और पानी से भोजन बनाते हैं।",
      "reply_translated": "ᱫᱟᱨᱮ ᱠᱚᱫᱚ ᱵᱮᱲᱟ ᱨᱮᱱᱟᱜ ᱢᱟᱨᱥᱟﻝ ᱟᱨ ᱫᱟᱜ ᱛᱮ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ",
      "timestamp": 1725450000
    }
  ]
}
```

---

## 🌐 6. API Endpoints & Protocols Reference

### HTTP REST APIs (FastAPI)

| Method | Endpoint | Description | Payload / Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup/student` | Register a new student profile | `{ name, roll_no, grade, division, pin }` |
| `POST` | `/api/auth/login` | Authenticate Student or Teacher | `{ role, roll_no, grade, division, pin }` or `{ role, teacher_id, password }` |
| `POST` | `/api/translate/live` | Translate classroom phrase | `{ text, target_lang, source_lang }` |
| `GET` | `/api/classroom/assigned-lectures` | Retrieve list of lectures by Grade & Division | `?grade=Class+3&division=A` |
| `POST` | `/api/classroom/speech-broadcast` | Broadcast teacher speech & translation | `{ lecture_id, teacher_hindi, translation_olchiki, target_lang }` |
| `POST` | `/api/classroom/qa/ask` | Student submits question to teacher | `{ lecture_id, student_id, student_name, roll_no, grade, division, text, lang }` |
| `POST` | `/api/classroom/qa/reply` | Teacher replies to student question | `{ qa_id, teacher_reply_hindi }` |
| `POST` | `/api/classroom/notes/publish` | Teacher publishes new lecture notes | `{ title, grade, subject_id, hindi_content, practice_questions }` |
| `GET` | `/api/curriculum/fln-lesson-plan` | Retrieve RAG FLN lesson plan | `?grade_id=grade_1&topic_id=t_num_1_10&target_lang=santhali` |

### WebSocket Real-Time Endpoint

| Protocol | Connection URL | Message Payload | Server Response |
| :--- | :--- | :--- | :--- |
| `WS` | `ws://localhost:8000/ws/voice-stream` | `{"text": "आज हम विज्ञान पढ़ेंगे", "target_lang": "santhali"}` | `{"source_text": "...", "translation_olchiki": "...", "translation_devanagari": "...", "phonetic": "...", "timestamp": 1725450000}` |

---

## 🚀 7. How to Run & Test Locally

### System Requirements:
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Modern Browser**: Google Chrome or Microsoft Edge (for Web Speech API support)

### Step 1: Start Backend Server
```bash
cd backend
pip install -r requirements.txt
python run.py
```
- API Base URL: `http://localhost:8000`
- Interactive API Docs (Swagger UI): `http://localhost:8000/docs`

### Step 2: Start Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Frontend Web App: `http://localhost:5173`

---

## 🎯 8. Interview Preparation Cheatsheet

If asked to present or explain TechSetu in a technical interview, use these concise responses:

1. **"What is TechSetu?"**
   > *"TechSetu is an offline-first multilingual education platform built to bridge the language gap for primary school students in Jharkhand by providing real-time voice translation between Hindi and tribal languages like Santhali, Ho, and Mundari."*

2. **"Why did you choose FastAPI and React?"**
   > *"FastAPI provides high-performance asynchronous Python execution with automatic OpenAPI documentation and native WebSocket support ideal for low-latency live audio translation. React 18 with Vite provides a fast, dynamic, single-page UI with smooth state management for real-time classroom interactions."*

3. **"How does the offline-first translation work?"**
   > *"We implemented a multi-tiered architecture. In rural areas without internet, our client-side matrix tokenizes input text, performs dictionary lookup, and applies Unicode transliteration rules directly in JavaScript. When online, requests use our backend NLP engine or fall back to Gemini 1.5/2.0 Flash for complex queries."*

4. **"How is RAG used in your project?"**
   > *"We use RAG for our NIPUN Bharat FLN Lesson Planner. Instead of generating unconstrained AI responses, the engine queries our structured NIPUN knowledge base (`nipun_fln_data.json`) for exact grade competencies, augments the prompt with localized tribal dialogue cues via our NLP engine, and generates structured 4-step teaching plans."*

5. **"How does script rendering work for Santhali?"**
   > *"Santhali uses the Ol Chiki script (`ᱚᱞ ᱪᱤᱠᱤ`). We implemented a custom transliteration engine (`DEVANAGARI_TO_OLCHIKI`) that maps Devanagari phonemes directly to Unicode character ranges (`\u1C50-\u1C7F`), ensuring native script rendering across all UI components."*

---

*Developed for Mother Tongue-Based Multilingual Education (MTB-MLE) & Vernacular Pedagogy Innovation.*
