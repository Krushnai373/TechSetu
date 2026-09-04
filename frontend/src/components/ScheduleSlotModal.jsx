import React, { useState } from 'react';
import { classroomService } from '../services/classroomService';
import { speechService } from '../services/speechService';
import { GRADE_SUBJECTS_CONFIG } from '../utils/subjectsData';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Layers,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ScheduleSlotModal = ({ isOpen, onClose, onScheduled, teacherName = "Prof. Anand Munda" }) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:45');
  const [targetClass, setTargetClass] = useState('Class 3');
  const [section, setSection] = useState('A');
  const [subjectId, setSubjectId] = useState('c3_sci');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classOptions = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ];
  const sectionOptions = ['A', 'B', 'C', 'D'];

  const availableSubjects = GRADE_SUBJECTS_CONFIG[targetClass] || [
    { id: 'gen_sci', name: 'General Science & Environmental Studies', santhali: 'ᱥᱟᱬᱮᱥ ᱟᱨ ᱯᱚᱨᱤᱵᱮᱥ', icon: '🔬' },
    { id: 'gen_math', name: 'Mathematics & Logic', santhali: 'ᱮᱞᱠᱷᱟ ᱟᱨ ᱞᱮᱠᱷᱟ', icon: '📐' },
    { id: 'gen_lang', name: 'Santhali Language & Ol Chiki', santhali: 'ᱥᱟᱱᱛᱟᱲᱤ ᱯᱟᱹᱨᱥᱤ ᱟᱨ ᱚᱞ ᱪᱤᱠᱤ', icon: '📖' }
  ];

  // Standardize 12-hour AM/PM formats
  const formattedStart = classroomService.format12Hour(startTime);
  const formattedEnd = classroomService.format12Hour(endTime);

  // Live Conflict Check
  const conflictCheck = classroomService.checkSlotConflict({
    date,
    startTime: formattedStart,
    endTime: formattedEnd,
    targetClass,
    section
  });

  const handleClassChange = (newClass) => {
    setTargetClass(newClass);
    const subjects = GRADE_SUBJECTS_CONFIG[newClass] || [];
    if (subjects.length > 0) {
      setSubjectId(subjects[0].id);
      if (subjects[0].topics && subjects[0].topics.length > 0) {
        setTopic(subjects[0].topics[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg('Please enter a lesson topic or title.');
      return;
    }

    if (conflictCheck.hasConflict) {
      setErrorMsg(conflictCheck.message);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const selectedSub = availableSubjects.find(s => s.id === subjectId) || availableSubjects[0];

      const newSlot = classroomService.assignLecture({
        grade: targetClass,
        division: section,
        targetClass,
        section,
        subjectId: selectedSub.id,
        subjectName: selectedSub.name,
        santhaliSubject: selectedSub.santhali || selectedSub.name,
        icon: selectedSub.icon || '📖',
        topic: topic.trim(),
        date,
        startTime: formattedStart,
        endTime: formattedEnd,
        timeSlot: `${formattedStart} - ${formattedEnd}`,
        teacherName
      });

      speechService.playChime('reward');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

      if (onScheduled) onScheduled(newSlot);
      onClose();
    } catch (err) {
      setErrorMsg('Failed to schedule slot: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl">
            📅
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Schedule Class Lecture</h2>
            <p className="text-xs text-slate-400">
              Create a targeted live meeting slot for your assigned student batch
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Live Slot Conflict Banner */}
        {conflictCheck.hasConflict && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 text-rose-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm block mb-1">Slot Conflict Detected!</strong>
              <span>{conflictCheck.message}</span>
              <p className="mt-1 text-[11px] text-rose-300">Please choose a different date, time interval, class, or section.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Target Class & Section Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-orange-400" />
                Target Class / Grade
              </label>
              <select
                value={targetClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
              >
                {classOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                Batch / Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
              >
                {sectionOptions.map(s => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
            >
              {availableSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.icon || '📖'} {sub.name} ({sub.santhali || 'Tribal'})
                </option>
              ))}
            </select>
          </div>

          {/* Topic / Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Lesson Topic / Meeting Title
            </label>
            <input
              type="text"
              placeholder="e.g. ᱫᱟᱨᱮ ᱠᱚ ᱪᱮᱫ ᱞᱮᱠᱟ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ? (How Plants Make Food)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
            />
          </div>

          {/* Date & Standardized Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Selected: {formattedStart}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Selected: {formattedEnd}</span>
            </div>
          </div>

          {/* Access Control Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <span className="text-base">🔒</span>
            <div>
              <strong className="text-slate-200">Strict Targeted Access:</strong> Only enrolled students of{' '}
              <span className="text-orange-400 font-bold">{targetClass} - Section {section}</span> will see this slot on their dashboard and be permitted to join.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || conflictCheck.hasConflict}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${
                conflictCheck.hasConflict
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Scheduling...' : conflictCheck.hasConflict ? 'Time Slot Conflict' : 'Publish & Schedule Lecture'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
