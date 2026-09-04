import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { classroomService } from '../../services/classroomService';
import { speechService } from '../../services/speechService';
import { offlineEngine } from '../../services/offlineTranslation';
import { AudioWaveform } from '../../components/common/AudioWaveform';
import {
  Radio,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Send,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Clock,
  User,
  Tv,
  Layers,
  BookOpen,
  Calendar,
  Users,
  CheckSquare,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LiveClassroom = () => {
  const { currentUser, selectedLanguage, addStudentReward, studentT, setActiveMeeting } = useApp();

  const studentGrade = currentUser?.grade || "Class 3";
  const studentDivision = currentUser?.division || "A";

  const [activeLectures, setActiveLectures] = useState(() => classroomService.getActiveLectures());
  
  // Allotted Lectures strictly targeted to this student's class & division
  const [gradeLectures, setGradeLectures] = useState(() => classroomService.getAssignedLectures(studentGrade, studentDivision));
  const [selectedLecture, setSelectedLecture] = useState(() => {
    const list = classroomService.getAssignedLectures(studentGrade, studentDivision);
    return list.find(l => l.status === 'live') || list[0] || null;
  });

  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [isAsking, setIsAsking] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [studentQuestions, setStudentQuestions] = useState(() => classroomService.getQuestions());
  const [isAiResolving, setIsAiResolving] = useState(false);
  const [isAttendanceSheetOpen, setIsAttendanceSheetOpen] = useState(false);

  // Auto mark student attendance when entering the live lecture
  useEffect(() => {
    if (selectedLecture && currentUser) {
      classroomService.markAttendance(selectedLecture.id, currentUser);
    }
  }, [selectedLecture?.id, currentUser?.rollNo]);

  useEffect(() => {
    const unsubscribe = classroomService.subscribe((event) => {
      if (event.type === 'TEACHER_SPEECH') {
        const lecture = event.payload;
        setActiveLectures(prev => [lecture, ...prev.filter(l => l.id !== lecture.id)].slice(0, 30));

        if (autoPlayAudio) {
          const langData = lecture.santhali || lecture[selectedLanguage];
          if (langData) {
            speechService.speak({
              text: langData.devanagari || langData.script || lecture.hindiText,
              phonetic: langData.phonetic,
              lang: 'santhali'
            });
          }
        }
      } else if (event.type === 'TEACHER_ANSWERED' || event.type === 'STUDENT_QUESTION') {
        setStudentQuestions(classroomService.getQuestions());
        if (event.type === 'TEACHER_ANSWERED') {
          const ans = event.payload;
          if (ans.studentId === currentUser?.id || ans.rollNo === currentUser?.rollNo) {
            speechService.playChime('reward');
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          }
        }
      } else if (event.type === 'LECTURE_ASSIGNED' || event.type === 'ATTENDANCE_MARKED') {
        const updated = classroomService.getAssignedLectures(studentGrade, studentDivision);
        setGradeLectures(updated);
        if (selectedLecture) {
          const cur = updated.find(l => l.id === selectedLecture.id);
          if (cur) setSelectedLecture(cur);
        }
      }
    });

    return () => unsubscribe();
  }, [autoPlayAudio, selectedLanguage, currentUser, studentGrade, studentDivision, selectedLecture]);

  const handleJoinLecture = (lec) => {
    speechService.playChime('reward');
    setSelectedLecture(lec);
    classroomService.markAttendance(lec.id, currentUser);
    addStudentReward(10);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });

    // Launch Zoom-like WebRTC Meeting Room
    if (setActiveMeeting) {
      setActiveMeeting(lec);
    }
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', `/meeting/${lec.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSendQuestion = async (textToSend) => {
    const qText = textToSend || questionInput;
    if (!qText || !qText.trim()) return;

    speechService.playChime('click');
    const tr = offlineEngine.translate(qText, "santhali", "hindi");

    const newQuestion = classroomService.askQuestion({
      student: currentUser || { name: "ᱥᱮᱪᱮᱫᱤᱭᱟᱹ", rollNo: "1", grade: studentGrade, division: studentDivision },
      questionText: qText.trim(),
      translatedHindi: tr.devanagari || qText.trim(),
      language: 'santhali'
    });

    setQuestionInput('');
    setIsAsking(false);
    speechService.playChime('success');
    addStudentReward(5);

    // Auto-resolve doubt referencing previous saved classroom lesson context!
    setIsAiResolving(true);
    setTimeout(async () => {
      try {
        const aiAns = await classroomService.generateAiContextualAnswer(newQuestion);
        if (aiAns) {
          classroomService.answerQuestion(newQuestion.id, {
            teacherName: "AI ᱜᱚᱢᱠᱮ (Classroom Memory Engine)",
            replyHindi: aiAns.replyHindi,
            replyTribal: aiAns.replyTribal,
            phonetic: aiAns.phonetic,
            language: 'santhali',
            conceptReferenced: aiAns.conceptReferenced
          });
        }
      } finally {
        setIsAiResolving(false);
      }
    }, 1000);
  };

  const handleMicToggle = () => {
    if (isMicActive) {
      speechService.stopListening();
      setIsMicActive(false);
    } else {
      speechService.playChime('click');
      setIsMicActive(true);
      setInterimText('');

      speechService.startListening({
        onInterim: (txt) => setInterimText(txt),
        onResult: ({ text }) => {
          setIsMicActive(false);
          setQuestionInput(text);
          setInterimText('');
          handleSendQuestion(text);
        },
        onError: () => setIsMicActive(false),
        onEnd: () => setIsMicActive(false)
      });
    }
  };

  const myQuestions = studentQuestions.filter(
    q => q.studentId === currentUser?.id || q.rollNo === currentUser?.rollNo
  );

  const t = studentT.classroom;
  const latestLecture = activeLectures.length > 0 ? activeLectures[0] : null;
  const latestLang = latestLecture ? (latestLecture.santhali || latestLecture[selectedLanguage] || {}) : null;

  // Attendees of the active lecture
  const attendees = selectedLecture?.attendees || [];
  const isMyAttendanceMarked = attendees.some(
    a => a.rollNo === currentUser?.rollNo && a.grade === studentGrade
  );

  return (
    <div className="space-y-6">

      {/* Live Classroom Status Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
              🎧
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black tracking-wider uppercase border border-emerald-500/30 flex items-center gap-1.5 font-olchiki">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                {t.badge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {studentGrade} ({studentDivision})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-olchiki">
              {t.title}
            </h2>
            <p className="text-xs text-slate-300 font-medium font-olchiki">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Controls: Attendance Register, Audio Autoplay, Ask Teacher */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Attendance Sheet Button */}
          <button
            onClick={() => { speechService.playChime('click'); setIsAttendanceSheetOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 active:scale-95 transition-all font-olchiki"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>ᱦᱟᱡᱤᱨᱟ ᱠᱷᱟᱛᱟ ({attendees.length} ᱥᱮᱞᱮᱫ)</span>
          </button>

          {/* Autoplay Audio Toggle */}
          <button
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border font-olchiki ${autoPlayAudio
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
          >
            {autoPlayAudio ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{autoPlayAudio ? t.auto_audio_on : t.auto_audio_off}</span>
          </button>

          {/* Ask Teacher Button */}
          <button
            onClick={() => { speechService.playChime('click'); setIsAsking(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-xs sm:text-sm font-black hover:brightness-110 active:scale-95 shadow-lg shadow-orange-500/30 transition-all font-olchiki"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.ask_teacher_btn}</span>
          </button>
        </div>
      </div>

      {/* --- ALLOTTED LECTURES & SCHEDULE FOR THIS GRADE --- */}
      <div className="glass-card rounded-3xl p-6 border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base font-olchiki">
              ᱟᱢᱟᱜ ᱠᱞᱟᱥ ᱞᱟᱹᱜᱤᱫ ᱥᱟᱡᱟᱣ ᱞᱮᱠᱪᱟᱨ (Allotted Lectures for {studentGrade})
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400 font-olchiki">
            {gradeLectures.length} ᱥᱟᱛᱟᱢ ᱞᱮᱠᱪᱟᱨ (Subjects)
          </span>
        </div>

        {gradeLectures.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-olchiki">
            ᱱᱚᱣᱟ ᱠᱞᱟᱥ ᱞᱟᱹᱜᱤᱫ ᱱᱤᱛᱚᱜ ᱪᱮᱫ ᱞᱮᱠᱪᱟᱨ ᱦᱚᱸ ᱵᱟᱹᱱᱩᱜᱼᱟ᱾
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gradeLectures.map((lec) => {
              const isCurrent = selectedLecture?.id === lec.id;
              const hasMarked = (lec.attendees || []).some(a => a.rollNo === currentUser?.rollNo);
              const slotStatus = classroomService.isSlotActiveNow(lec);
              const canJoin = slotStatus.canJoin || lec.status === 'live';

              return (
                <div
                  key={lec.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isCurrent && canJoin
                      ? 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                        {lec.icon || "📖"}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-300 font-mono font-bold">
                          <Clock className="w-3 h-3 text-sky-400" />
                          <span>{lec.timeSlot}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          canJoin 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                            : slotStatus.isUpcoming
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                        }`}>
                          {canJoin ? '🔴 Live Now' : slotStatus.isUpcoming ? `🔒 ${slotStatus.text}` : '✓ Completed'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm leading-snug">
                        {lec.subjectName}
                      </h4>
                      <p className="text-xs text-amber-300 font-olchiki font-medium mt-0.5">
                        {lec.santhaliSubject}
                      </p>
                      <p className="text-[11px] text-slate-400 font-olchiki line-clamp-2 mt-1">
                        {lec.topic}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-olchiki">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{hasMarked ? "ᱦᱟᱡᱤᱨᱟ: ᱥᱮᱞᱮᱫ ✓" : `${lec.attendees?.length || 0} ᱥᱮᱞᱮᱫ`}</span>
                    </span>

                    {canJoin ? (
                      <button
                        onClick={() => handleJoinLecture(lec)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 font-olchiki flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-105 animate-pulse"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>📹 ᱡᱚᱭᱮᱱ ᱢᱤᱴᱤᱝ (Join Meeting)</span>
                      </button>
                    ) : slotStatus.isUpcoming ? (
                      <button
                        onClick={() => alert(`This class is scheduled for ${lec.startTime || (lec.timeSlot ? lec.timeSlot.split('-')[0] : 'scheduled time')}. Entry will unlock when the slot begins (${slotStatus.text}).`)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold font-olchiki bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 flex items-center gap-1"
                      >
                        <span>🔒 {slotStatus.text}</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold font-olchiki bg-slate-800 text-slate-400 border border-slate-700">
                        ✓ Expired / Ended
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- FEATURED LIVE DIGITAL CLASSROOM BOARD (ᱞᱟᱭᱤᱵᱷ ᱥᱟᱱᱛᱟᱲᱤ ᱵᱚᱨᱰ) --- */}
      <div className="relative rounded-3xl p-1 bg-gradient-to-b from-amber-800 via-amber-950 to-slate-900 shadow-2xl border-2 border-amber-600/40 overflow-hidden">
        {/* Blackboard Frame Interior */}
        <div className="relative rounded-[22px] bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-950 p-6 sm:p-8 border border-emerald-500/20">
          
          {/* Header of the Board: Allotted Subject & Scheduled Time */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                📺
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-wide font-olchiki">
                    ᱞᱟᱭᱤᱵᱷ ᱥᱟᱱᱛᱟᱲᱤ ᱵᱚᱨᱰ (Live Santhali Smart Board)
                  </h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs mt-0.5">
                  <span className="text-emerald-300 font-bold font-olchiki">
                    ᱥᱟᱛᱟᱢ: {selectedLecture?.santhaliSubject || "ᱥᱟᱬᱮᱥ"}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-amber-300 font-mono font-semibold">
                    ᱚᱠᱛᱚ: {selectedLecture?.timeSlot || "09:00 AM - 09:45 AM"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-olchiki flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{isMyAttendanceMarked ? "ᱦᱟᱡᱤᱨᱟ: ᱥᱮᱞᱮᱫ (Present)" : "ᱦᱟᱡᱤᱨᱟ ᱥᱮᱞᱮᱫᱚᱜ ᱠᱟᱱᱟ..."}</span>
              </span>

              {latestLang && (
                <button
                  onClick={() => speechService.speak({
                    text: latestLang.devanagari || latestLang.script || latestLecture.hindiText,
                    phonetic: latestLang.phonetic,
                    lang: 'santhali'
                  })}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black hover:brightness-110 active:scale-95 shadow-md shadow-emerald-500/30"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>ᱟᱲᱟᱝ (Play)</span>
                </button>
              )}
            </div>
          </div>

          {/* Center Main Board Content - ONLY THE TRANSLATION VISIBLE */}
          <div className="py-8 px-2 text-center space-y-4">
            {latestLecture ? (
              <>
                {/* Huge Glowing Ol Chiki Headline */}
                <div className="font-olchiki text-3xl sm:text-5xl font-black text-amber-300 drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)] tracking-wider leading-relaxed animate-in fade-in zoom-in-95 duration-200">
                  {latestLang?.script || latestLang?.devanagari || latestLecture.hindiText}
                </div>

                {/* Subtitle Lines (Only Santhali Translation & Pronunciation Guide) */}
                <div className="max-w-2xl mx-auto pt-2 space-y-2">
                  {latestLang?.phonetic && (
                    <p className="text-sm sm:text-base text-emerald-200/90 font-medium italic font-sans">
                      &ldquo;{latestLang.phonetic}&rdquo;
                    </p>
                  )}
                  {latestLang?.devanagari && latestLang?.devanagari !== latestLang?.script && (
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs sm:text-sm text-emerald-300 font-olchiki">
                      <span className="text-amber-300 font-bold">ᱥᱟᱱᱛᱟᱲᱤ ᱛᱚᱨᱡᱚᱢᱟ:</span>
                      <span>{latestLang.devanagari}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 space-y-3 font-olchiki">
                <span className="text-5xl">👨‍🏫</span>
                <p className="text-lg font-bold text-white">ᱠᱞᱟᱥ ᱱᱤᱛᱚᱜ ᱮᱦᱚᱵᱚᱜ ᱠᱟᱱᱟ...</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  ᱜᱚᱢᱠᱮ ᱦᱤᱱᱫᱤ ᱵᱟᱝᱠᱷᱟᱱ ᱤᱝᱞᱤᱥ ᱛᱮ ᱨᱚᱲ ᱮᱦᱚᱵ ᱥᱟᱶᱛᱮ ᱱᱚᱣᱟ ᱵᱚᱨᱰ ᱨᱮ ᱥᱟᱱᱛᱟᱲᱤ (ᱚᱞ ᱪᱤᱠᱤ) ᱛᱮ ᱛᱚᱨᱡᱚᱢᱟ ᱠᱟᱛᱮ ᱧᱮᱞᱚᱜᱼᱟ᱾
                </p>
              </div>
            )}
          </div>

          {/* Board Footer Bar */}
          <div className="pt-4 border-t border-emerald-500/20 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Smart Classroom Context: <strong className="text-emerald-300">Database Synced ✓</strong></span>
            </div>
            <span className="font-olchiki text-amber-300">
              {selectedLecture ? `${selectedLecture.grade} (${selectedLecture.division}) • ${selectedLecture.timeSlot}` : "TechSetu MTB-MLE Board"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Feed (Left) & My Questions/Answers (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Live Broadcast Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-3xl p-6 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base font-olchiki">{t.live_feed_title}</h3>
              </div>
              <span className="text-xs text-slate-400 font-olchiki">{activeLectures.length} ᱵᱮᱣᱨᱟ (messages)</span>
            </div>

            {activeLectures.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-olchiki">
                <span className="text-4xl">👨‍🏫</span>
                <p className="text-white font-bold text-sm">ᱠᱞᱟᱥ ᱱᱤᱛᱚᱜ ᱮᱦᱚᱵᱚᱜ ᱠᱟᱱᱟ...</p>
                <p className="text-xs text-slate-400">
                  ᱜᱚᱢᱠᱮ ᱨᱚᱲ ᱮᱦᱚᱵ ᱥᱟᱶᱛᱮ ᱱᱚᱰᱮ ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮ ᱚᱞ ᱟᱨ ᱟᱲᱟᱝ ᱟᱸᱡᱚᱢᱚᱜᱼᱟ᱾
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {activeLectures.map((lec, idx) => {
                  const langData = lec.santhali || {
                    script: lec.hindiText,
                    devanagari: lec.hindiText,
                    phonetic: ""
                  };

                  const isNew = idx === 0;

                  return (
                    <div
                      key={lec.id || idx}
                      className={`p-5 rounded-2xl border transition-all ${isNew
                          ? 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/40 shadow-xl shadow-emerald-500/10'
                          : 'bg-slate-900/90 border-slate-800'
                        }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2 font-olchiki">
                          <span className="font-bold text-amber-300">👨‍🏫 {lec.teacherName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {lec.timeString}
                          </span>
                        </div>

                        <button
                          onClick={() => speechService.speak({
                            text: langData.devanagari || langData.script || lec.hindiText,
                            phonetic: langData.phonetic,
                            lang: 'santhali'
                          })}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-transform active:scale-95 font-olchiki"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t.play_audio_btn}</span>
                        </button>
                      </div>

                      {/* Primary Santhali Ol Chiki Script */}
                      <div className="py-2">
                        <div className="font-olchiki text-2xl sm:text-3xl font-black text-amber-300 leading-snug">
                          {langData.script || langData.devanagari}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 space-y-1 text-xs font-olchiki">
                        {langData.phonetic && (
                          <p className="text-slate-400 italic">
                            &ldquo;{langData.phonetic}&rdquo;
                          </p>
                        )}
                        {langData.devanagari && langData.devanagari !== langData.script && (
                          <p className="text-emerald-400/80 text-[11px]">
                            <span className="text-slate-400">ᱥᱟᱱᱛᱟᱲᱤ:</span> {langData.devanagari}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: My Asked Questions & Teacher Replies */}
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6 border-slate-800 space-y-4 font-olchiki">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-white text-base">{t.my_questions_title}</h3>
              </div>
              <span className="text-xs font-bold text-amber-400">{myQuestions.length} ᱠᱩᱠᱞᱤ</span>
            </div>

            {myQuestions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-3xl">🙋‍♂️</span>
                <p className="text-xs text-slate-400">
                  ᱟᱢ ᱱᱤᱛ ᱫᱷᱟᱹᱵᱤᱡ ᱪᱮᱫ ᱦᱚᱸ ᱵᱟᱢ ᱠᱩᱞᱤ ᱟᱠᱟᱫᱟ᱾ ᱪᱮᱛᱟᱱ ᱨᱮ <strong>"ᱜᱚᱢᱠᱮ ᱠᱩᱞᱤᱭᱮᱢ"</strong> ᱵᱚᱴᱚᱱ ᱚᱛᱟᱭ ᱢᱮ!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {myQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300">ᱟᱢᱟᱜ ᱠᱩᱠᱞᱤ:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${q.status === 'answered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        }`}>
                        {q.status === 'answered' ? t.answered : t.waiting_reply}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-white font-olchiki">{q.questionText}</p>

                    {/* Teacher's / Context AI Reply */}
                    {q.reply && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-black text-emerald-400">{q.reply.teacherName || t.teacher_reply_prefix}</span>
                          <button
                            onClick={() => speechService.speak({
                              text: q.reply.replyTribal || q.reply.replyHindi,
                              phonetic: q.reply.phonetic,
                              lang: 'santhali'
                            })}
                            className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                            title="Listen"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-amber-300 font-olchiki">{q.reply.replyTribal || q.reply.replyHindi}</p>
                        {q.reply.conceptReferenced && (
                          <p className="text-[10px] text-emerald-400/80 italic">
                            ✓ {q.reply.conceptReferenced}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- MODAL 1: ATTENDANCE SHEET FOR STUDENTS --- */}
      {isAttendanceSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 border-emerald-500/40 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 font-olchiki">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="text-lg font-black text-white">
                    ᱠᱞᱟᱥ ᱦᱟᱡᱤᱨᱟ ᱠᱷᱟᱛᱟ (Class Attendance Register)
                  </h3>
                  <p className="text-xs text-slate-400">
                    {studentGrade} ({studentDivision}) • {selectedLecture?.santhaliSubject || "Classroom"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAttendanceSheetOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Attendance Status of Current Student */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 block">ᱟᱢᱟᱜ ᱦᱟᱡᱤᱨᱟ (Your Status):</span>
                <strong className="text-emerald-300 text-sm font-black">
                  {currentUser?.name || "ᱥᱮᱪᱮᱫᱤᱭᱟᱹ"} (Roll #{currentUser?.rollNo || "1"})
                </strong>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                ✓ ᱥᱮᱞᱮᱫ (Present)
              </span>
            </div>

            {/* Total Students Attending List */}
            <div>
              <span className="text-xs text-slate-400 font-bold block mb-2">
                ᱱᱚᱣᱟ ᱞᱮᱠᱪᱟᱨ ᱨᱮ ᱥᱮᱞᱮᱫ ᱟᱠᱟᱱ ᱜᱟᱛᱮ ᱠᱚ ({attendees.length} Students):
              </span>
              <div className="rounded-2xl border border-slate-800 divide-y divide-slate-800/60 max-h-56 overflow-y-auto">
                {attendees.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    ᱱᱤᱛ ᱫᱷᱟᱹᱵᱤᱡ ᱪᱮᱫ ᱦᱚᱸ ᱦᱟᱡᱤᱨᱟ ᱵᱟᱹᱱᱩᱜᱼᱟ᱾
                  </div>
                ) : (
                  attendees.map((att, i) => (
                    <div key={i} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-300 font-mono font-bold">#{att.rollNo}</span>
                        <span className="text-white font-bold">{att.name}</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-[11px]">
                        ✓ {att.joinTime || "Present"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsAttendanceSheetOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black hover:brightness-110"
              >
                ᱴᱷᱤᱠ ᱜᱮᱭᱟ (Done)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 2: ASK QUESTION POPUP MODAL --- */}
      {isAsking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 border-amber-500/30 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200 font-olchiki">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🙋‍♂️</span>
                <div>
                  <h3 className="text-lg font-black text-white">{t.ask_modal_title}</h3>
                  <p className="text-xs text-slate-400">ᱱᱚᱣᱟ ᱠᱞᱟᱥ ᱨᱮᱱᱟᱜ ᱯᱟᱴᱷ ᱵᱟᱵᱚᱛ ᱠᱩᱞᱤ ᱢᱮ</p>
                </div>
              </div>
              <button
                onClick={() => { speechService.stopListening(); setIsMicActive(false); setIsAsking(false); }}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {isMicActive && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 text-center space-y-2">
                <AudioWaveform isActive={true} color="#F59E0B" height={40} />
                <p className="text-xs font-bold text-amber-300 animate-pulse">
                  ᱟᱸᱡᱚᱢᱮᱫᱟ... ᱨᱚᱲ ᱢᱮ! {interimText}
                </p>
              </div>
            )}

            <div>
              <textarea
                rows={3}
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="ᱟᱢᱟᱜ ᱠᱩᱠᱞᱤ ᱥᱟᱱᱛᱟᱲᱤ ᱵᱟᱝᱠᱷᱟᱱ ᱦᱤᱱᱫᱤ ᱛᱮ ᱚᱞ ᱢᱮ (Type question in Santhali or Hindi)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner font-olchiki"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                "ᱤᱧ ᱱᱚᱣᱟ ᱵᱟᱹᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱞᱮᱫᱟ",
                "ᱫᱟᱭᱟᱠᱟᱛᱮ ᱟᱨ ᱢᱤᱫᱫᱷᱟᱣ ᱞᱟᱹᱭ ᱢᱮ",
                "ᱢᱤᱫᱴᱟᱝ ᱩᱫᱟᱹᱦᱚᱨᱚᱱ ᱮᱢ ᱢᱮ",
                "ᱫᱟᱨᱮ ᱠᱚ ᱪᱮᱫ ᱞᱮᱠᱟ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ?"
              ].map((txt, i) => (
                <button
                  key={i}
                  onClick={() => setQuestionInput(txt)}
                  className="text-[11px] px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
                >
                  ⚡ {txt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-3.5 rounded-2xl font-bold flex items-center justify-center transition-all shadow-md active:scale-95 ${isMicActive
                    ? 'bg-rose-600 text-white animate-voice-pulse'
                    : 'bg-amber-500 text-slate-950 hover:brightness-110'
                  }`}
                title="Speak"
              >
                {isMicActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => handleSendQuestion()}
                disabled={!questionInput.trim() || isAiResolving}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all shadow-lg shadow-emerald-500/30"
              >
                <Send className="w-4 h-4" />
                <span>{isAiResolving ? "ᱡᱟᱣᱟᱵᱽ ᱥᱟᱯᱲᱟᱣᱜ ᱠᱟᱱᱟ..." : t.submit_q_btn}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
