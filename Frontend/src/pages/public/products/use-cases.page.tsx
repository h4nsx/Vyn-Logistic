import { Truck, Package, ShoppingBag, Globe, ArrowRight, Zap, Target, BarChart3, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Button } from '../../../shared/components/ui/Button';

// ─── Animation variants ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: idx * 0.1, ease: 'easeOut' as const }
  }),
};

// ─── Case Card ───────────────────────────────────────────────────────────────
function CaseCard({ icon: Icon, title, body, index, colorClass, metrics }: { icon: any, title: string, body: string, index: number, colorClass: string, metrics: string[] }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      custom={index}
      className="group p-8 rounded-3xl border border-border hover:border-orange/20 hover:shadow-elevated bg-white transition-all duration-300 relative overflow-hidden"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7" />
      </div>
      
      <h3 className="text-2xl font-black text-navy mb-4 group-hover:text-orange transition-colors">{title}</h3>
      <p className="text-content-secondary text-sm leading-relaxed mb-8">{body}</p>
      
      <div className="space-y-3 mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted">Impact Metrics</p>
        <div className="flex flex-wrap gap-2">
          {metrics.map(m => (
            <div key={m} className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-bold text-navy">
              {m}
            </div>
          ))}
        </div>
      </div>
      
      <Link to="/resources/samples" className="flex items-center gap-2 text-sm font-black text-navy hover:text-orange transition-colors group/btn">
        Explore Sample Data <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform text-orange" />
      </Link>

      {/* Decorative top dot */}
      <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-orange/20 rounded-full group-hover:scale-150 transition-transform" />
    </motion.div>
  );
}

export function UseCasesPage() {
  const useCases = [
    {
      icon: Truck,
      colorClass: 'bg-orange-50 text-orange border border-orange/10',
      title: 'Carrier Performance',
      body: 'Identify which carriers consistently cause delays and which routes are most volatile. Optimize dispatch decisions based on real-time intelligence.',
      metrics: ['-38% Dispatch delay', '94% Route accuracy', '+15% Fleet ROI'],
    },
    {
      icon: Package,
      colorClass: 'bg-navy-50 text-navy border border-navy/10',
      title: 'Warehouse Operations',
      body: 'Map hidden bottlenecks in pick-and-pack workflows. Use intelligence to optimize labor allocation and storage layout for maximum throughput.',
      metrics: ['-22% Processing time', '100% Stock visibility', '4.2x Daily pick rate'],
    },
    {
      icon: ShoppingBag,
      colorClass: 'bg-cyan-50 text-cyan border border-cyan/10',
      title: 'B2C E-commerce',
      body: 'Gain total transparency over the last-mile journey. Predict delivery failures before they happen and proactively manage customer expectations.',
      metrics: ['-45% Return rate', '99% On-time delivery', '+28% CSAT Score'],
    },
    {
      icon: Globe,
      colorClass: 'bg-success-50 text-success border border-success/10',
      title: 'Global Supply Chain',
      body: 'Orchestrate multi-continent logistics with high-level oversight. Detect systemic failures across your entire enterprise network.',
      metrics: ['Total Visibility', 'Risk Mitigation', 'Intermodal tracking'],
    },
    {
      icon: Target,
      colorClass: 'bg-anomaly-50 text-anomaly border border-anomaly/10',
      title: 'Cold-Chain Logistics',
      body: 'Track temperature-sensitive process logs and identify where environmental compliance fails during long-haul transport.',
      metrics: ['0% Spoilage', 'Temp-node mapping', 'Legal compliance'],
    },
    {
      icon: Zap,
      colorClass: 'bg-warning-50 text-warning border border-warning/10',
      title: 'Emergency Response',
      body: 'Intelligence-driven route rerouting for humanitarian and disaster recovery logistics where every second counts.',
      metrics: ['90s Insight time', 'Path optimization', 'Node Resilience'],
    }
  ];

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="bg-surface border-b border-border py-20 lg:py-28 text-center overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange/20 border border-orange/40 rounded-full text-orange text-xs font-black uppercase tracking-widest mb-8"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Vyn in the Real World
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black text-navy mb-6"
          >
            Solving <span className="text-orange">Complex</span> Challenges
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-content-secondary max-w-2xl mx-auto leading-relaxed"
          >
            Explore how logistics leaders use Vyn across various industries to drive intelligent decisions and operational excellence.
          </motion.p>
        </div>
      </section>

      {/* Case Grid */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {useCases.map((c, idx) => (
              <CaseCard key={c.title} {...c} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Action Banner */}
      <section className="bg-navy py-24 text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-orange/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-3xl p-12 bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black mb-4 flex items-center justify-center md:justify-start gap-3">
                <AlertCircle className="w-8 h-8 text-orange" />
                Custom Solutions?
              </h2>
              <p className="text-white/60 mb-0">Don’t see your specific use case here? Contact our enterprise architect team to design a custom integration for your process logs.</p>
            </div>
            <div className="shrink-0 flex gap-4">
              <Button href="/contact" size="lg" className="px-10 h-14 bg-white text-navy hover:bg-white/90">Contact Us</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
