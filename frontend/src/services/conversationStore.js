// Persistent Classroom Conversation Database & Context Store
// Saves chronological dialogues between teacher and students for context-aware doubt resolution

export class ConversationStore {
  constructor() {
    this.storageKey = "techsetu_classroom_conversation_db";
    this.history = this.loadHistory();
  }

  loadHistory() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [
        {
          id: "init_1",
          speaker: "teacher",
          speakerName: "Prof. Anand Munda",
          hindiText: "नमस्ते बच्चों, आज हम पौधों और प्रकाश संश्लेषण के बारे में पढ़ेंगे।",
          santhaliScript: "ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ, ᱛᱮᱦᱮᱧ ᱫᱚ ᱫᱟᱨᱮ ᱟᱨ ᱥᱮᱸᱜᱮᱞ ᱪᱮᱫᱟᱜ ᱫᱟᱨᱮ ᱡᱚᱢᱟᱜ ᱵᱮᱱᱟᱣᱟ ᱚᱱᱟ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ᱾",
          phonetic: "Johar gidra ko, tehenj do dare ar sengel chedag dare jomag benawa ona bon parhawa.",
          topic: "Science - Photosynthesis",
          timestamp: Date.now() - 300000,
          timeString: "10:00 AM"
        },
        {
          id: "init_2",
          speaker: "teacher",
          speakerName: "Prof. Anand Munda",
          hindiText: "पौधे सूर्य के प्रकाश, पानी और हवा से अपना भोजन बनाते हैं। पत्तियाँ हरी होती हैं।",
          santhaliScript: "ᱫᱟᱨᱮ ᱠᱚᱫᱚ ᱵᱮᱲᱟ ᱨᱮᱱᱟᱜ ᱢᱟᱨᱥᱟᱞ, ᱫᱟᱜ ᱟᱨ ᱦᱚᱭ ᱛᱮ ᱟᱠᱚᱣᱟᱜ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ᱾ ᱥᱟᱠᱟᱢ ᱫᱚ ᱦᱟᱹᱨᱭᱟᱹᱲ ᱜᱮᱭᱟ᱾",
          phonetic: "Dare kodo bera renag marsal, daag ar hoy te akowag jomag ko benawa. Sakam do haryar geya.",
          topic: "Science - Plant Food",
          timestamp: Date.now() - 180000,
          timeString: "10:05 AM"
        }
      ];
    } catch {
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history.slice(-100)));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  // Add teacher speech or announcement
  addTeacherSpeech({ teacherName, hindiText, santhaliScript, phonetic, topic = "Classroom" }) {
    const entry = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      speaker: "teacher",
      speakerName: teacherName || "Teacher",
      hindiText,
      santhaliScript: santhaliScript || hindiText,
      phonetic: phonetic || "",
      topic,
      timestamp: Date.now(),
      timeString: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    this.history.push(entry);
    this.save();
    return entry;
  }

  // Add student question / doubt
  addStudentQuestion({ studentName, rollNo, grade, division, questionText, translatedHindi }) {
    const entry = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      speaker: "student",
      studentName: studentName || "Student",
      rollNo: rollNo || "N/A",
      grade: grade || "Class 3",
      division: division || "A",
      questionText,
      translatedHindi: translatedHindi || questionText,
      reply: null,
      timestamp: Date.now(),
      timeString: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    this.history.push(entry);
    this.save();
    return entry;
  }

  // Add teacher's contextual answer to student's question
  addTeacherAnswer(questionId, { teacherName, replyHindi, replyTribal, phonetic, conceptReferenced }) {
    const question = this.history.find(item => item.id === questionId);
    if (question) {
      question.reply = {
        teacherName: teacherName || "Teacher",
        replyHindi,
        replyTribal,
        phonetic,
        conceptReferenced,
        timestamp: Date.now(),
        timeString: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      this.save();
      return question;
    }
    return null;
  }

  // Retrieve recent classroom history for Gemini prompt context
  getRecentContext(limit = 10) {
    return this.history
      .filter(item => item.speaker === "teacher")
      .slice(-limit);
  }

  getAllConversations() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    this.save();
  }
}

export const conversationStore = new ConversationStore();
