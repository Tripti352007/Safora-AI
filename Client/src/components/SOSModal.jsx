import React, { useState, useEffect } from 'react';
import { AlertTriangle, PhoneCall, Volume2, VolumeX, ShieldCheck, X, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { audioSynth } from '../utils/audioSynth';

export default function SOSModal({ isOpen, onClose, category }) {
  const { t, lang } = useLanguage();
  const [isSirenActive, setIsSirenActive] = useState(true);
  const [silentPin, setSilentPin] = useState('');
  const [pinDispatched, setPinDispatched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      audioSynth.startSiren();
      setIsSirenActive(true);
    } else {
      audioSynth.stopSiren();
    }
    return () => audioSynth.stopSiren();
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSiren = () => {
    if (isSirenActive) {
      audioSynth.stopSiren();
      setIsSirenActive(false);
    } else {
      audioSynth.startSiren();
      setIsSirenActive(true);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    setPinDispatched(true);
    setTimeout(() => {
      onClose();
      setPinDispatched(false);
      setSilentPin('');
    }, 2000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ border: '2px solid var(--accent-danger)', boxShadow: 'var(--shadow-glow-red)' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={28} className="text-red-500 animate-pulse" />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--accent-danger)' }}>{t('sosButton')} ACTIVE</h2>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Siren Sound Control */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 23, 68, 0.15)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
            {isSirenActive ? <Volume2 size={20} className="text-red-500" /> : <VolumeX size={20} />}
            <span>{isSirenActive ? "High-Decibel Siren Blaring..." : "Siren Muted"}</span>
          </div>
          <button 
            className="btn-icon-toggle"
            onClick={toggleSiren}
            style={{ background: isSirenActive ? 'var(--accent-danger)' : 'var(--bg-secondary)', color: '#fff', border: 'none' }}
          >
            {isSirenActive ? "Mute Siren" : "Start Siren"}
          </button>
        </div>

        {/* Dispatch Status Box */}
        <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--bg-card-border)', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--accent-safe)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={16} />
            <span>Emergency Signals Dispatched to:</span>
          </div>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <li>National Emergency Helpline <strong>112</strong></li>
            <li>{category === 'women' ? 'Women Helpline 1091' : category === 'child' ? 'Childline 1098' : 'Senior Helpline 14567'}</li>
            <li>Nearest NSS Volunteer Lead (Priya Sharma - 0.3km)</li>
            <li>Emergency Contacts (Simulated SMS Broadcast)</li>
          </ul>
        </div>

        {/* Direct Emergency Call Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <a href="tel:1091" className="btn-vol-call" style={{ background: '#ec4899', color: '#fff' }}>
            <PhoneCall size={16} />
            <span>1091 Women</span>
          </a>
          <a href="tel:112" className="btn-vol-call" style={{ background: '#ef4444', color: '#fff' }}>
            <PhoneCall size={16} />
            <span>112 Emergency</span>
          </a>
          <a href="tel:1098" className="btn-vol-call" style={{ background: '#f59e0b', color: '#fff' }}>
            <PhoneCall size={16} />
            <span>1098 Childline</span>
          </a>
          <a href="tel:14567" className="btn-vol-call" style={{ background: '#10b981', color: '#fff' }}>
            <PhoneCall size={16} />
            <span>14567 Senior</span>
          </a>
        </div>

        {/* Silent Panic PIN input */}
        <div style={{ borderTop: '1px solid var(--bg-card-border)', paddingTop: '14px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Lock size={14} />
            <span>{t('silentPinTitle')}</span>
          </div>
          {pinDispatched ? (
            <div style={{ color: 'var(--accent-safe)', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
              ✓ Silent Distress Signal Transmitted Covertly
            </div>
          ) : (
            <form onSubmit={handlePinSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="password" 
                maxLength={4}
                value={silentPin}
                onChange={(e) => setSilentPin(e.target.value)}
                placeholder="4-Digit PIN"
                style={{
                  width: '120px',
                  padding: '8px',
                  borderRadius: '6px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                className="btn-action-primary" 
                style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}
              >
                Silent Panic Trigger
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
