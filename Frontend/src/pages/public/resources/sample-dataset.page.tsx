import { motion } from 'framer-motion';
import { Download, Table, FileText, Database, Zap, CheckCircle2, Package, Truck, ArrowRight } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

export function SampleDatasetsPage() {
  const datasets = [
    {
      title: 'Transporter Performance Log',
      id: 'S-2026-001',
      desc: 'Real carrier performance logs from Southeast Asian routing, with over 10,000 unique process nodes.',
      type: 'CSV',
      size: '2.4 MB',
      icon: Truck,
      color: 'bg-orange-50 text-orange border border-orange/10 shadow-orange/10'
    },
    {
      title: 'Warehouse Operations v4',
      id: 'S-2026-002',
      desc: 'Detailed pick-and-pack workflow metrics from multiple distribution centers with anonymized KPI data.',
      type: 'XLSX',
      size: '4.8 MB',
      icon: Package,
      color: 'bg-navy-50 text-navy border border-navy/10 shadow-navy/10'
    },
    {
      title: 'Multimodal Freight Stream',
      id: 'S-2026-003',
      desc: 'Combined air and sea freight process logs, highlighting complex intermodal bottleneck scenarios.',
      type: 'CSV',
      size: '1.2 MB',
      icon: Database,
      color: 'bg-cyan-50 text-cyan border border-cyan/10 shadow-cyan/10'
    },
    {
      title: 'Retail Last-Mile Log',
      id: 'S-2026-004',
      desc: 'Comprehensive B2C delivery timelines with high-frequency customer delivery touchpoint analytics.',
      type: 'CSV',
      size: '850 KB',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo border border-indigo/10 shadow-indigo/10'
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-white">
      {/* Hero Header */}
      <section className="bg-surface py-20 lg:py-32 relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/20 border border-orange/40 rounded-full text-orange text-xs font-black uppercase tracking-widest mb-10">
            <Table className="w-3.5 h-3.5" /> Benchmarked Datasets
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-navy mb-8 leading-[1.05]">Test the power of <br /> <span className="text-orange">Vyn Intelligence.</span></h1>
          <p className="text-xl text-content-secondary max-w-2xl mx-auto leading-relaxed">Don't have your own data logs yet? Download one of our curated datasets to explore the platform's visual insights and neural mapping engine.</p>
        </div>
      </section>

      {/* Grid of Datasets */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {datasets.map((ds, i) => (
              <motion.div
                key={ds.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-10 rounded-[3rem] border border-border bg-white hover:border-orange/20 hover:shadow-elevated transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-lg ${ds.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <ds.icon className="w-10 h-10" />
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <p className="text-[10px] font-black uppercase text-content-muted tracking-widest mb-1">{ds.id}</p>
                        <h3 className="text-2xl font-black text-navy group-hover:text-orange transition-colors">{ds.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 bg-surface border border-border rounded-lg text-[10px] font-black uppercase text-navy/50">{ds.type}</span>
                        <span className="px-2.5 py-1 bg-surface border border-border rounded-lg text-[10px] font-black uppercase text-navy/50">{ds.size}</span>
                      </div>
                    </div>

                    <p className="text-content-secondary text-sm leading-relaxed italic">{ds.desc}</p>
                    
                    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border/50">
                      <button className="flex items-center gap-3 px-8 py-3.5 bg-navy rounded-2xl text-white text-xs font-black uppercase hover:bg-navy-dark transition-all shadow-md active:scale-95 group/btn">
                        Download Dataset <Download className="w-4 h-4 text-orange group-hover/btn:translate-y-0.5" />
                      </button>
                      <a href="#" className="text-xs font-black uppercase text-navy/40 hover:text-orange transition-all flex items-center gap-2">
                        Sample Preview <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Background decorative counts */}
                <div className="absolute bottom-6 right-6 text-orange/5 opacity-0 group-hover:opacity-100 transition-opacity"><CheckCircle2 className="w-20 h-20" /></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-navy py-24 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 opacity-10 blur-3xl rounded-full bg-orange -translate-y-1/2 translate-x-1/2" />
        <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <Zap className="w-16 h-16 text-orange mb-10 shadow-glow" />
          <h2 className="text-3xl lg:text-5xl font-black mb-8 max-w-2xl">Ready to analyze your own data?</h2>
          <p className="text-xl text-white/50 max-w-xl mx-auto mb-12 italic">Join logistics leaders globally who utilize Vyn to decode their process flows.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button href="/register" size="lg" className="px-12 h-16 shadow-2xl shadow-orange/30">Start Uploading</Button>
            <Button variant="outline" size="lg" className="px-12 h-16 border-white/20 text-white hover:bg-white/10">Learn More</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
