import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { audioSynth } from '../utils/audioSynth';

export default function CheckInTimer({ onTriggerHelp }) {
  const { t, lang } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins default
  const [showCheckInPrompt, setShowCheckInPrompt] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setShowCheckInPrompt(true);
      const promptSpeech = lang === 'hi' 
        ? "सुरक्षा जांच: क्या आप सुरक्षित हैं? कृपया पुष्टि करें।" 
        : "Safety Check-In: Are you okay? Please confirm your status.";
      audioSynth.speakText(promptSpeech, lang);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, lang]);

  const startCheckIn = (minutes) => {
    setTimeLeft(minutes * 60);
    setIsActive(true);
    setShowCheckInPrompt(false);
  };

  const handleImSafe = () => {
    setIsActive(false);
    setShowCheckInPrompt(false);
    setTimeLeft(900);
  };

  const handleNeedHelp = () => {
    setIsActive(false);
    setShowCheckInPrompt(false);
    onTriggerHelp();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel" style={{ padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} className="text-amber-400" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{t('checkinTitle')}</h3>
        </div>
        {isActive && (
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-warning)', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '8px' }}>
            ⏳ {formatTime(timeLeft)}
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{t('checkinSub')}</p>

      {!isActive ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => startCheckIn(5)} className="btn-icon-toggle" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}>
            5 min
          </button>
          <button onClick={() => startCheckIn(15)} className="btn-icon-toggle" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', borderColor: 'var(--accent-brand)', color: 'var(--accent-brand)' }}>
            15 min
          </button>
          <button onClick={() => startCheckIn(30)} className="btn-icon-toggle" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}>
            30 min
          </button>
        </div>
      ) : showCheckInPrompt ? (
        <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid var(--accent-warning)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)' }}>
            {t('timerPrompt')}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleImSafe} className="btn-action-primary" style={{ background: '#10b981', flex: 1, padding: '8px', fontSize: '0.82rem' }}>
              {t('btnImSafe')}
            </button>
            <button onClick={handleNeedHelp} className="btn-action-primary" style={{ background: '#ef4444', flex: 1, padding: '8px', fontSize: '0.82rem' }}>
              {t('btnNeedHelp')}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--accent-safe)', fontWeight: 600 }}>Active Verification Running...</span>
          <button onClick={handleImSafe} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>
            Cancel Timer
          </button>
        </div>
      )}
    </div>
  );
}
