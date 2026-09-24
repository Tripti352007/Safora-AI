import React from 'react';
import { UserCheck, Heart, Shield, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DemographicSelector({ category, onSelectCategory }) {
  const { t } = useLanguage();

  const categories = [
    { id: 'women', label: t('catWomen'), icon: <Heart size={18} />, colorClass: 'women' },
    { id: 'child', label: t('catChild'), icon: <UserCheck size={18} />, colorClass: 'child' },
    { id: 'elder', label: t('catElder'), icon: <Shield size={18} />, colorClass: 'elder' },
    { id: 'general', label: t('catGeneral'), icon: <Users size={18} />, colorClass: 'general' },
  ];

  return (
    <div className="category-bar">
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {t('selectCategory')}:
      </span>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`cat-chip ${cat.colorClass} ${category === cat.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat.id)}
        >
          {cat.icon}
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
