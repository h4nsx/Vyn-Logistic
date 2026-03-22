import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { Upload, Brain, CheckCircle2, ArrowRight, Zap, Target, Activity } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

// ─── Animation variants ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

// ─── Step Card ───────────────────────────────────────────────────────────────
function StepItem({ icon: Icon, step, title, body, index }: { icon: any, step: string, title: string, body: string, index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeUp}
      className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-20 border-b border-border/50 last:border-0"
    >
      <div className={`flex-1 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full text-orange text-xs font-bold mb-6 border border-orange/20">
          <span className="w-5 h-5 rounded-full bg-orange text-white flex items-center justify-center text-[10px]">{step}</span>
          The Methodology
        </div>
        <h2 className="text-4xl font-black text-navy mb-6 leading-tight max-w-md">{title}</h2>
        <p className="text-content-secondary text-lg leading-relaxed mb-8 max-w-xl">{body}</p>
        
        <ul className="space-y-4 mb-8">
          {['Instant processing', 'Automated data mapping', 'Real-time validation'].map(item => (
            <li key={item} className="flex items-center gap-3 text-navy/70 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-success" />
              {item}
            </li>
          ))}
        </ul>

        {index === 0 && (
          <Link to="/resources/docs" className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl text-xs font-black uppercase hover:bg-navy-dark transition-all">
            Technical Specs <ArrowRight className="w-4 h-4 text-orange" />
          </Link>
        )}
        {index === 1 && (
          <Link to="/resources/api" className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl text-xs font-black uppercase hover:bg-navy-dark transition-all">
            API Endpoints <ArrowRight className="w-4 h-4 text-orange" />
          </Link>
        )}
        {index === 2 && (
          <Link to="/resources/help" className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl text-xs font-black uppercase hover:bg-navy-dark transition-all">
            Help Center <ArrowRight className="w-4 h-4 text-orange" />
          </Link>
        )}
      </div>

      <div className={`flex-1 relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
        <div className="aspect-[4/3] bg-gradient-to-br from-surface to-white rounded-3xl border border-border shadow-elevated flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-navy/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Icon className="w-24 h-24 text-orange group-hover:scale-110 transition-transform duration-500" />
          
          {/* Decorative elements */}
          <div className="absolute top-6 left-6 p-3 bg-white border border-border rounded-xl shadow-card animate-pulse">
            <Zap className="w-4 h-4 text-orange" />
          </div>
          <div className="absolute bottom-6 right-6 p-3 bg-white border border-border rounded-xl shadow-card">
            <Activity className="w-4 h-4 text-cyan" />
          </div>
        </div>
        
        {/* Floating backdrop blur element */}
        <div className={`absolute -z-10 w-64 h-64 bg-orange/5 blur-3xl rounded-full ${index % 2 === 1 ? '-left-12 top-0' : '-right-12 bottom-0'}`} />
      </div>
    </motion.div>
  );
}

export function HowItWorksPage() {
  const steps = [
    {
      icon: Upload,
      step: '01',
      title: 'Seamless Data Integration',
      body: 'Simply upload your supply chain logs in CSV or Excel format. Our AI-driven engine instantly analyzes the structure and prepares it for processing.'
    },
    {
      icon: Brain,
      step: '02',
      title: 'Intelligent Pattern Recognition',
      body: 'Vyn’s neural network scans your workflows, identifying anomalies, tracing bottlenecks, and calculating risk scores for each individual process step.'
    },
    {
      icon: Target,
      step: '03',
      title: 'Actionable Strategic Insights',
      body: 'Rather than overwhelming you with raw data, we deliver clear, prioritized action items. You gain total visibility into exactly where and how to improve.'
    }
  ];

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="bg-surface py-20 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange/20 rounded-full text-orange text-sm font-semibold mb-8"
            >
              <Zap className="w-4 h-4 shrink-0" />
              Inside the AI Platform
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-5xl lg:text-7xl font-black text-navy leading-[1.1] mb-8"
            >
              Efficiency, decoded by <span className="text-orange">Intelligence.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl text-content-secondary leading-relaxed mb-10"
            >
              Experience the power of Vyn. We transform raw logistics logs into predictive insights in under 90 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Button href="/register" size="lg" className="px-10 h-14 text-base shadow-xl shadow-orange/25">
                Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 md:px-6">
          {steps.map((s, idx) => (
            <StepItem key={s.step} {...s} index={idx} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-navy text-white text-center overflow-hidden relative">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-black">Ready to see it in action?</h2>
            <p className="text-white/60 text-lg">Join forward-thinking logistics teams using intelligence to outrun the competition.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/register" size="lg" className="shadow-2xl shadow-orange/30">Get Started Free</Button>
              <Button href="/demo" variant="outline" size="lg" className="text-white border-white/20 hover:bg-white/10">Watch Demo</Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
