import React from 'react';

const StatCard = ({ label, value, sublabel, accent = 'forest', icon }) => {
  const accentMap = {
    forest: 'text-forest border-forest/20 bg-forest/5',
    turmeric: 'text-turmeric-dark border-turmeric/30 bg-turmeric/10',
    clay: 'text-clay border-clay/30 bg-clay/10',
    sage: 'text-forest-light border-sage/30 bg-sage/10',
  };
  return (
    <div className="bg-cardcream rounded-card shadow-soft p-5 border border-ink/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-ink/50 font-semibold">{label}</span>
        {icon && <span className={`text-lg w-8 h-8 rounded-full flex items-center justify-center border ${accentMap[accent]}`}>{icon}</span>}
      </div>
      <div className="font-display text-3xl text-ink">{value}</div>
      {sublabel && <div className="text-xs text-ink/50 mt-1 font-mono">{sublabel}</div>}
    </div>
  );
};

export default StatCard;
