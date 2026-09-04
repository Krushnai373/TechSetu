import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VOCABULARY_LIST } from '../../utils/tribalData';
import { speechService } from '../../services/speechService';
import { 
  Layers, 
  Volume2, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw,
  Sparkles
} from 'lucide-react';

export const FlashcardDeck = () => {
  const { teacherUiLang } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const filteredCards = activeCategory === 'all'
    ? VOCABULARY_LIST
    : VOCABULARY_LIST.filter(c => c.category === activeCategory);

  const currentCard = (filteredCards && filteredCards.length > 0)
    ? (filteredCards[currentIndex] || filteredCards[0])
    : VOCABULARY_LIST[0];

  const handleNext = () => {
    speechService.playChime('click');
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    speechService.playChime('click');
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleSpeak = (e) => {
    if (e) e.stopPropagation();
    speechService.playChime('click');
    speechService.speak({
      text: currentCard.santhali_devanagari || currentCard.santhali_olchiki,
      phonetic: currentCard.santhali_phonetic,
      lang: 'santhali'
    });
  };

  // Auto-slide presentation mode
  useEffect(() => {
    let timer;
    if (isAutoPlaying && filteredCards.length > 0) {
      timer = setInterval(() => {
        setIsFlipped(f => !f);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
          setIsFlipped(false);
        }, 2200);
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, filteredCards.length]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-pink-950/80 border border-purple-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎴</span>
            <h2 className="text-2xl font-black text-white">
              {teacherUiLang === 'en' ? 'Interactive Classroom Flashcard Deck' : 'सचित्र कक्षा फ्लैशकार्ड डेक'}
            </h2>
          </div>
          <p className="text-sm text-purple-300 font-medium mt-1">
            {teacherUiLang === 'en' ? 'Visual MTB-MLE Flashcards with Native Pronunciation' : 'चित्र, देवनागरी व ओल चिकी लिपि सहित सचित्र फ्लैशकार्ड'}
          </p>
        </div>

        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-lg ${
            isAutoPlaying
              ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
              : 'bg-purple-500 text-slate-950 hover:brightness-110 shadow-purple-500/30'
          }`}
        >
          {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isAutoPlaying ? (teacherUiLang === 'en' ? 'Pause Auto-Slides' : 'स्लाइड रोकें') : (teacherUiLang === 'en' ? 'Auto-Slide Mode' : 'स्वतः स्लाइड चालू करें')}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'nature', 'animals', 'classroom', 'body_parts'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* 3D Flip Card Container */}
      <div className="flex flex-col items-center">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full max-w-md h-96 cursor-pointer select-none perspective-1000"
        >
          <div
            className={`relative w-full h-full rounded-3xl transition-transform duration-500 transform-style-3d shadow-2xl border border-white/10 ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            
            {/* FRONT FACE: Picture & Hindi */}
            <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex flex-col justify-between items-center text-center backface-hidden border border-purple-500/30 shadow-2xl">
              <div className="w-full flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold px-2 py-0.5 rounded bg-white/10 text-purple-300 capitalize">{currentCard.category}</span>
                <span className="font-mono">{currentIndex + 1} / {filteredCards.length}</span>
              </div>

              <div className="my-auto space-y-4">
                <div className="text-7xl animate-float drop-shadow-xl">{currentCard.icon}</div>
                <div>
                  <h3 className="text-3xl font-black text-white">{currentCard.hindi}</h3>
                  <p className="text-sm text-slate-400 font-medium">English: {currentCard.english}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                <RotateCw className="w-3.5 h-3.5" />
                <span>{teacherUiLang === 'en' ? 'Click card to see Santhali translation' : 'संथाली अनुवाद देखने के लिए कार्ड पर क्लिक करें'}</span>
              </div>
            </div>

            {/* BACK FACE: Santhali (Ol Chiki) & Audio */}
            <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 p-8 flex flex-col justify-between items-center text-center backface-hidden rotate-y-180 border border-amber-500/40 shadow-2xl">
              <div className="w-full flex items-center justify-between text-xs">
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-olchiki">
                  ᱥᱟᱱᱛᱟᱲᱤ (Santhali)
                </span>
                <button
                  onClick={handleSpeak}
                  className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-md shadow-amber-500/30"
                  title="Play Pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="my-auto space-y-3">
                <div className="font-olchiki text-4xl sm:text-5xl font-black text-amber-300 tracking-wide drop-shadow">
                  {currentCard.santhali_olchiki || currentCard.santhali_devanagari}
                </div>
                
                <div className="space-y-1">
                  <div className="text-lg font-bold text-slate-200">
                    {currentCard.santhali_devanagari}
                  </div>
                  {currentCard.santhali_phonetic && (
                    <p className="text-xs text-slate-400 italic">
                      &ldquo;{currentCard.santhali_phonetic}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-400">
                <span>{currentCard.hindi} • {currentCard.english}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleSpeak}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black hover:brightness-110 active:scale-95 shadow-lg shadow-orange-500/30 transition-all"
          >
            <Volume2 className="w-4 h-4" />
            <span>{teacherUiLang === 'en' ? 'Speak' : 'उच्चारण सुनें'}</span>
          </button>

          <button
            onClick={handleNext}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95 shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};
