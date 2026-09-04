import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AuthPortal } from './components/AuthPortal';
import { speechService } from './services/speechService';

// Teacher Pages
import { LiveTranslator } from './pages/Teacher/LiveTranslator';
import { SubjectNotesManager } from './pages/Teacher/SubjectNotesManager';
import { LessonPlanner } from './pages/Teacher/LessonPlanner';
import { WorksheetStudio } from './pages/Teacher/WorksheetStudio';
import { FlashcardDeck } from './pages/Teacher/FlashcardDeck';
import { Analytics } from './pages/Teacher/Analytics';

// Student Pages
import { LiveClassroom } from './pages/Student/LiveClassroom';
import { SubjectNotes } from './pages/Student/SubjectNotes';
import { StudentHome } from './pages/Student/StudentHome';
import { VoiceBuddy } from './pages/Student/VoiceBuddy';
import { InteractiveGames } from './pages/Student/InteractiveGames';
import { QuizZone } from './pages/Student/QuizZone';

// System Diagnostics
import { Diagnostics } from './pages/System/Diagnostics';

import { 
  Mic, 
  Radio,
  BookOpen, 
  FileSpreadsheet, 
  Layers, 
  BarChart3, 
  MapPin, 
  MessageCircle, 
  Gamepad2, 
  Award,
  Library
} from 'lucide-react';

import { RoleAuthModal } from './components/RoleAuthModal';
import { MeetingRoom } from './components/MeetingRoom';

