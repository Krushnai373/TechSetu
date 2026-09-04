import React from 'react';
import { Volume2 } from 'lucide-react';
import { speechService } from '../../services/speechService';

export const TribalScriptText = ({
  olchiki = "",
  devanagari = "",
  phonetic = "",
  english = "",
  lang = "santhali",
  size = "md", // "sm" | "md" | "lg" | "xl"
  showAudio = true,
  onAudioPlay
}) => {
  const handleSpeak = () => {
    speechService.playChime("click");
    speechService.speak({
      text: devanagari || olchiki,
      phonetic: phonetic,
      lang: lang,
      onStart: () => {
        if (onAudioPlay) onAudioPlay();
      }
    });
  };

  const sizeClasses = {
    sm: "text-base font-semibold",
    md: "text-xl font-bold",
    lg: "text-2xl font-black",
    xl: "text-3xl lg:text-4xl font-black"
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Primary Tribal Script (Ol Chiki for Santhali) */}
      <div className="flex items-center gap-3">
        {olchiki && (
          <span className={`font-olchiki ${sizeClasses[size]} text-amber-400 drop-shadow-sm tracking-wide`}>
            {olchiki}
          </span>
        )}
        {showAudio && (
          <button
            onClick={handleSpeak}
            className="p-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-transform active:scale-90 border border-amber-500/30"
            title="Listen Pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Devanagari Transliteration */}
      {devanagari && (
        <span className="text-sm font-medium text-slate-200">
          देवनागरी: <span className="text-orange-300 font-semibold">{devanagari}</span>
        </span>
      )}

      {/* Roman Phonetic */}
      {phonetic && (
        <span className="text-xs text-slate-400 italic">
          Phonetic: &ldquo;{phonetic}&rdquo;
        </span>
      )}
    </div>
  );
};
