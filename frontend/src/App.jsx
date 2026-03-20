import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Nav from './components/Nav';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import CreatureModal from './components/CreatureModal';
import { fetchCreatures } from './api';
import './App.css';

function App() {
  const [page, setPage] = useState('home');
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [creatures, setCreatures] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCreatures(100);
        setCreatures(data.creatures);
      } catch (err) {
        console.error('Failed to fetch creatures:', err);
      }
    };
    load();
  }, []);

  const handleCardClick = (creature) => {
    setSelectedCreature(creature);
  };

  const handleNewCreature = (creature) => {
    setCreatures((prev) => [creature, ...prev.filter(c => c.creature_id !== creature.creature_id)]);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 selection:bg-red-900/50">
      <Nav currentPage={page} onNavigate={setPage} />

      <main>
        {page === 'home' ? (
          <HomePage 
            onCardClick={handleCardClick} 
            onNewCreature={handleNewCreature}
            recent={creatures.slice(0, 6)}
          />
        ) : (
          <GalleryPage 
            onCardClick={handleCardClick} 
            creatures={creatures}
          />
        )}
      </main>

      {selectedCreature && (
        <CreatureModal
          creature={selectedCreature}
          onClose={() => setSelectedCreature(null)}
        />
      )}

      {/* Global Toast Notifications */}
      <Toaster position="bottom-right" />
      
      {/* Visual background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#150020_0%,#000000_100%)] opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-950/10 to-transparent"></div>
      </div>
    </div>
  );
}

export default App;
