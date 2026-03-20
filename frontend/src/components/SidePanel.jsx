import React from 'react';
import { getThumbUrl } from '../api';
import RarityBadge from './RarityBadge';

function SampleCard({ creature, onClick }) {
  return (
    <div
      onClick={() => onClick(creature)}
      className="cursor-pointer void-card rounded-lg overflow-hidden border border-red-900/20 hover:border-red-700/50 transition-all duration-200 hover:shadow-card-hover group"
    >
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={getThumbUrl(creature.creature_id)}
          alt={creature.title}
          className="w-full h-full object-cover pixel-art group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <p className="font-pixel text-sm text-red-400 truncate stranger-glow-sm">{creature.title}</p>
        <p className="font-body text-xs text-gray-500 truncate mb-2">{creature.subtitle}</p>
        <RarityBadge rarity={creature.rarity} />
      </div>
    </div>
  );
}

export default function SidePanel({ creatures, side, onCardClick }) {
  const items = creatures.slice(0, 3);

  return (
    <div className={`hidden xl:flex flex-col gap-4 w-52 sticky top-24 self-start ${side === 'right' ? '' : ''}`}>
      <p className="font-pixel text-xs text-gray-600 uppercase tracking-widest text-center">
        {side === 'left' ? '← Recent' : 'Recent →'}
      </p>
      {items.map((c) => (
        <SampleCard key={c.creature_id} creature={c} onClick={onCardClick} />
      ))}
      {items.length === 0 && (
        <div className="text-center text-gray-700 font-pixel text-xs py-8">
          No creatures<br />yet forged
        </div>
      )}
    </div>
  );
}
