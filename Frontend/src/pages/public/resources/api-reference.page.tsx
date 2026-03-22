import { Send, Lock, Zap, Code, ArrowRight, ChevronDown, CheckCircle } from 'lucide-react';

export function ApiReferencePage() {
  const endpoints = [
    { method: 'POST', path: '/api/v1/auth/signin', desc: 'Securely authenticate and receive an JWT access token.' },
    { method: 'POST', path: '/api/v1/datasets/upload', desc: 'Stream a CSV or Excel file to the neural mapper.' },
    { method: 'GET', path: '/api/v1/analytics/bottlenecks', desc: 'Retrieve traced bottlenecks and risk scores.' },
    { method: 'GET', path: '/api/v1/datasets/:id', desc: 'Get full structural metadata of a processed dataset.' },
  ];

  return (
    <div className="pt-24 min-h-screen bg-white">
      {/* Hero Head */}
      <section className="bg-navy py-16 lg:py-24 text-white relative flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-orange/5 blur-[120px] rounded-full" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-xs font-black uppercase tracking-widest mb-10">
            <Send className="w-3.5 h-3.5 text-orange" /> v1.0 Legacy API
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-6">REST API Reference</h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto italic font-medium">Build custom integrations directly into your data warehouse with our high-throughput RESTful endpoints.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Mini */}
        <aside className="lg:col-span-3 space-y-10 group">
          <nav className="space-y-3">
            <h4 className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] mb-4">Core Concepts</h4>
            {['Authentication', 'Error Handling', 'Content Types', 'Rate Limits'].map(item => (
              <a key={item} href="#" className="flex items-center justify-between text-sm font-bold text-navy/60 hover:text-orange transition-all p-3 rounded-xl hover:bg-surface">
                {item}
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </nav>
        </aside>

        {/* Content - Endpoints */}
        <main className="lg:col-span-9 space-y-16">
          {/* Security Banner */}
          <div className="p-8 rounded-[2rem] bg-orange-50 border border-orange/10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-orange flex items-center justify-center shrink-0 shadow-lg shadow-orange/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-black text-navy mb-2">Bearer Token Authentication</h3>
              <p className="text-content-secondary text-sm leading-relaxed max-w-xl">Every request to the Vyn API must be authenticated with a valid JWT provided in the <code className="bg-orange/10 px-2 py-0.5 rounded text-orange">Authorization</code> header.</p>
            </div>
            <div className="shrink-0">
              <button className="flex items-center gap-3 px-6 py-3 bg-navy rounded-xl text-white text-sm font-black uppercase hover:bg-navy-dark transition-all">
                Get API Key <Zap className="w-4 h-4 text-orange fill-orange" />
              </button>
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-3xl font-black text-navy">Primary Endpoints</h2>
            {endpoints.map((ep) => (
              <div key={ep.path} className="group border border-border rounded-3xl overflow-hidden hover:border-orange/20 transition-all bg-white shadow-card">
                <div className="p-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${ep.method === 'POST' ? 'bg-orange text-white shadow-lg shadow-orange/20' : 'bg-cyan text-white shadow-lg shadow-cyan/20'}`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-black text-navy">{ep.path}</span>
                  </div>
                  <p className="flex-1 text-sm text-content-secondary font-medium md:text-right italic">{ep.desc}</p>
                  <ChevronDown className="w-5 h-5 text-content-muted transition-transform group-hover:translate-y-0.5" />
                </div>
                
                {/* Visual JSON/Code snippet (Collapsible feeling) */}
                <div className="px-8 pb-8 flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 p-6 bg-surface rounded-2xl border border-border/50">
                    <p className="text-[10px] font-black uppercase text-content-muted mb-4 tracking-[0.2em]">Request Payload</p>
                    <pre className="text-xs font-mono text-navy/70 leading-relaxed overflow-x-auto">
                      {`{
  "email": "user@vyn.ai",
  "name": "Alex Thompson"
}`}
                    </pre>
                  </div>
                  <div className="flex-1 p-6 bg-navy rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-white/10 opacity-50"><CheckCircle className="w-12 h-12" /></div>
                    <p className="text-orange text-[10px] font-black uppercase mb-4 tracking-[0.2em] relative z-10">Success Response</p>
                    <pre className="text-xs font-mono text-white/80 leading-relaxed relative z-10">
                      {`{
  "status": "success",
  "code": 201,
  "data": { ... }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quickstart Callout */}
          <div className="p-12 bg-surface rounded-[3rem] border border-border flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left relative overflow-hidden group">
            <div className="p-8 rounded-full bg-white shadow-xl shadow-orange/5 group-hover:scale-110 transition-transform"><Code className="w-12 h-12 text-orange " /></div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-navy mb-4">Already using Vyn?</h3>
              <p className="text-content-secondary leading-relaxed max-w-lg mb-0">Check out the full interactive playground and Sandbox mode in the dashboard settings to run live requests.</p>
            </div>
            <div className="shrink-0 flex gap-4">
              <button className="px-8 h-14 bg-navy text-white rounded-2xl font-black uppercase text-xs hover:bg-navy-dark transition-all">Go to Playground</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
