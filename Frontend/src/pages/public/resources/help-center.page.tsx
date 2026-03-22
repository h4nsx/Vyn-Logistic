import { motion } from 'framer-motion';
import { Search, HelpCircle, User, Settings, Info, Briefcase, Zap, ArrowRight, MessageCircle, Mail, Phone, FileText } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

export function HelpCenterPage() {
  const categories = [
    { title: 'Your Account', desc: 'Securely manage your profile, security, and team settings.', icon: User, color: 'text-orange bg-orange-50 border-orange/10' },
    { title: 'Billing & Plans', desc: 'Control your subscription and manage billing cycles.', icon: Briefcase, color: 'text-navy bg-navy-50 border-navy/10' },
    { title: 'Platform Basics', desc: 'Core tutorials to get you running with Vyn in minutes.', icon: Settings, color: 'text-cyan bg-cyan-50 border-cyan/10' },
    { title: 'Trust & Privacy', desc: 'Everything you need to know about our data policies.', icon: Info, color: 'text-success bg-success-50 border-success/10' },
  ];

  return (
    <div className="pt-24 min-h-screen bg-white">
      {/* Search Hero */}
      <section className="bg-navy py-24 lg:py-36 relative overflow-hidden text-center text-white">
        {/* Background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-orange/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-xs font-black uppercase tracking-widest mb-10">
            <HelpCircle className="w-3.5 h-3.5 text-orange" /> Vyn Support
          </div>
          <h1 className="text-4xl lg:text-7xl font-black mb-10 leading-[1.05]">How can we <span className="bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent italic">help</span> you?</h1>
          
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30 group-hover:text-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search help articles..." 
              className="w-full pl-16 pr-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-lg focus:outline-none focus:ring-2 focus:ring-orange/20 focus:bg-white/10 transition-all font-medium placeholder:text-white/20"
            />
          </div>
        </div>
      </section>

      {/* Grid Categories */}
      <section className="bg-surface py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-10 rounded-[3rem] bg-white border border-border hover:border-orange/20 transition-all hover:shadow-elevated text-center lg:text-left shadow-card"
              >
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 mx-auto lg:mx-0 border ${cat.color} group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-navy mb-3 group-hover:text-orange transition-colors">{cat.title}</h3>
                <p className="text-sm text-content-secondary leading-relaxed mb-6 italic">{cat.desc}</p>
                <a href="#" className="flex items-center justify-center lg:justify-start gap-2 text-xs font-black uppercase text-navy hover:text-orange transition-all">
                  Browse <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="bg-white py-24 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-black text-navy mb-16 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is my supply chain data encrypted?', a: 'Yes. We use standard AES-256 encryption at rest and TLS 1.3 in transit. Your process logs are securely siloed.' },
              { q: 'How many files can I upload per day?', a: 'Free accounts support up to 3 datasets daily. Enterprise accounts offer unlimited high-frequency uploads.' },
              { q: 'Can I export insights to Excel?', a: 'Absolutely. Every process map and bottleneck trace can be exported to CSV, XLSX, or PDF report formats.' },
              { q: 'Does Vyn support multi-currency routing?', a: 'Vyn’s neural mapper is currency-agnostic by default, allowing you to track costs in any format provided in your log files.' }
            ].map(faq => (
              <div key={faq.q} className="p-8 rounded-[2rem] bg-surface/50 border border-border/50 hover:bg-white hover:border-orange/20 transition-all cursor-pointer group">
                <div className="flex items-center justify-between gap-6">
                  <h4 className="font-black text-navy text-lg group-hover:text-orange transition-colors leading-relaxed">{faq.q}</h4>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-orange shadow-sm group-hover:bg-orange group-hover:text-white transition-all"><Zap className="w-4 h-4 fill-current" /></div>
                </div>
                <p className="text-content-secondary text-base leading-relaxed mt-4 italic">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support section */}
      <section className="bg-navy py-24 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 opacity-10 blur-3xl rounded-full bg-orange -translate-y-1/2 translate-x-1/2" />
        <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
          <div className="max-w-4xl mx-auto rounded-[3.5rem] p-12 lg:p-16 bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col md:flex-row items-center gap-16 text-center md:text-left group">
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-orange flex items-center justify-center shadow-2xl shadow-orange/30 group-hover:scale-110 transition-transform"><MessageCircle className="w-16 h-16 text-white" /></div>
            </div>
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl lg:text-5xl font-black mb-4 flex items-center justify-center md:justify-start gap-4">Still need <span className="text-orange underline decoration-orange/20 underline-offset-8">help?</span></h2>
              <p className="text-white/60 mb-0 font-medium italic">Our specialist Vyn architects are available 24/7 for enterprise support. Contact us directly through any channel.</p>
              <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                <Button href="/contact" size="lg" className="px-10 h-14 bg-white text-navy hover:bg-white/90">Email Support</Button>
                <button className="flex items-center gap-3 px-8 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white text-xs font-black uppercase hover:bg-white/15 transition-all">Talk to Sales <Phone className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
