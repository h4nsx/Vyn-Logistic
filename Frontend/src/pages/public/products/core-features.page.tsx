import { ShieldCheck, Brain, Activity, BarChart3, Truck, ArrowRight, Layers, MessageCircle, FileInput, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Button } from '../../../shared/components/ui/Button';

// ─── Animation variants ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const }
  }),
};

// ─── Feature Card ────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, body, index, colorClass }: { icon: any, title: string, body: string, index: number, colorClass: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      custom={index}
      className="group p-8 rounded-3xl border border-border hover:border-orange/20 hover:shadow-elevated bg-white transition-all duration-300 relative overflow-hidden"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorClass} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        <Icon className="w-7 h-7" />
      </div>
      
      <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-orange transition-colors">{title}</h3>
      <p className="text-content-secondary text-sm leading-relaxed mb-4">{body}</p>
      
      <Link to="/resources/docs" className="flex items-center gap-2 text-xs font-black text-orange uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Documentation <ArrowRight className="w-3.5 h-3.5" />
      </Link>

      {/* Subtle bottom shadow overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

export function CoreFeaturesPage() {
  const coreFeatures = [
    {
      icon: ShieldCheck,
      colorClass: 'bg-orange-50 text-orange border border-orange/10',
      title: 'Auto-Mapping Engine',
      body: 'AI-driven column mapping that recognizes any CSV or Excel structure instantly. No configuration required.'
    },
    {
      icon: Brain,
      colorClass: 'bg-navy-50 text-navy border border-navy/10',
      title: 'Neural Bottleneck Tracing',
      body: 'Proprietary ML model that pinpoints hidden bottlenecks across your entire supply chain network.'
    },
    {
      icon: Activity,
      colorClass: 'bg-cyan-50 text-cyan border border-cyan/10',
      title: 'Real-Time Risk Scoring',
      body: 'Every logistic process is assigned an intelligence-backed 0-100 risk score based on historical data.'
    },
    {
      icon: BarChart3,
      colorClass: 'bg-success-50 text-success border border-success/10',
      title: 'Trend Intelligence',
      body: 'Compare current performance against historical trends to identify deviations before they become delays.'
    },
    {
      icon: MessageCircle,
      colorClass: 'bg-anomaly-50 text-anomaly border border-anomaly/10',
      title: 'Plain-Language Insights',
      body: 'Vyn translates complex analytics into human-readable action items and root cause explanations.'
    },
    {
      icon: Layers,
      colorClass: 'bg-warning-50 text-warning border border-warning/10',
      title: 'Multi-Modal Support',
      body: 'From warehouse operations to carrier shipping — one single platform for all process types.'
    },
    {
      icon: Truck,
      colorClass: 'bg-indigo-50 text-indigo border border-indigo/10',
      title: 'Carrier Analytics',
      body: 'In-depth performance scoring for transporters, identifying the most reliable partners automatically.'
    },
    {
      icon: FileInput,
      colorClass: 'bg-rose-50 text-rose border border-rose/10',
      title: 'CSV Auto-Validation',
      body: 'Automatically cleans and validates your data files for gaps, errors, or formatting inconsistencies.'
    },
    {
      icon: Fingerprint,
      colorClass: 'bg-amber-50 text-amber border border-amber/10',
      title: 'Anomaly Fingerprinting',
      body: 'Unique ML signature detection for unusual events that might signal a larger systemic failure.'
    }
  ];

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero */}
      <section className="bg-navy py-20 lg:py-28 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-orange/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fb923c 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange/20 border border-orange/30 rounded-full text-orange text-xs font-black uppercase tracking-widest mb-8"
          >
            The Full Capabilities
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight"
          >
            Empowering <span className="bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent italic">Decisive</span> Logistics
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            A deep-tech core designed for zero-friction supply chain intelligence. Explore the features that drive Vyn's proprietary engine.
          </motion.p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-surface py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {coreFeatures.map((f, idx) => (
              <FeatureCard key={f.title} {...f} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <div className="bg-white border-t border-border py-16">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-navy mb-8">Looking for specific integration capabilities?</h2>
          <div className="flex flex-wrap gap-4">
            <Button href="/resources/api" variant="outline" className="px-8 shadow-sm">View API Documentation</Button>
            <Button href="/contact" variant="primary" className="px-8 shadow-md">Talk to Sales</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
