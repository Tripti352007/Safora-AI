import React, { useState } from 'react';
import { Users, PhoneCall, Copy, Check, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TrustedCircle({ isOpen, onClose, currentStatus, onUpdateStatus }) {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState([
    { id: 1, name: "Dad / Parents", relation: "Family", phone: "+91 98110 99887", isPrimary: true },
    { id: 2, name: "Priya (Sister)", relation: "Sibling", phone: "+91 98765 11223", isPrimary: false },
  ]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    setContacts(prev => [...prev, {
      id: Date.now(),
      name: newName,
      relation: "Contact",
      phone: newPhone,
      isPrimary: false
    }]);
    setNewName('');
    setNewPhone('');
  };

  const handleDeleteContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const emergencyMessage = `🚨 EMERGENCY ALERT via Safora AI Safety Companion:\nUser status: ${currentStatus.toUpperCase()}\nLast available location: Hauz Khas Enclave, New Delhi (28.5457, 77.1928).\nLive Tracking: https://safora.ai/live/user-safety-771928`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(emergencyMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} className="text-blue-400" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('trustedTitle')}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t('trustedSub')}</p>

        {/* Status Switcher Chips */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>SET CURRENT STATUS:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className={`cat-chip ${currentStatus === 'safe' ? 'active elder' : ''}`} onClick={() => onUpdateStatus('safe')} style={{ fontSize: '0.78rem' }}>
              {t('statusSafe')}
            </button>
            <button className={`cat-chip ${currentStatus === 'checkin' ? 'active child' : ''}`} onClick={() => onUpdateStatus('checkin')} style={{ fontSize: '0.78rem' }}>
              {t('statusCheckin')}
            </button>
            <button className={`cat-chip ${currentStatus === 'risk' ? 'active women' : ''}`} onClick={() => onUpdateStatus('risk')} style={{ fontSize: '0.78rem' }}>
              {t('statusRisk')}
            </button>
            <button className={`cat-chip ${currentStatus === 'emergency' ? 'active' : ''}`} onClick={() => onUpdateStatus('emergency')} style={{ fontSize: '0.78rem', borderColor: '#ef4444', color: '#ef4444' }}>
              {t('statusEmergency')}
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {contacts.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.phone} • {c.relation}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <a href={`tel:${c.phone}`} className="btn-vol-call" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                  <PhoneCall size={13} />
                  <span>Call</span>
                </a>
                {!c.isPrimary && (
                  <button onClick={() => handleDeleteContact(c.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Contact Form */}
        <form onSubmit={handleAddContact} style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            placeholder={t('contactName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none' }}
          />
          <input 
            type="text" 
            placeholder={t('contactPhone')}
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none' }}
          />
          <button type="submit" className="btn-icon-toggle" style={{ background: 'var(--accent-brand)', color: '#fff', border: 'none' }}>
            <Plus size={16} />
          </button>
        </form>

        {/* Formatted Emergency Message Box */}
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.8rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--accent-danger)', marginBottom: '4px' }}>Generated Emergency Alert Text:</div>
          <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-line', fontSize: '0.78rem', marginBottom: '8px' }}>
            {emergencyMessage}
          </div>
          <button onClick={handleCopyMessage} className="btn-icon-toggle" style={{ width: '100%', justifyContent: 'center', background: copied ? 'var(--accent-safe)' : 'var(--bg-secondary)', color: copied ? '#000' : 'var(--text-primary)' }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied to Clipboard!" : t('copyEmergencyMsg')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
