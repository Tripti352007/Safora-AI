import React from 'react';
import { ShieldCheck, AlertTriangle, MapPin, ArrowRight, PhoneCall, Compass } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SafetyDashboard({ 
  safetyData, 
  mode, 
  onOpenTrustedCircle,
  onFocusMapRoute 
}) {
  const { t } = useLanguage();

  const getStatusBadge = () => {
    switch (safetyData.riskLevel) {
      case 'EMERGENCY':
        return { text: t('dashStatusEmergency'), bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', icon: '🔴' };
      case 'HIGH':
        return { text: t('dashStatusRisk'), bg: 'rgba(249, 115, 22, 0.2)', border: '#f97316', icon: '🟠' };
      case 'MODERATE':
        return { text: t('dashStatusCheckin'), bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', icon: '🟡' };
      default:
        return { text: t('dashStatusOk'), bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', icon: '🟢' };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="glass-panel" style={{ padding: '22px', borderLeft: `6px solid ${status.border}` }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', fontWeight: 700 }}>
            SAFETY STATUS
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <span style={{ fontSize: '1.4rem' }}>{status.icon}</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{status.text}</h2>
          </div>
        </div>

        {/* Current Mode Badge */}
        <div style={{ background: 'var(--bg-secondary)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--bg-card-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={16} className="text-blue-400" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>MODE:</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {mode === 'outdoor' ? t('modeOutdoor') : mode === 'home' ? t('modeHome') : t('modeUnsafe')}
          </span>
        </div>
      </div>

      {/* Main Grid: Explainable Risk Reason & Recommended Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '12px' }}>
        {/* Risk Reason Card */}
        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <AlertTriangle size={15} />
            <span>{t('reasonTitle')} ({safetyData.riskLevel})</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.45' }}>
            "{safetyData.reason}"
          </p>
        </div>

        {/* Recommended Actions Card */}
        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-safe)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <ShieldCheck size={15} />
            <span>{t('recommendationTitle')}</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.45' }}>
            {safetyData.recommendation}
          </p>
        </div>
      </div>

      {/* Optional Safer Alternative Detour Banner */}
      {safetyData.saferAlternative && (
        <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(79, 70, 229, 0.12)', border: '1px solid var(--accent-brand)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={18} className="text-indigo-400" />
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-brand)' }}>{t('saferAlternativeTitle')}</span>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{safetyData.saferAlternative}</div>
            </div>
          </div>
          <button onClick={onFocusMapRoute} className="btn-icon-toggle" style={{ background: 'var(--accent-brand)', color: '#fff', border: 'none', fontSize: '0.8rem' }}>
            <span>{t('viewSaferRoute')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Single Clean Action Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--bg-card-border)' }}>
        <button onClick={onFocusMapRoute} className="btn-icon-toggle" style={{ flex: 1, minWidth: '160px', justifyContent: 'center' }}>
          <MapPin size={16} />
          <span>{t('viewSaferRoute')}</span>
        </button>

        <button onClick={onOpenTrustedCircle} className="btn-icon-toggle" style={{ flex: 1, minWidth: '160px', justifyContent: 'center' }}>
          <PhoneCall size={16} />
          <span>{t('contactTrusted')}</span>
        </button>
      </div>
    </div>
  );
}
