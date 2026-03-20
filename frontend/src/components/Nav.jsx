import React, { useState } from 'react';
import { Home, Users, Skull, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',    label: 'The Void',     icon: Skull,  page: 'home' },
  { id: 'gallery', label: 'Community',    icon: Users,  page: 'gallery' },
];

export default function Nav({ currentPage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 md:px-8">
      {/* Logo */}
      <div
        className="cursor-pointer flex items-center gap-2"
        onClick={() => onNavigate('home')}
      >
        <Skull className="text-red-500 w-5 h-5 md:w-6 md:h-6 animate-pulse" />
        <span className="font-pixel text-2xl md:text-3xl xl:text-4xl text-red-500 stranger-glow tracking-wider animate-flicker select-none">
          VOID FORGE
        </span>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.page)}
              className={`flex items-center gap-2 px-4 py-2 rounded font-pixel text-sm uppercase tracking-widest transition-all duration-200
                ${currentPage === item.page
                  ? 'bg-red-900/40 text-red-400 border border-red-700/50 stranger-glow-sm'
                  : 'text-gray-400 hover:text-red-300 hover:bg-red-900/20 border border-transparent'
                }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-red-400 p-2"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 glass-nav border-t border-red-900/30 md:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.page); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-6 py-4 font-pixel text-sm uppercase tracking-widest transition-colors
                  ${currentPage === item.page
                    ? 'text-red-400 bg-red-900/30'
                    : 'text-gray-400 hover:text-red-300 hover:bg-red-900/20'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
