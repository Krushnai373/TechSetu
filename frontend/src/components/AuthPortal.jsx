import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { 
  GraduationCap, 
  LogIn, 
  UserPlus, 
  Hash, 
  KeyRound, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthPortal = () => {
  const { 
    loginUser, 
    signupUser, 
    teacherUiLang, 
    setTeacherUiLang,
    setSelectedLanguage
  } = useApp();

  const [authRole, setAuthRole] = useState('student'); // 'student' | 'teacher'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentGrade, setStudentGrade] = useState('Class 3');
  const [studentDivision, setStudentDivision] = useState('A');
  const [studentSchool, setStudentSchool] = useState('ᱩᱛᱠᱨᱚᱢᱤᱛ ᱯᱨᱟᱛᱷᱚᱢᱤᱠ ᱵᱤᱫᱽᱭᱟᱞᱚᱭ, ᱫᱩᱢᱠᱟ');
  const [studentPin, setStudentPin] = useState('');

  // Teacher Form State
  const [teacherName, setTeacherName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [teacherSchool, setTeacherSchool] = useState('Govt. Middle School, Ranchi');
  const [teacherSubject, setTeacherSubject] = useState('Science & Mathematics');
  const [teacherPassword, setTeacherPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const classOptions = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ];

  const divisionOptions = ['A', 'B', 'C', 'D'];

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'signup') {
      if (!studentName.trim() || !rollNo.trim()) {
        setErrorMsg('ᱫᱟᱭᱟᱠᱟᱛᱮ ᱧᱩᱛᱩᱢ ᱟᱨ ᱨᱳᱞ ᱱᱚᱢᱵᱚᱨ ᱚᱞ ᱢᱮ (Please enter name and roll no).');
        return;
      }
      
      const newStudent = {
        id: `stu_${rollNo}_${studentGrade.replace(/\s+/g, '')}_${studentDivision}`,
        role: 'student',
        name: studentName.trim(),
        rollNo: rollNo.trim(),
        grade: studentGrade,
        division: studentDivision,
        school: studentSchool.trim() || 'Govt. Primary School',
        language: 'santhali',
        pin: studentPin.trim() || '1234',
        stars: 30,
        streakDays: 1,
        badges: ["ᱱᱟᱣᱟ ᱥᱮᱪᱮᱫᱤᱭᱟᱹ (New Learner)", "ᱯᱟᱞᱟᱥ ᱜᱟᱛᱮ (Palash Friend)"]
      };

      const res = signupUser(newStudent);
      if (res.success) {
        speechService.playChime('reward');
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setSelectedLanguage('santhali');
      } else {
        setErrorMsg(res.message);
      }
    } else {
      // Login
      if (!rollNo.trim()) {
        setErrorMsg('ᱫᱟᱭᱟᱠᱟᱛᱮ ᱨᱳᱞ ᱱᱚᱢᱵᱚᱨ ᱚᱞ ᱢᱮ (Please enter roll number).');
        return;
      }

      const res = loginUser({
        role: 'student',
        rollNo: rollNo.trim(),
        grade: studentGrade,
        division: studentDivision,
        pin: studentPin.trim()
      });

      if (res.success) {
        speechService.playChime('reward');
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'signup') {
      if (!teacherName.trim() || !teacherId.trim()) {
        setErrorMsg(teacherUiLang === 'en' ? 'Please enter teacher name and ID/Email.' : 'कृपया शिक्षक का नाम और आईडी दर्ज करें।');
        return;
      }

      const newTeacher = {
        id: `tch_${teacherId.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        role: 'teacher',
        name: teacherName.trim(),
        teacherId: teacherId.trim(),
        school: teacherSchool.trim() || 'Govt. Middle School',
        subject: teacherSubject,
        preferredLang: teacherUiLang,
        password: teacherPassword.trim() || 'teacher123'
      };

      const res = signupUser(newTeacher);
      if (res.success) {
        speechService.playChime('reward');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } else {
        setErrorMsg(res.message);
      }
    } else {
      // Teacher Login
      if (!teacherId.trim()) {
        setErrorMsg(teacherUiLang === 'en' ? 'Please enter Teacher ID.' : 'कृपया शिक्षक आईडी दर्ज करें।');
        return;
      }

      const res = loginUser({
        role: 'teacher',
        teacherId: teacherId.trim(),
        password: teacherPassword.trim()
      });

      if (res.success) {
        speechService.playChime('reward');
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  // 1-Click Quick Student Login in Santhali
  const handleQuickStudentLogin = () => {
    speechService.playChime('click');
    loginUser({
      role: 'student',
      rollNo: '14',
      grade: 'Class 3',
      division: 'A',
      pin: '1234'
    });
  };

  // 1-Click Quick Teacher Login
  const handleDemoTeacher = () => {
    speechService.playChime('click');
    loginUser({
      role: 'teacher',
      teacherId: 'teacher@jharkhand.edu',
      password: 'demo'
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 shadow-xl shadow-orange-600/30 border border-amber-400/40 transform hover:scale-105 transition-transform mb-1">
            <span className="text-3xl">🌺</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
            TechSetu
          </h1>
          <p className="text-sm font-semibold text-slate-300 font-olchiki">
            {authRole === 'student' ? 'ᱥᱟᱱᱛᱟᱲᱤ ᱥᱮᱪᱮᱫ ᱯᱟᱞᱟᱥ (Santhali Learning Suite)' : (teacherUiLang === 'en' ? 'Mother Tongue-Based Multilingual Education Suite' : 'झारखंड बहुभाषी शिक्षण सेतु')}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800 shadow-inner">
          <button
            onClick={() => { speechService.playChime('click'); setAuthRole('student'); setErrorMsg(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${
              authRole === 'student'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-lg">🧒</span>
            <span className="font-olchiki">ᱥᱮᱪᱮᱫᱤᱭᱟᱹ (Student)</span>
          </button>

          <button
            onClick={() => { speechService.playChime('click'); setAuthRole('teacher'); setErrorMsg(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${
              authRole === 'teacher'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-5 h-5 text-amber-300" />
            <span>{teacherUiLang === 'en' ? 'Teacher Portal' : 'शिक्षक मंच'}</span>
          </button>
        </div>

        {/* Auth Form Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-800 shadow-2xl relative">
          
          {/* Header row with Mode Tabs & Teacher Language Switcher */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-6 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { speechService.playChime('click'); setAuthMode('login'); setErrorMsg(''); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-white/15 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{authRole === 'student' ? 'ᱵᱚᱞᱚᱱ (Login)' : (teacherUiLang === 'en' ? 'Login' : 'लॉगिन')}</span>
              </button>

              <button
                onClick={() => { speechService.playChime('click'); setAuthMode('signup'); setErrorMsg(''); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'signup'
                    ? 'bg-white/15 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{authRole === 'student' ? 'ᱱᱟᱣᱟ ᱠᱷᱟᱛᱟ (Signup)' : (teacherUiLang === 'en' ? 'Signup' : 'नया पंजीकरण')}</span>
              </button>
            </div>

            {authRole === 'teacher' && (
              <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setTeacherUiLang('en')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold ${teacherUiLang === 'en' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setTeacherUiLang('hindi')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold ${teacherUiLang === 'hindi' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}
                >
                  हिन्दी
                </button>
              </div>
            )}

            {authRole === 'student' && (
              <span className="text-[11px] font-bold text-emerald-400 font-olchiki">
                ᱚᱞ ᱪᱤᱠᱤ ᱥᱟᱱᱛᱟᱲᱤ
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= STUDENT FORM (Santhali / Ol Chiki) ================= */}
          {authRole === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4 font-olchiki">
              
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ᱥᱮᱪᱮᱫᱤᱭᱟᱹ ᱧᱩᱛᱩᱢ (Student Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. ᱵᱤᱨᱥᱟ ᱥᱚᱨᱮᱱ (Birsa Soren)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-olchiki"
                  />
                </div>
              )}

              {/* Roll No, Class & Division */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ᱨᱳᱞ ᱱᱚᱢᱵᱚᱨ (Roll No) *
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. 14"
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-olchiki"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ᱪᱟᱱᱟᱪ (Class) *
                  </label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {classOptions.map((cls) => (
                      <option key={cls} value={cls} className="bg-slate-900">{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ᱦᱟᱹᱴᱤᱧ (Section) *
                  </label>
                  <select
                    value={studentDivision}
                    onChange={(e) => setStudentDivision(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {divisionOptions.map((div) => (
                      <option key={div} value={div} className="bg-slate-900">Section {div}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PIN */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ᱔-ᱮᱞ ᱯᱤᱱ (4-Digit PIN)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value)}
                    placeholder="1234"
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-emerald-500/30 font-olchiki"
              >
                <span>{authMode === 'signup' ? '🚀 ᱠᱷᱟᱛᱟ ᱵᱮᱱᱟᱣ ᱢᱮ ᱟᱨ ᱮᱦᱚᱵ ᱢᱮ' : ' ᱵᱚᱞᱚᱱ ᱢᱮ (Login)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ================= TEACHER FORM (English / Hindi) ================= */}
          {authRole === 'teacher' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {teacherUiLang === 'en' ? 'Teacher Full Name *' : 'शिक्षक का पूरा नाम *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder={teacherUiLang === 'en' ? "e.g. Prof. Ramesh Soren" : "उदा. डॉ. रमेश सोरेन"}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {teacherUiLang === 'en' ? 'Teacher ID / Email *' : 'शिक्षक आईडी या ईमेल *'}
                </label>
                <input
                  type="text"
                  required
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="teacher@jharkhand.edu"
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {authMode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {teacherUiLang === 'en' ? 'Subjects Taught' : 'मुख्य विषय'}
                    </label>
                    <input
                      type="text"
                      value={teacherSubject}
                      onChange={(e) => setTeacherSubject(e.target.value)}
                      placeholder="Science, Math, EVS"
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {teacherUiLang === 'en' ? 'School Name' : 'विद्यालय'}
                    </label>
                    <input
                      type="text"
                      value={teacherSchool}
                      onChange={(e) => setTeacherSchool(e.target.value)}
                      placeholder="Govt. Middle School, Ranchi"
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {teacherUiLang === 'en' ? 'Password *' : 'पासवर्ड *'}
                </label>
                <input
                  type="password"
                  required
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-orange-500/30"
              >
                <span>{authMode === 'signup' ? (teacherUiLang === 'en' ? 'Create Teacher Account' : 'शिक्षक खाता बनाएं') : (teacherUiLang === 'en' ? 'Login as Teacher' : 'शिक्षक प्रवेश करें')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs font-bold text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Test Profiles:</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickStudentLogin}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left text-xs transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-emerald-300 font-olchiki">🧒 ᱵᱤᱨᱥᱟ ᱥᱚᱨᱮᱱ (Birsa Soren)</div>
                  <div className="text-[10px] text-slate-400">Roll 14 • Class 3-A • ᱥᱟᱱᱛᱟᱲᱤ</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={handleDemoTeacher}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/40 text-left text-xs transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-amber-300">👨‍🏫 Prof. Anand Munda</div>
                  <div className="text-[10px] text-slate-400">Science & Language Teacher</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
