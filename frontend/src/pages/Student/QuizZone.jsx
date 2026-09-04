import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';
import { 
  Award, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  Star, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuizZone = () => {
  const { addStudentReward, studentT } = useApp();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const t = studentT.quiz;

  const quizQuestions = [
    {
      question: "ᱱᱚᱣᱟ ᱪᱤᱛᱟᱹᱨ ᱨᱮ ᱪᱮᱫ ᱢᱮᱱᱟᱜᱼᱟ? ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮ ᱞᱟᱹᱭ ᱢᱮ 🌺",
      icon: "🌺",
      options: [
        { text: "ᱵᱟᱦᱟ (Baha - Flower)", correct: true },
        { text: "ᱫᱟᱨᱮ (Dare - Tree)", correct: false },
        { text: "ᱫᱟᱜ (Daag - Water)", correct: false }
      ]
    },
    {
      question: "ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮ '1' (One) ᱫᱚ ᱪᱮᱫ ᱠᱚ ᱢᱮᱛᱟᱜᱼᱟ? 1️⃣",
      icon: "1️⃣",
      options: [
        { text: "ᱵᱟᱨ (Bar - 2)", correct: false },
        { text: "ᱢᱤᱫ (Mid - 1)", correct: true },
        { text: "ᱯᱮ (Pe - 3)", correct: false }
      ]
    },
    {
      question: "ᱦᱟᱹᱛᱤ ᱫᱚ ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮ ᱪᱮᱫ ᱠᱚ ᱢᱮᱛᱟᱭᱟ? 🐘",
      icon: "🐘",
      options: [
        { text: "ᱜᱟᱹᱭ (Gayi - Cow)", correct: false },
        { text: "ᱪᱮᱬᱮ (Chene - Bird)", correct: false },
        { text: "ᱦᱟᱹᱛᱤ (Hati - Elephant)", correct: true }
      ]
    },
    {
      question: "ᱵᱟᱨ ᱥᱟᱠᱟᱢ + ᱵᱟᱨ ᱥᱟᱠᱟᱢ = ᱛᱤᱱᱟᱹᱜ ᱥᱟᱠᱟᱢ? 🍃🍃 + 🍃🍃",
      icon: "🍃",
      options: [
        { text: "ᱯᱳᱱ (Pon - 4)", correct: true },
        { text: "ᱯᱮ (Pe - 3)", correct: false },
        { text: "ᱢᱚᱬᱮ (Mone - 5)", correct: false }
      ]
    }
  ];

  const currentQ = quizQuestions[currentIdx];

  const handleSelectOption = (opt) => {
    speechService.playChime('click');
    setSelectedOpt(opt);
  };

  const handleNext = () => {
    if (!selectedOpt) return;

    if (selectedOpt.correct) {
      speechService.playChime('reward');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setScore(prev => prev + 10);
      addStudentReward(10);
    }

    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
    } else {
      setQuizFinished(true);
      speechService.playChime('reward');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      addStudentReward(20, "ᱠᱩᱠᱞᱤ ᱪᱟᱢᱯᱤᱭᱟᱱ (Quiz Champion)");
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-olchiki">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⭐</span>
            <h2 className="text-2xl font-black text-white">
              {t.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-purple-300 font-medium mt-1">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-amber-300">
          <Star className="w-4 h-4 fill-amber-400" />
          <span>ᱤᱯᱤᱞ ᱡᱤᱛᱠᱟᱹᱨ: {score} ⭐</span>
        </div>
      </div>

      {!quizFinished ? (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-800 space-y-6 shadow-2xl">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-4">
            <span className="font-bold text-amber-400">
              {t.question_prefix} {currentIdx + 1} / {quizQuestions.length}
            </span>
            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/30 space-y-3 text-center">
            <div className="text-5xl">{currentQ.icon}</div>
            <h3 className="font-black text-white text-xl sm:text-2xl leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOpt === opt;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-4 rounded-2xl border text-left font-black text-sm sm:text-base flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-500/20 scale-102'
                      : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-purple-500/40'
                  }`}
                >
                  <span>{opt.text}</span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-300" />}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <div className="pt-2">
            <button
              onClick={handleNext}
              disabled={!selectedOpt}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 disabled:opacity-40 transition-all shadow-xl shadow-orange-500/20"
            >
              <span>{currentIdx + 1 === quizQuestions.length ? t.finish_btn : t.next_btn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* Quiz Finished View */
        <div className="glass-card rounded-3xl p-8 border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-purple-600 flex items-center justify-center mx-auto text-5xl shadow-2xl shadow-purple-500/40 animate-bounce">
            🏆
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {t.won_praise}
            </h3>
            <p className="text-sm text-amber-300">
              ᱟᱢ ᱱᱚᱣᱟ ᱠᱩᱠᱞᱤ ᱨᱮ <strong className="text-white font-bold">{score} ⭐</strong> ᱤᱯᱤᱞ ᱮᱢ ᱟᱢᱮᱴ ᱠᱮᱫᱟ!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs inline-flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>ᱱᱟᱣᱟ ᱢᱮᱰᱟᱞ: "ᱠᱩᱠᱞᱤ ᱪᱟᱢᱯᱤᱭᱟᱱ" (Quiz Champion Unlocked)</span>
          </div>

          <div>
            <button
              onClick={handleRestart}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-500/30 transition-all inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.restart}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
