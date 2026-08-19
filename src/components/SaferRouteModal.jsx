import React, { useState } from 'react';
import { MapPin, Navigation, ShieldCheck, Sparkles, X, Home, Building2, Shield, HeartPulse } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SaferRouteModal({ isOpen, onClose, onConfirmDestination }) {
  const { t, lang } = useLanguage();
  const [destination, setDestination] = useState('');

  if (!isOpen) return null;

  const presets = [
    { label: lang === 'hi' ? "निकटतम मेट्रो स्टेशन" : "Nearest Metro Station", val: "Green Park Metro Gate 2, New Delhi", icon: <Building2 size={16} /> },
    { label: lang === 'hi' ? "घर (Home)" : "Home", val: "Hauz Khas Residential Enclave", icon: <Home size={16} /> },
    { label: lang === 'hi' ? "सफदरजंग पुलिस स्टेशन" : "Safdarjung Police Station", val: "Safdarjung Police Booth #4", icon: <Shield size={16} /> },
    { label: lang === 'hi' ? "AIIMS अस्पताल" : "AIIMS Trauma Centre", val: "AIIMS Hospital Emergency Gate", icon: <HeartPulse size={16} /> },
  ];

  const handleSelectPreset = (val) => {
    setDestination(val);
    onConfirmDestination(val);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;
    onConfirmDestination(destination);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.2)', color: 'var(--accent-safe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Navigation size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {lang === 'hi' ? "सुरक्षित मार्ग गंतव्य चुनें" : "Plan Illuminated Safe Route"}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {lang === 'hi' ? "आप कहाँ जाना चाहते हैं? AI सर्वोत्तम रोशन मार्ग की गणना करेगा।" : "Where are you heading? AI will plot the brightest, most secure corridor."}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <MapPin size={18} className="text-emerald-400" />
            <input 
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={lang === 'hi' ? 'गंतव्य पता लिखें...' : 'Type destination address...'}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.88rem' }}
            />
          </div>
          <button type="submit" className="btn-action-primary" style={{ width: 'auto', padding: '10px 18px' }}>
            {lang === 'hi' ? "नेविगेट" : "Plot Route"}
          </button>
        </form>

        {/* Presets Grid */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {lang === 'hi' ? "त्वरित सुरक्षित स्थान (Quick Safe Destinations):" : "Popular Safe Destinations:"}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {presets.map((p, idx) => (
              <button 
                key={idx}
                onClick={() => handleSelectPreset(p.val)}
                className="problem-option-btn"
                style={{ justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="text-emerald-400">{p.icon}</span>
                  <span style={{ fontWeight: 600 }}>{p.label}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.val}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Safety Guarantee Footer */}
        <div style={{ padding: '10px 14px', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '8px', border: '1px solid rgba(5, 150, 105, 0.2)', fontSize: '0.78rem', color: 'var(--accent-safe)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} />
          <span>94% Lighting Rating & Active NSS Companion Escort Guaranteed</span>
        </div>
      </div>
    </div>
  );
}
