import { conversationStore } from './conversationStore';
import { geminiService } from './geminiService';
import { offlineEngine } from './offlineTranslation';

const BACKEND_BASE_URL = 'http://localhost:8000';

// Real-time Classroom Broadcast & Student Question Service
// Connects Teacher's Hindi/English Live Speech with Student's Tribal Hearing & Live Contextual Q&A

export class ClassroomService {
  constructor() {
    this.channelName = "techsetu_live_classroom";
    this.channel = null;
    this.listeners = new Set();
    this.initChannel();
    this.syncFromBackend();
    this.initPeriodicCleanup();
  }

  initPeriodicCleanup() {
    this.cleanupExpiredLectures();
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanupExpiredLectures();
      }, 20000);
    }
  }

  initChannel() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn("BroadcastChannel error, falling back to storage events:", e);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === "techsetu_classroom_event" && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notifyListeners(data);
          } catch (err) {
            console.error(err);
          }
        }
      });
    }
  }

  async syncFromBackend() {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/classroom/messages?limit=20`, {
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const messages = await res.json();
        if (Array.isArray(messages) && messages.length > 0) {
          const lectures = messages.map(m => ({
            id: m.id,
            teacherName: m.teacher_name,
            hindiText: m.hindi_text,
            santhali: {
              script: m.santhali_script,
              devanagari: m.santhali_script,
              phonetic: m.phonetic || ""
            },
            subject: m.subject || "General",
            timeString: m.time_string || "Classroom"
          })).reverse();
          localStorage.setItem("techsetu_active_lectures", JSON.stringify(lectures));
        }
      }
    } catch {
      // Offline fallback
    }
  }

  // Subscribe to real-time events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error("Classroom listener error:", err);
      }
    });
  }

  emit(eventType, payload) {
    const eventData = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString()
    };

    if (this.channel) {
      try {
        this.channel.postMessage(eventData);
      } catch (e) {}
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("techsetu_classroom_event", JSON.stringify(eventData));
      } catch (e) {}
    }

    // Also notify internal listeners on the same page
    this.notifyListeners(eventData);
  }

  // --- 1. Teacher Broadcasts Speech ---
  broadcastTeacherSpeech({ teacherName, hindiText, santhali, ho, mundari, subject = "General" }) {
    const lectureEvent = {
      id: `lec_${Date.now()}`,
      teacherName: teacherName || "शिक्षक (Teacher)",
      hindiText,
      santhali,
      ho,
      mundari,
      subject,
      timeString: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // 1. Save to active lecture log in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("techsetu_active_lectures") || "[]");
      const updated = [lectureEvent, ...existing.filter(l => l.id !== lectureEvent.id)].slice(0, 30);
      localStorage.setItem("techsetu_active_lectures", JSON.stringify(updated));
    } catch (e) {}

    // 2. Save into Persistent Conversation Store for Context Retrieval
    try {
      conversationStore.addTeacherSpeech({
        teacherName,
        hindiText,
        santhaliScript: santhali?.script || santhali?.devanagari || hindiText,
        phonetic: santhali?.phonetic || "",
        topic: subject
      });
    } catch (e) {}

    // 3. Save to Backend Database
    try {
      fetch(`${BACKEND_BASE_URL}/api/classroom/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lectureEvent.id,
          speaker: "teacher",
          teacher_name: lectureEvent.teacherName,
          hindi_text: hindiText,
          santhali_script: santhali?.script || santhali?.devanagari || hindiText,
          phonetic: santhali?.phonetic || "",
          subject: subject,
          time_string: lectureEvent.timeString
        }),
        signal: AbortSignal.timeout(2000)
      }).catch(() => {});
    } catch (e) {}

    this.emit("TEACHER_SPEECH", lectureEvent);
    return lectureEvent;
  }

  getActiveLectures() {
    try {
      return JSON.parse(localStorage.getItem("techsetu_active_lectures") || "[]");
    } catch (e) {
      return [];
    }
  }

  // --- 2. Student Submits a Question to Teacher ---
  askQuestion({ student, questionText, translatedHindi, language = "santhali" }) {
    const question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      studentId: student?.id || student?.rollNo || "1",
      studentName: student?.name || "Student",
      rollNo: student?.rollNo || "N/A",
      grade: student?.grade || "Class 3",
      division: student?.division || "A",
      school: student?.school || "Govt. School",
      language,
      questionText,
      translatedHindi: translatedHindi || questionText,
      status: "pending", // 'pending' | 'answered'
      reply: null,
      timeString: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now()
    };

    try {
      const existing = JSON.parse(localStorage.getItem("techsetu_classroom_questions") || "[]");
      const updated = [question, ...existing];
      localStorage.setItem("techsetu_classroom_questions", JSON.stringify(updated));
    } catch (e) {}

    // Save to Conversation Store
    try {
      conversationStore.addStudentQuestion({
        studentName: question.studentName,
        rollNo: question.rollNo,
        grade: question.grade,
        division: question.division,
        questionText,
        translatedHindi
      });
    } catch (e) {}

    // Save to Backend Database
    try {
      fetch(`${BACKEND_BASE_URL}/api/classroom/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: question.id,
          student_id: question.studentId,
          student_name: question.studentName,
          roll_no: question.rollNo,
          grade: question.grade,
          division: question.division,
          school: question.school,
          language: question.language,
          question_text: question.questionText,
          translated_hindi: question.translatedHindi,
          time_string: question.timeString
        }),
        signal: AbortSignal.timeout(2000)
      }).catch(() => {});
    } catch (e) {}

    this.emit("STUDENT_QUESTION", question);
    return question;
  }

  getQuestions() {
    try {
      return JSON.parse(localStorage.getItem("techsetu_classroom_questions") || "[]");
    } catch (e) {
      return [];
    }
  }

  // --- 3. Teacher Answers Student's Question (Context-Aware) ---
  answerQuestion(questionId, { teacherName, replyHindi, replyTribal, phonetic, language = "santhali", conceptReferenced }) {
    let answeredQuestion = null;
    try {
      const existing = JSON.parse(localStorage.getItem("techsetu_classroom_questions") || "[]");
      const updated = existing.map((q) => {
        if (q.id === questionId) {
          const replyObj = {
            teacherName: teacherName || "Teacher",
            replyHindi,
            replyTribal,
            phonetic: phonetic || "",
            language,
            conceptReferenced: conceptReferenced || "Previous Lesson",
            timeString: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
          q.status = "answered";
          q.reply = replyObj;
          answeredQuestion = q;
        }
        return q;
      });
      localStorage.setItem("techsetu_classroom_questions", JSON.stringify(updated));
    } catch (e) {}

    // Save to Conversation Store
    try {
      conversationStore.addTeacherAnswer(questionId, {
        teacherName,
        replyHindi,
        replyTribal,
        phonetic,
        conceptReferenced
      });
    } catch (e) {}

    // Save to Backend Database
    try {
      fetch(`${BACKEND_BASE_URL}/api/classroom/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          teacher_name: teacherName || "Teacher",
          reply_hindi: replyHindi,
          reply_tribal: replyTribal,
          phonetic: phonetic || "",
          language,
          concept_referenced: conceptReferenced || "Previous Lesson"
        }),
        signal: AbortSignal.timeout(2000)
      }).catch(() => {});
    } catch (e) {}

    if (answeredQuestion) {
      this.emit("TEACHER_ANSWERED", answeredQuestion);
    }
    return answeredQuestion;
  }

  // --- 4. AI-Powered Auto Doubt Resolution from Previous History ---
  async generateAiContextualAnswer(question) {
    const recentContext = conversationStore.getRecentContext(8);

    // 1. Try Gemini AI First with User API key
    try {
      const geminiAnswer = await geminiService.answerStudentDoubt({
        questionText: question.questionText || question.translatedHindi,
        studentInfo: {
          name: question.studentName,
          rollNo: question.rollNo,
          grade: question.grade
        },
        conversationHistory: recentContext
      });

      if (geminiAnswer && (geminiAnswer.replyTribal || geminiAnswer.replyHindi)) {
        return geminiAnswer;
      }
    } catch (e) {
      console.warn("Gemini answer doubt fallback:", e);
    }

    // 2. Try Backend Database Context Resolver
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/classroom/resolve-doubt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: question.questionText || question.translatedHindi,
          student_name: question.studentName || "Student",
          grade: question.grade || "Class 3"
        }),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        return {
          replyTribal: data.reply_tribal,
          replyDevanagari: data.reply_devanagari,
          replyHindi: data.reply_hindi,
          phonetic: data.phonetic,
          conceptReferenced: data.concept_referenced || "Previous Lesson",
          engine: "database-context"
        };
      }
    } catch {
      // Fall through to local context engine
    }

    // 3. Fallback using client-side conversationStore context
    const questionLower = (question.questionText || "").toLowerCase();
    let relevantTopic = "Classroom Lesson";
    let matchedExplanation = "";

    for (const item of recentContext) {
      if (item.hindiText) {
        matchedExplanation = item.hindiText;
        relevantTopic = item.topic || "Previous Lesson";
        break;
      }
    }

    const tr = offlineEngine.translate(
      matchedExplanation ? `जैसे हमने पढ़ा: ${matchedExplanation}` : "हाँ बच्चों, इसे ध्यान से समझें।",
      "hindi",
      "santhali"
    );

    return {
      replyTribal: tr.displayScript || tr.devanagari,
      replyDevanagari: tr.devanagari,
      replyHindi: matchedExplanation || "हाँ, पाठ के अनुसार यह सही है।",
      phonetic: tr.phonetic,
      conceptReferenced: relevantTopic,
      engine: "offline-context"
    };
  }

  // --- 5. Lecture Scheduling, Slot Collision & Targeted Access Control ---
  parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const clean = String(timeStr).trim().toUpperCase();
    const isPm = clean.includes('PM');
    const isAm = clean.includes('AM');
    const numPart = clean.replace('AM', '').replace('PM', '').trim();
    try {
      const parts = numPart.split(':');
      let hours = parseInt(parts[0], 10) || 0;
      const mins = parseInt(parts[1], 10) || 0;
      if (isPm && hours < 12) hours += 12;
      else if (isAm && hours === 12) hours = 0;
      return hours * 60 + mins;
    } catch {
      return 0;
    }
  }

  format12Hour(timeStr) {
    if (!timeStr) return '09:00 AM';
    if (String(timeStr).includes('AM') || String(timeStr).includes('PM')) {
      return String(timeStr);
    }
    const mins = this.parseTimeToMinutes(timeStr);
    let h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const hStr = h < 10 ? `0${h}` : `${h}`;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${hStr}:${mStr} ${ampm}`;
  }

  checkSlotConflict({ date, startTime, endTime, targetClass, section, excludeLectureId = null }) {
    const list = this.getAssignedLectures();
    const targetDate = date || new Date().toISOString().split('T')[0];
    const newStart = this.parseTimeToMinutes(startTime);
    let newEnd = this.parseTimeToMinutes(endTime);
    if (newEnd <= newStart) newEnd = newStart + 45;

    for (const l of list) {
      if (excludeLectureId && l.id === excludeLectureId) continue;
      if (l.status === 'completed') continue;

      const lGrade = l.targetClass || l.grade;
      const lSection = l.section || l.division;
      const lDate = l.date || new Date().toISOString().split('T')[0];

      if (lGrade === targetClass && lSection === section && lDate === targetDate) {
        const exStart = this.parseTimeToMinutes(l.startTime || (l.timeSlot ? l.timeSlot.split('-')[0] : '09:00 AM'));
        let exEnd = this.parseTimeToMinutes(l.endTime || (l.timeSlot ? l.timeSlot.split('-')[1] : '09:45 AM'));
        if (exEnd <= exStart) exEnd = exStart + 45;

        // Collision: newStart < exEnd && exStart < newEnd
        if (newStart < exEnd && exStart < newEnd) {
          return {
            hasConflict: true,
            conflictingLecture: l,
            message: `Conflict! ${targetClass} (Section ${section}) already has "${l.topic}" scheduled on ${targetDate} from ${l.startTime || (l.timeSlot ? l.timeSlot.split('-')[0] : '09:00 AM')} to ${l.endTime || (l.timeSlot ? l.timeSlot.split('-')[1] : '09:45 AM')}.`
          };
        }
      }
    }
    return { hasConflict: false };
  }

  isSlotActiveNow(lecture) {
    if (!lecture) return { canJoin: false, isUpcoming: false, isExpired: true, text: 'Ended' };
    if (lecture.status === 'completed') return { canJoin: false, isUpcoming: false, isExpired: true, text: 'Completed' };

    const todayStr = new Date().toISOString().split('T')[0];
    const lecDate = lecture.date || todayStr;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const startMin = this.parseTimeToMinutes(lecture.startTime || (lecture.timeSlot ? lecture.timeSlot.split('-')[0] : '09:00 AM'));
    let endMin = this.parseTimeToMinutes(lecture.endTime || (lecture.timeSlot ? lecture.timeSlot.split('-')[1] : '09:45 AM'));
    if (endMin <= startMin) endMin = startMin + 45;

    if (lecDate < todayStr) {
      return { canJoin: false, isUpcoming: false, isExpired: true, text: 'Expired' };
    }
    if (lecDate > todayStr) {
      return { canJoin: false, isUpcoming: true, isExpired: false, text: `Scheduled for ${lecDate}` };
    }

    // Same day time comparison:
    if (nowMin < startMin) {
      const diffMins = startMin - nowMin;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      const countdownText = hours > 0 ? `Starts in ${hours}h ${mins}m` : `Starts in ${mins}m`;
      return { 
        canJoin: false, 
        isUpcoming: true, 
        isExpired: false, 
        minutesUntilStart: diffMins, 
        text: countdownText 
      };
    } else if (nowMin >= startMin && nowMin <= endMin) {
      const remaining = endMin - nowMin;
      return { 
        canJoin: true, 
        isUpcoming: false, 
        isExpired: false, 
        minutesRemaining: remaining, 
        text: 'Live Now' 
      };
    } else {
      return { canJoin: false, isUpcoming: false, isExpired: true, text: 'Time Ended' };
    }
  }

  cleanupExpiredLectures() {
    try {
      const lectures = this.getAssignedLectures();
      let hasChanges = false;
      const updated = lectures.map(l => {
        if (l.status === 'live' || l.status === 'scheduled') {
          const statusCheck = this.isSlotActiveNow(l);
          if (statusCheck.isExpired) {
            hasChanges = true;
            return { ...l, status: 'completed' };
          }
        }
        return l;
      });
      if (hasChanges) {
        localStorage.setItem("techsetu_assigned_lectures", JSON.stringify(updated));
        this.emit("LECTURES_UPDATED", updated);
      }
    } catch (e) {}
  }

  endMeetingForAll(lectureId) {
    if (!lectureId) return;

    try {
      const lectures = this.getAssignedLectures();
      const updated = lectures.map(l => {
        if (l.id === lectureId) {
          return { ...l, status: 'completed', endedAt: Date.now() };
        }
        return l;
      });
      localStorage.setItem("techsetu_assigned_lectures", JSON.stringify(updated));

      // Sync with backend API
      fetch(`${BACKEND_BASE_URL}/api/classroom/lectures/end/${lectureId}`, {
        method: "POST"
      }).catch(() => {});

      // Emit termination across all client tabs
      this.emit("MEETING_ENDED", { lectureId });
      this.emit("LECTURES_UPDATED", updated);
    } catch (e) {
      console.error("End meeting error:", e);
    }
  }

  getAssignedLectures(grade = null, division = null) {
    try {
      const saved = localStorage.getItem("techsetu_assigned_lectures");
      let list = saved ? JSON.parse(saved) : DEFAULT_ASSIGNED_LECTURES;
      
      if (grade && grade !== 'all') {
        list = list.filter(l => (l.targetClass || l.grade) === grade);
      }
      if (division && division !== 'all') {
        list = list.filter(l => (l.section || l.division) === division);
      }
      return list;
    } catch (e) {
      return DEFAULT_ASSIGNED_LECTURES;
    }
  }

  assignLecture({ 
    grade, 
    division, 
    targetClass, 
    section, 
    subjectId, 
    subjectName, 
    santhaliSubject, 
    icon, 
    topic, 
    date, 
    startTime, 
    endTime, 
    timeSlot, 
    teacherName 
  }) {
    const finalGrade = targetClass || grade || "Class 3";
    const finalDivision = section || division || "A";
    const finalSlot = timeSlot || (startTime && endTime ? `${startTime} - ${endTime}` : "09:00 AM - 09:45 AM");
    const today = date || new Date().toISOString().split('T')[0];

    // Check conflict first
    const conflict = this.checkSlotConflict({
      date: today,
      startTime: startTime || "09:00 AM",
      endTime: endTime || "09:45 AM",
      targetClass: finalGrade,
      section: finalDivision
    });

    if (conflict.hasConflict) {
      throw new Error(conflict.message);
    }

    const newLecture = {
      id: `lec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      grade: finalGrade,
      division: finalDivision,
      targetClass: finalGrade,
      section: finalDivision,
      subjectId: subjectId || "c3_sci",
      subjectName: subjectName || "General Science",
      santhaliSubject: santhaliSubject || subjectName || "ᱥᱟᱬᱮᱥ",
      icon: icon || "📖",
      topic: topic || "Lesson Topic",
      teacherName: teacherName || "Prof. Anand Munda",
      date: today,
      startTime: startTime || "09:00 AM",
      endTime: endTime || "09:45 AM",
      timeSlot: finalSlot,
      status: "live",
      timestamp: Date.now(),
      attendees: []
    };

    try {
      const existing = this.getAssignedLectures();
      const updated = existing.map(l => {
        if ((l.grade === newLecture.grade || l.targetClass === newLecture.targetClass) && l.status === "live") {
          return { ...l, status: "completed" };
        }
        return l;
      });

      const fullList = [newLecture, ...updated];
      localStorage.setItem("techsetu_assigned_lectures", JSON.stringify(fullList));

      // Broadcast active lecture announcement
      this.broadcastTeacherSpeech({
        teacherName: newLecture.teacherName,
        hindiText: `नमस्ते बच्चों, आज हम ${newLecture.grade} (Section ${newLecture.division}) के लिए "${newLecture.topic}" पढ़ेंगे।`,
        subject: `${newLecture.subjectName} (${newLecture.grade}-${newLecture.division})`
      });

      fetch(`${BACKEND_BASE_URL}/api/classroom/lectures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newLecture.id,
          grade: newLecture.grade,
          division: newLecture.division,
          target_class: newLecture.targetClass,
          section: newLecture.section,
          subject_id: newLecture.subjectId,
          subject_name: newLecture.subjectName,
          santhali_subject: newLecture.santhaliSubject,
          icon: newLecture.icon,
          topic: newLecture.topic,
          teacher_name: newLecture.teacherName,
          date: newLecture.date,
          start_time: newLecture.startTime,
          end_time: newLecture.endTime,
          time_slot: newLecture.timeSlot,
          status: "live"
        }),
        signal: AbortSignal.timeout(2000)
      }).catch(() => {});

      this.emit("LECTURE_ASSIGNED", newLecture);
      return newLecture;
    } catch (e) {
      console.error("Assign lecture error:", e);
      return newLecture;
    }
  }

  // --- 6. Automated Attendance & Live Meeting Session Tracking ---
  startMeetingSession(lectureId, user) {
    if (!lectureId || !user) return null;
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const nowTime = Date.now();

    try {
      const lectures = this.getAssignedLectures();
      let attendeeRecord = null;

      const updated = lectures.map(l => {
        if (l.id === lectureId) {
          const attendees = l.attendees || [];
          const existing = attendees.find(a => a.studentId === user.id || (user.rollNo && a.rollNo === user.rollNo && a.grade === (user.grade || l.grade)));
          
          if (!existing) {
            attendeeRecord = {
              studentId: user.id || `stu_${user.rollNo || Date.now()}`,
              name: user.name || "Student",
              rollNo: user.rollNo || "-",
              grade: user.grade || l.targetClass || l.grade,
              division: user.division || l.section || l.division || "A",
              role: user.role || "student",
              joinTime: nowStr,
              joinTimestamp: nowTime,
              leaveTime: "-",
              durationSeconds: 0,
              durationMinutes: 0,
              status: user.role === 'teacher' ? 'Host' : 'In Progress'
            };
            attendees.push(attendeeRecord);
          } else {
            existing.joinTimestamp = existing.joinTimestamp || nowTime;
            attendeeRecord = existing;
          }
          l.attendees = attendees;
        }
        return l;
      });

      localStorage.setItem("techsetu_assigned_lectures", JSON.stringify(updated));

      // Post to backend
      if (user.role !== 'teacher') {
        fetch(`${BACKEND_BASE_URL}/api/classroom/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lecture_id: lectureId,
            student_id: attendeeRecord.studentId,
            student_name: attendeeRecord.name,
            roll_no: attendeeRecord.rollNo,
            grade: attendeeRecord.grade,
            division: attendeeRecord.division,
            join_time: nowStr,
            duration_seconds: attendeeRecord.durationSeconds || 0,
            status: "In Progress"
          }),
          signal: AbortSignal.timeout(2000)
        }).catch(() => {});
      }

      this.emit("MEETING_USER_JOINED", { lectureId, user: attendeeRecord });
      return attendeeRecord;
    } catch (e) {
      console.error("Start meeting session error:", e);
      return null;
    }
  }

  updateMeetingDuration(lectureId, user, elapsedSeconds, totalClassSeconds = 2700, thresholdPercent = 80) {
    if (!lectureId || !user) return null;

    try {
      const lectures = this.getAssignedLectures();
      let updatedRecord = null;

      const updated = lectures.map(l => {
        if (l.id === lectureId) {
          const attendees = l.attendees || [];
          const record = attendees.find(a => a.studentId === user.id || (user.rollNo && a.rollNo === user.rollNo));
          if (record) {
            record.durationSeconds = Math.max(record.durationSeconds || 0, elapsedSeconds);
            record.durationMinutes = Math.round((record.durationSeconds / 60) * 10) / 10;
            
            // Mark Present if duration meets threshold >= 80% (or min 10 min for demo)
            const requiredSeconds = Math.min(totalClassSeconds * (thresholdPercent / 100), 600);
            if (record.role !== 'teacher') {
              if (record.durationSeconds >= requiredSeconds) {
                record.status = "Present";
              } else {
                record.status = "In Progress";
              }
            }
            updatedRecord = record;
          }
          l.attendees = attendees;
        }
        return l;
      });

      localStorage.setItem("techsetu_assigned_lectures", JSON.stringify(updated));
      return updatedRecord;
    } catch (e) {
      return null;
    }
  }

  leaveMeetingSession(lectureId, user, elapsedSeconds = 0, totalClassSeconds = 2700, thresholdPercent = 80) {
    if (!lectureId || !user) return null;
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const lectures = this.getAssignedLectures();
      let attendeeRecord = null;

      const updated = lectures.map(l => {
        if (l.id === lectureId) {
          const attendees = l.attendees || [];
          const record = attendees.find(a => a.studentId === user.id || (user.rollNo && a.rollNo === user.rollNo));
          if (record) {
            record.leaveTime = nowStr;
            record.durationSeconds = Math.max(record.durationSeconds || 0, elapsedSeconds);
            record.durationMinutes = Math.round((record.durationSeconds / 60) * 10) / 10;

            const requiredSeconds = Math.min(totalClassSeconds * (thresholdPercent / 100), 600);
            if (record.role !== 'teacher') {
              record.status = record.durationSeconds >= requiredSeconds ? "Present" : "Partial";
            }
            attendeeRecord = record;
          }
          l.attendees = attendees;
        }
        return l;
      });

      localStorage.setItem("techsetu_assigned_lectures", JSON.stringify(updated));

      // Post final attendance to backend
      if (attendeeRecord && attendeeRecord.role !== 'teacher') {
        fetch(`${BACKEND_BASE_URL}/api/classroom/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lecture_id: lectureId,
            student_id: attendeeRecord.studentId,
            student_name: attendeeRecord.name,
            roll_no: attendeeRecord.rollNo,
            grade: attendeeRecord.grade,
            division: attendeeRecord.division,
            join_time: attendeeRecord.joinTime,
            leave_time: nowStr,
            duration_seconds: attendeeRecord.durationSeconds,
            status: attendeeRecord.status,
            threshold_percent: thresholdPercent
          }),
          signal: AbortSignal.timeout(2000)
        }).catch(() => {});
      }

      this.emit("MEETING_USER_LEFT", { lectureId, user: attendeeRecord });
      return attendeeRecord;
    } catch (e) {
      console.error("Leave meeting error:", e);
      return null;
    }
  }

  // --- 7. Mark Attendance (Quick Legacy Fallback) ---
  markAttendance(lectureId, student) {
    return this.startMeetingSession(lectureId, student);
  }

  getLectureAttendance(lectureId) {
    const lectures = this.getAssignedLectures();
    const target = lectures.find(l => l.id === lectureId);
    return target?.attendees || [];
  }

  exportAttendanceCSV(lectureId) {
    const target = this.getAssignedLectures().find(l => l.id === lectureId);
    if (!target) return null;

    const attendees = target.attendees || [];
    const csvRows = [
      ["Student ID", "Student Name", "Roll No", "Class", "Section", "Join Time", "Leave Time", "Duration (Mins)", "Status"]
    ];

    attendees.forEach(a => {
      csvRows.push([
        `"${a.studentId || ''}"`,
        `"${a.name || ''}"`,
        `"${a.rollNo || ''}"`,
        `"${a.grade || target.grade || ''}"`,
        `"${a.division || target.division || ''}"`,
        `"${a.joinTime || ''}"`,
        `"${a.leaveTime || ''}"`,
        `"${a.durationMinutes || (a.durationSeconds ? Math.round(a.durationSeconds / 60) : 0)}"`,
        `"${a.status || 'Present'}"`
      ]);
    });

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_${target.topic.replace(/\s+/g, '_')}_${target.date || 'today'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return csvContent;
  }

  // --- 8. Real-time Bidirectional Speech Broadcast ---
  broadcastLiveCaption(payload) {
    const eventData = {
      id: `caption_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      ...payload
    };
    this.emit("LIVE_CAPTION", eventData);
    return eventData;
  }
}

