// Web Audio API Synthesizer for Emergency Siren, Ringtone & SpeechSynthesis

class AudioSynth {
  constructor() {
    this.audioCtx = null;
    this.sirenOscillator = null;
    this.sirenGain = null;
    this.isSirenPlaying = false;
    this.ringInterval = null;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play High-Decibel Emergency Police Siren
  startSiren() {
    this.initContext();
    if (this.isSirenPlaying) return;

    this.isSirenPlaying = true;
    const ctx = this.audioCtx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.5, ctx.currentTime);

    // LFO frequency sweep from 600Hz to 1200Hz back and forth
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    
    let isHigh = false;
    this.sirenInterval = setInterval(() => {
      if (!this.isSirenPlaying || !this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      if (isHigh) {
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
      } else {
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.3);
      }
      isHigh = !isHigh;
    }, 350);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    this.sirenOscillator = osc;
    this.sirenGain = gain;
  }

  stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.sirenOscillator) {
      try {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
      } catch (e) {}
      this.sirenOscillator = null;
    }
    this.isSirenPlaying = false;
  }

  // Play phone ringtone simulation
  playRingtone() {
    this.initContext();
    const ctx = this.audioCtx;
    
    const playRingCycle = () => {
      if (!this.audioCtx) return;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.8);
      osc2.stop(now + 1.8);
    };

    playRingCycle();
    this.ringInterval = setInterval(playRingCycle, 3000);
  }

  stopRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  // Speak text using SpeechSynthesis
  speakText(text, lang = 'en-US', onEndCallback) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      if (onEndCallback) {
        utterance.onend = onEndCallback;
        utterance.onerror = onEndCallback;
      }
      window.speechSynthesis.speak(utterance);
    } else if (onEndCallback) {
      onEndCallback();
    }
  }

  stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeaking() {
    return 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }
}

export const audioSynth = new AudioSynth();
