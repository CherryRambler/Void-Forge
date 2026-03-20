import React, { useRef, useEffect, useState } from 'react';
import { getThumbUrl } from '../api';
import RarityBadge from './RarityBadge';

export default function MobileCarousel({ creatures, onCardClick }) {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const posRef = useRef(0);


  // Infinite scroll via JS animation (works better cross-browser than CSS for touch pause)
  const items = creatures.length > 0 ? [...creatures, ...creatures] : [];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    const speed = 0.5; // px per frame
    let rafId;

    const step = () => {
      if (!isPaused) {
        posRef.current -= speed;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(posRef.current) >= halfWidth) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [items.length, isPaused]);

  if (items.length === 0) return null;

  return (
    <div className="xl:hidden w-full overflow-hidden py-4">
      <div
        ref={trackRef}
        className="flex gap-4 w-max"
        style={{ willChange: 'transform' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {items.map((creature, i) => (
          <div
            key={`${creature.creature_id}-${i}`}
            onClick={() => onCardClick(creature)}
            className="cursor-pointer void-card rounded-lg overflow-hidden border border-red-900/20 hover:border-red-700/50 transition-all duration-200 hover:shadow-red-glow-sm flex-shrink-0 w-36"
          >
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={getThumbUrl(creature.creature_id)}
                alt={creature.title}
                className="w-full h-full object-cover pixel-art"
                loading="lazy"
              />
            </div>
            <div className="p-2">
              <p className="font-pixel text-xs text-red-400 truncate leading-tight">{creature.title}</p>
              <div className="mt-1">
                <RarityBadge rarity={creature.rarity} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
