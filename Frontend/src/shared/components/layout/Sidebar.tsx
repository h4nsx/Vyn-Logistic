import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  Settings, 
  LogOut, 
  Zap,
  Upload 
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { useAuthStore } from '../../../features/auth/store';

const navItems = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard, end: true },
  { name: 'Upload', href: '/app/upload', icon: Upload },
  { name: 'Datasets', href: '/app/datasets', icon: Database },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  return (
    <aside className="w-64 bg-gradient-to-b from-navy to-navy-dark h-screen fixed left-0 top-0 flex flex-col text-white/60 z-40">
      
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="bg-gradient-to-br from-orange to-orange-dark p-2 rounded-xl shadow-md shadow-orange/30">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight block leading-none">VYN</span>
          <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Intelligence</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 mt-2 space-y-1">
        {navItems.map((item) => {
          const isActive = item.end 
            ? location.pathname === item.href 
            : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={() => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm relative group",
                isActive 
                  ? "bg-white/10 text-white shadow-sm backdrop-blur-sm" 
                  : "hover:bg-white/5 hover:text-white"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange rounded-r-full" />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive ? "text-orange" : "group-hover:scale-110"
              )} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/10">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold hover:bg-white/5 hover:text-danger-light transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          Logout
        </button>
      </div>
    </aside>
  );
};