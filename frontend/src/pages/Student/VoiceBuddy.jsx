import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';
import { offlineEngine } from '../../services/offlineTranslation';
import { AudioWaveform } from '../../components/common/AudioWaveform';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  MessageCircle, 
  Send,
  Star,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VoiceBuddy = () => {
  const { selectedLanguage, addStudentReward } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [inputText, setInputText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const [chatHistory, setChatHistory] = useState([
    {
      sender: "buddy",
      text: "जोहार प्यारे दोस्त! मैं तुम्हारा पलाश बाल-मित्र हूँ। मुझसे अपनी मातृभाषा या हिंदी में कुछ भी पूछो! 🐯",
      tribal_text: selectedLanguage === 'santhali' 
        ? "ᱡᱚᱦᱟᱨ ᱫᱩᱞᱟᱹᱲ ᱜᱟᱛᱮ! ᱤᱧ ᱥᱟᱶ ᱨᱚᱯᱚᱲ ᱢᱮ᱾"
        : selectedLanguage === 'ho' 
        ? "जोहार दुलड़ गाति! आईंग सांव कजि में।" 
        : "जोहार दुलड़ गाति! आईंग सांव जगड़ में।",
      phonetic: selectedLanguage === 'santhali'
        ? "Johar dular gate! Iny saw ropor me."
        : selectedLanguage === 'ho'
        ? "Johar dular gaati! Aying saw kaji men."
        : "Johar dular gaati! Aying saw jagad men.",
      icon: "🐯"
    }
  ]);

  const quickPrompts = [
    { title: "🌺 पलाश का फूल", query: "पलाश का फूल क्या है?" },
    { title: "🔢 1 से 5 तक गिनती", query: "मुझे 1 से 5 तक गिनती सिखाओ" },
    { title: "🌳 पेड़ और पानी", query: "पेड़ और पानी को क्या कहते हैं?" },
    { title: "📖 बिरसा मुंडा की कहानी", query: "बिरसा मुंडा जी की कहानी बताओ" }
  ];

  const handleSendPrompt = async (query) => {
    if (!query || !query.trim()) return;

    speechService.playChime('click');
    setIsReplying(true);

    const newHistory = [...chatHistory, { sender: "child", text: query }];
    setChatHistory(newHistory);
    setInputText('');

    let replyHindi = "";
    let replyTribal = "";
    let replyPhonetic = "";

    if (query.includes("1 से 5") || query.includes("गिनती")) {
      if (selectedLanguage === "santhali") {
        replyHindi = "संथाली में 1 से 5: 1 (मिद), 2 (बार), 3 (पे), 4 (पोन), 5 (मोणे)! 🌟";
        replyTribal = "᱑ (ᱢᱤᱫ), ᱒ (ᱵᱟᱨ), ᱓ (ᱯᱮ), ᱔ (ᱯᱳᱱ), ᱕ (ᱢᱚᱬᱮ)! ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ!";
        replyPhonetic = "Mid, Bar, Pe, Pon, Mone! Adi napay!";
      } else if (selectedLanguage === "ho") {
        replyHindi = "हो भाषा में 1 से 5: 1 (मियद), 2 (बारिया), 3 (आपिया), 4 (उपूनिया), 5 (मोड़ेया)! 🌟";
        replyTribal = "1 (मियद), 2 (बारिया), 3 (आपिया), 4 (उपूनिया), 5 (मोड़ेया)! एतों बगे!";
        replyPhonetic = "Miyad, Bariya, Aapiya, Upuniya, Modeya! Eton bage!";
      } else {
        replyHindi = "मुण्डारी में 1 से 5: 1 (मियाद), 2 (बारिया), 3 (आपिया), 4 (उपूनिया), 5 (मोड़ेया)! 🌟";
        replyTribal = "1 (मियाद), 2 (बारिया), 3 (आपिया), 4 (उपूनिया), 5 (मोड़ेया)! एतों बुगि!";
        replyPhonetic = "Miyaad, Bariya, Aapiya, Upuniya, Modeya! Eton bugi!";
      }
    } else if (query.includes("पलाश") || query.includes("फूल")) {
      if (selectedLanguage === "santhali") {
        replyHindi = "पलाश झारखंड का राज्य पुष्प है! संथाली में फूल को 'बाहा' (Baha) कहते हैं। 🌺";
        replyTribal = "ᱯᱟᱞᱟᱥ ᱫᱚ ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱨᱮᱱᱟᱜ ᱵᱟᱦᱟ ᱠᱟᱱᱟ᱾";
        replyPhonetic = "Palash do Jharkhand renag baha kana.";
      } else if (selectedLanguage === "ho") {
        replyHindi = "पलाश झारखंड का राज्य फूल है! हो भाषा में फूल को 'बा' (Baa) कहते हैं। 🌺";
        replyTribal = "पलाश झारखंड रेया बा ताना। बा को एतों बगे!";
        replyPhonetic = "Palash Jharkhand reya baa tana. Baa ko eton bage!";
      } else {
        replyHindi = "पलाश झारखंड का राज्य फूल है! मुण्डारी में फूल को 'बा' (Baa) कहते हैं। 🌺";
        replyTribal = "पलाश झारखंड रेयाः बा तनाः।";
        replyPhonetic = "Palash Jharkhand reyaah baa tanaah.";
      }
    } else if (query.includes("पेड़") || query.includes("पानी")) {
      if (selectedLanguage === "santhali") {
        replyHindi = "पेड़ को संथाली में 'दारे' (Dare) और पानी को 'दाग' (Daag) कहते हैं! 🌳💧";
        replyTribal = "ᱫᱟᱨᱮ (Dare) ᱟᱨ ᱫᱟᱜ (Daag) - ᱫᱟᱜ ᱜᱮ ᱡᱤᱣᱤ ᱠᱟᱱᱟ᱾";
        replyPhonetic = "Dare aar Daag - Daag ge jiwi kana.";
      } else if (selectedLanguage === "ho") {
        replyHindi = "पेड़ को हो भाषा में 'दारु' (Daru) और पानी को 'दाः' (Daah) कहते हैं! 🌳💧";
        replyTribal = "दारु (Daru) आर दाः (Daah) - दाः गे जिउ ताना।";
        replyPhonetic = "Daru aar Daah - Daah ge jiu tana.";
      } else {
        replyHindi = "पेड़ को मुण्डारी में 'दारु' (Daru) और पानी को 'दाः' (Daah) कहते हैं! 🌳💧";
        replyTribal = "दारु (Daru) आर दाः (Daah) - दाः गे जिउ तनाः।";
        replyPhonetic = "Daru aar Daah - Daah ge jiu tanaah.";
      }
    } else if (query.includes("बिरसा")) {
      replyHindi = "भगवान बिरसा मुंडा हमारे महानायक हैं! उन्होंने जल, जंगल और जमीन की रक्षा के लिए संघर्ष किया।";
      if (selectedLanguage === "santhali") {
        replyTribal = "ᱫᱷᱟᱹᱨᱛᱤ ᱟᱵᱟ ᱵᱤᱨᱥᱟ ᱢᱩᱱᱰᱟ ᱫᱚ ᱩᱞᱜᱩᱞᱟᱱ ᱞᱟᱹᱲᱦᱟᱹᱭ ᱠᱮᱫᱟᱭ᱾";
        replyPhonetic = "Dharti Aaba Birsa Munda do Ulgulan larhay keday.";
      } else {
        replyTribal = "धरती आबा बिरसा मुंडा दाः, बुरु आर हासा बांचाव ते उलगुलान बाई केदाय।";
        replyPhonetic = "Dharti Aaba Birsa Munda daah, buru aar hasa banchaaw te Ulgulan baai keday.";
      }
    } else {
      const tr = offlineEngine.translate(query, "hindi", selectedLanguage);
      replyHindi = `बहुत सुंदर! आपकी भाषा में इसे कहते हैं: ${tr.devanagari}`;
      replyTribal = tr.displayScript || tr.devanagari;
      replyPhonetic = tr.phonetic;
    }

    setTimeout(() => {
      setIsReplying(false);
      setChatHistory(prev => [
        ...prev,
        {
          sender: "buddy",
          text: replyHindi,
          tribal_text: replyTribal,
          phonetic: replyPhonetic,
          icon: "🐯"
        }
      ]);

      speechService.speak({
        text: replyTribal || replyHindi,
        phonetic: replyPhonetic || replyHindi,
        lang: selectedLanguage
      });

      speechService.playChime('reward');
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      addStudentReward(5);
    }, 500);
  };

  const handleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      speechService.playChime('click');
      setIsListening(true);
      setInterimText('');
      
      speechService.startListening({
        onInterim: (txt) => setInterimText(txt),
        onResult: ({ text }) => {
          setIsListening(false);
          setInputText(text);
          handleSendPrompt(text);
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-950/80 via-slate-900 to-amber-950/80 border border-amber-500/30 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
            🐯
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              पलाश बाल-मित्र (AI Voice Buddy)
            </h2>
            <p className="text-xs sm:text-sm text-amber-300 font-medium">
              मातृभाषा: <strong className="uppercase">{selectedLanguage}</strong> • सवाल पूछो और नए शब्द सीखो!
            </p>
          </div>
        </div>

        <button
          onClick={() => setChatHistory([chatHistory[0]])}
          className="p-2.5 rounded-2xl bg-slate-800 text-slate-400 hover:text-slate-200"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="glass-card rounded-3xl p-6 border-slate-800 space-y-4 min-h-[360px] max-h-[460px] overflow-y-auto">
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              msg.sender === 'child' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 border ${
              msg.sender === 'child'
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}>
              {msg.sender === 'child' ? '🧒' : msg.icon || '🐯'}
            </div>

            <div className={`p-4 rounded-3xl max-w-lg space-y-2 ${
              msg.sender === 'child'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md'
                : 'bg-slate-900 border border-amber-500/30 text-slate-100 rounded-tl-none shadow-lg'
            }`}>
              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
              
              {msg.tribal_text && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-olchiki text-amber-300 text-base font-black">
                      {msg.tribal_text}
                    </span>
                    {msg.phonetic && (
                      <p className="text-[11px] text-slate-400 italic">&ldquo;{msg.phonetic}&rdquo;</p>
                    )}
                  </div>
                  <button
                    onClick={() => speechService.speak({
                      text: msg.tribal_text || msg.text,
                      phonetic: msg.phonetic,
                      lang: selectedLanguage
                    })}
                    className="p-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300"
                    title="Listen"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isReplying && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
              🐯
            </div>
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-amber-300 text-xs font-bold animate-pulse flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>मित्र सोच रहा है... (Thinking)</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(qp.query)}
            className="px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 text-xs font-bold whitespace-nowrap border border-slate-800 hover:border-amber-500/40 transition-all active:scale-95 shadow-sm"
          >
            {qp.title}
          </button>
        ))}
      </div>

      {isListening && (
        <div className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30">
          <AudioWaveform isActive={true} color="#F59E0B" height={35} />
          <p className="text-center text-xs text-amber-300 font-bold mt-1">
            बोलिए... {interimText || "सुन रहा हूँ!"}
          </p>
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(inputText)}
            placeholder="यहाँ लिखो या माइक दबाकर बोलो..."
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
          />
        </div>

        <button
          onClick={handleMic}
          className={`p-4 rounded-2xl font-black flex items-center justify-center transition-all shadow-xl active:scale-90 ${
            isListening
              ? 'bg-rose-600 text-white animate-voice-pulse'
              : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110 shadow-orange-500/30'
          }`}
          title="Tap to speak"
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={() => handleSendPrompt(inputText)}
          disabled={!inputText.trim()}
          className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 disabled:opacity-40 transition-all active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
