import React, { useState } from 'react';
import { Home, ShieldCheck, Bell, VolumeX, Eye, Lock, PhoneCall, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { audioSynth } from '../utils/audioSynth';

export default function AloneAtHomeMode({ onTriggerContext }) {
  const { t, lang } = useLanguage();
  const [activeScenario, setActiveScenario] = useState(null);

  const handleScenario = (key) => {
    setActiveScenario(key);
    let msg = '';
    if (key === 'noise') msg = t('botPreset1');
    else if (key === 'doorbell') msg = t('botPreset2');
    else msg = t('visitorBtn');

    onTriggerContext(msg);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-safe)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Home size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{t('homeTitle')}</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t('homeSubtitle')}</p>
        </div>
      </div>

      {/* Scenario Triggers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '12px' }}>
        <button 
          onClick={() => handleScenario('noise')}
          className="problem-option-btn"
          style={{ background: activeScenario === 'noise' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-secondary)', borderColor: activeScenario === 'noise' ? 'var(--accent-brand)' : 'var(--bg-card-border)' }}
        >
          <VolumeX size={18} className="text-amber-400" />
          <span>{t('noiseBtn')}</span>
        </button>

        <button 
          onClick={() => handleScenario('doorbell')}
          className="problem-option-btn"
          style={{ background: activeScenario === 'doorbell' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-secondary)', borderColor: activeScenario === 'doorbell' ? 'var(--accent-brand)' : 'var(--bg-card-border)' }}
        >
          <Bell size={18} className="text-blue-400" />
          <span>{t('doorbellBtn')}</span>
        </button>

        <button 
          onClick={() => handleScenario('visitor')}
          className="problem-option-btn"
          style={{ background: activeScenario === 'visitor' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-secondary)', borderColor: activeScenario === 'visitor' ? 'var(--accent-brand)' : 'var(--bg-card-border)' }}
        >
          <Eye size={18} className="text-purple-400" />
          <span>{t('visitorBtn')}</span>
        </button>
      </div>

      {/* Guidance Cards */}
      <div style={{ marginTop: '16px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--bg-card-border)', fontSize: '0.84rem' }}>
        <div style={{ color: 'var(--accent-safe)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Lock size={15} />
          <span>Alone at Home Protocol:</span>
        </div>
        <ul style={{ listStyleType: 'disc', paddingLeft: '18px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
          <li>{t('secureRoomStep')}</li>
          <li>{t('doorbellStep')}</li>
          <li>Nearby NGO Security Lead Arjun Kapoor (+91 98333 44556) is available on standby.</li>
        </ul>
      </div>
    </div>
  );
}
