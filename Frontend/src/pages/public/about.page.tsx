import { motion, type Variants } from 'framer-motion';
import { Target, Shield, Heart, Users, Globe, Zap, CheckCircle2, Award, Mail, Github } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';

// ─── Animation variants ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: idx * 0.1, ease: 'easeOut' as const }
  }),
};

// ─── Value Card ──────────────────────────────────────────────────────────────
function ValueCard({ icon: Icon, title, body, index }: { icon: any, title: string, body: string, index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      custom={index}
      className="p-8 rounded-3xl border border-border bg-white hover:border-orange/20 hover:shadow-elevated transition-all duration-300 group"
    >
      <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-navy mb-3">{title}</h3>
      <p className="text-content-secondary text-sm leading-relaxed">{body}</p>
    </motion.div>
  );
}

export function AboutPage() {
  return (
    <div className="pt-24 min-h-screen">
      {/* ── Hero Section ── */}
      <section className="bg-navy py-24 lg:py-36 relative overflow-hidden text-center">
        {/* Abstract background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-orange/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-xs font-black uppercase tracking-widest mb-10 shadow-lg"
          >
            <Zap className="w-3.5 h-3.5 text-orange" />Our Mission
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-5xl lg:text-7xl font-black mb-8 leading-[1.05]"
          >
            Logistics, <span className="bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent italic">Simplified</span> <br /> by Intelligence.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            We're building the first Zero-Friction supply chain intelligence platform that empowers operations teams to act with the speed and precision of AI.
          </motion.p>
        </div>
      </section>

      {/* ── Core Philosophy ── */}
      <section className="bg-white py-24 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1">
            <h2 className="text-4xl font-black text-navy mb-8 leading-tight">Beyond Dashboards — Providing <span className="text-orange underline decoration-orange/20 underline-offset-8">Decisions.</span></h2>
            <div className="space-y-6">
              {[
                { title: 'Zero-Friction Integration:', text: 'Eliminate the hours spent on data preparation. Focus on action.' },
                { title: 'Autonomous Intelligence:', text: 'AI that finds the root cause, not just the symptom of a delay.' },
                { title: 'Empowering Growth:', text: 'Tools built for every team member, from logistics managers to enterprise VPs.' }
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 bg-surface rounded-2xl border border-border/50 group hover:border-orange/20 transition-all"
                >
                  <h4 className="font-black text-navy text-lg mb-2">{item.title}</h4>
                  <p className="text-content-secondary leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="aspect-square bg-gradient-to-br from-orange/20 to-orange/5 rounded-[48px] p-2 rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-full bg-white rounded-[42px] border border-orange/10 shadow-elevated flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 rounded-full bg-orange flex items-center justify-center mb-8 shadow-xl shadow-orange/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black text-navy mb-4">Born while during Lotus Hackathon 2026</h3>
                <p className="text-content-secondary leading-relaxed">A team with passion, dedicated to redefining how human intelligence interacts with supply chain data.</p>
              </div>
            </div>
            
            {/* Background decorative blob */}
            <div className="absolute -z-10 top-0 left-0 w-full h-full bg-navy/5 blur-[80px] rounded-full scale-125" />
          </div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="bg-surface py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-navy mb-4">The Vyn Values</h2>
            <p className="text-content-secondary max-w-xl mx-auto italic font-medium">The principles that guide every feature we ship and every decision we make.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueCard icon={Target} index={0} title="Impact-First" body="Complexity must be earned. We prioritize insights that lead to immediate, large-scale operational improvements." />
            <ValueCard icon={Shield} index={1} title="Radical Transparency" body="We value clear data lineage. You should always know exactly how our AI reached its conclusions." />
            <ValueCard icon={Heart} index={2} title="A Human Approach" body="AI is an assistant, not a replacement. We build for the people running the world's most complex workflows." />
            <ValueCard icon={Globe} index={3} title="Global Scale" body="Intelligence should have no borders. We empower logistics networks across every continent." />
            <ValueCard icon={Users} index={4} title="Trust Over Features" body="Building reliable infrastructure is our baseline. Data privacy is integrated into our DNA, not an afterthought." />
            <ValueCard icon={Zap} index={5} title="Uncompromising Speed" body="We measures results in seconds, not months. We believe efficiency starts with the tool you use." />
          </div>
        </div>
      </section>

      {/* ── Benchmarks Highlight ── */}
      <section className="py-24 bg-navy text-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-orange font-black text-xs uppercase tracking-[0.3em] mb-4">Engine Benchmarks</p>
            <h2 className="text-3xl font-black">Built for Enterprise Scale.</h2>
          </div>
          
          <div className="flex flex-wrap justify-between items-center gap-12">
            {[
              { label: 'Time-to-first insight', val: '90s' },
              { label: 'Detection accuracy', val: '94%' },
              { label: 'Rows per upload', val: '1M+' },
              { label: 'Setup time required', val: '0s' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex-1 text-center min-w-[200px]"
              >
                <div className="text-5xl lg:text-6xl font-black text-orange mb-3 tracking-tighter italic">{stat.val}</div>
                <div className="text-sm font-bold text-white/40 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-navy mb-4">The Architects of Intelligence</h2>
            <p className="text-content-secondary max-w-xl mx-auto">A team with passion, dedicated to redefining how human intelligence interacts with supply chain data.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                name: 'Võ Tuấn Hùng (Hans)', 
                role: 'Team Leader', 
                bio: 'AI researcher focused on supply chain optimization.', 
                color: 'from-orange to-orange-dark',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop',
                email: 'votuanhung1205.work@gmail.com',
                github: 'https://github.com/h4nsx'
              },
              { 
                name: 'Nguyễn Tăng Minh Thông (Stone)', 
                role: 'Backend Engineer', 
                bio: 'Expert in high-throughput data pipelines and ML architecture.', 
                color: 'from-navy to-navy-dark',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop',
                email: 'Thongntmse171742@fpt.edu.vn',
                github: 'https://github.com/thongntms171742'
              },
              { 
                name: 'Trần Quốc Huy (Quwy)', 
                role: 'AI Engineer', 
                bio: 'Obsessed with creating zero-friction, human-centric interfaces.', 
                color: 'from-cyan to-cyan-dark',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop',
                email: 'Paper250805@gmail.com',
                github: 'https://github.com/quwyimn'
              },
              { 
                name: 'Nguyễn Văn Linh (Louis)', 
                role: 'Frontend & Documentation', 
                bio: 'Specialist in neural bottleneck detection and risk modeling.', 
                color: 'from-success to-success-dark',
                image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&auto=format&fit=crop',
                email: 'nglinhvan189@gmail.com',
                github: 'https://github.com/mazino189'
              },
            ].map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group flex flex-col items-center text-center focus-within:ring-2 focus-within:ring-orange/20 rounded-3xl p-6 transition-all hover:bg-surface border border-transparent hover:border-border"
              >
                {/* Avatar / Photo */}
                <div className={`w-32 h-32 rounded-[2rem] bg-gradient-to-br ${member.color} mb-6 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-black/10 transition-transform group-hover:scale-105 group-hover:rotate-3 overflow-hidden border-2 border-transparent group-hover:border-orange/20`}>
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                
                <h3 className="text-xl font-black text-navy mb-1">{member.name}</h3>
                <p className="text-orange text-xs font-black uppercase tracking-widest mb-4">{member.role}</p>
                <p className="text-content-secondary text-sm leading-relaxed mb-6 px-4">{member.bio}</p>

                {/* Social row */}
                <div className="flex items-center gap-3 mt-auto">
                  <a href={`mailto:${member.email}`} className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface border border-border text-content-muted hover:text-orange hover:border-orange/20 transition-all" title="Email">
                    <Mail className="w-4 h-4" />
                  </a>
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface border border-border text-content-muted hover:text-navy hover:border-navy/20 transition-all" title="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTASection ── */}
      <section className="bg-white py-24 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 lg:p-16 rounded-[48px] bg-surface border border-border shadow-elevated relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange/10 transition-all duration-700" />
            <Award className="w-16 h-16 text-orange/30 mx-auto mb-8 animate-bounce" />
            <h2 className="text-4xl lg:text-5xl font-black text-navy mb-8">Empower your logistics today.</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/register" size="lg" className="px-10 h-14 shadow-xl shadow-orange/20">Get Started Free</Button>
              <Button href="/contact" variant="outline" size="lg" className="px-10 h-14 border-navy/10 text-navy hover:bg-navy/5">Talk to Us</Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
