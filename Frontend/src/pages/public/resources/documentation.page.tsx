import { Terminal, ChevronRight, Search, Layout, Database, Shield } from 'lucide-react';

export function DocumentationPage() {
  const sections = [
    { title: 'Introduction', items: ['Getting Started', 'What is Vyn?', 'Architecture Overview'] },
    { title: 'Integration', items: ['CSV Uploads', 'Excel Support', 'Data Sanitization'] },
    { title: 'Intelligence', items: ['Bottleneck Tracing', 'Risk Modeling', 'Pattern Recognition'] },
    { title: 'Exporting', items: ['PDF Reports', 'JSON Exports', 'Cloud Sync'] },
  ];

  return (
    <div className="pt-24 min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-10">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-hover:text-orange transition-colors" />
              <input 
                type="text" 
                placeholder="Search docs..." 
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange/20 transition-all font-medium"
              />
            </div>

            <nav className="space-y-8">
              {sections.map(section => (
                <div key={section.title}>
                  <h4 className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] mb-4">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.items.map(item => (
                      <li key={item}>
                        <a href="#" className="flex items-center gap-2 text-sm font-bold text-navy/60 hover:text-orange transition-all group">
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full text-orange text-xs font-black uppercase mb-6 border border-orange/10">
                <Layout className="w-3 h-3" /> System Docs
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-navy mb-6">Introduction to Vyn Intelligence</h1>
              <p className="text-xl text-content-secondary leading-relaxed">
                Vyn is a zero-friction logistics intelligence platform designed to transform raw log files into predictive insights. This guide will walk you through the fundamental core concepts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {[
                { icon: Shield, title: 'Identity & Access', desc: 'Securely manage team roles and data permissions.' },
                { icon: Database, title: 'Data Structures', desc: 'Learn how our auto-mapper handles disparate schemas.' },
              ].map(card => (
                <div key={card.title} className="p-8 rounded-3xl bg-surface border border-border hover:border-orange/20 transition-all group">
                  <card.icon className="w-8 h-8 text-orange mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="font-black text-navy text-lg mb-2">{card.title}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            <article className="prose prose-navy max-w-none space-y-8">
              <h2 className="text-3xl font-black text-navy border-b border-border pb-4">Getting Started</h2>
              <p className="text-content-secondary leading-relaxed font-medium">
                To begin analyzing your supply chain, you don't need a complex setup. Vyn was built to ingest standard logistics outputs (CSV, XLSX, SQL) and instantly build a process map.
              </p>
              
              <div className="p-8 bg-navy rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Terminal className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-orange text-xs font-black uppercase mb-4 tracking-widest">Quick Snippet</p>
                  <pre className="p-0 m-0 bg-transparent text-white/90 font-mono text-sm leading-relaxed overflow-x-auto">
                    {`# Verify your connection
curl -X GET https://api.vyn.ai/v1/health \\
  -H "Authorization: Bearer \${YOUR_TOKEN}"`}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  'Drag and drop any logistics log file.',
                  'Wait 90s for the neural mapper to process.',
                  'View bottlenecks on your interactive dashboard.'
                ].map((step, i) => (
                  <div key={step} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-orange/10 text-orange flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                    <p className="text-navy/70 font-semibold">{step}</p>
                  </div>
                ))}
              </div>
            </article>

            {/* Page Navigation */}
            <div className="mt-20 pt-10 border-t border-border flex justify-between items-center">
              <div className="text-left group cursor-pointer">
                <p className="text-[10px] font-black uppercase text-content-muted mb-1">Previous</p>
                <div className="text-navy font-black text-lg flex items-center gap-1 group-hover:text-orange transition-colors">
                  Overview
                </div>
              </div>
              <div className="text-right group cursor-pointer">
                <p className="text-[10px] font-black uppercase text-content-muted mb-1">Next</p>
                <div className="text-navy font-black text-lg flex items-center gap-1 group-hover:text-orange transition-colors">
                  Column Mapping <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
