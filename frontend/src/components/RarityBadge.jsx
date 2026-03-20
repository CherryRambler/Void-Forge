import React from 'react';

const RARITY_STYLES = {
  Common:    'rarity-common',
  Rare:      'rarity-rare',
  Epic:      'rarity-epic',
  Legendary: 'rarity-legendary',
};

const RARITY_ICONS = {
  Common: '◆',
  Rare: '✦',
  Epic: '❋',
  Legendary: '★',
};

export default function RarityBadge({ rarity = 'Common', size = 'sm' }) {
  const cls = RARITY_STYLES[rarity] || RARITY_STYLES.Common;
  const icon = RARITY_ICONS[rarity] || '◆';
  const textSize = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span
      className={`${cls} ${textSize} rounded font-pixel inline-flex items-center gap-1 uppercase tracking-widest font-bold`}
    >
      {icon} {rarity}
    </span>
  );
}
