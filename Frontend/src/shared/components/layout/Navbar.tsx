import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../../features/auth/store';
import { motion, AnimatePresence } from 'framer-motion';

const products = [
  { name: 'How it works', href: '/products/how-it-works', desc: 'End-to-end visibility' },
  { name: 'Core features', href: '/products/core-features', desc: 'Fleet analytics & routing' },
  { name: 'Architecture', href: '/products/architecture', desc: 'Inventory intelligence' },
  { name: 'Use cases', href: '/products/use-cases', desc: 'Custom integrations' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  
  const lastScrollY = useRef(0);
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if scrolled
      setIsScrolled(currentScrollY > 20);

      // Determine visibility (hide on scroll down, show on scroll up)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setProductsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header 
        initial={false}
        animate={{ 
          y: isVisible ? 0 : -100,
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0)',
          backdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)',
          borderBottomColor: isScrolled ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          isScrolled ? 'py-3 shadow-navbar' : 'py-5'
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group z-50">
            <div className="bg-gradient-to-br from-orange to-orange-dark text-white p-1.5 rounded-xl shadow-md shadow-orange/20 group-hover:shadow-orange/40 transition-shadow">
              <Zap className="w-5 h-5" />
            </div>
            <span className={cn(
              "font-bold text-xl tracking-tight transition-colors",
              (isScrolled || !isHomePage) ? 'text-navy' : 'text-white'
            )}>
              VYN
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-colors",
                (isScrolled || !isHomePage) 
                  ? 'text-content-secondary hover:text-navy hover:bg-surface' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}>
                Product
                <ChevronDown className={cn("w-4 h-4 transition-transform", productsOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {productsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl shadow-elevated border border-border p-2"
                  >
                    {products.map(s => (
                      <Link
                        key={s.href}
                        to={s.href}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface transition-colors group"
                      >
                        <div className="w-2 h-2 rounded-full bg-orange mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                        <div>
                          <p className="text-sm font-semibold text-navy">{s.name}</p>
                          <p className="text-xs text-content-muted">{s.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {[{ name: 'Demo', href: '/demo' }, { name: 'About', href: '/about-us' }].map(link => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-black transition-colors",
                  (isScrolled || !isHomePage) 
                    ? 'text-content-secondary hover:text-navy hover:bg-surface' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/app"
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-black transition-all border shadow-sm",
                  (isScrolled || !isHomePage)
                    ? "bg-navy text-white border-navy shadow-navy/20"
                    : "bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/40"
                )}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange to-orange-dark text-white flex items-center justify-center text-xs font-bold shadow">
                  {user?.initials}
                </div>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-black transition-colors",
                    (isScrolled || !isHomePage) ? 'text-navy hover:bg-surface' : 'text-white/90 hover:text-white hover:bg-white/10'
                  )}
                >
                  Log in
                </Link>
                <Button href="/register" size="sm" className="shadow-md shadow-orange/25">
                  Start Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className={cn("md:hidden z-50 p-2 rounded-xl transition-colors", (isScrolled || isMobileOpen || !isHomePage) ? 'text-navy hover:bg-surface' : 'text-white hover:bg-white/10')}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-40 md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 pt-20 flex-grow">
                <p className="text-[11px] font-bold text-content-muted uppercase tracking-widest mb-4">Product</p>
                <div className="space-y-1 mb-6">
                  {products.map(s => (
                    <Link key={s.href} to={s.href} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-surface transition-colors text-sm font-semibold text-navy">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
                      {s.name}
                    </Link>
                  ))}
                </div>
                <div className="h-px bg-border mb-6" />
                <div className="space-y-1">
                  {[{ name: 'Demo', href: '/demo' }, { name: 'About', href: '/about-us' }].map(link => (
                    <Link key={link.href} to={link.href} className="block px-3 py-2.5 rounded-xl hover:bg-surface transition-colors text-sm font-semibold text-content-secondary hover:text-navy">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-border space-y-3">
                {isAuthenticated ? (
                  <Button href="/app" className="w-full" size="lg">Dashboard</Button>
                ) : (
                  <>
                    <Button href="/login" variant="outline" size="lg" className="w-full">Log in</Button>
                    <Button href="/register" size="lg" className="w-full">Start Free Trial</Button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};