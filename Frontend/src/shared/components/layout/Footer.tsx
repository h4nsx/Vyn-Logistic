import { Link } from 'react-router-dom';
import { Zap, Twitter, Linkedin, Github } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    solutions: [
      { name: 'Trucking', href: '/solutions/trucking' },
      { name: 'Warehouse', href: '/solutions/warehouse' },
      { name: 'Supply Chain', href: '/solutions/supply-chain' },
      { name: 'Enterprise', href: '/solutions/enterprise' },
    ],
    company: [
      { name: 'About Us', href: '/about-us' }
    ],
    resources: [
      { name: 'Interactive Demo', href: '/demo' },
      { name: 'API Documentation', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'System Status', href: '#' },
    ],
  };

  return (
    <footer className="bg-white border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Top Section: Brand & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <div className="bg-orange text-white p-1.5 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-navy">
                VYNLYTICS
              </span>
            </Link>
            <p className="text-content-secondary text-sm max-w-sm leading-relaxed">
              The intelligent logistics platform. Detect anomalies, diagnose supply chain bottlenecks, and deliver with unprecedented efficiency.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="text-content-muted hover:text-navy transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-content-muted hover:text-navy transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-content-muted hover:text-navy transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold text-navy mb-4">Solutions</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.solutions.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-content-secondary hover:text-orange transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-navy mb-4">Our teams</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-content-secondary hover:text-orange transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-navy mb-4">Resources</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-content-secondary hover:text-orange transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright & Legal */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-content-muted">
            © {currentYear} Vynlytics Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-sm text-content-muted hover:text-navy transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-sm text-content-muted hover:text-navy transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};