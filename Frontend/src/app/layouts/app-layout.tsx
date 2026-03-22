import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../../shared/components/layout/Sidebar';
import { useAuthStore } from '../../features/auth/store';
import { Search, Bell } from 'lucide-react';
import { useSearchStore } from '../../shared/store/sreachStore';
import { motion, AnimatePresence } from 'framer-motion';

// Page title map
const pageTitles: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/upload': 'Upload Dataset',
  '/app/datasets': 'Datasets',
  '/app/analytics': 'Intelligence Center',
  '/app/settings': 'Account Settings',
};

export function AppLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const { openSearch } = useSearchStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Determine page title from pathname
  const pathSegments = location.pathname.split('/').slice(0, 3).join('/');
  const pageTitle = pageTitles[pathSegments] || pageTitles[location.pathname] || 'Overview';

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-navy">{pageTitle}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search trigger */}
            <button 
              onClick={openSearch} 
              className="flex items-center gap-2 px-3 py-2 bg-surface hover:bg-surface-dark border border-border rounded-xl text-sm text-content-muted transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-border rounded text-[10px] font-bold text-content-muted ml-2">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button className="p-2.5 text-content-muted hover:text-navy hover:bg-surface rounded-xl transition-all duration-200 relative group">
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange rounded-full ring-2 ring-white" />
            </button>
            
            <div className="h-8 w-px bg-border mx-1" />
            
            {/* User */}
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-navy leading-none">{user?.name}</p>
                <p className="text-[11px] text-content-muted mt-0.5">{user?.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-navy-dark text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.initials}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area with page transition */}
        <main className="p-8 flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}