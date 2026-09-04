import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { storageService } from '../services/storageService';
import { INITIAL_LECTURE_NOTES } from '../utils/subjectsData';
import { TEACHER_UI_TEXT, getTeacherTranslations, STUDENT_SANTHALI_UI_TEXT } from '../utils/translationsUI';

const AppContext = createContext();

const DEFAULT_STUDENTS = [
  {
    id: "stu_14_Class3_A",
    role: "student",
    name: "ᱵᱤᱨᱥᱟ ᱥᱚᱨᱮᱱ (Birsa Soren)",
    rollNo: "14",
    grade: "Class 3",
    division: "A",
    school: "ᱩᱛᱠᱨᱚᱢᱤᱛ ᱯᱨᱟᱛᱷᱚᱢᱤᱠ ᱵᱤᱫᱽᱭᱟᱞᱚᱭ, ᱫᱩᱢᱠᱟ",
    language: "santhali",
    pin: "1234",
    stars: 45,
    streakDays: 4,
    level: 2,
    badges: ["ᱵᱤᱨᱥᱟ ᱜᱟᱛᱮ (Birsa Buddy)", "ᱯᱟᱞᱟᱥ ᱢᱟᱥᱴᱟᱨ (Palash Master)", "ᱥᱟᱨᱡᱚᱢ ᱥᱠᱚᱞᱟᱨ (Sal Scholar)"]
  }
];

const DEFAULT_TEACHERS = [
  {
    id: "tch_anand",
    role: "teacher",
    name: "Prof. Anand Munda",
    teacherId: "teacher@jharkhand.edu",
    school: "Govt. Middle School, Ranchi",
    subject: "Science & Mathematics",
    preferredLang: "english", // 'english' | 'hindi'
    password: "demo"
  }
];

