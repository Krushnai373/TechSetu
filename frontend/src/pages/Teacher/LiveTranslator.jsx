import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';
import { classroomService } from '../../services/classroomService';
import { offlineEngine } from '../../services/offlineTranslation';
import { conversationStore } from '../../services/conversationStore';
import { AudioWaveform } from '../../components/common/AudioWaveform';
import { CLASSROOM_PHRASES } from '../../utils/tribalData';
import { GRADE_SUBJECTS_CONFIG } from '../../utils/subjectsData';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  Zap, 
  Sparkles, 
  RadioTower,
  MessageSquare,
  User,
  Bot,
  History,
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  PlusCircle,
  Download,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScheduleSlotModal } from '../../components/ScheduleSlotModal';

export const LiveTranslator = () => {
  const { currentUser, updateMetrics, teacherT = {}, teacherUiLang = 'english', setActiveMeeting } = useApp();
  
  const [teacherInput, setTeacherInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLiveBroadcasting, setIsLiveBroadcasting] = useState(true);
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  // Lecture Scheduling & Assignment State (Grades 1-5)
  const [assignedLectures, setAssignedLectures] = useState(() => classroomService.getAssignedLectures());
  const [activeLecture, setActiveLecture] = useState(() => {
    const list = classroomService.getAssignedLectures();
    return list.find(l => l.status === 'live') || list[0] || null;
  });

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Form State for Assigning Lecture
  const [assignGrade, setAssignGrade] = useState('Class 3');
  const [assignDivision, setAssignDivision] = useState('A');
  const [assignSubjectId, setAssignSubjectId] = useState('c3_sci');
  const [assignTopic, setAssignTopic] = useState('ᱫᱟᱨᱮ ᱠᱚ ᱪᱮᱫ ᱞᱮᱠᱟ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ? (How Plants Make Food)');
  const [assignTimeSlot, setAssignTimeSlot] = useState('09:00 AM - 09:45 AM');
  
  // Current Active Translation Result for Santhali
  const [activeResult, setActiveResult] = useState({
    sourceText: "नमस्ते बच्चों, आज हम विज्ञान और प्रकृति के बारे में पढ़ेंगे।",
    olchiki: "ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ, ᱛᱮᱦᱮᱧ ᱫᱚ ᱥᱟᱬᱮᱥ ᱟᱨ ᱥᱤᱨᱡᱚᱱ ᱵᱟᱵᱚᱛ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ᱾",
    devanagari: "जोहार गिद्रा को, तेहेञ दो साणेस आर सिरजोन बाबत बोन पाड़हावा।",
    phonetic: "Johar gidra ko, tehenj do sanes ar sirjon babot bon parhawa.",
    displayScript: "ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ, ᱛᱮᱦᱮᱧ ᱫᱚ ᱥᱟᱬᱮᱥ ᱟᱨ ᱥᱤᱨᱡᱚᱱ ᱵᱟᱵᱚᱛ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ᱾",
    english: "Hello children, today we will study science and nature.",
    latencyMs: 18.5,
    confidence: 0.99
  });

  const [studentQuestions, setStudentQuestions] = useState(() => {
    try {
      return classroomService.getQuestions() || [];
    } catch {
      return [];
    }
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [aiDraftAnswer, setAiDraftAnswer] = useState(null);

  // Synchronize when grade changes in the assignment form
  useEffect(() => {
    const subjects = GRADE_SUBJECTS_CONFIG[assignGrade] || [];
    if (subjects.length > 0) {
      setAssignSubjectId(subjects[0].id);
      setAssignTimeSlot(subjects[0].timeDefault || "09:00 AM - 09:45 AM");
    }
  }, [assignGrade]);

  // Subscribe to incoming classroom events (Questions, Attendance, Lecture Assignments)
  useEffect(() => {
    try {
      const unsubscribe = classroomService.subscribe((event) => {
        if (event.type === 'STUDENT_QUESTION' || event.type === 'TEACHER_ANSWERED') {
          setStudentQuestions(classroomService.getQuestions() || []);
          if (event.type === 'STUDENT_QUESTION') {
            speechService.playChime('click');
          }
        } else if (event.type === 'ATTENDANCE_MARKED' || event.type === 'LECTURE_ASSIGNED') {
          const updated = classroomService.getAssignedLectures();
          setAssignedLectures(updated);
          if (activeLecture) {
            const current = updated.find(l => l.id === activeLecture.id);
            if (current) setActiveLecture(current);
          }
        }
      });
      return () => unsubscribe && unsubscribe();
    } catch (err) {
      console.warn("Subscription error:", err);
    }
  }, [activeLecture]);

  const handleTranslate = async (textToTranslate, sttLatency = 210) => {
    if (!textToTranslate || !textToTranslate.trim()) return;

    setIsTranslating(true);
    const transStart = performance.now();
    
    // Gemini AI + Offline Santhali translation
    const result = await offlineEngine.translateAsync(textToTranslate, "hindi", "santhali");
    const transLatency = Math.round(performance.now() - transStart);

    setActiveResult(result);
    setIsTranslating(false);

    // Speak audio in Santhali
    speechService.speak({
      text: result.devanagari || result.olchiki || result.displayScript,
      phonetic: result.phonetic,
      lang: "santhali",
      onStart: ({ ttsLatencyMs }) => {
        if (updateMetrics) {
          updateMetrics({
            stt: sttLatency,
            trans: transLatency,
            tts: ttsLatencyMs
          });
        }
      }
    });

    // Auto broadcast to live student classroom & save into Conversation Database
    if (isLiveBroadcasting) {
      classroomService.broadcastTeacherSpeech({
        teacherName: currentUser?.name || "Teacher",
        hindiText: textToTranslate,
        santhali: {
          script: result.olchiki || result.devanagari,
          devanagari: result.devanagari,
          phonetic: result.phonetic
        },
        subject: activeLecture ? `${activeLecture.subjectName} (${activeLecture.grade})` : "General"
      });
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      speechService.playChime('click');
      setIsListening(true);
      setInterimTranscript('');
      
      speechService.startListening({
        onInterim: (text) => setInterimTranscript(text),
        onResult: ({ text, sttLatencyMs }) => {
          setIsListening(false);
          setTeacherInput(text);
          setInterimTranscript('');
          handleTranslate(text, sttLatencyMs);
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
    }
  };

  const handleQuickPhrase = (phrase) => {
    speechService.playChime('click');
    setTeacherInput(phrase.hindi);
    handleTranslate(phrase.hindi, 120);
  };

  // AI-Powered Context Answer Generator
  const handleGenerateAiAnswer = async (q) => {
    setIsAiAnswering(true);
    setReplyingTo(q);
    speechService.playChime('click');
    const aiAns = await classroomService.generateAiContextualAnswer(q);
    setIsAiAnswering(false);
    setAiDraftAnswer(aiAns);
    setReplyText(aiAns.replyHindi || "");
  };

  const handleSendReply = async (q) => {
    if (!replyText.trim() && !aiDraftAnswer) return;

    let tribalAnswer = aiDraftAnswer?.replyTribal;
    let phonetic = aiDraftAnswer?.phonetic;

    if (!tribalAnswer || replyText !== aiDraftAnswer?.replyHindi) {
      const tr = await offlineEngine.translateAsync(replyText, "hindi", "santhali");
      tribalAnswer = tr.displayScript || tr.devanagari;
      phonetic = tr.phonetic;
    }

    classroomService.answerQuestion(q.id, {
      teacherName: currentUser?.name || (teacherUiLang === 'en' ? "Teacher" : "शिक्षक"),
      replyHindi: replyText.trim() || aiDraftAnswer?.replyHindi,
      replyTribal: tribalAnswer,
      phonetic: phonetic || "",
      language: "santhali",
      conceptReferenced: aiDraftAnswer?.conceptReferenced || activeLecture?.topic || "Previous Lesson"
    });

    speechService.playChime('reward');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setReplyingTo(null);
    setReplyText('');
    setAiDraftAnswer(null);
  };

  // Handle Assigning Lecture
  const handleAssignLectureSubmit = (e) => {
    e.preventDefault();
    const subjects = GRADE_SUBJECTS_CONFIG[assignGrade] || [];
    const chosenSubject = subjects.find(s => s.id === assignSubjectId) || subjects[0] || {
      name_hi: "सामान्य विषय",
      name_tribal: "ᱥᱟᱱᱛᱟᱲᱤ ᱥᱮᱪᱮᱫ",
      icon: "📖"
    };

    const newLec = classroomService.assignLecture({
      grade: assignGrade,
      division: assignDivision,
      subjectId: chosenSubject.id,
      subjectName: chosenSubject.name_hi,
      santhaliSubject: chosenSubject.name_tribal,
      icon: chosenSubject.icon,
      topic: assignTopic.trim() || chosenSubject.name_hi,
      timeSlot: assignTimeSlot.trim() || "09:00 AM - 09:45 AM",
      teacherName: currentUser?.name || "Prof. Anand Munda"
    });

    setActiveLecture(newLec);
    setAssignedLectures(classroomService.getAssignedLectures());
    setIsAssignModalOpen(false);
    speechService.playChime('reward');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
  };

  const handleExportAttendance = () => {
    if (activeLecture?.id) {
      speechService.playChime('reward');
      classroomService.exportAttendanceCSV(activeLecture.id);
    }
  };

  const safeQuestions = (studentQuestions || []).filter(q => q && typeof q === 'object');
  const attendees = activeLecture?.attendees || [];
  const currentGradeSubjects = GRADE_SUBJECTS_CONFIG[assignGrade] || [];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-orange-950 via-slate-900 to-amber-950 border border-orange-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎙️</span>
            <h2 className="text-2xl font-black text-white">
              {teacherT.translator_title || "Real-Time Voice Classroom Dialoguer"}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
              ✨ Gemini AI Powered
            </span>
          </div>
          <p className="text-sm text-amber-300 font-medium mt-1">
            {teacherT.translator_desc || "Speak in Hindi/English -> High-accuracy Santhali (Ol Chiki) broadcast with conversation memory"}
          </p>
        </div>

        {/* Action Controls: Assign Lecture, Video Meeting, Attendance Sheet, Broadcast Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Button: Launch Video Meeting Room */}
          <button
            onClick={() => {
              speechService.playChime('reward');
              if (setActiveMeeting) setActiveMeeting(activeLecture);
              if (window.history && window.history.pushState) {
                window.history.pushState({}, '', `/meeting/${activeLecture?.id || 'room_default'}`);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-600/30 transition-all animate-pulse"
          >
            <span>📹 वीडियो मीटिंग शुरू करें (Start Video Meeting)</span>
          </button>

          {/* Button: Assign Lecture for Grades 1-5 */}
          <button
            onClick={() => { speechService.playChime('click'); setIsAssignModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black hover:brightness-110 active:scale-95 shadow-lg shadow-orange-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>व्याख्यान शेड्यूल करें (Schedule Slot)</span>
          </button>

          {/* Button: Attendance Register Sheet */}
          <button
            onClick={() => { speechService.playChime('click'); setIsAttendanceModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black hover:bg-emerald-500/30 active:scale-95 transition-all"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>हाजिरी रजिस्टर ({attendees.length} उपस्थित)</span>
          </button>

          {/* Broadcast Toggle */}
          <button
            onClick={() => setIsLiveBroadcasting(!isLiveBroadcasting)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all border ${
              isLiveBroadcasting
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-md shadow-rose-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <RadioTower className={`w-4 h-4 ${isLiveBroadcasting ? 'text-rose-400 animate-pulse' : ''}`} />
            <span>{isLiveBroadcasting ? (teacherT.broadcasting_on || "Live Broadcast ON") : (teacherT.broadcasting_off || "Broadcast Paused")}</span>
          </button>
        </div>
      </div>

      {/* --- ASSIGNED LECTURE & TIMETABLE CARD (GRADES 1-5) --- */}
      {activeLecture && (
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
              {activeLecture.icon || "📖"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black tracking-wider uppercase border border-amber-500/30">
                  {activeLecture.grade} • Section {activeLecture.division}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>समय: {activeLecture.timeSlot}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/30 animate-pulse">
                  🔴 LIVE NOW
                </span>
              </div>

              <h3 className="text-lg font-black text-white mt-1">
                {activeLecture.subjectName} <span className="text-amber-400 font-olchiki font-normal text-sm">({activeLecture.santhaliSubject})</span>
              </h3>
              <p className="text-xs text-slate-300">
                <strong className="text-slate-400">पाठ / Topic:</strong> {activeLecture.topic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 block">वर्तमान उपस्थिति</span>
              <strong className="text-emerald-400 text-sm">{attendees.length} छात्र उपस्थित</strong>
            </div>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
            >
              विषय बदलें (Change)
            </button>
          </div>
        </div>
      )}

      {/* Split Screen: Teacher Input Left | Santhali Output Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Teacher Input */}
        <div className="glass-card rounded-3xl p-6 border-orange-500/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-600/30 flex items-center justify-center text-orange-400 font-bold border border-orange-500/40">
                  👨‍🏫
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{teacherT.teacher_input_title || "Teacher Voice Input"}</h3>
                  <p className="text-xs text-slate-400">{teacherT.speak_or_type || "Speak in Hindi or English..."}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Source: Hindi / EN
              </span>
            </div>

            {/* Visualizer Box */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4 min-h-[130px] flex flex-col justify-between">
              <div className="text-slate-300 text-sm">
                {isListening ? (
                  <div className="flex items-center gap-2 text-amber-400 font-medium animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>{(teacherT.listening || "Listening...")} {interimTranscript}</span>
                  </div>
                ) : teacherInput ? (
                  <p className="font-semibold text-white text-base leading-relaxed">{teacherInput}</p>
                ) : (
                  <p className="text-slate-500 italic">{teacherT.speak_or_type || "Speak into mic or type here in Hindi or English..."}</p>
                )}
              </div>

              <div className="mt-3">
                <AudioWaveform isActive={isListening || isTranslating} color="#F97316" height={40} />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={teacherInput}
                  onChange={(e) => setTeacherInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTranslate(teacherInput)}
                  placeholder={teacherT.speak_or_type || "Type lesson speech in Hindi..."}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 shadow-inner"
                />
              </div>

              {/* Push-to-Talk Mic */}
              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-3.5 rounded-2xl font-bold flex items-center justify-center transition-all shadow-md active:scale-95 ${
                  isListening 
                    ? 'bg-rose-600 text-white animate-voice-pulse' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 hover:brightness-110 shadow-orange-500/30'
                }`}
                title={isListening ? "Stop Voice" : "Start Voice"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => handleTranslate(teacherInput)}
                disabled={isTranslating || !teacherInput.trim()}
                className="px-4 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-orange-600/30 disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{teacherT.btn_translate || "Send"}</span>
              </button>
            </div>
          </div>

          {/* Quick Classroom Phrases */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">⚡ {teacherT.quick_phrases_title || "Quick Phrases"}</span>
              <span className="text-[10px] text-slate-500">Click to speak & broadcast</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CLASSROOM_PHRASES.slice(0, 5).map((cp) => (
                <button
                  key={cp.id}
                  onClick={() => handleQuickPhrase(cp)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all active:scale-95 text-left"
                >
                  {cp.hindi}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real-time Santhali (Ol Chiki) Output */}
        <div className="glass-card rounded-3xl p-6 border-emerald-500/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Santhali Classroom Projection</h3>
                  <p className="text-xs text-slate-400 font-olchiki">ᱥᱟᱱᱛᱟᱲᱤ ᱛᱚᱨᱡᱚᱢᱟ (Ol Chiki ᱚᱞ ᱪᱤᱠᱤ)</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activeResult.latencyMs}ms • Latency
              </span>
            </div>

            {/* Translated Board Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 shadow-xl space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-olchiki">
                  Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ)
                </span>
                <button
                  onClick={() => speechService.speak({
                    text: activeResult.devanagari || activeResult.displayScript,
                    phonetic: activeResult.phonetic,
                    lang: "santhali"
                  })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black hover:brightness-110 active:scale-95 shadow-md shadow-emerald-500/30 transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{teacherT.play_audio || "Play Audio"}</span>
                </button>
              </div>

              {/* Large Ol Chiki Output */}
              <div className="py-2">
                <div className="font-olchiki text-2xl sm:text-3xl font-black text-amber-300 tracking-wide leading-snug">
                  {activeResult.olchiki || activeResult.devanagari || activeResult.displayScript || "ᱡᱚᱦᱟᱨ"}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                <p className="text-slate-300">
                  <span className="text-slate-400">Devanagari:</span> <strong className="text-emerald-300">{activeResult.devanagari}</strong>
                </p>
                {activeResult.phonetic && (
                  <p className="text-slate-400 italic">
                    <span className="not-italic text-slate-500">Phonetic:</span> &ldquo;{activeResult.phonetic}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Broadcast Status: <strong className="text-emerald-400">Live Active</strong></span>
            </div>
            <span className="text-[10px] text-slate-500">Auto-saved to Conversation DB ✓</span>
          </div>
        </div>
      </div>

      {/* --- INCOMING STUDENT DOUBTS & QUESTIONS --- */}
      <div className="glass-card rounded-3xl p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              छात्रों के सवाल व शंकाएं (Incoming Student Doubts)
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              {safeQuestions.length} Total
            </span>
          </div>
        </div>

        {safeQuestions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm">
            अभी तक किसी छात्र ने सवाल नहीं पूछा है। जब छात्र सवाल पूछेंगे, वे यहाँ दिखाई देंगे।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeQuestions.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-white font-olchiki">
                    <span>🧒 {q.studentName || "Student"}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                      Roll: {q.rollNo} • {q.grade}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    q.status === 'answered'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  }`}>
                    {q.status === 'answered' ? 'Answered ✓' : 'Pending'}
                  </span>
                </div>

                <p className="text-sm text-slate-200 font-semibold font-olchiki">
                  &ldquo;{q.questionText}&rdquo;
                </p>

                {q.reply ? (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                    <span className="font-bold text-emerald-300">उत्तर दिया गया (Reply):</span>
                    <p className="text-amber-300 font-olchiki text-sm font-bold">{q.reply.replyTribal || q.reply.replyHindi}</p>
                    {q.reply.replyHindi && q.reply.replyHindi !== q.reply.replyTribal && (
                      <p className="text-slate-400 text-[11px]">{q.reply.replyHindi}</p>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateAiAnswer(q)}
                      disabled={isAiAnswering}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>{isAiAnswering && replyingTo?.id === q.id ? "स्मार्ट उत्तर बन रहा है..." : "स्मार्ट AI संदर्भ उत्तर तैयार करें"}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL 1: SCHEDULE LECTURE SLOT --- */}
      <ScheduleSlotModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onScheduled={(slot) => {
          setActiveLecture(slot);
          setAssignedLectures(classroomService.getAssignedLectures());
        }}
        teacherName={currentUser?.name || "Prof. Anand Munda"}
      />

      {/* --- MODAL 2: LIVE ATTENDANCE REGISTER SHEET --- */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full rounded-3xl p-6 border-emerald-500/40 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
                  📋
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    छात्र उपस्थिति रजिस्टर (Student Attendance Sheet)
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeLecture ? `${activeLecture.grade} • ${activeLecture.subjectName} (${activeLecture.timeSlot})` : "Class Attendance"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Attendance Summary Bar */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block">कुल उपस्थित (Present)</span>
                <strong className="text-emerald-400 text-xl font-mono">{attendees.length}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block">कक्षा व वर्ग (Class)</span>
                <strong className="text-amber-300 text-base">{activeLecture?.grade || "Class 3"} ({activeLecture?.division || "A"})</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block">सत्र का समय (Slot)</span>
                <strong className="text-sky-300 text-xs font-mono">{activeLecture?.timeSlot || "Live"}</strong>
              </div>
            </div>

            {/* Attendees Table */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden max-h-72 overflow-y-auto">
              {attendees.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  अभी तक कोई छात्र कक्षा में शामिल नहीं हुआ है। जैसे ही छात्र शामिल होंगे, उनका नाम और समय यहाँ रिकॉर्ड होगा।
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-3">रोल नं (Roll)</th>
                      <th className="p-3">छात्र का नाम (Student Name)</th>
                      <th className="p-3">कक्षा (Grade)</th>
                      <th className="p-3">प्रवेश समय (Time)</th>
                      <th className="p-3 text-right">स्थिति (Status)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {attendees.map((att, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono text-amber-300 font-bold">#{att.rollNo}</td>
                        <td className="p-3 text-white font-olchiki">{att.name}</td>
                        <td className="p-3 text-slate-300">{att.grade} ({att.division})</td>
                        <td className="p-3 text-slate-400 font-mono">{att.joinTime}</td>
                        <td className="p-3 text-right">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            ✓ {att.status || "Present"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Actions: Export CSV and Close */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                * Real-time attendance synced with TechSetu Database
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportAttendance}
                  disabled={attendees.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>उपस्थिति पत्रक डाउनलोड (CSV)</span>
                </button>
                <button
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black hover:brightness-110"
                >
                  ठीक है (Done)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
