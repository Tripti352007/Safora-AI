import React from 'react';
import { Shield, Globe, Moon, Sun, AlertTriangle, PhoneCall, Home, Compass, AlertCircle, Mic } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Header({ activeMode, onSelectMode, onOpenSOS, onOpenFakeCall, onOpenVoiceModal }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header glass-panel">
      {/* Left Brand Area */}
      <div className="header-brand">
        <div className="brand-icon-box">
          <Shield size={26} />
        </div>
        <div>
          <h1 className="brand-title gradient-text-brand">{t('appName')}</h1>
          <p className="brand-sub">{t('tagline')}</p>
        </div>
      </div>

      {/* Center Mode Selection Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '0 12px' }}>
        <button 
          className={`cat-chip ${activeMode === 'outdoor' ? 'active' : ''}`}
          onClick={() => onSelectMode('outdoor')}
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
        >
          <Compass size={15} />
          <span>{t('modeOutdoor')}</span>
        </button>

        <button 
          className={`cat-chip ${activeMode === 'home' ? 'active elder' : ''}`}
          onClick={() => onSelectMode('home')}
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
        >
          <Home size={15} />
          <span>{t('modeHome')}</span>
        </button>

        <button 
          className={`cat-chip ${activeMode === 'unsafe' ? 'active women' : ''}`}
          onClick={() => onSelectMode('unsafe')}
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
        >
          <AlertCircle size={15} />
          <span>{t('modeUnsafe')}</span>
        </button>
      </div>

      {/* Right Tools Area */}
      <div className="header-controls">
        {/* Voice Assistant Tool */}
        <button 
          className="btn-icon-toggle" 
          onClick={onOpenVoiceModal}
          title={t('voiceBtn')}
          style={{ borderColor: 'var(--accent-brand)', color: 'var(--accent-brand)' }}
        >
          <Mic size={15} />
          <span>Voice</span>
        </button>

        {/* Fake Call Quick Tool */}
        <button 
          className="btn-icon-toggle" 
          onClick={onOpenFakeCall}
          title={t('fakeCallSub')}
        >
          <PhoneCall size={15} className="text-amber-400" />
          <span>{t('fakeCallBtn')}</span>
        </button>

        {/* Language Switcher (EN <-> HI) */}
        <button className="btn-icon-toggle" onClick={toggleLanguage}>
          <Globe size={15} />
          <span>{t('languageToggle')}</span>
        </button>

        {/* Theme Switcher (Dark <-> Light) */}
        <button className="btn-icon-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Single Unified SOS Button */}
        <button className="btn-sos-header" onClick={onOpenSOS}>
          <AlertTriangle size={17} />
          <span>{t('sosButton')}</span>
        </button>
      </div>
    </header>
  );
}