export const AppProvider = ({ children }) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("techsetu_active_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [registeredStudents, setRegisteredStudents] = useState(() => {
    try {
      const saved = localStorage.getItem("techsetu_registered_students");
      return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
    } catch (e) {
      return DEFAULT_STUDENTS;
    }
  });

  const [registeredTeachers, setRegisteredTeachers] = useState(() => {
    try {
      const saved = localStorage.getItem("techsetu_registered_teachers");
      return saved ? JSON.parse(saved) : DEFAULT_TEACHERS;
    } catch (e) {
      return DEFAULT_TEACHERS;
    }
  });

  // Teacher UI Language: 'english' | 'hindi'
  const [teacherUiLang, setTeacherUiLang] = useState(() => {
    return currentUser?.preferredLang || 'english';
  });

  // Student language is Santhali by requirement
  const [selectedLanguage, setSelectedLanguage] = useState('santhali');

  const [activeRole, setActiveRole] = useState(() => {
    return currentUser?.role || 'teacher';
  });

  // Navigation tabs
  const [teacherTab, setTeacherTab] = useState('translator'); // 'translator' | 'subjects' | 'lesson' | 'worksheets' | 'flashcards' | 'analytics'
  const [studentTab, setStudentTab] = useState('classroom'); // 'classroom' | 'subjects' | 'adventure' | 'voice_buddy' | 'games' | 'quiz'
  
  // Active Video Meeting state
  const [activeMeeting, setActiveMeeting] = useState(null);

  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [forceOfflineMode, setForceOfflineMode] = useState(false);
  
  // Custom Lecture Notes state
  const [lectureNotes, setLectureNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("techsetu_lecture_notes");
      return saved ? JSON.parse(saved) : INITIAL_LECTURE_NOTES;
    } catch (e) {
      return INITIAL_LECTURE_NOTES;
    }
  });

  // Performance metrics for internal tracking
  const [performanceMetrics, setPerformanceMetrics] = useState({
    sttLatencyMs: 210,
    transLatencyMs: 18.5,
    ttsLatencyMs: 160,
    totalTurnaroundMs: 388.5
  });

  // Student Gamification Stats
  const [studentStats, setStudentStats] = useState({
    stars: currentUser?.stars || 45,
    streakDays: currentUser?.streakDays || 4,
    level: currentUser?.level || 2,
    badges: currentUser?.badges || ["ᱵᱤᱨᱥᱟ ᱜᱟᱛᱮ", "ᱯᱟᱞᱟᱥ ᱢᱟᱥᱴᱟᱨ"]
  });

  const [syncQueueCount, setSyncQueueCount] = useState(0);

  // Sync user state changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("techsetu_active_user", JSON.stringify(currentUser));
      const role = currentUser.role || (currentUser.rollNo ? 'student' : 'teacher');
      setActiveRole(role);
      
      if (role === 'student') {
        setSelectedLanguage('santhali');
        setStudentStats({
          stars: currentUser.stars || 45,
          streakDays: currentUser.streakDays || 4,
          level: currentUser.level || 2,
          badges: currentUser.badges || ["ᱵᱤᱨᱥᱟ ᱜᱟᱛᱮ", "ᱯᱟᱞᱟᱥ ᱢᱟᱥᱴᱟᱨ"]
        });
      } else if (role === 'teacher') {
        if (currentUser.preferredLang) {
          setTeacherUiLang(currentUser.preferredLang);
        }
      }
    } else {
      localStorage.removeItem("techsetu_active_user");
    }
  }, [currentUser]);

  // Auth functions
  const loginUser = ({ role, rollNo, grade, division, pin, teacherId, password }) => {
    if (role === 'student') {
      const student = registeredStudents.find(
        s => s.rollNo === rollNo && (!grade || s.grade === grade) && (!division || s.division === division)
      );

      if (student) {
        if (pin && student.pin && student.pin !== pin) {
          return { success: false, message: "PIN is incorrect." };
        }
        const authenticatedStudent = { ...student, role: 'student' };
        setCurrentUser(authenticatedStudent);
        setActiveRole('student');
        setSelectedLanguage('santhali');
        return { success: true, user: authenticatedStudent };
      }

      // If not in registered list, create instant session
      const newQuickStudent = {
        id: `stu_${rollNo}_${grade || 'Class3'}_${division || 'A'}`,
        role: 'student',
        name: `ᱥᱮᱪᱮᱫᱤᱭᱟᱹ (Roll ${rollNo})`,
        rollNo,
        grade: grade || 'Class 3',
        division: division || 'A',
        school: 'Govt. Primary School',
        language: 'santhali',
        stars: 30,
        streakDays: 1,
        level: 1,
        badges: ["ᱱᱟᱣᱟ ᱥᱮᱪᱮᱫᱤᱭᱟᱹ"]
      };
      
      const updated = [...registeredStudents, newQuickStudent];
      setRegisteredStudents(updated);
      localStorage.setItem("techsetu_registered_students", JSON.stringify(updated));
      setCurrentUser(newQuickStudent);
      setActiveRole('student');
      setSelectedLanguage('santhali');
      return { success: true, user: newQuickStudent };
    } else {
      // Teacher Login
      const teacher = registeredTeachers.find(
        t => t.teacherId.toLowerCase() === teacherId.toLowerCase()
      );

      if (teacher) {
        if (password && teacher.password && teacher.password !== password && password !== 'demo') {
          return { success: false, message: "Password is incorrect." };
        }
        const authenticatedTeacher = { ...teacher, role: 'teacher' };
        setCurrentUser(authenticatedTeacher);
        setActiveRole('teacher');
        if (teacher.preferredLang) setTeacherUiLang(teacher.preferredLang);
        return { success: true, user: authenticatedTeacher };
      }

      // Quick fallback teacher login
      const quickTeacher = {
        id: `tch_${Date.now()}`,
        role: 'teacher',
        name: teacherId.split('@')[0] || "Teacher",
        teacherId,
        school: 'Govt. Middle School, Ranchi',
        subject: 'Science & Mathematics',
        preferredLang: teacherUiLang || 'english'
      };
      const updated = [...registeredTeachers, quickTeacher];
      setRegisteredTeachers(updated);
      localStorage.setItem("techsetu_registered_teachers", JSON.stringify(updated));
      setCurrentUser(quickTeacher);
      setActiveRole('teacher');
      return { success: true, user: quickTeacher };
    }
  };

  const signupUser = (userData) => {
    if (userData.role === 'student') {
      const exists = registeredStudents.some(
        s => s.rollNo === userData.rollNo && s.grade === userData.grade && s.division === userData.division
      );
      if (exists) {
        return { success: false, message: `Class ${userData.grade}-${userData.division} Roll ${userData.rollNo} already registered.` };
      }
      const newStudentUser = { ...userData, role: 'student', language: 'santhali' };
      const updated = [...registeredStudents, newStudentUser];
      setRegisteredStudents(updated);
      localStorage.setItem("techsetu_registered_students", JSON.stringify(updated));
      setCurrentUser(newStudentUser);
      setActiveRole('student');
      setSelectedLanguage('santhali');
      return { success: true, user: newStudentUser };
    } else {
      const exists = registeredTeachers.some(
        t => t.teacherId.toLowerCase() === userData.teacherId.toLowerCase()
      );
      if (exists) {
        return { success: false, message: "Teacher ID is already registered." };
      }
      const newTeacherUser = { ...userData, role: 'teacher' };
      const updated = [...registeredTeachers, newTeacherUser];
      setRegisteredTeachers(updated);
      localStorage.setItem("techsetu_registered_teachers", JSON.stringify(updated));
      setCurrentUser(newTeacherUser);
      setActiveRole('teacher');
      if (userData.preferredLang) setTeacherUiLang(userData.preferredLang);
      return { success: true, user: newTeacherUser };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem("techsetu_active_user");
  };

  const addLectureNote = (note) => {
    const updated = [note, ...lectureNotes];
    setLectureNotes(updated);
    localStorage.setItem("techsetu_lecture_notes", JSON.stringify(updated));
  };

  const addStudentReward = (starCount = 10, newBadge = null) => {
    setStudentStats(prev => {
      const newBadges = newBadge && !prev.badges.includes(newBadge) ? [...prev.badges, newBadge] : prev.badges;
      const updated = {
        ...prev,
        stars: prev.stars + starCount,
        badges: newBadges
      };

      if (currentUser && currentUser.role === 'student') {
        const updatedUser = { ...currentUser, stars: updated.stars, badges: updated.badges };
        setCurrentUser(updatedUser);
        const updatedList = registeredStudents.map(s => s.id === currentUser.id ? updatedUser : s);
        setRegisteredStudents(updatedList);
        localStorage.setItem("techsetu_registered_students", JSON.stringify(updatedList));
      }
      return updated;
    });
  };

  const updateMetrics = ({ stt, trans, tts }) => {
    setPerformanceMetrics(prev => ({
      sttLatencyMs: stt || prev.sttLatencyMs,
      transLatencyMs: trans || prev.transLatencyMs,
      ttsLatencyMs: tts || prev.ttsLatencyMs,
      totalTurnaroundMs: (stt || prev.sttLatencyMs) + (trans || prev.transLatencyMs) + (tts || prev.ttsLatencyMs)
    }));
  };

  const teacherT = getTeacherTranslations(teacherUiLang);
  const studentT = STUDENT_SANTHALI_UI_TEXT;

  return (
    <AppContext.Provider value={{
      currentUser,
      loginUser,
      signupUser,
      logoutUser,
      registeredStudents,
      registeredTeachers,
      teacherUiLang,
      setTeacherUiLang,
      teacherT,
      studentT,
      selectedLanguage,
      setSelectedLanguage,
      activeRole,
      setActiveRole,
      teacherTab,
      setTeacherTab,
      studentTab,
      setStudentTab,
      isBackendOnline,
      forceOfflineMode,
      setForceOfflineMode,
      lectureNotes,
      addLectureNote,
      performanceMetrics,
      updateMetrics,
      studentStats,
      addStudentReward,
      syncQueueCount,
      setSyncQueueCount,
      activeMeeting,
      setActiveMeeting
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
