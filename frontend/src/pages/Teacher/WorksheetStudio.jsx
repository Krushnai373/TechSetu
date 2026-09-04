import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VOCABULARY_LIST } from '../../utils/tribalData';
import { speechService } from '../../services/speechService';
import { 
  FileSpreadsheet, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  Award,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WorksheetStudio = () => {
  const { selectedLanguage, addStudentReward, teacherUiLang } = useApp();

  const [worksheetType, setWorksheetType] = useState('matching'); // 'matching' | 'counting'
  const [gradeLevel, setGradeLevel] = useState('Grade 1');
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);

  // Pick vocabulary items
  const matchingPairs = VOCABULARY_LIST.slice(0, 6);
  const countingItems = [
    { count: 1, icon: "🍃", tribal: "ᱢᱤᱫ (Mid)", devanagari: "मिद", hindi: "एक (1)" },
    { count: 2, icon: "🍃🍃", tribal: "ᱵᱟᱨ (Bar)", devanagari: "बार", hindi: "दो (2)" },
    { count: 3, icon: "🍃🍃🍃", tribal: "ᱯᱮ (Pe)", devanagari: "पे", hindi: "तीन (3)" },
    { count: 4, icon: "🍃🍃🍃🍃", tribal: "ᱯᱳᱱ (Pon)", devanagari: "पोन", hindi: "चार (4)" },
    { count: 5, icon: "🍃🍃🍃🍃🍃", tribal: "ᱢᱚᱬᱮ (Mone)", devanagari: "मोणे", hindi: "पाँच (5)" }
  ];

  const handleSelectAnswer = (questionId, optionValue) => {
    speechService.playChime('click');
    setUserAnswers(prev => ({ ...prev, [questionId]: optionValue }));
  };

  const handleEvaluateDigital = () => {
    let earned = 0;
    const total = matchingPairs.length;
    matchingPairs.forEach(pair => {
      if (userAnswers[pair.id] === pair.id) {
        earned++;
      }
    });

    const calculatedScore = Math.round((earned / total) * 100);
    setScore(calculatedScore);

    if (calculatedScore >= 60) {
      speechService.playChime('reward');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      addStudentReward(15, "Worksheet Champion");
    }
  };

  const handlePrint = () => {
    speechService.playChime('click');
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <h2 className="text-2xl font-black text-white">
              {teacherUiLang === 'en' ? 'Bilingual Worksheet & Assessment Generator' : 'द्विभाषी कार्यपत्रक व मूल्यांकन जनरेटर'}
            </h2>
          </div>
          <p className="text-sm text-blue-300 font-medium mt-1">
            {teacherUiLang === 'en' ? 'NIPUN Bharat FLN Aligned • Printable PDF Export & Interactive Tablet Solving' : 'NIPUN भारत FLN अनुरूप • प्रिंट करने योग्य PDF व डिजिटल हल'}
          </p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
          >
            <Printer className="w-4 h-4" />
            <span>{teacherUiLang === 'en' ? 'Print / Export PDF' : 'प्रिंट या PDF डाउनलोड'}</span>
          </button>
        </div>
      </div>

      {/* Control Tabs (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => { setWorksheetType('matching'); setScore(null); setUserAnswers({}); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              worksheetType === 'matching' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {teacherUiLang === 'en' ? 'Picture-Word Matching' : 'चित्र-शब्द मिलान (Matching)'}
          </button>
          <button
            onClick={() => { setWorksheetType('counting'); setScore(null); setUserAnswers({}); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              worksheetType === 'counting' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {teacherUiLang === 'en' ? 'Number & Object Counting' : 'संख्या व वस्तु गणना (Counting)'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
          <span>{teacherUiLang === 'en' ? 'Grade Level:' : 'कक्षा स्तर (Grade):'}</span>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-amber-300 font-bold focus:outline-none"
          >
            <option value="Balvatika">Balvatika (5-6 Yrs)</option>
            <option value="Grade 1">Grade 1 (6-7 Yrs)</option>
            <option value="Grade 2">Grade 2 (7-8 Yrs)</option>
          </select>
        </div>
      </div>

      {/* Printable / Interactive Worksheet Sheet */}
      <div className="worksheet-sheet bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        
        {/* Worksheet Header */}
        <div className="border-b-2 border-slate-700 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌺</span>
              <h3 className="text-xl font-black text-white">
                {teacherUiLang === 'en' ? 'Primary Multilingual Education (PALASH MTB-MLE) Worksheet' : 'झारखंड प्राथमिक शिक्षा (PALASH MTB-MLE) द्विभाषी कार्यपत्रक'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Foundational Literacy & Numeracy • Hindi + Santhali (Ol Chiki ᱚᱞ ᱪᱤᱠᱤ)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="border border-slate-600 px-3 py-1.5 rounded-lg">
              <span>{teacherUiLang === 'en' ? 'Student Name: ____________________' : 'विद्यार्थी का नाम: ____________________'}</span>
            </div>
            <div className="border border-slate-600 px-3 py-1.5 rounded-lg">
              <span>{teacherUiLang === 'en' ? 'Date: __________' : 'दिनांक: __________'}</span>
            </div>
          </div>
        </div>

        {/* Worksheet Instructions */}
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs sm:text-sm text-blue-200 font-medium flex items-center justify-between">
          <div>
            📌 <strong>{teacherUiLang === 'en' ? 'Instructions:' : 'निर्देश:'}</strong> {worksheetType === 'matching' 
              ? (teacherUiLang === 'en' ? 'Look at the picture and match with the correct Santhali word.' : 'चित्र देखें और उसके सही संथाली/हो/मुंडारी शब्द के साथ मिलान करें।')
              : (teacherUiLang === 'en' ? 'Count the leaves and select the correct Santhali numeral word.' : 'पत्तियों को गिनें और कोष्ठक में सही मातृभाषा संख्या लिखें।')}
          </div>
          <span className="text-amber-400 font-bold">{teacherUiLang === 'en' ? 'Max Marks: 50' : 'पूर्णांक: 50 अंक'}</span>
        </div>

        {/* Content: Matching Mode */}
        {worksheetType === 'matching' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingPairs.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-slate-700/50">{item.icon}</span>
                  <div>
                    <span className="text-sm font-bold text-white">{item.hindi}</span>
                    <p className="text-[11px] text-slate-400">English: {item.english}</p>
                  </div>
                </div>

                {/* Options / Answer selector */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectAnswer(item.id, item.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                      userAnswers[item.id] === item.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow'
                        : 'bg-slate-700/80 text-amber-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    <span className="font-olchiki">{item.santhali_olchiki || item.santhali_devanagari}</span>
                    <span className="text-[10px] block text-slate-300 font-normal">({item.santhali_devanagari})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content: Counting Mode */}
        {worksheetType === 'counting' && (
          <div className="space-y-4">
            {countingItems.map((c, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between flex-wrap gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="text-2xl tracking-widest">{c.icon}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="font-olchiki text-amber-300 text-lg font-bold">
                    {c.tribal}
                  </div>
                  <div className="w-24 border-b-2 border-dashed border-slate-500 text-center py-1 text-sm font-bold text-emerald-400">
                    {userAnswers[`cnt_${i}`] || (teacherUiLang === 'en' ? "[ Answer ]" : "[ उत्तर ]")}
                  </div>
                  <button
                    onClick={() => handleSelectAnswer(`cnt_${i}`, c.hindi)}
                    className="no-print px-3 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-bold border border-blue-500/30"
                  >
                    {c.hindi}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interactive Evaluation Action */}
        <div className="pt-6 border-t border-slate-700 flex flex-wrap items-center justify-between gap-4 no-print">
          <button
            onClick={handleEvaluateDigital}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
          >
            <Award className="w-5 h-5" />
            <span>{teacherUiLang === 'en' ? 'Evaluate & Grade Digitally' : 'डिजिटल मूल्यांकन करें (Check & Grade)'}</span>
          </button>

          {score !== null && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
              <span className="font-bold text-sm">
                {teacherUiLang === 'en' ? 'Score:' : 'प्राप्तांक:'} <strong className="text-xl font-black text-amber-300">{score}%</strong> ({teacherUiLang === 'en' ? 'Excellent!' : 'अति उत्तम!'})
              </span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
