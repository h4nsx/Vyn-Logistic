import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../../shared/components/layout/Sidebar';
import { useAuthStore } from '../../features/auth/store';
import { Search, Bell } from 'lucide-react';

export function AppLayout() {
  const { isAuthenticated, user } = useAuthStore();

  // Auth Guard: Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-lg font-bold text-navy">Overview</h1>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-content-muted hover:text-navy transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-content-muted hover:text-navy transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange rounded-full border-2 border-white" />
            </button>
            
            <div className="h-8 w-[1px] bg-border mx-2" />
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-navy leading-none">{user?.name}</p>
                <p className="text-xs text-content-muted mt-1">{user?.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-navy-50 text-navy flex items-center justify-center font-bold text-sm border border-navy-100">
                {user?.initials}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-8 flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
}