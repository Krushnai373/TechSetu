import React from 'react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';
import { 
  Sparkles, 
  MapPin, 
  Star, 
  Award, 
  Play, 
  Compass, 
  Lock,
  Mic
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentHome = () => {
  const { studentStats, setStudentTab, studentT } = useApp();

  const questLevels = [
    {
      id: 1,
      title: "ᱯᱟᱞᱟᱥ ᱵᱟᱦᱟ ᱵᱤᱨ",
      title_sub: "Palash Forest Quest",
      desc: "ᱥᱟᱱᱟᱢ ᱥᱚᱦᱚᱡᱽ ᱡᱤᱱᱤᱥ, ᱵᱟᱦᱟ ᱟᱨ ᱫᱟᱨᱮ ᱪᱤᱱᱦᱟᱹᱣ ᱢᱮ",
      icon: "🌺",
      starsRequired: 0,
      unlocked: true,
      completed: true,
      color: "from-amber-500 to-orange-600"
    },
    {
      id: 2,
      title: "ᱥᱟᱨᱡᱚᱢ ᱫᱟᱨᱮ ᱞᱮᱠᱷᱟ",
      title_sub: "Sal Tree Counting (1-5)",
      desc: "ᱥᱟᱠᱟᱢ ᱟᱨ ᱢᱟᱦᱩᱣᱟ ᱡᱟᱝ ᱛᱮ ᱑ ᱠᱷᱚᱱ ᱕ ᱞᱮᱠᱷᱟᱭ ᱢᱮ",
      icon: "🍃",
      starsRequired: 20,
      unlocked: true,
      completed: true,
      color: "from-emerald-500 to-teal-600"
    },
    {
      id: 3,
      title: "ᱵᱤᱨ ᱨᱮᱱ ᱡᱤᱣᱤ ᱡᱤᱭᱟᱹᱞᱤ",
      title_sub: "Animals of the Forest",
      desc: "ᱦᱟᱹᱛᱤ, ᱜᱟᱹᱭ, ᱪᱮᱬᱮ ᱟᱨ ᱦᱟᱠᱳ ᱠᱚᱣᱟᱜ ᱥᱟᱰᱮ",
      icon: "🐘",
      starsRequired: 40,
      unlocked: true,
      completed: false,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 4,
      title: "ᱚᱞ ᱪᱤᱠᱤ ᱟᱠᱷᱚᱨ ᱠᱷᱮᱞ",
      title_sub: "Ol Chiki Magical Letters",
      desc: "ᱟᱠᱷᱚᱨ ᱠᱷᱮᱞ ᱟᱨ ᱟᱲᱟᱝ ᱥᱮᱪᱮᱫ",
      icon: "✨",
      starsRequired: 70,
      unlocked: false,
      completed: false,
      color: "from-purple-500 to-pink-600"
    }
  ];

  const handleLevelClick = (level) => {
    speechService.playChime('click');
    if (level.unlocked) {
      speechService.playChime('reward');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setStudentTab('games');
    }
  };

  const handleMascotClick = () => {
    speechService.playChime('reward');
    speechService.speak({
      text: "ᱡᱚᱦᱟᱨ ᱜᱟᱛᱮ! ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ ᱵᱤᱨᱥᱟ ᱠᱟᱱᱟ᱾ ᱫᱮᱞᱟᱵᱚᱱ ᱢᱤᱫ ᱥᱟᱶᱛᱮ ᱥᱮᱨᱮᱧᱟᱵᱚᱱ!",
      phonetic: "Johar gate! Inyag nyutum do Birsa kana. Delabon mid sawte serenj-abon!",
      lang: 'santhali'
    });
  };

  return (
    <div className="space-y-8 pb-10 font-olchiki">
      
      {/* Student Welcome Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 border border-amber-500/30 shadow-2xl relative overflow-hidden flex flex-wrap items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 z-10">
          <div 
            onClick={handleMascotClick}
            className="cursor-pointer group relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 p-1 shadow-xl shadow-orange-600/30 border-2 border-amber-300 transform hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-4xl sm:text-5xl animate-float">
              🐯
            </div>
            <span className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-white">
              ᱵᱤᱨᱥᱟ ᱜᱟᱛᱮ
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ᱜᱮᱭᱟᱱ ᱫᱟᱬᱟᱺ (Quest Map)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {studentT.greeting}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {studentT.welcome_sub} • {studentT.level_label} {studentStats.level}
            </p>
          </div>
        </div>

        {/* Quick Activity Launchers */}
        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => { speechService.playChime('click'); setStudentTab('voice_buddy'); }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black hover:brightness-110 active:scale-95 shadow-lg shadow-orange-500/30 transition-all"
          >
            <Mic className="w-5 h-5" />
            <span>ᱨᱚᱯᱚᱲ ᱢᱮ (Speak)</span>
          </button>

          <button
            onClick={() => { speechService.playChime('click'); setStudentTab('quiz'); }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-500/30 transition-all"
          >
            <Award className="w-5 h-5" />
            <span>ᱤᱯᱤᱞ ᱠᱩᱠᱞᱤ (Quiz)</span>
          </button>
        </div>
      </div>

      {/* Gamified Adventure Path */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border-slate-800 relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-xl font-black text-white">ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱜᱮᱭᱟᱱ ᱰᱟᱦᱟᱨ (Adventure Quest Map)</h3>
              <p className="text-xs text-slate-400">ᱛᱷᱚᱠ ᱯᱩᱨᱟᱹᱣ ᱢᱮ ᱟᱨ ᱥᱚᱱᱟ ᱤᱯᱤᱞ ᱡᱤᱛᱠᱟᱹᱨᱚᱜ ᱢᱮ</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-amber-300">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>ᱢᱩᱴ ᱤᱯᱤᱞ (Total Stars): {studentStats.stars}</span>
          </div>
        </div>

        {/* Level Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {questLevels.map((lvl) => (
            <div
              key={lvl.id}
              onClick={() => handleLevelClick(lvl)}
              className={`group relative rounded-3xl p-6 border flex flex-col justify-between h-72 transition-all duration-300 ${
                lvl.unlocked
                  ? 'cursor-pointer bg-slate-900/90 border-slate-700 hover:border-amber-400 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20'
                  : 'cursor-not-allowed bg-slate-950/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black bg-gradient-to-br ${lvl.color} text-white shadow-md`}>
                  #{lvl.id}
                </span>

                {lvl.completed ? (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ᱯᱩᱨᱟᱹᱣ ✓
                  </span>
                ) : !lvl.unlocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    <Lock className="w-3 h-3" /> {lvl.starsRequired} ⭐
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    ᱮᱦᱚᱵ ᱢᱮ
                  </span>
                )}
              </div>

              <div className="my-auto space-y-2 text-center">
                <div className="text-5xl group-hover:scale-110 transition-transform drop-shadow-lg">
                  {lvl.icon}
                </div>
                <h4 className="font-black text-white text-base leading-snug">{lvl.title}</h4>
                <p className="text-[10px] text-amber-400 font-bold">{lvl.title_sub}</p>
                <p className="text-[11px] text-slate-400">{lvl.desc}</p>
              </div>

              <div>
                <button
                  disabled={!lvl.unlocked}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    lvl.unlocked
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{lvl.completed ? "ᱫᱚᱦᱲᱟ ᱠᱷᱮᱞ (Play)" : "ᱮᱦᱚᱵ ᱢᱮ (Start)"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Badges Collection */}
        <div className="mt-10 pt-6 border-t border-slate-800">
          <h4 className="font-bold text-slate-200 text-sm mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>ᱟᱢ ᱡᱤᱛᱠᱟᱹᱨ ᱟᱠᱟᱫ ᱢᱮᱰᱟᱞ ᱠᱚ (Badges):</span>
          </h4>

          <div className="flex flex-wrap gap-3">
            {studentStats.badges.map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm"
              >
                <span>🏅</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
