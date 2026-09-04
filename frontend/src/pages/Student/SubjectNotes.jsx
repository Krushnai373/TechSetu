import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUBJECTS_LIST } from '../../utils/subjectsData';
import { speechService } from '../../services/speechService';
import { 
  BookOpen, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Clock, 
  Star, 
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SubjectNotes = () => {
  const { lectureNotes, addStudentReward, studentT } = useApp();

  const [activeSubject, setActiveSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [answeredMap, setAnsweredMap] = useState({});

  const t = studentT.subjects;

  const santhaliSubjectNames = {
    science: { name: "ᱥᱟᱬᱮᱥ", sub: "Science", icon: "🔬" },
    math: { name: "ᱮᱞᱠᱷᱟ", sub: "Mathematics", icon: "📐" },
    evs: { name: "ᱯᱚᱨᱤᱵᱮᱥ", sub: "Environmental", icon: "🌍" },
    social_studies: { name: "ᱥᱟᱶᱛᱟ ᱥᱟᱬᱮᱥ", sub: "Social Studies", icon: "🏛️" },
    language: { name: "ᱯᱟᱹᱨᱥᱤ ᱟᱨ ᱠᱟᱹᱦᱱᱤ", sub: "Language", icon: "📖" }
  };

  const filteredNotes = lectureNotes.filter((note) => {
    const matchSubject = activeSubject === 'all' || note.subjectId === activeSubject;
    const matchGrade = selectedGrade === 'all' || note.grade === selectedGrade;
    const matchSearch = !searchQuery.trim() || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.translations?.santhali?.script && note.translations.santhali.script.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSubject && matchGrade && matchSearch;
  });

  const handlePracticeAnswer = (noteId) => {
    speechService.playChime('reward');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setAnsweredMap(prev => ({ ...prev, [noteId]: true }));
    addStudentReward(10);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4 font-olchiki">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📚</span>
            <h2 className="text-2xl font-black text-white">
              {t.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-blue-300 font-medium mt-1">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-amber-300">
          <Star className="w-4 h-4 fill-amber-400" />
          <span>ᱯᱟᱹᱨᱥᱤ: <strong className="text-white">ᱥᱟᱱᱛᱟᱲᱤ (Ol Chiki)</strong></span>
        </div>
      </div>

      {/* Subject Selector Cards in Santhali */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-olchiki">
        <button
          onClick={() => { speechService.playChime('click'); setActiveSubject('all'); }}
          className={`p-3.5 rounded-2xl border text-center transition-all ${
            activeSubject === 'all'
              ? 'bg-gradient-to-br from-slate-900 to-amber-950/60 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
              : 'glass-card border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-2xl block mb-1">🌟</span>
          <span className="font-bold text-xs text-white block">{t.all_subjects}</span>
          <span className="text-[10px] text-slate-400">All Subjects</span>
        </button>

        {SUBJECTS_LIST.map((subj) => {
          const santhaliMeta = santhaliSubjectNames[subj.id] || { name: subj.name_hi, sub: subj.name_en, icon: subj.icon };
          return (
            <button
              key={subj.id}
              onClick={() => { speechService.playChime('click'); setActiveSubject(subj.id); }}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                activeSubject === subj.id
                  ? `bg-gradient-to-br from-slate-900 to-blue-950/60 border-blue-400 shadow-lg shadow-blue-500/20 scale-105`
                  : 'glass-card border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-2xl block mb-1">{santhaliMeta.icon}</span>
              <span className="font-bold text-xs text-white block truncate">{santhaliMeta.name}</span>
              <span className="text-[10px] text-slate-400 block truncate">{santhaliMeta.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 font-olchiki">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ᱥᱟᱛᱟᱢ ᱥᱮᱸᱫᱽᱨᱟᱭ ᱢᱮ... (Search notes)"
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-olchiki"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">ᱪᱟᱱᱟᱪ (Class):</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 focus:outline-none cursor-pointer"
          >
            <option value="all">ᱥᱟᱱᱟᱢ ᱪᱟᱱᱟᱪ (All Classes)</option>
            <option value="Class 1">Class 1</option>
            <option value="Class 2">Class 2</option>
            <option value="Class 3">Class 3</option>
            <option value="Class 4">Class 4</option>
            <option value="Class 5">Class 5</option>
          </select>
        </div>
      </div>

      {/* Notes List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNotes.map((note) => {
          const santhaliData = note.translations?.santhali || {
            script: note.summary_hi,
            devanagari: note.summary_hi,
            phonetic: ""
          };

          const santhaliMeta = santhaliSubjectNames[note.subjectId] || { name: note.subjectId, icon: "📖" };

          return (
            <div
              key={note.id}
              className="glass-card rounded-3xl p-6 border-slate-800 space-y-4 flex flex-col justify-between hover:border-blue-500/40 transition-all font-olchiki shadow-xl"
            >
              <div>
                {/* Header Tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 text-[11px] font-black border border-blue-500/30">
                      {santhaliMeta.icon} {santhaliMeta.name}
                    </span>
                    <span className="px-2 py-1 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-bold">
                      {note.grade}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {note.audioDuration || "3 min"}
                  </span>
                </div>

                {/* Primary Santhali Ol Chiki Header & Script */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      ᱥᱟᱱᱛᱟᱲᱤ ᱥᱟᱨ (Santhali Summary)
                    </span>
                    <button
                      onClick={() => speechService.speak({
                        text: santhaliData.devanagari || santhaliData.script || note.summary_hi,
                        phonetic: santhaliData.phonetic,
                        lang: 'santhali'
                      })}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black hover:brightness-110 active:scale-95 shadow-md shadow-orange-500/30 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t.listen_lecture}</span>
                    </button>
                  </div>

                  {/* Large Ol Chiki Text */}
                  <div className="font-olchiki text-xl font-bold text-amber-300 py-1 leading-relaxed">
                    {santhaliData.script}
                  </div>

                  {santhaliData.phonetic && (
                    <p className="text-[11px] text-slate-400 italic">
                      &ldquo;{santhaliData.phonetic}&rdquo;
                    </p>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-bold text-white text-base leading-snug">
                  {note.title}
                </h4>

                {/* Key Terms in Santhali */}
                {note.keyTerms && note.keyTerms.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <h5 className="text-[11px] font-bold text-slate-400 mb-2">{t.key_terms}</h5>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {note.keyTerms.map((term, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col">
                          <span className="text-slate-400 text-[10px]">{term.hi}</span>
                          <span className="font-bold text-emerald-300 font-olchiki truncate">
                            {term.santhali || term.hi}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Practice Question */}
              {note.practiceQuestion_hi && (
                <div className="pt-3 border-t border-slate-800">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.practice_q} {note.practiceQuestion_hi}</span>
                    </p>

                    {answeredMap[note.id] ? (
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>ᱛᱮᱞᱟ: {note.practiceAnswer_hi} (+10 ⭐ ᱧᱟᱢᱮᱱᱟ!)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePracticeAnswer(note.id)}
                        className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.reveal_answer}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
