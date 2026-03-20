import React, { useState } from 'react';
import { Shuffle, Zap, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateCreature } from '../api';

const RANDOM_PROMPTS = [
  'A shadowy beast with glowing eyes emerging from ancient ruins',
  'A crystalline creature that feeds on moonlight',
  'A corrupted forest guardian twisted by dark magic',
  'An entity made of living shadows and whispered regrets',
  'A deep-sea horror that has learned to breathe fear',
  'A fractured time-wraith with eyes across all dimensions',
  'A plague doctor made of smoke and old bones',
  'A mirror demon that steals the reflections of the living',
  'A storm elemental born from the screams of the forgotten',
  'A chimeric beast fused from the nightmares of a thousand sleepers',
  'A void serpent that coils around stars and extinguishes them',
  'A bone-reaper forged in the fires beneath the shadow realm',
  'A child of entropy that unravels reality at the seams',
  'A spectral predator that hunts thoughts rather than bodies',
  'A cosmic maw at the edge of existence, always hungry',
];

export default function GenerationForm({ onCreatureGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const randomize = () => {
    const p = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setPrompt(p);
  };

  const handleGenerate = async () => {
    if (prompt.trim().length < 5) {
      toast.error('Prompt too short — feed the void more!', { icon: '❌' });
      return;
    }

    setLoading(true);

    // Step 1 toast
    const t1 = toast.loading('🌀 Channeling creature from the void...', {
      style: { background: '#120018', color: '#ff4444', border: '1px solid #660000', fontFamily: 'VT323, monospace', fontSize: '16px' },
    });

    try {
      // Brief delay then swap to step 2
      await new Promise((r) => setTimeout(r, 1500));
      toast.dismiss(t1);
      const t2 = toast.loading('📜 Inscribing dark lore...', {
        style: { background: '#120018', color: '#b44fff', border: '1px solid #330066', fontFamily: 'VT323, monospace', fontSize: '16px' },
      });

      const creature = await generateCreature(prompt);

      toast.dismiss(t2);
      toast.success(`☠ ${creature.title} has been summoned!`, {
        duration: 4000,
        style: { background: '#0a0010', color: '#ff6666', border: '1px solid #990000', fontFamily: 'VT323, monospace', fontSize: '18px' },
      });

      onCreatureGenerated(creature);
      setPrompt('');
    } catch (err) {
      toast.dismiss(t1);
      const msg = err?.response?.data?.detail || err.message || 'The void rejected your offering';
      toast.error(`☠ ${msg}`, {
        duration: 5000,
        style: { background: '#1a0000', color: '#ff4444', border: '1px solid #660000', fontFamily: 'VT323, monospace', fontSize: '16px' },
      });
    } finally {
      setLoading(false);
    }
  };

  const charCount = prompt.length;
  const isValid = charCount >= 5 && charCount <= 500;

  return (
    <div className="void-card relative rounded-lg p-6 card-corner-glow">
      <div className="relative z-10">
        <h2 className="font-pixel text-xl md:text-2xl text-red-400 stranger-glow-sm mb-1 uppercase tracking-widest">
          ☠ Summon a Creature
        </h2>
        <p className="text-gray-500 text-sm font-body mb-4">
          Describe your horror. The void will answer.
        </p>

        {/* Prompt textarea */}
        <div className="relative mb-3">
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
            placeholder="Describe your creature... (e.g. A bone-reaper emerging from the rift between worlds)"
            rows={4}
            disabled={loading}
            className="w-full bg-void-950 border border-red-900/30 focus:border-red-700/60 rounded px-4 py-3 text-gray-200 font-body text-sm resize-none outline-none transition-all duration-200 placeholder-gray-600 focus:shadow-red-glow-sm disabled:opacity-50"
          />
          <span className={`absolute bottom-3 right-3 text-xs font-pixel
            ${charCount > 450 ? 'text-red-400' : 'text-gray-600'}
            ${charCount > 500 ? 'text-red-600 animate-pulse' : ''}
          `}>
            {charCount}/500
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={randomize}
            disabled={loading}
            title="Randomize prompt"
            className="flex items-center gap-2 px-4 py-3 rounded bg-void-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-pixel text-sm uppercase tracking-wider transition-all duration-200 disabled:opacity-40"
          >
            <Shuffle className="w-4 h-4" />
            <span className="hidden sm:inline">Randomize</span>
          </button>

          <button
            id="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !isValid}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded bg-red-900 hover:bg-red-800 border border-red-700 text-red-100 font-pixel text-base uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed animate-pulse-red"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                Summoning...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Forge Creature
              </>
            )}
          </button>
        </div>

        {!isValid && charCount > 0 && charCount < 5 && (
          <p className="flex items-center gap-1 text-xs text-yellow-600 mt-2 font-body">
            <AlertTriangle className="w-3 h-3" />
            Need at least 5 characters
          </p>
        )}
      </div>
    </div>
  );
}
