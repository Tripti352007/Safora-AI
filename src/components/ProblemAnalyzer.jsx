import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, PhoneCall, Smile, Sparkles, Navigation, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { analyzeSafetyRisk } from '../utils/aiEngine';
import { audioSynth } from '../utils/audioSynth';

export default function ProblemAnalyzer({ category, volunteers = [], onTriggerAlert }) {
  const { t, lang } = useLanguage();
  const [selectedProblem, setSelectedProblem] = useState('lonely_place');
  const [customNote, setCustomNote] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeJoke, setActiveJoke] = useState(null);

  const problemOptions = [
    { id: 'lonely_place', label: t('probLonely'), icon: '🌑' },
    { id: 'crowded_place', label: t('probCrowded'), icon: '👥' },
    { id: 'following_stalking', label: t('probStalking'), icon: '🚨' },
    { id: 'medical_fall', label: t('probMedical'), icon: '🚑' },
    { id: 'transport_issue', label: t('probTransport'), icon: '🚕' },
  ];

  const handleAnalyze = async () => {
    setIsLoading(true);
    setActiveJoke(null);

    try {
      // Try backend Express API first
      const response = await fetch('http://localhost:5001/api/analyze-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemType: selectedProblem,
          demographic: category,
          userNote: customNote,
          language: lang
        })
      });
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data);
        if (data.predictiveAlert) {
          onTriggerAlert(data.predictiveAlert);
        }
      } else {
        // Fallback to local AI engine
        const fallback = analyzeSafetyRisk(selectedProblem, category, lang);
        setAnalysisResult(fallback);
      }
    } catch (err) {
      // Offline / fallback to local engine
      const fallback = analyzeSafetyRisk(selectedProblem, category, lang);
      setAnalysisResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTellJoke = () => {
    if (analysisResult?.panicJokes && analysisResult.panicJokes.length > 0) {
      const randomJ = analysisResult.panicJokes[Math.floor(Math.random() * analysisResult.panicJokes.length)];
      setActiveJoke(randomJ);
      audioSynth.speakText(randomJ, lang);
    } else {
      const defaultJ = lang === 'hi'
        ? "अगर भीड़ में कोई अजीब हरकत करे, तो ज़ोर से पूछिए: 'भैया जी 500 का नोट आपका गिरा है?' - सबका ध्यान भटक जाएगा! 😅"
        : "If someone gets too uncomfortably close in a crowd, ask loudly: 'Did you drop this 500 Rupee note?' - Everyone stops and looks! 😅";
      setActiveJoke(defaultJ);
      audioSynth.speakText(defaultJ, lang);
    }
  };

  return (
    <div className="problem-card glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldAlert size={22} className="text-amber-400" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t('askProblem')}</h3>
      </div>

      {/* Options List */}
      <div className="problem-select-grid">
        {problemOptions.map(opt => (
          <button
            key={opt.id}
            className={`problem-option-btn ${selectedProblem === opt.id ? 'selected' : ''}`}
            onClick={() => setSelectedProblem(opt.id)}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Details Input */}
      <input
        type="text"
        value={customNote}
        onChange={(e) => setCustomNote(e.target.value)}
        placeholder={lang === 'hi' ? 'कोई अतिरिक्त जानकारी लिखें...' : 'Add any specific detail...'}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--bg-card-border)',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          outline: 'none'
        }}
      />

      {/* Action Button */}
      <button 
        className="btn-action-primary" 
        onClick={handleAnalyze}
        disabled={isLoading}
      >
        {isLoading ? t('analyzing') : t('analyzeBtn')}
      </button>

      {/* AI Analysis & Substitute Output Box */}
      {analysisResult && (
        <div className={`solution-box ${analysisResult.riskLevel === 'CRITICAL' ? 'critical' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: analysisResult.riskLevel === 'CRITICAL' ? 'var(--accent-danger)' : 'var(--accent-safe)' }}>
              {t('riskLevel')}: {analysisResult.riskLevel} ({analysisResult.riskScore}%)
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {analysisResult.recommendedHelpline}
            </span>
          </div>

          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            {t('substituteHeader')}
          </div>

          <div className="solution-text">
            {analysisResult.substituteSolution}
          </div>

          {/* Volunteer Connect Quick Action */}
          {volunteers[0] && (
            <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--bg-card-border)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{volunteers[0].name} ({volunteers[0].type})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{volunteers[0].organization} • {volunteers[0].phone}</div>
              </div>
              <a href={`tel:${volunteers[0].phone}`} className="btn-vol-call" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                <PhoneCall size={14} />
                <span>Call</span>
              </a>
            </div>
          )}

          {/* Crowded place De-stress Joke Generator */}
          {selectedProblem === 'crowded_place' && (
            <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px dashed var(--bg-card-border)' }}>
              <button 
                onClick={handleTellJoke}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 179, 0, 0.15)',
                  color: 'var(--accent-warning)',
                  border: '1px solid var(--accent-warning)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <Smile size={16} />
                <span>{t('tellJoke')}</span>
              </button>

              {activeJoke && (
                <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(255, 179, 0, 0.1)', borderRadius: '8px', fontSize: '0.83rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                  "{activeJoke}"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
