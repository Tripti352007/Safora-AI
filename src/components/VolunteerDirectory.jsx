import React, { useState } from 'react';
import { PhoneCall, ShieldCheck, MapPin, Star, CheckCircle, Search, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VolunteerDirectory({ volunteers = [] }) {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'NSS' | 'NGO'
  const [searchQuery, setSearchQuery] = useState('');
  const [signaledVolId, setSignaledVolId] = useState(null);

  const handleSignalVolunteer = (id) => {
    setSignaledVolId(id);
    setTimeout(() => {
      setSignaledVolId(null);
    }, 3000);
  };

  const filteredVolunteers = volunteers.filter(vol => {
    const matchesType = filterType === 'ALL' || vol.type.toUpperCase() === filterType;
    const matchesSearch = vol.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          vol.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vol.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="volunteers-section" style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('volunteerSectionTitle')}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('volunteerSub')}</p>
        </div>

        {/* Filter Chips & Search Bar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <Search size={14} className="text-gray-400" />
            <input 
              type="text"
              placeholder="Search volunteer or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.8rem', width: '140px' }}
            />
          </div>

          <button 
            className={`cat-chip ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {t('filterAll')}
          </button>
          <button 
            className={`cat-chip ${filterType === 'NSS' ? 'active elder' : ''}`}
            onClick={() => setFilterType('NSS')}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {t('filterNSS')}
          </button>
          <button 
            className={`cat-chip ${filterType === 'NGO' ? 'active women' : ''}`}
            onClick={() => setFilterType('NGO')}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {t('filterNGO')}
          </button>
        </div>
      </div>

      <div className="volunteers-grid">
        {filteredVolunteers.map(vol => (
          <div key={vol.id} className="volunteer-card glass-panel">
            <div className="volunteer-top">
              <img src={vol.avatar} alt={vol.name} className="vol-avatar" />
              <div style={{ flex: 1 }}>
                <div className="vol-name">{vol.name}</div>
                <div className="vol-org">{vol.organization} • {vol.role}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
                  <Star size={13} fill="#f59e0b" />
                  <span>{vol.rating}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>• {vol.distanceKm} km away</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span className="badge-tag">
                <ShieldCheck size={12} />
                <span>{vol.type}</span>
              </span>
              {vol.verifications.map((ver, idx) => (
                <span key={idx} className="badge-tag" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-brand)' }}>
                  {ver}
                </span>
              ))}
            </div>

            {/* Address */}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} />
              <span>{vol.address}</span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <a href={`tel:${vol.phone}`} className="btn-vol-call">
                <PhoneCall size={14} />
                <span>{t('callVolunteer')}</span>
              </a>

              <button 
                onClick={() => handleSignalVolunteer(vol.id)}
                className="btn-icon-toggle"
                style={{
                  justifyContent: 'center',
                  background: signaledVolId === vol.id ? 'var(--accent-safe)' : 'var(--bg-secondary)',
                  color: signaledVolId === vol.id ? '#000' : 'var(--text-primary)'
                }}
              >
                {signaledVolId === vol.id ? (
                  <>
                    <CheckCircle size={14} />
                    <span>Signal Sent</span>
                  </>
                ) : (
                  <span>{t('chatVolunteer')}</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
