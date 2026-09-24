import React from 'react';
import { AlertOctagon, X } from 'lucide-react';

export default function NotificationBanner({ alert, onClose }) {
  if (!alert) return null;

  return (
    <div className="predictive-alert-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertOctagon size={24} />
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>{alert.title}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.95 }}>{alert.message}</div>
        </div>
      </div>

      <button 
        onClick={onClose}
        style={{
          background: 'rgba(0,0,0,0.15)',
          border: 'none',
          color: '#000',
          padding: '4px',
          borderRadius: '50%',
          cursor: 'pointer'
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}
