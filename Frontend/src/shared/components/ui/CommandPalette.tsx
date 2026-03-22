import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, LayoutDashboard, Settings, BarChart3, Upload, ArrowRight, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchStore } from '../../store/sreachStore';
import { useAuthStore } from '../../../features/auth/store';

const ALL_ROUTES = [
  { name: 'Dashboard', path: '/app', icon: LayoutDashboard, description: 'Overview of your logistics', protected: true },
  { name: 'Upload Dataset', path: '/app/upload', icon: Upload, description: 'Analyze a new CSV file', protected: true },
  { name: 'Datasets', path: '/app/datasets', icon: FileText, description: 'Browse analyzed files', protected: true },
  { name: 'Analytics', path: '/app/analytics', icon: BarChart3, description: 'Risk trends & insights', protected: true },
  { name: 'Settings', path: '/app/settings', icon: Settings, description: 'Account & preferences', protected: true },
];

export const CommandPalette = () => {
  const { isOpen, closeSearch, toggleSearch } = useSearchStore();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch, closeSearch]);

  const filteredRoutes = ALL_ROUTES.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) &&
    (!r.protected || isAuthenticated)
  );

  // Arrow key navigation
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filteredRoutes.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filteredRoutes[activeIdx]) {
        handleNavigate(filteredRoutes[activeIdx].path);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, filteredRoutes, activeIdx]);

  // Reset index on query change
  useEffect(() => setActiveIdx(0), [query]);

  const handleNavigate = (path: string) => {
    navigate(path);
    closeSearch();
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 border-b border-border">
              <Search className="w-5 h-5 text-content-muted shrink-0" />
              <input
                ref={inputRef}
                autoFocus
                placeholder="Search pages or actions..."
                className="w-full py-4 text-sm text-navy outline-none placeholder:text-content-muted bg-transparent"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <kbd className="flex items-center gap-1 px-2 py-1 bg-surface rounded-lg border border-border text-[10px] font-bold text-content-muted shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[340px] overflow-y-auto p-2">
              {filteredRoutes.length > 0 ? (
                <>
                  <p className="px-3 py-2 text-[11px] font-bold text-content-muted uppercase tracking-wider">
                    Navigation
                  </p>
                  {filteredRoutes.map((route, idx) => (
                    <button
                      key={route.path}
                      onClick={() => handleNavigate(route.path)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                        activeIdx === idx ? 'bg-navy-50' : 'hover:bg-surface'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${
                        activeIdx === idx ? 'bg-white shadow-sm text-navy' : 'bg-surface text-content-secondary'
                      }`}>
                        <route.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-navy">{route.name}</p>
                        <p className="text-xs text-content-muted">{route.description}</p>
                      </div>
                      {activeIdx === idx && (
                        <ArrowRight className="w-4 h-4 text-content-muted" />
                      )}
                    </button>
                  ))}
                </>
              ) : (
                <div className="py-12 text-center">
                  <Command className="w-8 h-8 text-content-muted mx-auto mb-3" />
                  <p className="text-sm font-semibold text-navy">No results for "{query}"</p>
                  <p className="text-xs text-content-muted mt-1">Try searching for Dashboard, Upload, or Analytics</p>
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="px-5 py-3 border-t border-border flex items-center gap-4 text-[11px] text-content-muted bg-surface/50">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-border rounded text-[10px] font-bold">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-border rounded text-[10px] font-bold">↵</kbd> Select</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-border rounded text-[10px] font-bold">ESC</kbd> Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};