import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Upload, Brain, TrendingDown, ShieldCheck,
  BarChart3, Activity, Truck, Package, CheckCircle2,
  ChevronRight, Play, X, AlertTriangle, Clock, DollarSign
} from 'lucide-react';
import { motion, useInView, useMotionValue, useTransform, type Variants } from 'framer-motion';
import { Button } from '../../shared/components/ui/Button';

// ─── Animation variants ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// ─── Reusable section reveal wrapper ─────────────────────────────────────────
function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Tilt Card ───────────────────────────────────────────────────────────────
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Metric ticker ───────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  if (inView && val === 0 && target > 0) {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
  }

  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const steps = [
  { icon: Upload, n: '01', title: 'Upload your CSV', body: 'Drop any process log — orders, shipments, warehouse events. Our engine handles any format automatically.' },
  { icon: Brain, n: '02', title: 'AI maps & analyzes', body: 'Columns are auto-detected. The model calculates risk scores, anomalies, and bottleneck probability in seconds.' },
  { icon: TrendingDown, n: '03', title: 'Insight in seconds', body: 'A clear dashboard shows exactly what is wrong, why it happened, and what to fix — no data science degree needed.' },
];

const features = [
  { icon: ShieldCheck, color: 'bg-navy-50 text-navy', title: 'Zero-Friction Upload', body: 'Drag & drop any CSV. AI detects column structure automatically — no manual mapping required.' },
  { icon: Brain, color: 'bg-orange-50 text-orange', title: 'AI Bottleneck Detection', body: 'Our ML engine pinpoints the exact step causing delays and explains the root cause in plain language.' },
  { icon: Activity, color: 'bg-cyan-50 text-cyan', title: 'Real-Time Risk Scoring', body: 'Every process gets a 0–100 risk score so you know exactly where to focus your attention first.' },
  { icon: BarChart3, color: 'bg-success-50 text-success', title: 'Trend Intelligence', body: 'Track risk over time. Compare your last 10 uploads to spot recurring patterns before they become crises.' },
  { icon: Truck, color: 'bg-anomaly-50 text-anomaly', title: 'Multi-Modal Support', body: 'From trucking routes to warehouse picks — the engine adapts to any supply chain process type.' },
  { icon: Package, color: 'bg-warning-50 text-warning', title: 'Insight → Action', body: 'Each analysis ends with concrete, prioritized action items — not just charts and numbers.' },
];

const stats = [
  { value: 94, suffix: '%', label: 'Anomaly detection accuracy' },
  { value: 38, suffix: '%', label: 'Avg. delay reduction' },
  { value: 90, suffix: 's', label: 'Time to first insight' },
  { value: 500, suffix: '+', label: 'Logistics teams' },
];

