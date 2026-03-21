import { Mail, MapPin, MessageCircle, Send, Globe, Zap, ArrowRight } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';

export function ContactPage() {
  return (
    <div className="pt-24 min-h-screen bg-white">
      {/* Hero Head */}
      <section className="bg-navy py-20 lg:py-32 text-white relative flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-orange/5 blur-[120px] rounded-full" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-xs font-black uppercase tracking-widest mb-10">
            <MessageCircle className="w-3.5 h-3.5 text-orange" /> Got Questions?
          </div>
          <h1 className="text-5xl lg:text-7xl font-black mb-6 italic">Let's <span className="text-orange underline decoration-orange/20 underline-offset-8">Connect.</span></h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto font-medium">Our team of logistics architects and AI experts are here to help you revolutionize your supply chain analytics.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Info Side */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-black text-navy mb-6 italic underline decoration-orange/20 decoration-8 underline-offset-[-2px]">Our Hubs</h2>
              <div className="space-y-8 mt-10">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange flex items-center justify-center shrink-0 border border-orange/10"><MapPin className="w-6 h-6" /></div>
                  <div>
                    <h4 className="text-lg font-black text-navy mb-1 tracking-tight">Ho Chi Minh City, Vietnam</h4>
                    <p className="text-content-secondary text-sm leading-relaxed">District 1, Ho Chi Minh City, Vietnam <br /> (Built while during Lotus Hackathon 2026)</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy flex items-center justify-center shrink-0 border border-navy/10"><Globe className="w-6 h-6" /></div>
                  <div>
                    <h4 className="text-lg font-black text-navy mb-1 tracking-tight">Global Ops</h4>
                    <p className="text-content-secondary text-sm leading-relaxed">Operating 24/7 regions to support global supply chain networks.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-navy text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Zap className="w-20 h-20 text-orange" /></div>
              <h3 className="text-2xl font-black mb-6">Need Immediate Support?</h3>
              <p className="text-white/60 mb-8 leading-relaxed italic">Our specialist AI architects are ready for direct calls if you are an enterprise tier user.</p>
              <div className="space-y-4">
                <a href="mailto:hello@vyn.ai" className="flex items-center gap-4 text-orange font-black hover:translate-x-1 transition-transform group/link">
                  <Mail className="w-5 h-5" /> hello@vyn.ai <ArrowRight className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-10 lg:p-12 rounded-[3.5rem] bg-surface/50 border border-border shadow-card relative">
            <h2 className="text-3xl font-black text-navy mb-10">Send a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-navy/40 ml-1">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full px-6 py-4 rounded-2xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange/20 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-navy/40 ml-1">Email Address</label>
                  <input type="email" placeholder="john@company.com" className="w-full px-6 py-4 rounded-2xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange/20 transition-all font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-navy/40 ml-1">Inquiry Type</label>
                <select className="w-full px-6 py-4 rounded-2xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange/20 transition-all font-medium appearance-none">
                  <option>Core Features & Intelligence</option>
                  <option>Enterprise API Integration</option>
                  <option>Security & Architecture</option>
                  <option>Sample Data Request</option>
                  <option>Other / Custom Inquiry</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-navy/40 ml-1">Message</label>
                <textarea rows={5} placeholder="Tell us how we can help..." className="w-full px-6 py-4 rounded-2xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange/20 transition-all font-medium resize-none" />
              </div>
              <Button size="lg" className="w-full h-16 shadow-xl shadow-orange/20 font-black uppercase tracking-widest gap-3">
                Send Intelligence <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
