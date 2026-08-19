import React, { useState } from 'react';
import { PhoneCall, ShieldCheck, MapPin, Star, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NearbyVolunteersQuickWidget({ volunteers = [] }) {
  const { t, lang } = useLanguage();
  const [signaledId, setSignaledId] = useState(null);

  const handleSignal = (id) => {
    setSignaledId(id);
    setTimeout(() => setSignaledId(null), 3000);
  };

  // Show top 3 closest volunteers
  const topVolunteers = volunteers.slice(0, 3);

  return (
    <div className="glass-panel" style={{ padding: '18px', borderLeft: '5px solid var(--accent-safe)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(5, 150, 105, 0.2)', color: 'var(--accent-safe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>
              {lang === 'hi' ? "⚡ निकटतम सत्यापित स्वयंसेवक (Direct Call)" : "⚡ Nearby Active Safety Volunteers"}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {lang === 'hi' ? "आपके लाइव स्थान के पास तुरंत सहायता के लिए उपलब्ध" : "Verified NSS & NGO guardians within 1 km"}
            </p>
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-safe)', background: 'rgba(5, 150, 105, 0.15)', padding: '4px 8px', borderRadius: '6px' }}>
          3 Active
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {topVolunteers.map(vol => (
          <div key={vol.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--bg-card-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={vol.avatar} alt={vol.name} style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--accent-safe)', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{vol.name}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{vol.organization}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent-safe)', fontWeight: 600, marginTop: '2px' }}>
                  <MapPin size={11} />
                  <span>{vol.distanceKm} km away • {vol.status}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <a href={`tel:${vol.phone}`} className="btn-vol-call" style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem', justifyContent: 'center' }}>
                <PhoneCall size={13} />
                <span>Call Now</span>
              </a>
              <button 
                onClick={() => handleSignal(vol.id)}
                className="btn-icon-toggle"
                style={{
                  padding: '7px 10px',
                  fontSize: '0.75rem',
                  background: signaledId === vol.id ? 'var(--accent-safe)' : 'var(--bg-primary)',
                  color: signaledId === vol.id ? '#fff' : 'var(--text-primary)'
                }}
              >
                {signaledId === vol.id ? <CheckCircle size={13} /> : "Signal GPS"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
