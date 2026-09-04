import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { speechService } from '../services/speechService';
import { 
  GraduationCap, 
  BookOpen, 
  LogIn, 
  UserPlus, 
  ArrowLeft, 
  KeyRound, 
  Sparkles,
  School,
  Hash,
  Languages,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RoleAuthModal = ({ onAuthenticated, currentPath = '/' }) => {
  const { 
    currentUser,
    loginUser, 
    signupUser, 
    setTeacherUiLang, 
    setSelectedLanguage 
  } = useApp();

  // Selected role: null (role picker) | 'student' | 'teacher'
  const [selectedRole, setSelectedRole] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentGrade, setStudentGrade] = useState('Class 3');
  const [studentDivision, setStudentDivision] = useState('A');
  const [studentSchool, setStudentSchool] = useState('ᱩᱛᱠᱨᱚᱢᱤᱛ ᱯᱨᱟᱛᱷᱚᱢᱤᱠ ᱵᱤᱫᱽᱭᱟᱞᱚᱭ, ᱫᱩᱢᱠᱟ');
  const [studentPin, setStudentPin] = useState('1234');

  // Teacher Form State
  const [teacherName, setTeacherName] = useState('Prof. Anand Munda');
  const [teacherId, setTeacherId] = useState('teacher@jharkhand.edu');
  const [teacherSchool, setTeacherSchool] = useState('Govt. Middle School, Ranchi');
  const [teacherSubject, setTeacherSubject] = useState('Science & Mathematics');
  const [teacherLang, setTeacherLang] = useState('english');
  const [teacherPassword, setTeacherPassword] = useState('demo');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const classOptions = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ];
  const divisionOptions = ['A', 'B', 'C', 'D'];

  const redirectAfterAuth = (role) => {
    speechService.playChime('reward');
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    const targetUrl = role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    if (onAuthenticated) onAuthenticated(targetUrl);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        if (!studentName.trim() || !rollNo.trim()) {
          setErrorMsg('ᱫᱟᱭᱟᱠᱟᱛᱮ ᱧᱩᱛᱩᱢ ᱟᱨ ᱨᱳᱞ ᱱᱚᱢᱵᱚᱨ ᱚᱞ ᱢᱮ (Please enter name and roll no).');
          setIsLoading(false);
          return;
        }

        const newStudent = {
          id: `stu_${rollNo}_${studentGrade.replace(/\s+/g, '')}_${studentDivision}`,
          role: 'student',
          name: studentName.trim(),
          roll_no: rollNo.trim(),
          rollNo: rollNo.trim(),
          grade: studentGrade,
          division: studentDivision,
          school: studentSchool.trim() || 'Govt. Primary School',
          language: 'santhali',
          pin: studentPin.trim() || '1234',
          stars: 30,
          streak_days: 1
        };

        // Attempt backend sync
        await apiService.signupUser(newStudent);

        // Update local context
        const res = signupUser(newStudent);
        if (res.success) {
          setSelectedLanguage('santhali');
          redirectAfterAuth('student');
        } else {
          setErrorMsg(res.message);
        }
      } else {
        // Login
        if (!rollNo.trim()) {
          setErrorMsg('ᱫᱟᱭᱟᱠᱟᱛᱮ ᱨᱳᱞ ᱱᱚᱢᱵᱚᱨ ᱚᱞ ᱢᱮ (Please enter roll number).');
          setIsLoading(false);
          return;
        }

        // Try backend login first
        const apiRes = await apiService.loginUser({
          role: 'student',
          roll_no: rollNo.trim(),
          grade: studentGrade,
          division: studentDivision,
          pin: studentPin.trim()
        });

        const res = loginUser({
          role: 'student',
          rollNo: rollNo.trim(),
          grade: studentGrade,
          division: studentDivision,
          pin: studentPin.trim()
        });

        if (res.success) {
          setSelectedLanguage('santhali');
          redirectAfterAuth('student');
        } else {
          setErrorMsg(res.message || 'Login failed.');
        }
      }
    } catch (err) {
      setErrorMsg('Login error occurred. Trying offline mode...');
      const fallback = loginUser({
        role: 'student',
        rollNo: rollNo.trim(),
        grade: studentGrade,
        division: studentDivision,
        pin: studentPin.trim()
      });
      if (fallback.success) redirectAfterAuth('student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        if (!teacherName.trim() || !teacherId.trim()) {
          setErrorMsg('Please enter Teacher Name and Teacher ID.');
          setIsLoading(false);
          return;
        }

        const newTeacher = {
          id: `tch_${Date.now()}`,
          role: 'teacher',
          name: teacherName.trim(),
          teacher_id: teacherId.trim().toLowerCase(),
          teacherId: teacherId.trim().toLowerCase(),
          school: teacherSchool.trim(),
          subject: teacherSubject.trim(),
          preferred_lang: teacherLang,
          preferredLang: teacherLang,
          password: teacherPassword || 'demo'
        };

        await apiService.signupUser(newTeacher);

        const res = signupUser(newTeacher);
        if (res.success) {
          setTeacherUiLang(teacherLang);
          redirectAfterAuth('teacher');
        } else {
          setErrorMsg(res.message);
        }
      } else {
        // Teacher Login
        if (!teacherId.trim()) {
          setErrorMsg('Please enter your Teacher ID.');
          setIsLoading(false);
          return;
        }

        await apiService.loginUser({
          role: 'teacher',
          teacher_id: teacherId.trim().toLowerCase(),
          password: teacherPassword
        });

        const res = loginUser({
          role: 'teacher',
          teacherId: teacherId.trim().toLowerCase(),
          password: teacherPassword
        });

        if (res.success) {
          setTeacherUiLang(teacherLang);
          redirectAfterAuth('teacher');
        } else {
          setErrorMsg(res.message || 'Teacher login failed.');
        }
      }
    } catch (err) {
      const fallback = loginUser({
        role: 'teacher',
        teacherId: teacherId.trim().toLowerCase(),
        password: teacherPassword
      });
      if (fallback.success) redirectAfterAuth('teacher');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0a0f1d] relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-inner mb-4">
            <span className="text-2xl animate-pulse">🌺</span>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              TechSetu • MTB-MLE Vernacular Learning
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ • Welcome
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Interactive Classroom, Video Conferencing & Real-Time Santhali (Ol Chiki ᱚᱞ ᱪᱤᱠᱤ) Speech Translation
          </p>
        </div>

        {/* STEP 1: Role Selector Screen */}
        {!selectedRole ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {currentUser && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                    {currentUser.role === 'teacher' ? '👩‍🏫' : '🎒'}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Currently Logged In:</div>
                    <div className="text-sm font-bold text-white">
                      {currentUser.name} <span className="text-emerald-400 font-semibold text-xs">({currentUser.role === 'teacher' ? 'Teacher' : `Student • ${currentUser.grade || ''}-${currentUser.division || ''}`})</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => redirectAfterAuth(currentUser.role)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-1.5"
                >
                  <span>Continue to Dashboard →</span>
                </button>
              </div>
            )}

            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-200">
                Choose your role to get started:
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select whether you are joining as a Student or a Teacher
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Student Role Card */}
              <button
                id="role-student-btn"
                onClick={() => {
                  speechService.playChime('click');
                  setSelectedRole('student');
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className="group relative p-6 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-emerald-950/40 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 text-left transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  🎒
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  Learner Portal
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  I am a Student
                </h3>
                <div className="font-olchiki text-sm text-emerald-400 mt-1 font-bold">
                  ᱤᱧ ᱫᱚ ᱥᱮᱪᱮᱫᱤᱭᱟᱹ ᱠᱟᱹᱱᱟᱹᱧ
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Join live interactive classes, audio speech buddy, bilingual notes, and learning games.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  Continue as Student →
                </div>
              </button>

              {/* Teacher Role Card */}
              <button
                id="role-teacher-btn"
                onClick={() => {
                  speechService.playChime('click');
                  setSelectedRole('teacher');
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className="group relative p-6 rounded-2xl border-2 border-orange-500/40 bg-gradient-to-b from-slate-900 to-orange-950/40 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/20 text-left transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  👩‍🏫
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  Instructor Suite
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors">
                  I am a Teacher
                </h3>
                <div className="text-xs text-orange-400 font-bold mt-1">
                  शिक्षक / शिक्षक डैशबोर्ड
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Schedule lectures, conduct video meetings, track automated attendance, and translate live speech.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                  Continue as Teacher →
                </div>
              </button>

            </div>

            {/* Quick Demo Credentials Reminder */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Demo Student: <strong>Class 3-A, Roll 14</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                Demo Teacher: <strong>teacher@jharkhand.edu</strong>
              </span>
            </div>
          </div>
        ) : (
          
          /* STEP 2: Clean Auth Card with Login / Signup Toggle */
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            
            {/* Top Bar: Back Button & Role Badge */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <button
                onClick={() => {
                  speechService.playChime('click');
                  setSelectedRole(null);
                  setErrorMsg('');
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Change Role
              </button>

              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {selectedRole === 'student' ? '🎒' : '👩‍🏫'}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  selectedRole === 'student' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                }`}>
                  {selectedRole === 'student' ? 'Student Portal' : 'Teacher Portal'}
                </span>
              </div>
            </div>

            {/* Login / Sign Up Tabs */}
            <div className="flex rounded-2xl bg-slate-950 p-1.5 border border-slate-800 mb-6">
              <button
                id="auth-tab-login"
                type="button"
                onClick={() => {
                  speechService.playChime('click');
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  authMode === 'login'
                    ? selectedRole === 'student'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login (ᱵᱚᱞᱚᱱ)</span>
              </button>

              <button
                id="auth-tab-signup"
                type="button"
                onClick={() => {
                  speechService.playChime('click');
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  authMode === 'signup'
                    ? selectedRole === 'student'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up (ᱱᱟᱣᱟ ଖᱟᱛᱟ)</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ================= STUDENT FORM ================= */}
            {selectedRole === 'student' && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Student Full Name (ᱧᱩᱛᱩᱢ)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ᱵᱤᱨᱥᱟ ᱥᱚᱨᱮᱱ (Birsa Soren)"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Class / Grade (ᱪᱟᱱᱟᱪ)
                    </label>
                    <select
                      value={studentGrade}
                      onChange={(e) => setStudentGrade(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                    >
                      {classOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Section / Division (ᱦᱟᱹᱴᱤᱧ)
                    </label>
                    <select
                      value={studentDivision}
                      onChange={(e) => setStudentDivision(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                    >
                      {divisionOptions.map((d) => (
                        <option key={d} value={d}>Section {d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Roll Number (ᱨᱳᱞ ᱮᱞ)
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. 14"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Security PIN (ᱯᱤᱱ)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        placeholder="1234"
                        value={studentPin}
                        onChange={(e) => setStudentPin(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      School Name (ᱵᱤᱨᱫᱟᱹᱜᱟᱲ)
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Govt. Primary School, Dumka"
                        value={studentSchool}
                        onChange={(e) => setStudentSchool(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all transform active:scale-98 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="animate-spin">⏳</span>
                  ) : authMode === 'signup' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Register & Go to Student Dashboard →</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Login & Enter Classroom (ᱵᱚᱞᱚᱱ) →</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ================= TEACHER FORM ================= */}
            {selectedRole === 'teacher' && (
              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Prof. Anand Munda"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Teacher ID / Email
                  </label>
                  <input
                    type="text"
                    placeholder="teacher@jharkhand.edu"
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Preferred Interface
                    </label>
                    <select
                      value={teacherLang}
                      onChange={(e) => setTeacherLang(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
                    >
                      <option value="english">English (Teacher)</option>
                      <option value="hindi">हिन्दी (Teacher)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="demo"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        School / Institution
                      </label>
                      <input
                        type="text"
                        placeholder="Govt. Middle School, Ranchi"
                        value={teacherSchool}
                        onChange={(e) => setTeacherSchool(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Teaching Subject
                      </label>
                      <input
                        type="text"
                        placeholder="Science & Math"
                        value={teacherSubject}
                        onChange={(e) => setTeacherSubject(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-orange-600/30 transition-all transform active:scale-98 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="animate-spin">⏳</span>
                  ) : authMode === 'signup' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Register & Go to Teacher Dashboard →</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Login to Teacher Dashboard →</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
