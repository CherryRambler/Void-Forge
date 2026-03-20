import React, { useEffect, useState, useCallback } from 'react';
import GalleryGrid from '../components/GalleryGrid';
import { fetchCreatures } from '../api';

export default function GalleryPage({ onCardClick, creatures: initialCreatures = [] }) {
  const [creatures, setCreatures] = useState(initialCreatures);
  const [total, setTotal] = useState(initialCreatures.length);
  const [loading, setLoading] = useState(initialCreatures.length === 0);

  const load = useCallback(async () => {
    if (initialCreatures.length > 0) {
      setCreatures(initialCreatures);
      setTotal(initialCreatures.length);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchCreatures(100);
      setCreatures(data.creatures);
      setTotal(data.total);
    } catch {
      setCreatures([]);
    } finally {
      setLoading(false);
    }
  }, [initialCreatures]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <GalleryGrid
          creatures={creatures}
          total={total}
          onCardClick={onCardClick}
          loading={loading}
        />
      </div>
    </div>
  );
}
