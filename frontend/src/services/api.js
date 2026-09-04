import { offlineEngine } from './offlineTranslation';
import { NIPUN_GRADES } from '../utils/nipunCurriculum';
import { storageService } from './storageService';

const BACKEND_BASE_URL = 'http://localhost:8000';

export const apiService = {
  // Check backend health
  async checkBackendOnline() {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/`, { method: 'GET', signal: AbortSignal.timeout(1000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Real-time Translation
  async translateText(text, sourceLang = "hindi", targetLang = "santhali") {
    const startTime = performance.now();
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source_lang: sourceLang, target_lang: targetLang }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const data = await res.json();
        const totalTurnaround = performance.now() - startTime;
        return {
          sourceText: data.source_text,
          targetLang: data.target_lang,
          olchiki: data.translation_olchiki,
          devanagari: data.translation_devanagari,
          phonetic: data.phonetic,
          english: data.english,
          latencyMs: parseFloat(totalTurnaround.toFixed(1)),
          confidence: data.confidence,
          isOffline: false
        };
      }
    } catch {
      // Fallback to offline engine
    }

    // Offline translation
    const offlineRes = offlineEngine.translate(text, sourceLang, targetLang);
    return {
      ...offlineRes,
      isOffline: true
    };
  },

  // Get FLN Lesson Plan
  async getLessonPlan(gradeId, topicId, targetLang = "santhali") {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/curriculum/generate-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade_id: gradeId, topic_id: topicId, target_lang: targetLang }),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        await storageService.saveLesson(`${gradeId}_${topicId}`, data);
        return { ...data, isOffline: false };
      }
    } catch {
      // Fallback
    }

    // Generate from client-side FLN curriculum knowledge
    const grade = NIPUN_GRADES.find(g => g.grade_id === gradeId) || NIPUN_GRADES[0];
    const topic = grade.topics.find(t => t.topic_id === topicId) || grade.topics[0];

    const teacherPhrases = [
      "नमस्ते बच्चों, आज हम एक नया पाठ पढ़ेंगे।",
      "कृपया अपनी किताब खोलिए।",
      "श्यामपट्ट की ओर देखो।",
      "बहुत बढ़िया! आपने बहुत अच्छा किया।"
    ];

    const dialogue = teacherPhrases.map(p => {
      const tr = offlineEngine.translate(p, "hindi", targetLang);
      return {
        hindi: p,
        tribal_script: tr.olchiki,
        tribal_devanagari: tr.devanagari,
        phonetic: tr.phonetic
      };
    });

    const fallbackPlan = {
      grade_id: gradeId,
      topic_id: topic.topic_id,
      topic_title: topic.title,
      nipun_code: topic.nipun_code,
      competency: topic.competency,
      target_language: targetLang,
      pedagogy_objectives: [
        `मातृभाषा (${targetLang.toUpperCase()}) के माध्यम से समझ विकसित करना।`,
        "चित्रों और स्थानीय परिवेश की वस्तुओं द्वारा सम्प्रत्यय स्पष्टीकरण।",
        "NIPUN Bharat FLN अधिगम प्रतिफलों की शत-प्रतिशत प्राप्ति।"
      ],
      step_by_step_teacher_guide: [
        {
          step: 1,
          title: "आरंभ एवं रुचि जाग्रति (Warm-up & Ice Breaking)",
          instruction: topic.teacher_instructions[0] || "मातृभाषा में संवाद से कक्षा शुरू करें।",
          suggested_dialogue: dialogue[0]
        },
        {
          step: 2,
          title: "सचित्र अवधारणा शिक्षण (Concept Delivery with Visuals)",
          instruction: topic.teacher_instructions[1] || `चित्र और स्थानीय संदर्भ का उपयोग करके '${topic.title}' समझाएं।`,
          suggested_dialogue: dialogue[1]
        },
        {
          step: 3,
          title: "बाल-केन्द्रित गतिविधि (Interactive Activity)",
          instruction: topic.activities[0] || "समूह गतिविधि आयोजित करें।",
          suggested_dialogue: dialogue[2]
        },
        {
          step: 4,
          title: "मूल्यांकन एवं प्रतिपुष्टि (FLN Assessment & Feedback)",
          instruction: topic.assessment_question || "बच्चों की समझ की जांच करें।",
          suggested_dialogue: dialogue[3]
        }
      ],
      bilingual_dialogue_cues: dialogue,
      isOffline: true
    };

    await storageService.saveLesson(`${gradeId}_${topicId}`, fallbackPlan);
    return fallbackPlan;
  },

  // Trigger Cloud Sync
  async syncPendingQueue() {
    const queue = await storageService.getSyncQueue();
    if (queue.length === 0) {
      return { status: "no_items", count: 0 };
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: "tablet_jharkhand_palash_01",
          offline_records: queue
        }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        await storageService.clearSyncQueue();
        return { status: "success", count: queue.length };
      }
    } catch {
      // Offline
    }

    return { status: "failed_offline", count: queue.length };
  },

  // --- Auth Endpoints ---
  async loginUser(payload) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({}));
      return { status: "error", message: err.detail || "Authentication failed" };
    } catch {
      return null; // Signals offline fallback
    }
  },

  async signupUser(payload) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({}));
      return { status: "error", message: err.detail || "Registration failed" };
    } catch {
      return null;
    }
  },

  async getUsers() {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/auth/users`, {
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  },

  // --- Classroom & Attendance Endpoints ---
  async getScheduledLectures(grade, division) {
    try {
      let url = `${BACKEND_BASE_URL}/api/classroom/lectures`;
      const params = new URLSearchParams();
      if (grade && grade !== 'all') params.append('grade', grade);
      if (division && division !== 'all') params.append('division', division);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  },

  async scheduleLecture(payload) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/classroom/lectures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  },

  async recordAttendance(payload) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/classroom/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  },

  async exportAttendance(lectureId) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/classroom/attendance/export/${lectureId}`, {
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  }
};