export default function App() {
  const { 
    currentUser,
    activeRole, 
    teacherTab, 
    setTeacherTab, 
    studentTab, 
    setStudentTab,
    teacherT = {},
    studentT = { tabs: {} },
    teacherUiLang = 'english',
    activeMeeting,
    setActiveMeeting
  } = useApp();

  // URL-based routing state synced with browser history
  const [currentPath, setCurrentPath] = React.useState(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  React.useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Direct Login Page on Entry: Landing on root '/' always shows the Login & Role Selection modal
  if (!currentUser || currentPath === '/') {
    return (
      <RoleAuthModal 
        onAuthenticated={(target) => {
          setCurrentPath(target);
        }} 
      />
    );
  }

  // Enforce strict role isolation: If logged in as student, role is locked to 'student'
  const isStudent = currentUser?.role === 'student';
  const effectiveRole = isStudent ? 'student' : activeRole;

  // If user is inside an active meeting or visiting /meeting/:id
  const isMeetingRoute = currentPath.startsWith('/meeting/') || !!activeMeeting;
  if (isMeetingRoute) {
    const meetingLecture = activeMeeting || {
      id: currentPath.replace('/meeting/', ''),
      topic: 'TechSetu Live Classroom Meeting',
      grade: currentUser?.grade || 'Class 3',
      division: currentUser?.division || 'A'
    };
    return (
      <MeetingRoom
        lecture={meetingLecture}
        onClose={() => {
          setActiveMeeting(null);
          const returnPath = isStudent ? '/student/dashboard' : '/teacher/dashboard';
          if (window.history && window.history.pushState) {
            window.history.pushState({}, '', returnPath);
          }
          setCurrentPath(returnPath);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1d] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Sub-Navigation for Teacher Mode (English or Hindi based on teacher preference) - HIDDEN for students */}
      {!isStudent && effectiveRole === 'teacher' && (
        <div className="bg-slate-900/90 border-b border-slate-800/80 sticky top-20 z-40 px-4 py-2.5 no-print">
          <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto">
            
            <button
              onClick={() => { speechService.playChime('click'); setTeacherTab('translator'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                teacherTab === 'translator'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Mic className="w-4 h-4 text-amber-300" />
              <span>🎙️ {teacherT.tab_translator || "Live Classroom"}</span>
            </button>

            <button
              onClick={() => { speechService.playChime('click'); setTeacherTab('subjects'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                teacherTab === 'subjects'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Library className="w-4 h-4 text-blue-300" />
              <span>📚 {teacherT.tab_subjects || "Subject Notes"}</span>
            </button>

            <button
              onClick={() => { speechService.playChime('click'); setTeacherTab('lesson'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                teacherTab === 'lesson'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>📖 {teacherT.tab_lesson || "Lesson Plan"}</span>
            </button>

            <button
              onClick={() => { speechService.playChime('click'); setTeacherTab('worksheets'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                teacherTab === 'worksheets'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-300" />
              <span>📝 {teacherT.tab_worksheets || "Worksheets"}</span>
            </button>

            <button
              onClick={() => { speechService.playChime('click'); setTeacherTab('flashcards'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                teacherTab === 'flashcards'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-300" />
              <span>🎴 {teacherT.tab_flashcards || "Flashcards"}</span>
            </button>

            <button
              onClick={() => { speechService.playChime('click'); setTeacherTab('analytics'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                teacherTab === 'analytics'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-teal-300" />
              <span>📊 {teacherT.tab_analytics || "Analytics"}</span>
            </button>

          </div>
        </div>
      )}

      {/* Sub-Navigation for Student Mode (100% Santhali / Ol Chiki) */}
      {activeRole === 'student' && (
        <div className="bg-slate-900/90 border-b border-slate-800/80 sticky top-20 z-40 px-4 py-2.5 no-print">
          <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto">
            
            <button
              onClick={() => { speechService.playChime('click'); setStudentTab('classroom'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                studentTab === 'classroom'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-300" />
              <span className="font-olchiki">{studentT?.tabs?.classroom || "🎧 ᱥᱟᱡᱤᱵᱽ ᱠᱞᱟᱥ"}</span>
            </button>

            <button
              onClick={() => { speechService.playChime('click'); setStudentTab('subjects'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                studentTab === 'subjects'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Library className="w-4 h-4 text-blue-300" />
              <span className="font-olchiki">{studentT?.tabs?.subjects || "📚 ᱥᱟᱛᱟᱢ ᱱᱳᱴ"}</span>
            </button>

            <button
              onClick={() => { speechService.playChime('click'); setStudentTab('adventure'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                studentTab === 'adventure'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4 text-orange-400" />
              <span className="font-olchiki">{studentT?.tabs?.adventure || "🗺️ ᱜᱮᱭᱟᱱ ᱫᱟᱬᱟᱺ"}</span>
            </button>

            <button
              onClick={() => { speechService.playChime('click'); setStudentTab('voice_buddy'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                studentTab === 'voice_buddy'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <span className="font-olchiki">{studentT?.tabs?.voice_buddy || "🐯 ᱨᱚᱯᱚᱲ ᱜᱟᱛᱮ"}</span>
            </button>

            <button
              onClick={() => { speechService.playChime('click'); setStudentTab('games'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                studentTab === 'games'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-pink-300" />
              <span className="font-olchiki">{studentT?.tabs?.games || "🎮 ᱠᱷᱮᱞ ᱴᱷᱟᱶ"}</span>
            </button>

            <button
              onClick={() => { speechService.playChime('click'); setStudentTab('quiz'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                studentTab === 'quiz'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4 text-purple-300" />
              <span className="font-olchiki">{studentT?.tabs?.quiz || "⭐ ᱤᱯᱤᱞ ᱠᱩᱠᱞᱤ"}</span>
            </button>

          </div>
        </div>
      )}

      {/* Main Dynamic Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isStudent && effectiveRole === 'teacher' && (
          <>
            {teacherTab === 'translator' && <LiveTranslator />}
            {teacherTab === 'subjects' && <SubjectNotesManager />}
            {teacherTab === 'lesson' && <LessonPlanner />}
            {teacherTab === 'worksheets' && <WorksheetStudio />}
            {teacherTab === 'flashcards' && <FlashcardDeck />}
            {teacherTab === 'analytics' && <Analytics />}
          </>
        )}

        {effectiveRole === 'student' && (
          <>
            {studentTab === 'classroom' && <LiveClassroom />}
            {studentTab === 'subjects' && <SubjectNotes />}
            {studentTab === 'adventure' && <StudentHome />}
            {studentTab === 'voice_buddy' && <VoiceBuddy />}
            {studentTab === 'games' && <InteractiveGames />}
            {studentTab === 'quiz' && <QuizZone />}
          </>
        )}

        {!isStudent && effectiveRole === 'system' && <Diagnostics />}
      </main>

      {/* Clean Educational Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🌺</span>
            <span className="font-bold text-slate-200">TechSetu</span>
            <span>• {activeRole === 'student' ? 'ᱥᱟᱱᱛᱟᱲᱤ ᱥᱮᱪᱮᱫ ᱯᱟᱞᱟᱥ' : (teacherUiLang === 'en' || teacherUiLang === 'english' ? 'Mother Tongue-Based Multilingual Education Platform' : 'झारखंड बहुभाषी शिक्षण सेतु')}</span>
          </div>
          <div className="text-slate-400">
            Santhali (Ol Chiki ᱚᱞ ᱪᱤᱠᱤ) • Ho • Mundari • Hindi • English
          </div>
        </div>
      </footer>

    </div>
  );
}
