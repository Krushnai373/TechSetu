import React, { useState, useEffect } from 'react';
import { speechService } from '../services/speechService';
import { 
  Volume2, 
  VolumeX, 
  Subtitles, 
  Languages, 
  Sparkles,
  User,
  Radio,
  Eye,
  EyeOff
} from 'lucide-react';

export const LiveCaptionOverlay = ({
  caption,
  userRole = 'student', // 'student' | 'teacher'
  preferredLang = 'english', // For teacher: 'english' | 'hindi'
  autoPlayAudio = true,
  onToggleAudio = null
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Play synthesized speech whenever a new caption arrives if autoPlayAudio is enabled
  useEffect(() => {
    if (!caption || !autoPlayAudio) return;

    if (userRole === 'student') {
      // Student receives Santali TTS
      const speakText = caption.olchiki || caption.santhali || caption.translatedText || caption.phonetic;
      const phoneticText = caption.phonetic || caption.devanagari;
      if (speakText) {
        speechService.speak({
          text: speakText,
          phonetic: phoneticText,
          lang: 'santhali',
          rate: 0.88
        });
      }
    } else {
      // Teacher receives English/Hindi TTS
      const speakText = preferredLang === 'hindi' 
        ? (caption.hindi || caption.translatedText || caption.sourceText) 
        : (caption.english || caption.translatedText || caption.sourceText);
      if (speakText) {
        speechService.speak({
          text: speakText,
          lang: preferredLang === 'hindi' ? 'hi-IN' : 'en-US',
          rate: 0.95
        });
      }
    }
  }, [caption?.id, caption?.timestamp, autoPlayAudio, userRole, preferredLang]);

  if (!isVisible || !caption || (!caption.sourceText && !caption.translatedText)) {
    return null;
  }

  const isTeacherSpeaking = caption.speakerRole === 'teacher';
  const speakerLabel = caption.speakerName || (isTeacherSpeaking ? 'Teacher' : 'Student');

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl z-30 pointer-events-auto transition-all animate-fadeIn">
      <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          isTeacherSpeaking ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
        }`} />

        {/* Caption Header Pill */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              isTeacherSpeaking 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{isTeacherSpeaking ? '👩‍🏫 ' + speakerLabel : '🎒 ' + speakerLabel}</span>
            </span>

            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Languages className="w-3 h-3 text-slate-500" />
              {isTeacherSpeaking ? (
                userRole === 'student' ? 'Hindi/English ➔ Santhali (Ol Chiki)' : 'Teacher Speech'
              ) : (
                userRole === 'teacher' ? `Santhali ➔ ${preferredLang === 'hindi' ? 'Hindi' : 'English'}` : 'Your Question'
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleAudio && (
              <button
                onClick={onToggleAudio}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  autoPlayAudio ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={autoPlayAudio ? "Translated Audio TTS On (Click to Mute Audio)" : "Translated Audio TTS Muted (Subtitles Only)"}
              >
                {autoPlayAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="text-[10px] hidden sm:inline">
                  {autoPlayAudio ? 'TTS Audio Active' : 'Subtitles Only'}
                </span>
              </button>
            )}

            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 text-xs"
              title="Hide Subtitles"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Translation Body */}
        <div className="space-y-1.5">
          {/* Main Target Translation (Highlighted) */}
          {userRole === 'student' ? (
            <div>
              {/* Primary: Ol Chiki Script */}
              <div className="font-olchiki text-emerald-300 font-bold text-lg sm:text-xl tracking-wide leading-relaxed drop-shadow-sm">
                {caption.olchiki || caption.santhali || caption.translatedText}
              </div>
              {/* Secondary: Phonetic Pronunciation for Beginners */}
              {caption.phonetic && (
                <div className="text-slate-400 text-xs italic font-sans mt-0.5">
                  Phonetic: {caption.phonetic}
                </div>
              )}
              {/* Original Teacher Speech in Hindi/English */}
              <div className="text-slate-500 text-xs mt-1 border-t border-slate-800/80 pt-1">
                Original: {caption.sourceText || caption.hindi}
              </div>
            </div>
          ) : (
            <div>
              {/* Teacher View: Preferred Language (English or Hindi) */}
              <div className="text-amber-300 font-bold text-base sm:text-lg leading-relaxed drop-shadow-sm">
                {preferredLang === 'hindi' 
                  ? (caption.hindi || caption.translatedText || caption.sourceText) 
                  : (caption.english || caption.translatedText || caption.sourceText)}
              </div>
              {/* Original Student Santali Speech */}
              <div className="text-slate-400 text-xs font-olchiki mt-1 border-t border-slate-800/80 pt-1 flex items-center gap-2">
                <span>Santali:</span>
                <span className="text-emerald-400 font-bold">{caption.olchiki || caption.sourceText}</span>
                {caption.phonetic && <span className="text-slate-500 italic">({caption.phonetic})</span>}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
