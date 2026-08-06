import React from 'react';

/**
 * Signature visual for the product: a thali-style plate divided into
 * "saved" and "wasted" portions, rendered as an SVG ring so it reads
 * instantly as food, not a generic donut chart.
 */
const PlateGauge = ({ savedPercent = 80, label = 'Meals saved', size = 180 }) => {
  const clamped = Math.max(0, Math.min(100, savedPercent));
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const savedLength = (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* plate rim */}
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 3} fill="#FBFAF2" stroke="#E4DFC8" strokeWidth="6" />
          {/* wasted (base) ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EADFC4"
            strokeWidth="14"
          />
          {/* saved (progress) ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2F4B3C"
            strokeWidth="14"
            strokeDasharray={`${savedLength} ${circumference - savedLength}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
          {/* center fork+spoon mark */}
          <circle cx={size / 2} cy={size / 2} r={radius - 20} fill="#F2F0E3" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl text-forest">{clamped}%</span>
        </div>
      </div>
      <p className="mt-3 font-body text-sm text-ink/70 text-center max-w-[10rem]">{label}</p>
    </div>
  );
};

export default PlateGauge;
