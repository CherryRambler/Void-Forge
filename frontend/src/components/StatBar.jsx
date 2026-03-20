import React from 'react';

const STAT_CONFIG = {
  intensity: {
    label: 'Intensity',
    color: 'from-red-900 to-red-500',
    icon: '🔥',
  },
  stealth: {
    label: 'Stealth',
    color: 'from-purple-900 to-purple-400',
    icon: '👁',
  },
  rift_affinity: {
    label: 'Rift Affinity',
    color: 'from-blue-900 to-blue-400',
    icon: '⚡',
  },
};

export default function StatBar({ stat, value }) {
  const config = STAT_CONFIG[stat] || { label: stat, color: 'from-gray-700 to-gray-400', icon: '◆' };
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="font-pixel text-sm text-gray-300 uppercase tracking-wider">
          {config.icon} {config.label}
        </span>
        <span className="font-pixel text-sm text-red-400 stranger-glow-sm">{value}</span>
      </div>
      <div className="h-2 bg-void-900 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${config.color} transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
