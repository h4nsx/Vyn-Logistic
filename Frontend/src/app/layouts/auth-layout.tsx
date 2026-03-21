import { Outlet, Link } from 'react-router-dom';
import { Zap, ShieldCheck, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: ShieldCheck, text: 'AI-Powered Anomaly Detection' },
  { icon: Activity, text: 'Real-time Process Monitoring' },
  { icon: TrendingUp, text: 'Predictive Bottleneck Analysis' },
];

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Panel — Decorative (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy via-navy-dark to-navy-900 flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <Link to="/" className="flex items-center gap-2.5 z-10 w-fit group">
          <div className="bg-gradient-to-br from-orange to-orange-dark text-white p-2 rounded-xl shadow-lg shadow-orange/30 group-hover:shadow-orange/40 transition-shadow">
            <Zap className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            Vyn - Supply Chain Detection
          </span>
        </Link>

        <div className="z-10 max-w-md space-y-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold text-white mb-4 leading-tight"
            >
              Detect. Diagnose.<br />
              <span className="bg-gradient-to-r from-orange to-cyan-light bg-clip-text text-transparent">
                Deliver.
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/50 text-lg leading-relaxed"
            >
              Intelligent supply chain analytics — powered by machine learning.
            </motion.p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {features.map((feat, idx) => (
              <motion.div
                key={feat.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                className="flex items-center gap-3 text-white/60"
              >
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <feat.icon className="w-4 h-4 text-orange-light" />
                </div>
                <span className="text-sm font-medium">{feat.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="z-10 flex items-center gap-2 text-white/30 text-xs font-medium"
        >
          <ShieldCheck className="w-4 h-4" />
          Enterprise-grade security · SOC 2 Type II
        </motion.div>
      </div>

      {/* Right Panel — Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}