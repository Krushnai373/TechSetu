import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { classroomService } from '../services/classroomService';
import { speechService } from '../services/speechService';
import { offlineEngine } from '../services/offlineTranslation';
import { apiService } from '../services/api';
import { LiveCaptionOverlay } from './LiveCaptionOverlay';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Users, 
  MessageSquare, 
  Share2, 
  Volume2, 
  VolumeX, 
  Download, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Radio, 
  Maximize2, 
  Minimize2,
  X,
  Send,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MeetingRoom = ({ lecture, onClose }) => {
  const { currentUser, teacherUiLang = 'english' } = useApp();

  const isTeacher = currentUser?.role === 'teacher';
  const meetingId = lecture?.id || 'room_default';
  const meetingTitle = lecture?.topic || 'TechSetu Live Lecture';
  const targetClass = lecture?.targetClass || lecture?.grade || 'Class 3';
  const targetSection = lecture?.section || lecture?.division || 'A';

  // Video and Audio Media States
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Active Drawers & Panels
  const [activeDrawer, setActiveDrawer] = useState('roster'); // 'roster' | 'attendance' | 'chat' | null

  // Live Participants in the room
  const [participants, setParticipants] = useState(() => {
    const list = classroomService.getLectureAttendance(meetingId) || [];
    return list;
  });

  // Attendance Duration Tracker
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const thresholdPercent = 80;
  const totalClassSeconds = 2700; // 45 minutes default

  // Live Captions & Bidirectional Translation
  const [activeCaption, setActiveCaption] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Local media stream reference
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Media Stream (WebRTC getUserMedia)
  useEffect(() => {
    let mounted = true;

    async function setupLocalMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: true
          });
          if (mounted) {
            localStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            // Mute initial audio to prevent feedback
            stream.getAudioTracks().forEach(track => { track.enabled = false; });
          }
        }
      } catch (err) {
        console.warn("Camera/Mic access not granted or unavailable, using simulation:", err);
      }
    }

    setupLocalMedia();

    // Start Attendance Session
    const userRecord = classroomService.startMeetingSession(meetingId, currentUser);
    setAttendanceRecord(userRecord);

    // Join room announcement
    if (isTeacher) {
      speechService.playChime('reward');
    }

    return () => {
      mounted = false;
      // Stop local camera tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      // Leave session & finalize attendance
      classroomService.leaveMeetingSession(meetingId, currentUser, sessionSeconds, totalClassSeconds, thresholdPercent);
    };
  }, [meetingId]);

  // Real-time Session Timer (Automated Attendance Duration Calculation & Expiry)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSessionSeconds(prev => {
        const next = prev + 1;
        // Periodic attendance status update every 5 seconds
        if (next % 5 === 0 && currentUser) {
          const updated = classroomService.updateMeetingDuration(
            meetingId, 
            currentUser, 
            next, 
            totalClassSeconds, 
            thresholdPercent
          );
          if (updated) {
            setAttendanceRecord(updated);
            // Re-fetch participants list to reflect updated duration
            setParticipants(classroomService.getLectureAttendance(meetingId));
          }

          // Auto-terminate check if slot expired
          if (lecture) {
            const statusCheck = classroomService.isSlotActiveNow(lecture);
            if (statusCheck.isExpired) {
              classroomService.endMeetingForAll(meetingId);
              alert("The scheduled time slot for this lecture has ended.");
              onClose();
            }
          }
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [meetingId, currentUser, lecture, onClose]);

  // Subscribe to real-time meeting events (Live Captions, Joins, Leaves, Endings)
  useEffect(() => {
    const unsubscribe = classroomService.subscribe((event) => {
      if (event.type === 'LIVE_CAPTION') {
        setActiveCaption(event.payload);
      } else if (event.type === 'MEETING_ENDED') {
        if (event.payload?.lectureId === meetingId) {
          alert(isTeacher ? "Meeting has been ended for all participants." : "The teacher has ended this live meeting.");
          onClose();
        }
      } else if (event.type === 'MEETING_USER_JOINED' || event.type === 'MEETING_USER_LEFT' || event.type === 'ATTENDANCE_MARKED') {
        setParticipants(classroomService.getLectureAttendance(meetingId));
      }
    });

    return () => unsubscribe();
  }, [meetingId, isTeacher, onClose]);

  // Media Controls: Toggle Camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      } else {
        setIsVideoOn(prev => !prev);
      }
    } else {
      setIsVideoOn(prev => !prev);
    }
    speechService.playChime('click');
  };

  // Media Controls: Toggle Microphone with Speech Recognition & Translation
  const toggleMic = () => {
    speechService.playChime('click');
    const nextState = !isMicOn;
    setIsMicOn(nextState);

    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = nextState;
    }

    if (nextState) {
      setIsSpeaking(true);
      const sttLang = isTeacher ? 'hi-IN' : 'hi-IN'; // Indic recognition

      speechService.startListening({
        lang: sttLang,
        continuous: true,
        onResult: async ({ text }) => {
          if (!text.trim()) return;

          let translatedText = "";
          let olchikiText = "";
          let phoneticText = "";

          if (isTeacher) {
            // Teacher speaks Hindi/English -> Translate to Santali Ol Chiki
            const tr = await apiService.translateText(text, 'hindi', 'santhali');
            translatedText = tr.olchiki || tr.devanagari;
            olchikiText = tr.olchiki;
            phoneticText = tr.phonetic;

            classroomService.broadcastLiveCaption({
              speakerRole: 'teacher',
              speakerName: currentUser?.name || 'Prof. Anand Munda',
              sourceText: text,
              hindi: text,
              english: tr.english || text,
              translatedText: translatedText,
              olchiki: olchikiText,
              phonetic: phoneticText,
              targetLang: 'santhali'
            });
          } else {
            // Student speaks -> Translate to Teacher's preferred language (Hindi/English)
            const tr = await apiService.translateText(text, 'santhali', 'hindi');
            translatedText = tr.devanagari || text;

            classroomService.broadcastLiveCaption({
              speakerRole: 'student',
              speakerName: currentUser?.name || `Student (Roll ${currentUser?.rollNo})`,
              sourceText: text,
              translatedText: translatedText,
              hindi: translatedText,
              english: tr.english || text,
              olchiki: text,
              phonetic: tr.phonetic,
              targetLang: 'hindi'
            });
          }
        },
        onError: () => {
          setIsSpeaking(false);
          setIsMicOn(false);
        },
        onEnd: () => {
          setIsSpeaking(false);
        }
      });
    } else {
      speechService.stopListening();
      setIsSpeaking(false);
    }
  };

  // Screen Share Toggle
  const toggleScreenShare = async () => {
    speechService.playChime('click');
    if (!isScreenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = displayStream;
          }
          displayStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            if (localStreamRef.current && localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
            }
          };
          setIsScreenSharing(true);
        }
      } catch (e) {
        console.warn("Screen share cancelled:", e);
      }
    } else {
      setIsScreenSharing(false);
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
  };

  // Export Attendance CSV
  const handleExportAttendance = () => {
    speechService.playChime('reward');
    classroomService.exportAttendanceCSV(meetingId);
  };

  // Format Elapsed Time (MM:SS)
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Calculate student attendance percent
  const percentAttended = Math.min(100, Math.round((sessionSeconds / totalClassSeconds) * 100));
  const isPresentThresholdMet = percentAttended >= thresholdPercent || sessionSeconds >= 600;

  const handleEndMeetingForAll = () => {
    if (window.confirm("Are you sure you want to end this live meeting for all students?")) {
      speechService.playChime('click');
      classroomService.endMeetingForAll(meetingId);
      onClose();
    }
  };

  // Send in-meeting chat
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: `chat_${Date.now()}`,
      sender: currentUser?.name || 'Participant',
      role: currentUser?.role || 'student',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    speechService.playChime('click');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080d18] flex flex-col overflow-hidden text-slate-100 font-sans select-none">
      
      {/* 1. TOP STATUS BAR */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-xl">
            {lecture?.icon || '🎥'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base text-white tracking-wide truncate max-w-xs sm:max-w-md">
                {meetingTitle}
              </h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-extrabold uppercase animate-pulse">
                <Radio className="w-2.5 h-2.5" /> LIVE
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-orange-400 font-semibold">{targetClass} - Section {targetSection}</span>
              <span>•</span>
              <span>Host: {lecture?.teacherName || 'Prof. Anand Munda'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Duration Timer */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Session: {formatTime(sessionSeconds)}</span>
          </div>

          {/* Student Automated Attendance Status Badge */}
          {!isTeacher && (
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
              isPresentThresholdMet
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isPresentThresholdMet ? 'Attendance: Present (>=80%)' : `Tracking: ${percentAttended}%`}</span>
            </div>
          )}

          {/* Quick Drawer Toggles */}
          <button
            onClick={() => setActiveDrawer(activeDrawer === 'roster' ? null : 'roster')}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeDrawer === 'roster'
                ? 'bg-orange-600 text-white border-orange-500'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Participant Roster"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">({participants.length + 1})</span>
          </button>

          {isTeacher && (
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'attendance' ? null : 'attendance')}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeDrawer === 'attendance'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Automated Attendance Tracker"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Attendance</span>
            </button>
          )}

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'chat' ? null : 'chat')}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeDrawer === 'chat'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Live Chat / Q&A"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* End Meeting / Leave Button */}
          {isTeacher ? (
            <button
              onClick={handleEndMeetingForAll}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all border border-rose-500/50"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Meeting for All</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN VIDEO CONFERENCE STAGE */}
      <div className="flex-1 relative flex overflow-hidden">
        
        {/* Video Stage Area */}
        <div className="flex-1 p-4 flex flex-col items-center justify-center relative overflow-y-auto">
          
          {/* Video Grid (Zoom-like Multi-Tile Layout) */}
          <div className="w-full h-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            
            {/* TILE 1: Local User Video Feed */}
            <div className={`relative rounded-3xl overflow-hidden bg-slate-900 border-2 transition-all flex items-center justify-center ${
              isSpeaking ? 'border-emerald-500 shadow-xl shadow-emerald-500/20' : 'border-slate-800'
            }`}>
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror-mode"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-4xl mb-3 shadow-inner">
                    {isTeacher ? '👩‍🏫' : '🎒'}
                  </div>
                  <div className="font-bold text-white text-base">
                    {currentUser?.name || (isTeacher ? 'Teacher' : 'Student')} (You)
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Camera is turned off</div>
                </div>
              )}

              {/* Local User Badge */}
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-xs font-bold text-white flex items-center gap-2">
                <span>{currentUser?.name || 'You'} ({isTeacher ? 'Teacher' : 'Student'})</span>
                {isMicOn ? <Mic className="w-3 h-3 text-emerald-400 animate-pulse" /> : <MicOff className="w-3 h-3 text-rose-400" />}
              </div>
            </div>

            {/* TILE 2: Remote Peer (Teacher Spotlight or Fellow Classmate) */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-orange-600/20 border-2 border-orange-500/50 flex items-center justify-center text-4xl mb-3 shadow-lg shadow-orange-500/10 animate-pulse">
                  {isTeacher ? '🎒' : '👩‍🏫'}
                </div>
                <div className="font-bold text-white text-base">
                  {isTeacher ? 'ᱥᱩᱱᱤᱞ ᱢᱩᱨᱢᱩ (Sunil Murmu)' : 'Prof. Anand Munda (Host)'}
                </div>
                <div className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{isTeacher ? 'Class 3-A • Roll 1' : 'Teacher • Speaking Hindi/English'}</span>
                </div>
              </div>

              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-xs font-bold text-white flex items-center gap-2">
                <span>{isTeacher ? 'Sunil Murmu (Roll 1)' : 'Prof. Anand Munda'}</span>
                <Mic className="w-3 h-3 text-emerald-400" />
              </div>
            </div>

            {/* TILE 3: Fellow Tribal Student Peer */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 hidden md:flex items-center justify-center">
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-600/20 border-2 border-emerald-500/50 flex items-center justify-center text-4xl mb-3">
                  🎒
                </div>
                <div className="font-bold text-white text-base">
                  ᱨᱟᱹᱱᱤ ᱦᱟᱸᱥᱫᱟᱜ (Rani Hansda)
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Class 3-A • Roll 2
                </div>
              </div>

              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-xs font-bold text-white flex items-center gap-2">
                <span>Rani Hansda (Roll 2)</span>
                <MicOff className="w-3 h-3 text-slate-500" />
              </div>
            </div>

          </div>

          {/* Real-time Bidirectional Live Subtitles & TTS Overlay */}
          <LiveCaptionOverlay
            caption={activeCaption}
            userRole={currentUser?.role || 'student'}
            preferredLang={teacherUiLang}
            autoPlayAudio={autoPlayAudio}
            onToggleAudio={() => setAutoPlayAudio(prev => !prev)}
          />

        </div>

        {/* 3. SIDEBAR DRAWERS */}
        
        {/* DRAWER A: Participant Roster */}
        {activeDrawer === 'roster' && (
          <aside className="w-80 border-l border-slate-800 bg-slate-900/95 backdrop-blur-md p-4 flex flex-col z-30 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                <span>Participants ({participants.length + 1})</span>
              </h2>
              <button onClick={() => setActiveDrawer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {/* Host / Teacher Item */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-sm">
                    👩‍🏫
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {lecture?.teacherName || 'Prof. Anand Munda'}
                    </div>
                    <div className="text-[10px] text-orange-400 font-bold">Host / Teacher</div>
                  </div>
                </div>
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              {/* Enrolled Students in this Class */}
              {participants.map((p, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-sm">
                      🎒
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Roll: {p.rollNo} • {p.grade}-{p.division}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    p.status === 'Present'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {p.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* DRAWER B: Automated Attendance Tracker (Teacher View) */}
        {activeDrawer === 'attendance' && isTeacher && (
          <aside className="w-96 border-l border-slate-800 bg-slate-900/95 backdrop-blur-md p-4 flex flex-col z-30 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Automated Attendance</span>
                </h2>
                <div className="text-[10px] text-slate-400">
                  Threshold: &gt;= {thresholdPercent}% active meeting duration
                </div>
              </div>
              <button onClick={() => setActiveDrawer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attendance Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 mb-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Class & Section:</span>
                <span className="font-bold text-white">{targetClass} - Section {targetSection}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Enrolled Attendees:</span>
                <span className="font-bold text-emerald-400">{participants.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Present (Threshold Met):</span>
                <span className="font-bold text-white">
                  {participants.filter(p => p.status === 'Present').length} / {participants.length}
                </span>
              </div>
            </div>

            {/* Attendance Roster with Timestamps */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {participants.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No students have joined yet. Attendance logs when students enter the room.
                </div>
              ) : (
                participants.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        item.status === 'Present' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-1 mt-1">
                      <div>Joined: <strong className="text-slate-300">{item.joinTime}</strong></div>
                      <div>Duration: <strong className="text-slate-300">{item.durationMinutes || Math.round((item.durationSeconds || sessionSeconds) / 60)}m</strong></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Export Attendance CSV Button */}
            <button
              onClick={handleExportAttendance}
              className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Attendance (CSV)</span>
            </button>
          </aside>
        )}

        {/* DRAWER C: Live Chat / Q&A */}
        {activeDrawer === 'chat' && (
          <aside className="w-80 border-l border-slate-800 bg-slate-900/95 backdrop-blur-md p-4 flex flex-col z-30 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Classroom Chat & Q&A</span>
              </h2>
              <button onClick={() => setActiveDrawer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {chatMessages.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  Ask a question or send a message to the teacher in Hindi or Santali.
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{msg.sender}</span>
                      <span className="text-[10px] text-slate-500">{msg.time}</span>
                    </div>
                    <p className="text-slate-300 font-olchiki">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Type question in Hindi/Santali..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </aside>
        )}

      </div>

      {/* 4. BOTTOM MEETING CONTROLS TOOLBAR */}
      <footer className="h-20 bg-slate-900/90 border-t border-slate-800 px-4 flex items-center justify-center gap-3 sm:gap-4 z-20 backdrop-blur-md">
        
        {/* Toggle Microphone */}
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl flex items-center justify-center transition-all ${
            isMicOn
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
              : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/40'
          }`}
          title={isMicOn ? "Mute Microphone" : "Unmute Microphone (Speak & Translate)"}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Toggle Camera */}
        <button
          onClick={toggleCamera}
          className={`p-3.5 rounded-2xl flex items-center justify-center transition-all ${
            isVideoOn
              ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
              : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/40'
          }`}
          title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`p-3.5 rounded-2xl flex items-center justify-center transition-all ${
            isScreenSharing
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
          title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
        >
          <Share2 className="w-5 h-5" />
        </button>

        {/* Audio TTS Mute / Subtitles Only Toggle */}
        <button
          onClick={() => {
            speechService.playChime('click');
            setAutoPlayAudio(prev => !prev);
          }}
          className={`px-3 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold border transition-all ${
            autoPlayAudio
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title={autoPlayAudio ? "Translated Audio TTS On" : "Translated Audio TTS Muted (Subtitles Only)"}
        >
          {autoPlayAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden md:inline">{autoPlayAudio ? 'Audio + Subtitles' : 'Subtitles Only'}</span>
        </button>

        {/* End Call / Leave Meeting */}
        <button
          onClick={onClose}
          className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all ml-2"
          title="Leave Class"
        >
          <PhoneOff className="w-5 h-5" />
        </button>

      </footer>

    </div>
  );
};
