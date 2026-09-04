import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VOCABULARY_LIST } from '../../utils/tribalData';
import { speechService } from '../../services/speechService';
import { 
  Gamepad2, 
  Volume2, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  RotateCcw,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const InteractiveGames = () => {
  const { addStudentReward, studentT } = useApp();

  const [activeGame, setActiveGame] = useState('sound_match'); // 'sound_match' | 'counting'
  const [currentRound, setCurrentRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameScore, setGameScore] = useState(0);

  const t = studentT.games;

  // Sound Match Questions with Santhali Target Vocab
  const soundQuestions = [
    {
      targetVocab: VOCABULARY_LIST.find(v => v.id === "v_15") || VOCABULARY_LIST[14], // Palash Flower
      options: [
        VOCABULARY_LIST.find(v => v.id === "v_15"),
        VOCABULARY_LIST.find(v => v.id === "v_11"),
        VOCABULARY_LIST.find(v => v.id === "v_12"),
        VOCABULARY_LIST.find(v => v.id === "v_18")
      ]
    },
    {
      targetVocab: VOCABULARY_LIST.find(v => v.id === "v_11") || VOCABULARY_LIST[10], // Tree
      options: [
        VOCABULARY_LIST.find(v => v.id === "v_19"),
        VOCABULARY_LIST.find(v => v.id === "v_11"),
        VOCABULARY_LIST.find(v => v.id === "v_13"),
        VOCABULARY_LIST.find(v => v.id === "v_23")
      ]
    },
    {
      targetVocab: VOCABULARY_LIST.find(v => v.id === "v_19") || VOCABULARY_LIST[18], // Elephant
      options: [
        VOCABULARY_LIST.find(v => v.id === "v_18"),
        VOCABULARY_LIST.find(v => v.id === "v_21"),
        VOCABULARY_LIST.find(v => v.id === "v_19"),
        VOCABULARY_LIST.find(v => v.id === "v_15")
      ]
    }
  ];

  // Counting Questions in Santhali
  const countingQuestions = [
    { count: 3, icons: "🍃🍃🍃", correctOlchiki: "ᱯᱮ (3)", correctPhonetic: "Pe", name: "ᱯᱮ ᱥᱟᱠᱟᱢ" },
    { count: 2, icons: "🍃🍃", correctOlchiki: "ᱵᱟᱨ (2)", correctPhonetic: "Bar", name: "ᱵᱟᱨ ᱥᱟᱠᱟᱢ" },
    { count: 5, icons: "🍃🍃🍃🍃🍃", correctOlchiki: "ᱢᱚᱬᱮ (5)", correctPhonetic: "Mone", name: "ᱢᱚᱬᱮ ᱥᱟᱠᱟᱢ" }
  ];

  const currentSoundQ = soundQuestions[currentRound % soundQuestions.length];
  const currentCountQ = countingQuestions[currentRound % countingQuestions.length];

  const playTargetSound = () => {
    speechService.playChime('click');
    speechService.speak({
      text: currentSoundQ.targetVocab.santhali_devanagari || currentSoundQ.targetVocab.santhali_olchiki,
      phonetic: currentSoundQ.targetVocab.santhali_phonetic,
      lang: 'santhali'
    });
  };

  const handleOptionSelect = (option) => {
    if (option.id === currentSoundQ.targetVocab.id) {
      speechService.playChime('reward');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setFeedback({ correct: true, message: t.correct_praise });
      setGameScore(prev => prev + 10);
      addStudentReward(10);
      setTimeout(() => {
        setFeedback(null);
        setCurrentRound(prev => prev + 1);
      }, 1500);
    } else {
      speechService.playChime('click');
      setFeedback({ correct: false, message: t.wrong_try_again });
    }
  };

  const handleCountSelect = (optionText) => {
    if (optionText === currentCountQ.correctOlchiki) {
      speechService.playChime('reward');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setFeedback({ correct: true, message: t.correct_praise });
      setGameScore(prev => prev + 10);
      addStudentReward(10);
      setTimeout(() => {
        setFeedback(null);
        setCurrentRound(prev => prev + 1);
      }, 1500);
    } else {
      speechService.playChime('click');
      setFeedback({ correct: false, message: t.wrong_try_again });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-olchiki">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-950 via-slate-900 to-rose-950 border border-pink-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎮</span>
            <h2 className="text-2xl font-black text-white">
              {t.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-pink-300 font-medium mt-1">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-amber-300">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{t.score_label}: {gameScore} ⭐</span>
        </div>
      </div>

      {/* Game Mode Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { speechService.playChime('click'); setActiveGame('sound_match'); setFeedback(null); }}
          className={`flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all border ${
            activeGame === 'sound_match'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-lg shadow-pink-500/30 scale-105'
              : 'glass-card border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.sound_match_tab}
        </button>

        <button
          onClick={() => { speechService.playChime('click'); setActiveGame('counting'); setFeedback(null); }}
          className={`flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all border ${
            activeGame === 'counting'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105'
              : 'glass-card border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.counting_tab}
        </button>
      </div>

      {/* ================= GAME 1: SOUND MATCH ================= */}
      {activeGame === 'sound_match' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-800 space-y-6 text-center">
          
          <div className="space-y-2">
            <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              ᱫᱷᱟᱯ {currentRound + 1} (Round {currentRound + 1})
            </span>
            <h3 className="text-xl font-black text-white">
              {t.play_sound} ᱟᱨ ᱥᱟᱹᱨᱤ ᱪᱤᱛᱟᱹᱨ ᱵᱟᱪᱷᱟᱣ ᱢᱮ
            </h3>
          </div>

          {/* Big Speaker Button */}
          <div>
            <button
              onClick={playTargetSound}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/40 border-2 border-pink-300 transform hover:scale-110 active:scale-95 transition-all animate-bounce"
              title="Click to hear word"
            >
              <Volume2 className="w-12 h-12" />
            </button>
            <p className="text-xs text-amber-300 font-bold mt-2">
              👆 ᱱᱚᱰᱮ ᱚᱛᱟᱭ ᱢᱮ ᱟᱲᱟᱝ ᱟᱸᱡᱚᱢ ᱞᱟᱹᱜᱤᱫ (Click to Listen)
            </p>
          </div>

          {/* Picture Choices */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            {currentSoundQ.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOptionSelect(opt)}
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-700 hover:border-pink-400 hover:scale-105 active:scale-95 transition-all space-y-3 shadow-lg hover:shadow-pink-500/20"
              >
                <div className="text-5xl">{opt.icon}</div>
                <div className="font-olchiki font-black text-lg text-white">
                  {opt.santhali_olchiki}
                </div>
                <p className="text-xs text-slate-400 italic">&ldquo;{opt.santhali_phonetic}&rdquo;</p>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`p-4 rounded-2xl text-sm font-bold animate-in zoom-in-95 duration-150 ${
              feedback.correct
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
            }`}>
              {feedback.message}
            </div>
          )}

        </div>
      )}

      {/* ================= GAME 2: COUNTING ================= */}
      {activeGame === 'counting' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-800 space-y-6 text-center">
          
          <div className="space-y-2">
            <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ᱫᱷᱟᱯ {currentRound + 1} (Round {currentRound + 1})
            </span>
            <h3 className="text-xl font-black text-white">
              ᱥᱟᱠᱟᱢ ᱞᱮᱠᱷᱟᱭ ᱢᱮ ᱟᱨ ᱥᱟᱹᱨᱤ ᱮᱞ ᱵᱟᱪᱷᱟᱣ ᱢᱮ
            </h3>
          </div>

          {/* Visual Leaves Box */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-center gap-4 text-5xl">
            {currentCountQ.icons}
          </div>

          {/* Counting Choices */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {["ᱢᱤᱫ (1)", "ᱵᱟᱨ (2)", "ᱯᱮ (3)", "ᱯᱳᱱ (4)", "ᱢᱚᱬᱮ (5)"].slice(0, 3).map((choice, i) => (
              <button
                key={i}
                onClick={() => handleCountSelect(choice)}
                className="py-5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-emerald-400 font-olchiki font-black text-lg text-white hover:scale-105 active:scale-95 transition-all shadow"
              >
                {choice}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`p-4 rounded-2xl text-sm font-bold animate-in zoom-in-95 duration-150 ${
              feedback.correct
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
            }`}>
              {feedback.message}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
