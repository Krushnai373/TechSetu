// Web Speech STT and Synthesizer Service with Latency Benchmarking

export class SpeechAudioService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.audioCtx = null;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'hi-IN'; // Hindi recognition for teachers
    }
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    return this.audioCtx;
  }

  // Play synthetic feedback sound effect (success chime, click, celebration)
  playChime(type = "success") {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "success") {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "click") {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "reward") {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }

  // Start Voice Recognition with latency timing
  startListening({ onResult, onInterim, onError, onEnd, lang = "hi-IN", continuous = false }) {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      if (onError) onError("Speech Recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // Configure language
    this.recognition.lang = lang;
    this.recognition.continuous = continuous;

    const sttStart = performance.now();
    this.isListening = true;

    this.recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim && onInterim) {
        onInterim(interim);
      }

      if (final && onResult) {
        const sttLatency = performance.now() - sttStart;
        onResult({ text: final, sttLatencyMs: Math.round(sttLatency) });
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.warn("Recognition start warning:", err);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Speak tribal or hindi text with pitch adaptation
  speak({ text, phonetic, lang = "santhali", rate = 0.9, pitch = 1.0, onStart, onEnd }) {
    if (!this.synth) return;

    this.synth.cancel(); // Stop any pending speech

    const ttsStart = performance.now();
    // Speak phonetic transliteration or devanagari script
    const utteranceText = phonetic || text;
    if (!utteranceText) return;

    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.rate = rate;
    utterance.pitch = pitch;

    const voices = this.synth.getVoices();
    if (lang === 'english' || lang === 'en-US') {
      const enVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US') || v.lang.includes('en'));
      if (enVoice) utterance.voice = enVoice;
    } else {
      const indicVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
      if (indicVoice) utterance.voice = indicVoice;
    }

    utterance.onstart = () => {
      const ttsLatency = performance.now() - ttsStart;
      if (onStart) onStart({ ttsLatencyMs: Math.round(ttsLatency) });
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }
}

export const speechService = new SpeechAudioService();
