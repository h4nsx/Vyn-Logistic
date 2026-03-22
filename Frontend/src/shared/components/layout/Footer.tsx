import { Link } from 'react-router-dom';
import { Zap, Github, Linkedin, Mail, ArrowRight } from 'lucide-react';

const productLinks = [
  { name: 'Interactive Demo', href: '/demo' },
  { name: 'Dashboard', href: '/app' },
  { name: 'Upload Dataset', href: '/app/upload' },
  { name: 'Process Analysis', href: '/app/datasets' },
];

const resourceLinks = [
  { name: 'Interactive Demo', href: '/demo' },
  { name: 'Documentation', href: '/resources/docs' },
  { name: 'API Reference', href: '/resources/api' },
  { name: 'Sample Dataset', href: '/resources/samples' },
];

const companyLinks = [
  { name: 'About', href: '/about-us' },
  { name: 'Contact', href: '/contact' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
];

const socials = [
  { Icon: Github, href: 'https://github.com/h4nsx', label: 'GitHub' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/in/tuan-hung-vo-5822b1374/', label: 'LinkedIn' },
  { Icon: Mail, href: 'mailto:votuanhung1205.work@gmail.com', label: 'Email' },
];

function LinkColumn({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-5">{title}</p>
      <ul className="space-y-3">
        {links.map(link => (
          <li key={link.name}>
            <Link
              to={link.href}
              className="text-sm text-white/50 hover:text-white transition-colors duration-200 hover:translate-x-0.5 inline-block"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Footer = () => {
  return (
    <footer className="bg-navy text-white">

      {/* ── Main Grid ── */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* ── Section 1 — Brand (2 cols wide) ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 w-fit group">
              <div className="bg-gradient-to-br from-orange to-orange-dark text-white p-1.5 rounded-xl shadow-md shadow-orange/30 group-hover:shadow-orange/50 transition-shadow">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-white block leading-none">Vyn</span>
                <span className="text-[10px] text-white/30 font-medium uppercase tracking-widest">Supply Chain Intelligence</span>
              </div>
            </Link>

            {/* Description */}
            <div className="space-y-1.5">
              <p className="text-white/70 font-semibold text-sm leading-snug">
                AI Logistics Process Intelligence Platform
              </p>
              <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                Analyze your supply chain workflows, detect bottlenecks, and optimize operations using AI.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Mini CTA */}
            <div className="mt-2 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <p className="text-sm font-semibold text-white/70 leading-snug">
                Ready to optimize your logistics?
              </p>
              <Link
                to="/app/upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange to-orange-dark text-white text-sm font-bold rounded-xl shadow-md shadow-orange/20 hover:shadow-orange/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                Upload Your Dataset
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ── Section 2, 3, 4 — Link Columns ── */}
          <LinkColumn title="Product" links={productLinks} />
          <LinkColumn title="Resources" links={resourceLinks} />
          <LinkColumn title="Company" links={companyLinks} />
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © 2026 Vyn. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-white/20">
            <Link to="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};