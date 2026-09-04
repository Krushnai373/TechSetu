import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUBJECTS_LIST } from '../../utils/subjectsData';
import { offlineEngine } from '../../services/offlineTranslation';
import { speechService } from '../../services/speechService';
import { 
  PlusCircle, 
  Volume2, 
  Sparkles, 
  Send, 
  FileText,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SubjectNotesManager = () => {
  const { lectureNotes, addLectureNote, currentUser, teacherT, teacherUiLang } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS_LIST[0].id);
  const [grade, setGrade] = useState('Class 3');
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [summaryHi, setSummaryHi] = useState('');
  const [practiceQ, setPracticeQ] = useState('');
  const [practiceAns, setPracticeAns] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const classOptions = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ];

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!title.trim() || !summaryHi.trim()) return;

    speechService.playChime('click');

    // Auto-generate Santhali translation
    const santhaliTr = offlineEngine.translate(summaryHi, 'hindi', 'santhali');

    const newNote = {
      id: `ln_custom_${Date.now()}`,
      subjectId: selectedSubject,
      grade,
      division: "All",
      title: title.trim(),
      title_en: titleEn.trim() || title.trim(),
      teacherName: currentUser?.name || "Teacher",
      date: new Date().toISOString().split('T')[0],
      summary_hi: summaryHi.trim(),
      translations: {
        santhali: {
          script: santhaliTr.olchiki || santhaliTr.devanagari,
          devanagari: santhaliTr.devanagari,
          phonetic: santhaliTr.phonetic
        }
      },
      keyTerms: [
        { 
          hi: title.trim(), 
          santhali: santhaliTr.olchiki || santhaliTr.devanagari
        }
      ],
      audioDuration: "3:00 min",
      practiceQuestion_hi: practiceQ.trim() || "What did you learn from this lesson?",
      practiceAnswer_hi: practiceAns.trim() || "Understand the core concept of the lesson."
    };

    addLectureNote(newNote);
    speechService.playChime('reward');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    setTitle('');
    setTitleEn('');
    setSummaryHi('');
    setPracticeQ('');
    setPracticeAns('');
    setIsCreating(false);
  };

  const filtered = lectureNotes.filter(n => 
    !searchFilter || n.title.toLowerCase().includes(searchFilter.toLowerCase()) || n.summary_hi.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 border border-blue-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📚</span>
            <h2 className="text-2xl font-black text-white">
              {teacherT.notes_manager_title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-blue-300 font-medium mt-1">
            {teacherT.notes_manager_desc}
          </p>
        </div>

        <button
          onClick={() => { speechService.playChime('click'); setIsCreating(!isCreating); }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 font-black text-sm hover:brightness-110 active:scale-95 shadow-lg shadow-blue-500/30 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{isCreating ? teacherT.view_list : teacherT.create_new_note}</span>
        </button>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <form onSubmit={handleCreateNote} className="glass-card rounded-3xl p-6 sm:p-8 border-blue-500/30 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{teacherT.create_new_note}</span>
            </h3>
            <span className="text-xs text-emerald-400 font-bold">✨ Auto-Translated to Santhali (Ol Chiki ᱚᱞ ᱪᱤᱠᱤ)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{teacherT.subject_label} *</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {SUBJECTS_LIST.map((subj) => (
                  <option key={subj.id} value={subj.id}>{subj.icon} {teacherUiLang === 'en' ? subj.name_en : subj.name_hi}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{teacherT.grade_label} *</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {classOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{teacherT.title_label} *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How Plants Make Food (प्रकाश संश्लेषण)"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{teacherT.title_en_label}</label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Photosynthesis in Plants"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {teacherT.summary_label} *
            </label>
            <textarea
              rows={4}
              required
              value={summaryHi}
              onChange={(e) => setSummaryHi(e.target.value)}
              placeholder="Write the core lesson explanation here. It will be auto-translated to Santhali Ol Chiki for students..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{teacherT.practice_q_label}</label>
              <input
                type="text"
                value={practiceQ}
                onChange={(e) => setPracticeQ(e.target.value)}
                placeholder="e.g. How do leaves make food?"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{teacherT.practice_ans_label}</label>
              <input
                type="text"
                value={practiceAns}
                onChange={(e) => setPracticeAns(e.target.value)}
                placeholder="e.g. Using sunlight, water and carbon dioxide."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
            >
              {teacherT.cancel}
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{teacherT.publish_btn}</span>
            </button>
          </div>
        </form>
      )}

      {/* Published Notes Catalog */}
      <div className="glass-card rounded-3xl p-6 border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>{teacherT.published_notes} ({filtered.length})</span>
          </h3>

          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={teacherT.search_placeholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((note) => {
            const subj = SUBJECTS_LIST.find(s => s.id === note.subjectId) || SUBJECTS_LIST[0];
            return (
              <div key={note.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 text-[11px] font-bold">
                    {subj.icon} {teacherUiLang === 'en' ? subj.name_en : subj.name_hi} • {note.grade}
                  </span>
                  <span className="text-slate-500 text-[11px]">{note.date}</span>
                </div>

                <h4 className="font-black text-white text-base">{note.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2">{note.summary_hi}</p>

                {/* Santhali Ol Chiki Preview */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-olchiki text-sm font-bold truncate">
                  {note.translations?.santhali?.script || note.summary_hi}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Teacher: <strong>{note.teacherName}</strong></span>
                  <button
                    onClick={() => speechService.speak({
                      text: note.translations?.santhali?.script || note.summary_hi,
                      phonetic: note.translations?.santhali?.phonetic,
                      lang: "santhali"
                    })}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Audio</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
