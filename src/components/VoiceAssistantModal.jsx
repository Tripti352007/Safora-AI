import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { analyzeContextualSafety } from '../utils/aiEngine';
import { audioSynth } from '../utils/audioSynth';

export default function VoiceAssistantModal({ isOpen, onClose, category, mode }) {
  const { t, lang } = useLanguage();
  
  // Status states: 'idle' | 'requesting' | 'listening' | 'processing' | 'responding' | 'error'
  const [voiceState, setVoiceState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Check browser support
  const isSpeechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      audioSynth.stopSpeech();
    };
  }, []);

  if (!isOpen) return null;

  const startVoiceAssistant = async () => {
    setErrorMessage('');

    // Feature Detection Check
    if (!isSpeechSupported) {
      setVoiceState('error');
      setErrorMessage("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari, or type your message below.");
      return;
    }

    // Step 1: Request Microphone Permission explicitly
    setVoiceState('requesting');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop stream track once permission confirmed so browser releases mic handle
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.warn("Microphone permission error:", err);
      setVoiceState('error');
      setErrorMessage("Microphone access is required for voice input. Please allow microphone access in your browser settings.");
      return;
    }

    // Step 2: Initialize Speech Recognition instance
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

      rec.onstart = () => {
        setVoiceState('listening');
      };

      rec.onresult = (event) => {
        const spokenText = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setTranscript(spokenText);

        if (event.results[0].isFinal) {
          setVoiceState('processing');
          handleProcessVoiceQuery(spokenText);
        }
      };

      rec.onerror = (event) => {
        console.warn("Speech Recognition Event Error:", event.error);
        let userErr = "Voice input error. Please try speaking again.";
        if (event.error === 'not-allowed') {
          userErr = "Microphone access was denied. Please enable microphone permissions in your browser settings.";
        } else if (event.error === 'no-speech') {
          userErr = "No speech was detected. Please tap the microphone and speak clearly.";
        } else if (event.error === 'audio-capture') {
          userErr = "No microphone hardware was detected on your device.";
        } else if (event.error === 'network') {
          userErr = "Network connection issue required for speech recognition.";
        }
        setErrorMessage(userErr);
        setVoiceState('error');
      };

      rec.onend = () => {
        // Reset state if listening ended without proceeding to processing
        setVoiceState(prev => (prev === 'listening' || prev === 'requesting' ? 'idle' : prev));
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setErrorMessage("Failed to start voice recognition. Please try typing your message.");
      setVoiceState('error');
    }
  };

  const stopVoiceAssistant = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setVoiceState('idle');
  };

  const handleProcessVoiceQuery = (queryText) => {
    const textStr = queryText || transcript;
    if (!textStr.trim()) {
      setVoiceState('idle');
      return;
    }

    setVoiceState('processing');

    // Feed text to SAME AI Safety Engine (analyzeContextualSafety)
    setTimeout(() => {
      const res = analyzeContextualSafety({
        mode,
        userMessage: textStr,
        demographic: category,
        language: lang
      });

      setVoiceResult(res);
      setVoiceState('responding');
      setIsSpeaking(true);

      // Trigger Text-to-Speech
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

  const sampleQueries = [
    lang === 'hi' ? "मुझे सुनसान रास्ते पर डर लग रहा है" : "I am alone at home and heard a strange noise",
    lang === 'hi' ? "कोई बार-बार दरवाजे की घंटी बजा रहा है" : "Someone keeps ringing my doorbell",
    lang === 'hi' ? "मुझे लग रहा है कि कोई मेरा पीछा कर रहा है" : "I think someone is following me",
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} className="text-purple-400" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Voice Safety Assistant</h2>
          </div>
          <button onClick={() => { handleStopSpeech(); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Feature Detection Warning if unsupported */}
        {!isSpeechSupported && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', border: '1px solid var(--accent-danger)', fontSize: '0.82rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>Voice input is not supported in this browser. Please use Chrome, Edge, or Safari, or type your message below.</span>
          </div>
        )}

        {/* Status Display Badge */}
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <button 
            className={`btn-voice-trigger ${voiceState === 'listening' ? 'listening' : ''}`}
            onClick={voiceState === 'listening' ? stopVoiceAssistant : startVoiceAssistant}
            disabled={!isSpeechSupported}
            style={{ width: '84px', height: '84px', margin: '0 auto 12px' }}
          >
            {voiceState === 'listening' ? <MicOff size={36} /> : <Mic size={36} />}
          </button>

          {/* Dynamic Voice Status Badge */}
          <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>
            {voiceState === 'listening' && <span style={{ color: 'var(--accent-danger)' }}>🔴 Listening... Speak clearly now</span>}
            {voiceState === 'requesting' && <span style={{ color: 'var(--accent-warning)' }}>⏳ Requesting Microphone Permission...</span>}
            {voiceState === 'processing' && <span style={{ color: 'var(--accent-brand)' }}>⚙️ Processing Speech...</span>}
            {voiceState === 'responding' && <span style={{ color: 'var(--accent-safe)' }}>🔊 AI is responding...</span>}
            {voiceState === 'idle' && <span style={{ color: 'var(--text-muted)' }}>Tap Microphone to Speak</span>}
            {voiceState === 'error' && <span style={{ color: 'var(--accent-danger)' }}>⚠️ Voice Action Required</span>}
          </div>
        </div>

        {/* Error Message Box */}
        {errorMessage && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--accent-danger)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--accent-danger)', textAlign: 'center' }}>
            {errorMessage}
            <button onClick={startVoiceAssistant} style={{ display: 'block', margin: '6px auto 0', background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
              Try Again 🔄
            </button>
          </div>
        )}

        {/* Sample Queries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Or tap a sample question:
          </span>
          {sampleQueries.map((q, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setTranscript(q);
                handleProcessVoiceQuery(q);
              }}
              className="cat-chip"
              style={{ fontSize: '0.78rem', padding: '6px 12px', justifyContent: 'center' }}
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Speech-to-Text Input Bar */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcessVoiceQuery()}
            placeholder={t('voicePlaceholder')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--bg-card-border)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button 
            onClick={() => handleProcessVoiceQuery()}
            className="btn-action-primary" 
            style={{ width: 'auto', padding: '10px 18px' }}
          >
            <Send size={16} />
          </button>
        </div>

        {/* Spoken Response Result Box & Stop Speaking Button */}
        {voiceResult && (
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.12)', border: '1px solid var(--accent-safe)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-safe)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Volume2 size={16} />
                <span>AI SAFETY SOLUTION ({voiceResult.riskLevel}):</span>
              </span>

              {/* Stop Speaking Button */}
              {isSpeaking && (
                <button 
                  onClick={handleStopSpeech}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'var(--accent-danger)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <VolumeX size={14} />
                  <span>Stop Speaking</span>
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {voiceResult.recommendation}
            </div>

            {voiceResult.steps && voiceResult.steps.length > 0 && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
                {voiceResult.steps.map((st, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>{st}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
