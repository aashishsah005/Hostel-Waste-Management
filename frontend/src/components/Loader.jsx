import React from 'react';

const Loader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-ink/60">
    <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin mb-3" />
    <p className="font-body text-sm">{label}</p>
  </div>
);

export default Loader;
