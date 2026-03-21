import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, Search, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../../features/auth/store';
import { useSearchStore } from '../../store/sreachStore';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const { isAuthenticated, user } = useAuthStore();
  const { openSearch } = useSearchStore();

  // Handle scroll effect (Transparent -> White with shadow)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Solutions', href: '/solutions/enterprise' },
    { name: 'Demo', href: '/demo' },
    { name: 'About', href: '/about-us' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white shadow-navbar py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className="bg-orange text-white p-1.5 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-navy">
            VYN
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-semibold text-content-secondary hover:text-navy transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={openSearch}
                className="p-2 text-content-secondary hover:text-navy rounded-full hover:bg-surface-dark transition-colors"
                aria-label="Open Search"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {/* User Dropdown Trigger (Simplified for now) */}
              <Link to="/app" className="flex items-center gap-2 p-1 pr-3 rounded-full border border-border hover:border-border-dark transition-colors">
                <div className="w-8 h-8 rounded-full bg-navy-50 text-navy flex items-center justify-center text-xs font-bold">
                  {user?.initials || <User className="w-4 h-4" />}
                </div>
                <span className="text-sm font-semibold text-navy">Dashboard</span>
              </Link>
            </>
          ) : (
            <>
              <Button variant="ghost" href="/login">
                Log in
              </Button>
              <Button variant="primary" smartAuth icon>
                Start Free Trial
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden z-50 p-2 text-navy"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Full-Screen Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-white z-40 flex flex-col pt-24 px-6 transition-transform duration-300 ease-in-out md:hidden',
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <nav className="flex flex-col gap-6 text-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="font-semibold text-navy border-b border-border pb-4"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pb-8 flex flex-col gap-4">
          {isAuthenticated ? (
            <Button variant="primary" size="lg" href="/app" className="w-full">
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="outline" size="lg" href="/login" className="w-full">
                Log in
              </Button>
              <Button variant="primary" size="lg" smartAuth className="w-full">
                Start Free Trial
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};