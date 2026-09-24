import React, { useState, useEffect, useRef } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import SafetyDashboard from './components/SafetyDashboard';
import DemographicSelector from './components/DemographicSelector';
import NearbyVolunteersQuickWidget from './components/NearbyVolunteersQuickWidget';
import MapView from './components/MapView';
import AIChatbot from './components/AIChatbot';
import AloneAtHomeMode from './components/AloneAtHomeMode';
import TrustedCircle from './components/TrustedCircle';
import CheckInTimer from './components/CheckInTimer';
import VolunteerDirectory from './components/VolunteerDirectory';
import SOSModal from './components/SOSModal';
import FakeCallModal from './components/FakeCallModal';
import SaferRouteModal from './components/SaferRouteModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import NotificationBanner from './components/NotificationBanner';

import { analyzeContextualSafety } from './utils/aiEngine';
import mockVolunteers from '../../server/data/volunteers.json';
import mockSafeZones from '../../server/data/safeZones.json';

function MainApp() {
  const { t, lang } = useLanguage();
  const [activeMode, setActiveMode] = useState('outdoor'); // 'outdoor' | 'home' | 'unsafe'
  const [category, setCategory] = useState('women');
  
  // Modals & Banners state
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);
  const [isTrustedCircleOpen, setIsTrustedCircleOpen] = useState(false);
  const [isSaferRouteOpen, setIsSaferRouteOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [predictiveAlert, setPredictiveAlert] = useState(null);

  // Selected Destination Address
  const [selectedDestination, setSelectedDestination] = useState('Green Park Metro Gate 2, New Delhi');

  // Trusted Circle status
  const [trustedStatus, setTrustedStatus] = useState('safe');

  // Datasets
  const [volunteers, setVolunteers] = useState(mockVolunteers);
  const [safeZones, setSafeZones] = useState(mockSafeZones);

  // Map Scroll Reference
  const mapSectionRef = useRef(null);

  // Proactive Risk Calculation
  const safetyData = analyzeContextualSafety({
    mode: activeMode,
    userMessage: activeMode === 'unsafe' ? 'I feel followed in dark area' : '',
    demographic: category,
    language: lang
  });

  // Fetch live datasets from backend server
  useEffect(() => {
    fetch('http://localhost:5001/api/volunteers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setVolunteers(data.data);
      })
      .catch(err => console.log('Backend server fallback active'));

    fetch('http://localhost:5001/api/safe-zones')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setSafeZones(data.data);
      })
      .catch(err => console.log('Backend server fallback active'));
  }, []);

  // Proactive Predictive Alert simulator on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setPredictiveAlert({
        title: "⚠️ Safora Proactive Safety Warning",
        message: "Low lighting area ahead on 4th Ave. NGO Volunteer Rahul is 200m away. Redirecting to illuminated avenue."
      });
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenRouteModal = () => {
    setIsSaferRouteOpen(true);
  };

  const handleConfirmDestination = (destStr) => {
    setSelectedDestination(destStr);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Predictive System Notification Banner */}
      <NotificationBanner 
        alert={predictiveAlert} 
        onClose={() => setPredictiveAlert(null)} 
      />

      {/* Main App Header */}
      <Header 
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenFakeCall={() => setIsFakeCallOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      {/* Main Proactive Safety Dashboard */}
      <SafetyDashboard 
        safetyData={safetyData}
        mode={activeMode}
        onSelectMode={setActiveMode}
        onOpenTrustedCircle={() => setIsTrustedCircleOpen(true)}
        onFocusMapRoute={handleOpenRouteModal}
      />

      {/* Direct Nearby Volunteers Quick Call Widget */}
      <NearbyVolunteersQuickWidget volunteers={volunteers} />

      {/* Demographic Category Filter Bar */}
      <DemographicSelector 
        category={category} 
        onSelectCategory={setCategory} 
      />

      {/* Main Grid: Interactive Map & ChatGPT AI Safety Companion Chatbot */}
      <div className="main-grid" ref={mapSectionRef}>
        {/* Left Column: Clean Interactive Map with AI Guide Avatar */}
        <MapView 
          volunteers={volunteers} 
          safeZones={safeZones}
          destination={selectedDestination}
        />

        {/* Right Column: AI Safety Companion Chatbot & Context Tools */}
        <div className="sidebar-panel">
          {/* ChatGPT-style AI Safety Companion Chatbot */}
          <AIChatbot 
            mode={activeMode} 
            demographic={category} 
            onTriggerFakeCall={() => setIsFakeCallOpen(true)}
            onTriggerSOS={() => setIsSOSOpen(true)}
          />

          {/* Smart Safety Check-In Timer */}
          <CheckInTimer onTriggerHelp={() => setIsSOSOpen(true)} />

          {/* Alone-at-Home Safety Guardian widget if Home Mode active */}
          {activeMode === 'home' && (
            <AloneAtHomeMode 
              onTriggerContext={(ctxMsg) => {
                setActiveMode('home');
              }} 
            />
          )}
        </div>
      </div>

      {/* Verified NSS & NGO Volunteer Network Directory */}
      <VolunteerDirectory volunteers={volunteers} />

      {/* Modals */}
      <SOSModal 
        isOpen={isSOSOpen} 
        onClose={() => setIsSOSOpen(false)} 
        category={category}
      />

      <FakeCallModal 
        isOpen={isFakeCallOpen} 
        onClose={() => setIsFakeCallOpen(false)} 
      />

      <TrustedCircle 
        isOpen={isTrustedCircleOpen} 
        onClose={() => setIsTrustedCircleOpen(false)}
        currentStatus={trustedStatus}
        onUpdateStatus={setTrustedStatus}
      />

      <SaferRouteModal 
        isOpen={isSaferRouteOpen}
        onClose={() => setIsSaferRouteOpen(false)}
        onConfirmDestination={handleConfirmDestination}
      />

      <VoiceAssistantModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        category={category}
        mode={activeMode}
      />

      {/* Footer & Transparent Privacy Notice */}
      <footer style={{ borderTop: '1px solid var(--bg-card-border)', paddingTop: '24px', marginTop: '20px' }}>
        <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px', border: '1px solid var(--bg-card-border)' }}>
          {t('privacyNotice')}
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          <p>{t('footerText')}</p>
          <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Built on Safora AI Neural Mesh & Leaflet OpenStreetMap</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}
