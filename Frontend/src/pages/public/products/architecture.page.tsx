import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Layers, Database, Brain, Globe, ShieldCheck, Zap, Server, Cpu, Network, ArrowRight } from 'lucide-react';

// ─── Animation variants ──────────────────────────────────────────────────────
const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.12, ease: 'easeOut' as const }
  }),
};

// ─── Architecture Layer ──────────────────────────────────────────────────────
function ArchLayer({ icon: Icon, title, body, index, colorClass, items }: { icon: any, title: string, body: string, index: number, colorClass: string, items: string[] }) {
  return (
    <motion.div
      variants={fadeScale}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      custom={index}
      className={`relative p-10 rounded-3xl border border-border/60 bg-white shadow-card overflow-hidden group hover:shadow-elevated transition-all duration-300 ${index % 2 === 1 ? 'lg:translate-x-8' : ''}`}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm ${colorClass} group-hover:rotate-6 transition-transform`}>
        <Icon className="w-8 h-8" />
      </div>

      <div className="lg:max-w-md">
        <h3 className="text-2xl font-black text-navy mb-4">{title}</h3>
        <p className="text-content-secondary leading-relaxed mb-8">{body}</p>
        
        <div className="grid grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item} className="flex items-center gap-2 text-sm font-bold text-navy/70">
              <div className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <Link to="/resources/docs" className="inline-flex items-center gap-2 mt-10 text-xs font-black text-orange uppercase tracking-widest group/link">
          Explore Technical Specs <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Decorative count indicator */}
      <div className="absolute top-8 right-8 text-5xl font-black text-navy/[0.03] select-none italic tracking-tighter group-hover:text-orange/5 transition-colors">
        0{index + 1}
      </div>
      
      {/* Background glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-navy/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

export function ArchitecturePage() {
  const archStack = [
    {
      icon: Database,
      colorClass: 'bg-indigo-50 text-indigo border border-indigo/10',
      title: 'Adaptive Data Ingestion',
      body: 'Highly resilient layer that consumes disparate logistics logs (CSV, API, EDI), normalizes them with proprietary mapping, and provides a unified intelligence stream.',
      items: ['Schema discovery', 'Format normalization', 'Latency-free ingestion']
    },
    {
      icon: Brain,
      colorClass: 'bg-orange-50 text-orange border border-orange/10',
      title: 'Vyn Core Intelligence Engine',
      body: 'Our advanced ML models that use deep-tracing technology to analyze process nodes, calculate risk scores, and simulate "what-if" bottleneck scenarios in real-time.',
      items: ['Neural bottleneck tracing', 'Predictive risk scoring', 'Anomaly fingerprints']
    },
    {
      icon: Layers,
      colorClass: 'bg-cyan-50 text-cyan border border-cyan/10',
      title: 'Elastic Orchestration API',
      body: 'A high-throughput API layer that exposes intelligence to dashboards, mobile clients, and enterprise resource planning systems with enterprise-grade security.',
      items: ['REST/GraphQL support', 'Real-time webhooks', 'Encrypted data streams']
    },
    {
      icon: Network,
      colorClass: 'bg-success-50 text-success border border-success/10',
      title: 'Actionable Insights Overlay',
      body: 'The final intelligence tier where processing results are translated into strategic actions, plain-language insights, and visual process graphs.',
      items: ['NLP Insight generator', 'Strategic prioritization', 'KPI Visualization']
    }
  ];

  return (
    <div className="pt-24 min-h-screen">
      {/* Header section with technical emphasis */}
      <section className="bg-surface border-b border-border py-20 lg:py-28 relative">
        <div className="container mx-auto px-4 md:px-6 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-2 bg-navy rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-navy/20 mb-10"
          >
            <Server className="w-3.5 h-3.5 text-orange" />
            Vyn Tech Stack v2.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-5xl lg:text-7xl font-black text-navy text-center mb-6"
          >
            The Intelligence <span className="text-orange">Architecture</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-xl text-content-secondary max-w-2xl mx-auto text-center leading-relaxed"
          >
            Engineered for reliability, privacy, and speed. Vyn's proprietary stack operates with total transparency across your process logs.
          </motion.p>
        </div>
      </section>

      {/* Stack Visualization */}
      <section className="bg-white py-24 relative">
        {/* Connector vertical line */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-navy/5 via-navy/10 to-transparent hidden lg:block" />
        
        <div className="container mx-auto px-4 md:px-6 flex flex-col gap-16 lg:gap-24">
          {archStack.map((stack, idx) => (
            <ArchLayer key={stack.title} {...stack} index={idx} />
          ))}
        </div>
      </section>

      {/* Infrastructure Specs */}
      <section className="bg-navy py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: 'Compliance', body: 'SOC2 Type II, GDPR, and enterprise encryption standards as default.', href: '/privacy' },
              { icon: Cpu, title: 'Performance', body: 'Average 90-second time-to-insight for million-row datasets.', href: '/resources/docs' },
              { icon: Globe, title: 'Global Scale', body: 'Distributed across 12+ regions for multi-continent logistics support.', href: '/resources/help' },
              { icon: Zap, title: 'Latency', body: 'Predictive models updated in under 3ms with incremental learning.', href: '/resources/api' }
            ].map(spec => (
              <Link to={spec.href} key={spec.title} className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-orange transition-colors duration-300">
                  <spec.icon className="w-6 h-6" />
                </div>
                <h4 className="font-black text-lg mb-3 tracking-tight">{spec.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed max-w-[220px] italic">{spec.body}</p>
                <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-orange opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowRight className="w-3.5 h-3.5 inline-block" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
