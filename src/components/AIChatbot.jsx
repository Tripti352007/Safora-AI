import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Mic, MicOff, Sparkles, Volume2, Shield, PhoneCall, Clock, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { analyzeContextualSafety } from '../utils/aiEngine';
import { audioSynth } from '../utils/audioSynth';

export default function AIChatbot({ mode, demographic, onTriggerFakeCall, onTriggerSOS }) {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: lang === 'hi' 
        ? "नमस्ते! मैं आपका साफ़ोरा AI सुरक्षा साथी हूँ। आप अपने आसपास की स्थिति, घर की सुरक्षा या किसी भी असहजता के बारे में मुझसे बेझिझक पूछ सकते हैं।"
        : "Hello! I am your Safora AI Safety Companion. Ask me anything about your current journey, strange noises at home, or uncomfortable situations.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

      rec.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setInputVal(spokenText);
        handleSendMessage(spokenText);
      };

      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      setRecognition(rec);
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition not supported in this browser. Please type your message.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {}
    }
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      const analysis = analyzeContextualSafety({
        mode,
        userMessage: query,
        demographic,
        language: lang
      });

      let botReplyText = `${analysis.recommendation}\n\n`;
      if (analysis.steps && analysis.steps.length > 0) {
        botReplyText += analysis.steps.join('\n');
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReplyText,
        riskBadge: `${analysis.riskBadgeColor} ${analysis.riskLevel}`,
        showActions: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      audioSynth.speakText(analysis.recommendation, lang);
    }, 500);
  };

  const handlePresetClick = (presetText) => {
    setInputVal(presetText);
    handleSendMessage(presetText);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '460px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--bg-card-border)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}>
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{t('botTitle')}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('botSubtitle')}</p>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px 0', borderBottom: '1px solid var(--bg-card-border)' }}>
        <button className="cat-chip" onClick={() => handlePresetClick(t('botPreset1'))} style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}>
          🏠 {t('botPreset1')}
        </button>
        <button className="cat-chip" onClick={() => handlePresetClick(t('botPreset2'))} style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}>
          🔔 {t('botPreset2')}
        </button>
        <button className="cat-chip" onClick={() => handlePresetClick(t('botPreset3'))} style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}>
          🚨 {t('botPreset3')}
        </button>
      </div>

      {/* Chat Messages List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map(msg => (
          <div 
            key={msg.id} 
            style={{ 
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {msg.riskBadge && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-secondary)', width: 'fit-content', border: '1px solid var(--bg-card-border)' }}>
                {msg.riskBadge}
              </span>
            )}
            <div style={{
              padding: '10px 14px',
              borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              background: msg.sender === 'user' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'var(--bg-secondary)',
              color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
              fontSize: '0.85rem',
              lineHeight: '1.45',
              whiteSpace: 'pre-line',
              border: msg.sender === 'bot' ? '1px solid var(--bg-card-border)' : 'none'
            }}>
              {msg.text}

              {/* Action Buttons inside Bot Message */}
              {msg.showActions && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--bg-card-border)', flexWrap: 'wrap' }}>
                  <a href="tel:+919876543210" className="btn-vol-call" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                    <PhoneCall size={12} />
                    <span>Call NSS Lead</span>
                  </a>
                  <button onClick={onTriggerFakeCall} className="btn-icon-toggle" style={{ padding: '4px 8px', fontSize: '0.72rem', background: 'var(--bg-primary)' }}>
                    <Phone size={12} className="text-amber-400" />
                    <span>Fake Call</span>
                  </button>
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.timestamp}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--bg-card-border)' }}>
        <button 
          onClick={toggleListening}
          className={`btn-icon-toggle ${isListening ? 'listening' : ''}`}
          style={{ background: isListening ? 'var(--accent-danger)' : 'var(--bg-secondary)', color: '#fff' }}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <input 
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={t('botPlaceholder')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-card-border)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />

        <button 
          onClick={() => handleSendMessage()}
          className="btn-action-primary" 
          style={{ width: 'auto', padding: '8px 16px', borderRadius: '8px' }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
