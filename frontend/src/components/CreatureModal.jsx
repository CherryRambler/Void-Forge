import React, { useRef, useEffect, useCallback } from 'react';
import { X, Download, ImageIcon, CreditCard } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import RarityBadge from './RarityBadge';
import StatBar from './StatBar';
import { getFullUrl } from '../api';

function slugify(str) {
  return str.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
}

export default function CreatureModal({ creature, onClose }) {
  const cardRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const downloadCard = useCallback(async (mode) => {
    if (!cardRef.current) return;
    const toastId = toast.loading('🖼 Rendering card...', {
      style: { background: '#120018', color: '#b44fff', fontFamily: 'VT323, monospace', fontSize: '16px' },
    });
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#030005',
        logging: false,
      });
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slugify(creature.title)}-${mode === 'card' ? 'card' : 'image'}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss(toastId);
      toast.success('✅ Card downloaded!', {
        style: { background: '#0a0010', color: '#66ff66', fontFamily: 'VT323, monospace', fontSize: '16px' },
      });
    } catch {
      toast.dismiss(toastId);
      toast.error('❌ Download failed');
    }
  }, [creature]);

  if (!creature) return null;

  const stats = creature.stats || {};
  const imageUrl = getFullUrl(creature.creature_id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={cardRef}
        className="relative void-card card-corner-glow vhs-grain scanlines rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-500 hover:text-red-400 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="mb-4">
            <RarityBadge rarity={creature.rarity} size="lg" />
            <h2 className="font-pixel text-3xl md:text-4xl text-red-400 stranger-glow mt-2 leading-tight">
              {creature.title}
            </h2>
            <p className="font-pixel text-lg text-purple-400 rift-glow">{creature.subtitle}</p>
          </div>

          {/* Image */}
          <div className="relative aspect-square w-full max-w-sm mx-auto mb-6 rounded overflow-hidden border border-red-900/30 shadow-red-glow">
            <img
              src={imageUrl}
              alt={creature.title}
              className="w-full h-full object-cover pixel-art"
              crossOrigin="anonymous"
            />
            {/* Red corner glow overlay */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-red-700/20 rounded-full blur-xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-red-700/20 rounded-full blur-xl" />
          </div>

          {/* Stats */}
          <div className="mb-6 bg-void-950/80 rounded-lg p-4 border border-red-900/20">
            <h3 className="font-pixel text-sm text-gray-500 uppercase tracking-widest mb-3">Shadow Stats</h3>
            <StatBar stat="intensity"     value={stats.intensity     ?? 50} />
            <StatBar stat="stealth"       value={stats.stealth       ?? 50} />
            <StatBar stat="rift_affinity" value={stats.rift_affinity ?? 50} />
          </div>

          {/* Lore */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-pixel text-sm text-red-500 uppercase tracking-widest mb-1">Origin</h3>
              <p className="text-gray-300 text-sm font-body leading-relaxed">{creature.backstory}</p>
            </div>
            <div>
              <h3 className="font-pixel text-sm text-purple-400 uppercase tracking-widest mb-1">Ability</h3>
              <p className="text-gray-300 text-sm font-body leading-relaxed">{creature.ability}</p>
            </div>
            <div>
              <h3 className="font-pixel text-sm text-yellow-600 uppercase tracking-widest mb-1">Weakness</h3>
              <p className="text-gray-300 text-sm font-body leading-relaxed">{creature.weakness}</p>
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-red-900/20">
            <button
              onClick={() => downloadCard('card')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-300 font-pixel text-sm uppercase tracking-wider transition-all duration-200"
            >
              <CreditCard className="w-4 h-4" />
              Download Full Card
            </button>
            <button
              onClick={() => downloadCard('image')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded bg-void-800 hover:bg-void-700 border border-gray-700 text-gray-300 font-pixel text-sm uppercase tracking-wider transition-all duration-200"
            >
              <ImageIcon className="w-4 h-4" />
              Image Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
