import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Network, PieChart, TrendingUp, BrainCircuit, X, Upload } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ReportType = {
  id: string;
  title?: string;
  description?: string;
  icon?: any;
  image?: string;
  colSpan: string;
  color?: string;
  iconColor?: string;
  isCta?: boolean;
};

const reports: ReportType[] = [
  {
    id: 'portfolio',
    title: 'End-to-End Supply Chain Coverage',
    description: 'Our AI actively monitors every stage of the logistics process, ensuring holistic risk management across all domains.',
    icon: Network,
    image: '/assets/reports/cross_process_monthly_avg_risk.png',
    colSpan: 'md:col-span-2 md:row-span-2',
    color: 'from-navy-50 to-cyan-50',
    iconColor: 'text-navy',
  },
  {
    id: 'deep-analysis',
    title: 'Deep Risk Analysis',
    description: 'Pinpoint accuracy in classifying low, moderate, and high-risk shipments.',
    icon: ShieldCheck,
    image: '/assets/reports/trucking_model_risk_overview.png',
    colSpan: 'md:col-span-1 md:row-span-1',
    color: 'from-cyan-50 to-cyan-50',
    iconColor: 'text-cyan',
  },
  {
    id: 'actionable',
    title: 'Actionable Insights',
    description: 'Clear, categorized severity breakdowns allow your team to prioritize critical issues.',
    icon: PieChart,
    image: '/assets/reports/warehouse_severity_mix_donut.png',
    colSpan: 'md:col-span-1 md:row-span-1',
    color: 'from-orange-50 to-orange-50',
    iconColor: 'text-orange',
  },
  {
    id: 'tracking',
    title: 'Continuous Tracking',
    description: 'The AI continuously monitors historical trends, proving its reliability over time.',
    icon: TrendingUp,
    image: '/assets/reports/customs_monthly_risk_trend.png',
    colSpan: 'md:col-span-1 md:row-span-1',
    color: 'from-navy-50 to-navy-50',
    iconColor: 'text-navy-light',
  },
  {
    id: 'xai',
    title: 'Explainable AI (XAI)',
    description: 'No black-box models. See exactly which features drive every AI decision.',
    icon: BrainCircuit,
    image: '/assets/reports/driver_feature_importance.png',
    colSpan: 'md:col-span-1 md:row-span-1',
    color: 'from-orange-50 to-cyan-50',
    iconColor: 'text-navy',
  },
  {
    id: 'cta',
    isCta: true,
    colSpan: 'md:col-span-1 md:row-span-1',
  }
];

export function ReportGallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="py-24 bg-white text-navy relative overflow-hidden">
      {/* Background ambient glow matching light theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-16 text-center mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-50 rounded-full text-cyan-dark text-xs font-bold mb-4 border border-cyan/20">
            Trust & Transparency
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-black tracking-tight mb-6 text-navy"
          >
            AI You Can Trust. Proven Results.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-content-secondary leading-relaxed"
          >
            We believe in complete transparency. Our models are continuously evaluated and monitored. 
            Here is the raw data and visual evidence proving the effectiveness and explainability of our Logistics AI.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {reports.map((report, index) => {
            if (report.isCta) {
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={cn(
                    "group relative rounded-3xl overflow-hidden border-2 border-dashed border-border bg-surface hover:border-orange hover:bg-orange/5 transition-all duration-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer shadow-sm",
                    report.colSpan
                  )}
                  onClick={() => window.location.href = '/register'}
                >
                  <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-transform duration-300">
                    <Upload className="w-7 h-7 text-orange" />
                  </div>
                  <h3 className="text-xl font-black text-navy mb-2">Test Your Data</h3>
                  <p className="text-sm text-content-secondary leading-relaxed max-w-[200px]">
                    Upload your logistics logs and see the AI generate these insights in 90 seconds.
                  </p>
                </motion.div>
              );
            }

            const Icon = report.icon;
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={cn(
                  "group relative rounded-3xl overflow-hidden border border-border bg-white shadow-card hover:shadow-elevated transition-all duration-300 cursor-zoom-in",
                  report.colSpan
                )}
                onClick={() => setSelectedImage(report.image!)}
              >
                <div className="flex flex-col h-full relative z-10">
                  {/* Text Header */}
                  <div className="p-6 relative z-10 bg-gradient-to-b from-white via-white/95 to-transparent pb-16">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("p-2 rounded-xl bg-surface border border-border shadow-sm", report.iconColor)}>
                        <Icon size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-navy">{report.title}</h3>
                    </div>
                    <p className="text-sm font-medium text-content-secondary max-w-sm">
                      {report.description}
                    </p>
                  </div>
                  
                  {/* Image Container */}
                  <div className="absolute inset-x-0 bottom-0 top-32 flex items-end justify-center p-6">
                    <img 
                      src={report.image} 
                      alt={report.title}
                      className="w-full h-full object-contain object-bottom group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-sm"
                    />
                  </div>
                </div>

                {/* Subtle hover gradient overlay */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none z-20",
                  report.color
                )} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-navy/90 backdrop-blur-md cursor-zoom-out"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors shadow-lg"
            >
              <X size={24} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Enlarged Report"
              className="w-auto h-auto max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-4 ring-white/10 bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
