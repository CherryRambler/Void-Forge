import GenerationForm from '../components/GenerationForm';
import SidePanel from '../components/SidePanel';
import MobileCarousel from '../components/MobileCarousel';

export default function HomePage({ onCardClick, onNewCreature, recent = [] }) {
  const left  = recent.slice(0, 3);
  const right = recent.slice(3, 6);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="font-pixel text-5xl sm:text-6xl md:text-7xl xl:text-8xl text-red-500 stranger-glow animate-flicker leading-none mb-3">
          VOID FORGE
        </h1>
        <p className="font-body text-gray-500 text-sm md:text-base max-w-lg mx-auto">
          Summon pixel-art horrors from the Shadow Realm. Each creature carries dark lore, unique stats, and a collectible card for sharing.
        </p>
      </div>

      {/* Three-column layout */}
      <div className="max-w-7xl mx-auto flex gap-6 items-start">
        <SidePanel creatures={left}  side="left"  onCardClick={onCardClick} />

        <div className="flex-1 min-w-0 max-w-2xl mx-auto">
          <GenerationForm
            onCreatureGenerated={(c) => {
              onCardClick(c);
              onNewCreature?.(c);
            }}
          />

          {recent.length > 0 && (
            <div className="mt-8">
              <p className="font-pixel text-xs text-gray-600 uppercase tracking-widest mb-3 text-center">
                Recent Summons
              </p>
              <MobileCarousel creatures={recent} onCardClick={onCardClick} />
            </div>
          )}
        </div>

        <SidePanel creatures={right} side="right" onCardClick={onCardClick} />
      </div>
    </div>
  );
}