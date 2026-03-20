import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getThumbUrl } from '../api';
import RarityBadge from './RarityBadge';

export default function GalleryGrid({ creatures, total, onCardClick, loading }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-pixel text-2xl md:text-3xl text-red-400 stranger-glow">
            Community Compendium
          </h2>
          <p className="font-body text-sm text-gray-500 mt-1">
            <span className="text-red-500 font-semibold">{total}</span> creature{total !== 1 ? 's' : ''} summoned by the global community
          </p>
        </div>
      </div>

      {loading && creatures.length === 0 && (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-pixel text-gray-600">Consulting the void...</p>
        </div>
      )}

      {!loading && creatures.length === 0 && (
        <div className="text-center py-20">
          <p className="font-pixel text-4xl text-red-900 mb-4">☠</p>
          <p className="font-pixel text-gray-600 text-lg">No creatures yet.</p>
          <p className="font-body text-gray-700 text-sm mt-2">Be the first to open the rift.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        <AnimatePresence>
          {creatures.map((creature, i) => (
            <motion.div
              key={creature.creature_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.5) }}
              onClick={() => onCardClick(creature)}
              className="cursor-pointer void-card rounded-lg overflow-hidden border border-red-900/20 hover:border-red-700/50 transition-all duration-200 hover:shadow-card-hover group"
            >
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={getThumbUrl(creature.creature_id)}
                  alt={creature.title}
                  className="w-full h-full object-cover pixel-art group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-2 md:p-3">
                <p className="font-pixel text-xs md:text-sm text-red-400 truncate stranger-glow-sm leading-tight">
                  {creature.title}
                </p>
                <p className="font-body text-xs text-gray-600 truncate mb-2">{creature.subtitle}</p>
                <RarityBadge rarity={creature.rarity} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
