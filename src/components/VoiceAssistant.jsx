import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Send, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { analyzeContextualSafety } from '../utils/aiEngine';
import { audioSynth } from '../utils/audioSynth';

export default function VoiceAssistant({ category, mode = 'outdoor' }) {
  const { t, lang } = useLanguage();
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'responding' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const isSpeechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      audioSynth.stopSpeech();
    };
  }, []);

  const toggleListening = async () => {
    setErrorMessage('');

    if (!isSpeechSupported) {
      setVoiceState('error');
      setErrorMessage("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (voiceState === 'listening') {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setVoiceState('idle');
      return;
    }

    // Request Mic Permission explicitly
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      setVoiceState('error');
      setErrorMessage("Microphone access required. Please allow mic access in your browser settings.");
      return;
    }

    // Initialize SpeechRecognition
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

      rec.onstart = () => setVoiceState('listening');

      rec.onresult = (event) => {
        const text = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(text);

        if (event.results[0].isFinal) {
          setVoiceState('processing');
          handleProcessVoiceInput(text);
        }
      };

      rec.onerror = (event) => {
        let userErr = "Voice input error. Please try speaking again.";
        if (event.error === 'not-allowed') userErr = "Microphone permission denied.";
        else if (event.error === 'no-speech') userErr = "No speech detected. Please speak clearly.";
        setErrorMessage(userErr);
        setVoiceState('error');
      };

      rec.onend = () => {
        setVoiceState(prev => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setErrorMessage("Could not start speech recognition.");
      setVoiceState('error');
    }
  };

  const handleProcessVoiceInput = (textToProcess) => {
    const inputStr = textToProcess || transcript;
    if (!inputStr.trim()) {
      setVoiceState('idle');
      return;
    }

    setVoiceState('processing');

    setTimeout(() => {
      // Use SAME AI Safety Engine
      const res = analyzeContextualSafety({
        mode,
        userMessage: inputStr,
        demographic: category,
        language: lang
      });

      setVoiceResult(res);
      setVoiceState('responding');
      setIsSpeaking(true);

      audioSynth.speakText(res.recommendation, lang, () => {
        setIsSpeaking(false);
        setVoiceState('idle');
      });
    }, 400);
  };

  const handleStopSpeech = () => {
    audioSynth.stopSpeech();
    setIsSpeaking(false);
    setVoiceState('idle');
  };

  return (
    <div className="voice-card glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
        <Sparkles size={18} className="text-purple-400" />
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{t('voiceBtn')}</h3>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t('voiceSubtitle')}</p>

      {/* Mic Button */}
      <button 
        className={`btn-voice-trigger ${voiceState === 'listening' ? 'listening' : ''}`}
        onClick={toggleListening}
        disabled={!isSpeechSupported}
      >
        {voiceState === 'listening' ? <MicOff size={32} /> : <Mic size={32} />}
      </button>

      <div style={{ fontSize: '0.85rem', fontWeight: 700, margin: '8px 0' }}>
        {voiceState === 'listening' && <span style={{ color: 'var(--accent-danger)' }}>🔴 Listening... Speak clearly</span>}
        {voiceState === 'processing' && <span style={{ color: 'var(--accent-brand)' }}>⚙️ Processing...</span>}
        {voiceState === 'responding' && <span style={{ color: 'var(--accent-safe)' }}>🔊 AI is responding...</span>}
        {voiceState === 'idle' && <span style={{ color: 'var(--text-muted)' }}>Tap Microphone to Speak</span>}
        {voiceState === 'error' && <span style={{ color: 'var(--accent-danger)' }}>⚠️ Voice Action Required</span>}
      </div>

      {errorMessage && (
        <div style={{ fontSize: '0.78rem', color: 'var(--accent-danger)', marginBottom: '8px' }}>
          {errorMessage}
        </div>
      )}

      {/* Input Bar */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input 
          type="text" 
          value={transcript} 
          onChange={(e) => setTranscript(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleProcessVoiceInput()}
          placeholder={t('voicePlaceholder')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-card-border)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            outline: 'none'
          }}
        />
        <button 
          onClick={() => handleProcessVoiceInput()}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'var(--accent-brand)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Send size={15} />
        </button>
      </div>

      {/* Voice Result Output Box */}
      {voiceResult && (
        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(5, 150, 105, 0.12)', border: '1px solid var(--accent-safe)', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-safe)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Volume2 size={15} />
              <span>AI Response ({voiceResult.riskLevel}):</span>
            </span>

            {isSpeaking && (
              <button onClick={handleStopSpeech} style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--accent-danger)', color: '#fff', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <VolumeX size={12} />
                <span>Stop Speaking</span>
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            {voiceResult.recommendation}
          </div>
        </div>
      )}
    </div>
  );
}
