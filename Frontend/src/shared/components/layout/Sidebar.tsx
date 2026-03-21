import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  Settings, 
  LogOut, 
  Zap 
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { useAuthStore } from '../../../features/auth/store';

const navItems = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Datasets', href: '/app/datasets', icon: Database },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="w-64 bg-navy h-screen fixed left-0 top-0 flex flex-col text-white/70">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="bg-orange p-1.5 rounded-xl">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <span className="font-bold text-xl tracking-tight">VYN</span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 mt-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/app'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm",
              isActive 
                ? "bg-white/10 text-white shadow-sm" 
                : "hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold hover:bg-danger/10 hover:text-danger-light transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};