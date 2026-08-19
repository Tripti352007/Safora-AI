import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, User, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { audioSynth } from '../utils/audioSynth';

export default function FakeCallModal({ isOpen, onClose }) {
  const { t, lang } = useLanguage();
  const [callState, setCallState] = useState('ringing'); // 'ringing', 'answered', 'ended'

  useEffect(() => {
    if (isOpen) {
      setCallState('ringing');
      audioSynth.playRingtone();
    } else {
      audioSynth.stopRingtone();
    }
    return () => audioSynth.stopRingtone();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAnswer = () => {
    audioSynth.stopRingtone();
    setCallState('answered');

    // Synthesize caller speech
    const speechText = t('fakeCallerSpeech');
    audioSynth.speakText(speechText, lang);
  };

  const handleDecline = () => {
    audioSynth.stopRingtone();
    setCallState('ended');
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content fake-call-modal">
        <div style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {callState === 'ringing' ? 'Incoming Call...' : callState === 'answered' ? '00:04 Connected' : 'Call Ended'}
        </div>

        <div className="call-avatar-big">
          <User size={48} className="text-gray-300" />
        </div>

        <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: '4px 0' }}>
          {t('fakeCallerName')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#aaa' }}>Mobile +91 98110 99887</p>

        {callState === 'answered' && (
          <div style={{ marginTop: '20px', padding: '14px', background: '#111', borderRadius: '10px', fontSize: '0.85rem', color: '#4ade80', textAlign: 'center', border: '1px solid #222' }}>
            <Volume2 size={18} style={{ margin: '0 auto 6px' }} />
            <span>"{t('fakeCallerSpeech')}"</span>
          </div>
        )}

        <div className="call-action-btns">
          {callState === 'ringing' && (
            <button className="btn-call-accept" onClick={handleAnswer}>
              <Phone size={28} />
            </button>
          )}

          <button className="btn-call-decline" onClick={handleDecline}>
            <PhoneOff size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
