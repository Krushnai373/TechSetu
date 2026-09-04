import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NIPUN_GRADES } from '../../utils/nipunCurriculum';
import { apiService } from '../../services/api';
import { speechService } from '../../services/speechService';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Volume2, 
  Bookmark, 
  Download, 
  Lightbulb
} from 'lucide-react';

export const LessonPlanner = () => {
  const { teacherT } = useApp();

  const [selectedGrade, setSelectedGrade] = useState(NIPUN_GRADES[0].grade_id);
  const [selectedTopic, setSelectedTopic] = useState(NIPUN_GRADES[0].topics[0].topic_id);
  const [lessonPlan, setLessonPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const activeGradeObj = NIPUN_GRADES.find(g => g.grade_id === selectedGrade) || NIPUN_GRADES[0];

  const handleGenerateLesson = async (gradeId, topicId) => {
    setIsLoading(true);
    setIsSaved(false);
    speechService.playChime('click');
    const plan = await apiService.getLessonPlan(gradeId, topicId, 'santhali');
    setLessonPlan(plan);
    setIsLoading(false);
  };

  useEffect(() => {
    handleGenerateLesson(selectedGrade, selectedTopic);
  }, [selectedGrade, selectedTopic]);

  const handleSaveOffline = () => {
    speechService.playChime('reward');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h2 className="text-2xl font-black text-white">
              {teacherT.planner_title}
            </h2>
          </div>
          <p className="text-sm text-emerald-300 font-medium mt-1">
            {teacherT.planner_desc}
          </p>
        </div>

        <button
          onClick={handleSaveOffline}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/30"
        >
          <Bookmark className="w-4 h-4" />
          <span>{isSaved ? "Saved Offline! ✓" : teacherT.save_offline}</span>
        </button>
      </div>

      {/* Grade and Topic Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {NIPUN_GRADES.map((grade) => (
          <div
            key={grade.grade_id}
            onClick={() => {
              setSelectedGrade(grade.grade_id);
              setSelectedTopic(grade.topics[0].topic_id);
            }}
            className={`cursor-pointer p-4 rounded-3xl border transition-all ${
              selectedGrade === grade.grade_id
                ? 'bg-gradient-to-br from-slate-900 to-emerald-950/50 border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'glass-card border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{grade.icon}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {grade.age_group}
              </span>
            </div>
            <h3 className="font-bold text-white text-base">{grade.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{grade.topics.length} NIPUN FLN Competencies</p>
          </div>
        ))}
      </div>

      {/* Topic Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {activeGradeObj.topics.map((t) => (
          <button
            key={t.topic_id}
            onClick={() => setSelectedTopic(t.topic_id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedTopic === t.topic_id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Generated Lesson Plan View */}
      {lessonPlan && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-800 space-y-8">
          
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {lessonPlan.nipun_code}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-olchiki">
                  Target: ᱥᱟᱱᱛᱟᱲᱤ (SANTHALI)
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">{lessonPlan.topic_title}</h3>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                🎯 <strong className="text-amber-300">Competency:</strong> {lessonPlan.competency}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 no-print"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{teacherT.print_plan}</span>
            </button>
          </div>

          {/* Pedagogy Objectives */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <h4 className="font-bold text-amber-400 text-sm mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>{teacherT.learning_objectives}</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
              {lessonPlan.pedagogy_objectives?.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4-Step Structured Teaching Workflow */}
          <div>
            <h4 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              <span>{teacherT.step_guide}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessonPlan.step_by_step_teacher_guide?.map((step) => (
                <div
                  key={step.step}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/60 border border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-black flex items-center justify-center">
                        {step.step}
                      </span>
                      <h5 className="font-bold text-slate-100 text-sm">{step.title}</h5>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {step.instruction}
                    </p>
                  </div>

                  {step.suggested_dialogue && (
                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400">
                          Santhali Classroom Prompt
                        </span>
                        <button
                          onClick={() => speechService.speak({
                            text: step.suggested_dialogue.tribal_devanagari || step.suggested_dialogue.tribal_script,
                            phonetic: step.suggested_dialogue.phonetic,
                            lang: 'santhali'
                          })}
                          className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-transform active:scale-95"
                          title="Listen Pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="font-olchiki text-amber-300 font-bold text-sm">
                        {step.suggested_dialogue.tribal_script}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {step.suggested_dialogue.hindi}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