// ─── HomePage ─────────────────────────────────────────────────────────────────
export function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-navy-dark via-navy to-navy-light overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-orange/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-orange/10 border border-orange/20 rounded-full text-orange text-sm font-semibold backdrop-blur-sm">
                <Zap className="w-4 h-4" />
                AI-Powered Supply Chain Intelligence
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
                Detect. Diagnose.{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-orange via-orange-light to-cyan-light bg-clip-text text-transparent">
                    Deliver.
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange to-cyan-light rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-white/60 text-xl leading-relaxed max-w-lg">
                Upload your logistics data. In 90 seconds, our AI identifies every bottleneck, anomaly, and risk — with plain-language explanations.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
                <Button href="/register" size="lg" className="shadow-xl shadow-orange/30 min-w-[180px]" glow>
                  Start for Free <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Link to="/demo" className="flex items-center gap-2.5 text-white/70 hover:text-white font-semibold text-sm transition-colors group">
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  Watch demo
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-6 pt-2">
                {[
                  'No credit card',
                  '3 free analyses / month',
                  'SOC 2 Certified',
                ].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-white/40 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    {t}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Floating Dashboard Card */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block"
            >
              <TiltCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                {/* Mini dashboard preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
                      <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Live Analysis</span>
                    </div>
                    <span className="text-white/30 text-xs">Updated 2s ago</span>
                  </div>

                  {/* Risk Score Big */}
                  <div className="bg-white/5 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-orange/30 flex items-center justify-center">
                      <span className="text-2xl font-black text-orange">72</span>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wide font-semibold">Risk Score</p>
                      <p className="text-white font-bold text-lg">High Risk</p>
                      <p className="text-xs text-danger font-medium">↑ 14 from last run</p>
                    </div>
                  </div>

                  {/* Steps */}
                  {[
                    { label: 'Order Intake', status: 'ok', duration: '1.2h' },
                    { label: 'Dispatch', status: 'bottleneck', duration: '5.4h' },
                    { label: 'In Transit', status: 'ok', duration: '22h' },
                  ].map(row => (
                    <div key={row.label} className={`flex items-center justify-between p-3 rounded-xl ${row.status === 'bottleneck' ? 'bg-orange/10 border border-orange/20' : 'bg-white/5'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${row.status === 'bottleneck' ? 'bg-orange' : 'bg-success'}`} />
                        <span className="text-sm text-white/80 font-medium">{row.label}</span>
                        {row.status === 'bottleneck' && <span className="text-[10px] bg-orange text-white px-1.5 py-0.5 rounded font-bold">BOTTLENECK</span>}
                      </div>
                      <span className="text-xs text-white/40 font-mono">{row.duration}</span>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </motion.div>
          </div>

          {/* Stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-white/10"
          >
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-white">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-xs text-white/40 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4 md:px-6">
          <RevealSection>
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full text-orange text-xs font-bold mb-4 border border-orange/20">
                How It Works
              </div>
              <h2 className="text-4xl font-black text-navy leading-tight">Upload → Understand → Act</h2>
              <p className="text-content-secondary mt-3 leading-relaxed">
                The simplest way to get actionable supply chain intelligence.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection lines */}
              <div className="absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-orange/30 via-orange to-orange/30 hidden md:block" />

              {steps.map((step, idx) => (
                <motion.div
                  key={step.n}
                  variants={fadeUp}
                  className="relative bg-white rounded-2xl border border-border shadow-card p-8 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="absolute -top-4 left-8 px-3 py-1 bg-navy text-white text-xs font-black rounded-full">{step.n}</div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${idx === 0 ? 'bg-navy text-white' : idx === 1 ? 'bg-orange text-white' : 'bg-success text-white'} shadow-md`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-3">{step.title}</h3>
                  <p className="text-content-secondary text-sm leading-relaxed">{step.body}</p>
                  <div className="mt-5 flex items-center gap-1 text-xs font-bold text-orange opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <RevealSection>
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 rounded-full text-navy text-xs font-bold mb-4 border border-navy/10">
                Intelligence Features
              </div>
              <h2 className="text-4xl font-black text-navy leading-tight">
                Everything you need.<br />Nothing you don't.
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="group p-6 rounded-2xl border border-border hover:border-navy/20 hover:shadow-card bg-white hover:bg-surface/30 transition-all duration-300 cursor-default"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color} group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-navy mb-2">{f.title}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>


      {/* ── BEFORE / AFTER ── */}
      <section className="py-24 bg-gradient-to-b from-surface to-white">
        <div className="container mx-auto px-4 md:px-6">
          <RevealSection>
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-danger-50 rounded-full text-danger text-xs font-bold mb-4 border border-danger/20">
                The Problem We Solve
              </div>
              <h2 className="text-4xl font-black text-navy leading-tight">
                How most teams manage logistics today — and what Vyn changes.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* BEFORE */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-danger/20 bg-danger-50/40 p-7">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-danger/10 rounded-lg">
                    <X className="w-4 h-4 text-danger" />
                  </div>
                  <p className="font-black text-danger uppercase tracking-wider text-sm">Without Vyn</p>
                </div>
                <ul className="space-y-4">
                  {[
                    { icon: Clock, text: 'Hours of manual Excel analysis to find one bottleneck' },
                    { icon: AlertTriangle, text: 'Discover problems only after customers already complained' },
                    { icon: DollarSign, text: 'Pay consultants $200k+ for insights you need every week' },
                    { icon: Brain, text: 'No way to tell which process step is actually the problem' },
                    { icon: BarChart3, text: 'Charts everywhere, but zero plain-language explanations' },
                  ].map(item => (
                    <li key={item.text} className="flex items-start gap-3 text-sm text-danger-dark">
                      <item.icon className="w-4 h-4 shrink-0 mt-0.5 text-danger opacity-60" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* AFTER */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-success/20 bg-success-50/40 p-7">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-success/10 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <p className="font-black text-success uppercase tracking-wider text-sm">With Vyn</p>
                </div>
                <ul className="space-y-4">
                  {[
                    { icon: Upload, text: 'Drop any CSV — AI maps and analyzes it in 90 seconds' },
                    { icon: Zap, text: 'Catch bottlenecks before they cascade into delays' },
                    { icon: Brain, text: 'Plain-language explanations — no data science needed' },
                    { icon: Activity, text: 'Risk score pinpoints exactly which step to fix first' },
                    { icon: TrendingDown, text: 'Early adopters running analyses teams haven\'t imagined yet' },
                  ].map(item => (
                    <li key={item.text} className="flex items-start gap-3 text-sm text-success-dark">
                      <item.icon className="w-4 h-4 shrink-0 mt-0.5 text-success" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── WHY VYN vs ALTERNATIVES ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <RevealSection>
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 rounded-full text-navy text-xs font-bold mb-4 border border-navy/10">
                Why Vyn
              </div>
              <h2 className="text-4xl font-black text-navy leading-tight">
                Built different — from the ground up.
              </h2>
              <p className="text-content-secondary mt-3">
                Most tools give you dashboards. Vyn gives you decisions.
              </p>
            </motion.div>

            {/* Comparison table */}
            <motion.div variants={fadeUp} className="max-w-4xl mx-auto overflow-x-auto">
              <div className="rounded-2xl border border-border overflow-hidden shadow-card min-w-[640px]">
                {/* Header */}
                <div className="grid grid-cols-4 bg-surface">
                  <div className="p-5 border-b border-border" />
                  {['Traditional\nTools', 'BI Platforms\n(Tableau, etc.)', 'Vyn\nIntelligence'].map((col, i) => (
                    <div key={col} className={`p-5 border-b border-border text-center ${
                      i === 2 ? 'bg-navy text-white' : ''
                    }`}>
                      <p className={`text-xs font-black uppercase tracking-wide whitespace-pre-line leading-tight ${
                        i === 2 ? 'text-white' : 'text-content-secondary'
                      }`}>{col}</p>
                      {i === 2 && <div className="w-1.5 h-1.5 bg-orange rounded-full mx-auto mt-1.5" />}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {[
                  { label: 'Auto column mapping', vals: [false, false, true] },
                  { label: 'Plain-language insights', vals: [false, false, true] },
                  { label: 'Risk score per process', vals: [false, true, true] },
                  { label: 'Bottleneck explanation', vals: [false, false, true] },
                  { label: '90-second time to insight', vals: [false, false, true] },
                  { label: 'No setup / config required', vals: [false, false, true] },
                  { label: 'Works with any CSV format', vals: [false, false, true] },
                ].map((row, ri) => (
                  <div key={row.label} className={`grid grid-cols-4 ${
                    ri < 6 ? 'border-b border-border' : ''
                  } ${ ri % 2 === 1 ? 'bg-surface/40' : 'bg-white' }`}>
                    <div className="px-5 py-4 text-sm font-semibold text-navy">{row.label}</div>
                    {row.vals.map((v, vi) => (
                      <div key={vi} className={`px-5 py-4 flex items-center justify-center ${
                        vi === 2 ? 'bg-navy/5' : ''
                      }`}>
                        {v
                          ? <CheckCircle2 className="w-5 h-5 text-success" />
                          : <X className="w-5 h-5 text-content-muted/40" />}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </RevealSection>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <RevealSection>
            <motion.div
              variants={fadeUp}
              className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-navy via-navy-dark to-navy-900 p-16 text-center"
            >
              {/* Background blobs */}
              <div className="absolute top-0 left-1/4 w-80 h-80 bg-orange/15 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan/10 rounded-full blur-3xl" />
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

              <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/10 border border-orange/20 rounded-full text-orange text-sm font-semibold">
                  <Zap className="w-4 h-4" />
                  Start in 90 seconds
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Stop guessing.<br />
                  <span className="bg-gradient-to-r from-orange to-cyan-light bg-clip-text text-transparent">
                    Start knowing.
                  </span>
                </h2>
                <p className="text-white/50 text-lg">
                  Upload your first dataset for free. No credit card, no contracts, no complexity.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button href="/register" size="lg" className="min-w-[200px] shadow-xl shadow-orange/30" glow>
                    Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button href="/demo" variant="ghost" size="lg" className="text-white/70 hover:text-white hover:bg-white/10">
                    See Live Demo
                  </Button>
                </div>
              </div>
            </motion.div>
          </RevealSection>
        </div>
      </section>

    </div>
  );
}