const DEFAULT_ASSIGNED_LECTURES = [
  {
    id: "lec_c1_lang",
    grade: "Class 1",
    division: "A",
    subjectId: "c1_lang",
    subjectName: "संथाली भाषा एवं वर्णमाला",
    santhaliSubject: "ᱥᱟᱱᱛᱟᱲᱤ ᱯᱟᱹᱨᱥᱤ ᱟᱨ ᱚᱞ ᱪᱤᱠᱤ",
    icon: "📖",
    topic: "ᱚᱞ ᱪᱤᱠᱤ ᱟᱠᱷᱚᱨ ᱩᱯᱨᱩᱢ (Introduction to Ol Chiki Letters)",
    teacherName: "Prof. Anand Munda",
    timeSlot: "09:00 AM - 09:45 AM",
    status: "live",
    attendees: [
      { studentId: "stu_01_c1", name: "ᱥᱩᱱᱤᱞ ᱢᱩᱨᱢᱩ (Sunil Murmu)", rollNo: "1", grade: "Class 1", division: "A", joinTime: "09:05 AM", status: "Present" },
      { studentId: "stu_02_c1", name: "ᱨᱟᱹᱱᱤ ᱦᱟᱸᱥᱫᱟᱜ (Rani Hansda)", rollNo: "2", grade: "Class 1", division: "A", joinTime: "09:07 AM", status: "Present" }
    ]
  },
  {
    id: "lec_c1_math",
    grade: "Class 1",
    division: "A",
    subjectId: "c1_math",
    subjectName: "बुनियादी गणित और गिनती (1-20)",
    santhaliSubject: "ᱮᱞᱠᱷᱟ ᱟᱨ ᱞᱮᱠᱷᱟ (᱑-᱒᱐)",
    icon: "🔢",
    topic: "ᱢᱤᱫ ᱠᱷᱚᱱ ᱜᱮᱞ ᱞᱮᱠᱷᱟ (Numbers 1 to 10 with visuals)",
    teacherName: "Prof. Anand Munda",
    timeSlot: "10:00 AM - 10:45 AM",
    status: "scheduled",
    attendees: []
  },
  {
    id: "lec_c2_lang",
    grade: "Class 2",
    division: "A",
    subjectId: "c2_lang",
    subjectName: "भाषा एवं जनजातीय लोककथाएं",
    santhaliSubject: "ᱥᱟᱱᱛᱟᱲᱤ ᱠᱟᱹᱦᱱᱤ ᱟᱨ ᱯᱟᱹᱨᱥᱤ",
    icon: "📚",
    topic: "ᱪᱮᱬᱮ ᱟᱨ ᱦᱟᱹᱛᱤ ᱠᱟᱹᱦᱱᱤ (The Bird and Elephant Story)",
    teacherName: "Prof. Anand Munda",
    timeSlot: "09:00 AM - 09:45 AM",
    status: "scheduled",
    attendees: []
  },
  {
    id: "lec_c2_math",
    grade: "Class 2",
    division: "A",
    subjectId: "c2_math",
    subjectName: "गणित: जोड़ और घटाव",
    santhaliSubject: "ᱮᱞᱠᱷᱟ: ᱢᱮᱥᱟ ᱟᱨ ᱵᱷᱮᱜᱟᱨ",
    icon: "📐",
    topic: "ᱵᱟᱨ ᱮᱞᱠᱷᱟ ᱢᱮᱥᱟ (Two Digit Addition)",
    teacherName: "Prof. Anand Munda",
    timeSlot: "10:00 AM - 10:45 AM",
    status: "scheduled",
    attendees: []
  },
  {
    id: "lec_c3_sci",
    grade: "Class 3",
    division: "A",
    subjectId: "c3_sci",
    subjectName: "सामान्य विज्ञान: पौधे एवं प्रकाश संश्लेषण",
    santhaliSubject: "ᱥᱟᱬᱮᱥ: ᱫᱟᱨᱮ ᱟᱨ ᱡᱚᱢᱟᱜ ᱵᱮᱱᱟᱣ",
    icon: "🔬",
    topic: "ᱫᱟᱨᱮ ᱠᱚ ᱪᱮᱫ ᱞᱮᱠᱟ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ? (How Plants Make Food)",
    teacherName: "Prof. Anand Munda",
    timeSlot: "09:00 AM - 09:45 AM",
    status: "live",
    attendees: [
      { studentId: "stu_14_Class3_A", name: "ᱵᱤᱨᱥᱟ ᱥᱚᱨᱮᱱ (Birsa Soren)", rollNo: "14", grade: "Class 3", division: "A", joinTime: "09:02 AM", status: "Present" },
      { studentId: "stu_05_c3", name: "ᱥᱟᱹᱱᱛᱤ ᱴᱩᱰᱩ (Shanti Tudu)", rollNo: "5", grade: "Class 3", division: "A", joinTime: "09:06 AM", status: "Present" },
      { studentId: "stu_09_c3", name: "ᱢᱟᱞᱚᱛᱤ ᱢᱩᱨᱢᱩ (Malati Murmu)", rollNo: "9", grade: "Class 3", division: "A", joinTime: "09:10 AM", status: "Present" }
    ]
  },
  {
    id: "lec_c3_math",
    grade: "Class 3",
    division: "A",
    subjectId: "c3_math",
    subjectName: "गणित: पहाड़े और गुणन",
    santhaliSubject: "ᱮᱞᱠᱷᱟ: ᱜᱩᱬᱟᱹᱣ ᱟᱨ ᱞᱮᱠᱷᱟ",
    icon: "🧮",
    topic: "ᱯᱮ ᱟᱨ ᱯᱳᱱ ᱨᱮᱱᱟᱜ ᱜᱩᱬᱟᱹᱣ (Tables of 3 and 4)",
    teacherName: "Prof. Anand Munda",
    timeSlot: "10:00 AM - 10:45 AM",
    status: "scheduled",
    attendees: []
  },
  {
    id: "lec_c3_soc",
    grade: "Class 3",
    division: "A",
    subjectId: "c3_soc",
    subjectName: "झारखंड संस्कृति व हमारा समाज",
    santhaliSubject: "ᱥᱟᱶᱛᱟ ᱥᱟᱬᱮᱥ ᱟᱨ ᱦᱮᱨᱤᱴᱮᱡᱽ",
    icon: "🏛️",
    topic: "ᱵᱤᱨᱥᱟ ᱢᱩᱱᱰᱟ ᱟᱨ ᱥᱟᱨᱦᱩᱞ ᱯᱟᱨᱵᱚ (Birsa Munda & Sarhul Festival)",
    teacherName: "Prof. Anand Munda",
    timeSlot: "11:00 AM - 11:45 AM",
    status: "scheduled",
    attendees: []
  },
  {
    id: "lec_c4_evs",
    grade: "Class 4",
    division: "A",
    subjectId: "c4_evs",
    subjectName: "पर्यावरण विज्ञान: जल व वन संरक्षण",
    santhaliSubject: "ᱯᱚᱨᱤᱵᱮᱥ ᱥᱟᱬᱮᱥ: ᱫᱟᱜ ᱟᱨ ᱵᱤᱨ ᱵᱟᱧᱪᱟᱣ",
    icon: "🌍",
    topic: "ᱡᱟᱞ ᱜᱮ ᱡᱤᱣᱤ ᱠᱟᱱᱟ (Water Conservation in Jharkhand)",
    teacherName: "Prof. Anand Munda",
    timeSlot: "09:00 AM - 09:45 AM",
    status: "scheduled",
    attendees: []
  },
  {
    id: "lec_c4_math",
    grade: "Class 4",
    division: "A",
    subjectId: "c4_math",
    subjectName: "गणित: भाग एवं ज्यामितीय आकृतियाँ",
    santhaliSubject: "ᱮᱞᱠᱷᱟ: ᱦᱟᱹᱴᱤᱧ ᱟᱨ ᱨᱩᱯ",
    icon: "📐",
    topic: "ᱦᱟᱹᱴᱤᱧ ᱟᱨ ᱯᱮᱠᱳᱬ (Division and Triangles)",
    teacherName: "Prof. Anand Munda",
    timeSlot: "10:00 AM - 10:45 AM",
    status: "scheduled",
    attendees: []
  },
  {
    id: "lec_c5_sci",
    grade: "Class 5",
    division: "A",
    subjectId: "c5_sci",
    subjectName: "सामान्य विज्ञान: मानव शरीर व स्वास्थ्य",
    santhaliSubject: "ᱥᱟᱬᱮᱥ: ᱦᱚᱲᱢᱚ ᱟᱨ ᱦᱚᱲᱢᱚ ᱱᱟᱯᱟᱭ",
    icon: "🧬",
    topic: "ᱦᱚᱲᱢᱚ ᱨᱮᱱᱟᱜ ᱢᱩᱬ ᱚᱝᱜᱚ (Major Organ Systems of Body)",
    teacherName: "Prof. Anand Munda",
    timeSlot: "09:00 AM - 09:45 AM",
    status: "live",
    attendees: [
      { studentId: "stu_01_c5", name: "ᱚᱨᱡᱩᱱ ᱦᱮᱢᱵᱽᱨᱚᱢ (Arjun Hembrom)", rollNo: "1", grade: "Class 5", division: "A", joinTime: "09:01 AM", status: "Present" }
    ]
  }
];

export const classroomService = new ClassroomService();
