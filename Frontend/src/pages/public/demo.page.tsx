import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle, 
  Zap, Download, Truck, Warehouse, 
  ShieldCheck, History, Activity, Database, Package, Eye,
  ChevronLeft, Clock, TrendingUp, Globe, Loader2, Circle
} from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { demoDatasets } from './demoData';

/* ═══════════════════════════════════════════
   TYPES & MOCK DATA LOGIC
   ═══════════════════════════════════════════ */

type DemoPhase = 'dashboard' | 'preview' | 'analyzing' | 'results';
type DatasetType = 'events' | 'safety_incidents' | 'tracking_log';

interface DatasetOption {
  id: DatasetType;
  name: string;
  icon: any;
  description: string;
  rows: number;
  color: string;
  bg: string;
  status: 'Healthy' | 'Elevated' | 'Warning';
  date: string;
}

const datasetOptions: DatasetOption[] = [
  { id: 'events', name: 'Global Process Events', icon: Database, description: 'Baseline APAC-EU trade data.', rows: 15200, color: 'text-orange', bg: 'bg-orange-50', status: 'Healthy', date: 'Oct 24, 14:00' },
  { id: 'safety_incidents', name: 'Safety & Incidents', icon: ShieldCheck, description: 'High-volatility risk clusters.', rows: 28400, color: 'text-anomaly', bg: 'bg-anomaly/5', status: 'Elevated', date: 'Oct 24, 15:30' },
  { id: 'tracking_log', name: 'Historical Tracking Logs', icon: History, description: 'Clean benchmarks for validation.', rows: 8900, color: 'text-cyan', bg: 'bg-cyan-50', status: 'Warning', date: 'Oct 24, 16:45' },
];

const analysisSteps = [
  { label: 'Structuring Data', desc: 'Parsing logs and building activity graph', duration: 1200 },
  { label: 'Calculating Metrics', desc: 'Computing duration and sequence transitions', duration: 1500 },
  { label: 'Running AI Model', desc: 'Comparing against standard operating bounds', duration: 1800 },
  { label: 'Detecting Bottlenecks', desc: 'Identifying root causes and risk levels', duration: 1500 },
];

// Mock generator for the results table (kept from original)
const generateData = (type: DatasetType) => {
  const steps = [
    { step: 'Sanitization', location: 'System Core', mean: 12, std: 4, p95: 18 },
    { step: 'Clustering', location: 'Neural Node', mean: 120, std: 30, p95: 160 },
    { step: 'Stress Check', location: 'Vulnerability Loop', mean: 55, std: 22, p95: 90 },
    { step: 'Final Synthesis', location: 'Outcome Layer', mean: 20, std: 8, p95: 35 },
  ];
  
  const rows = [];
  for (let i = 0; i < 60; i++) {
    const cfg = steps[i % steps.length];
    const isAnomaly = Math.random() > (type === 'safety_incidents' ? 0.6 : type === 'tracking_log' ? 0.9 : 0.75);
    const actual = isAnomaly 
      ? Math.round(cfg.mean + cfg.std * (3 + Math.random() * 2)) 
      : Math.round(cfg.mean + (Math.random() - 0.5) * cfg.std);
    const riskPercent = (actual / cfg.p95) * 100;

    rows.push({
      id: i.toString(),
      processId: `TEST-${type.toUpperCase()}-${1000 + i}`,
      step: cfg.step,
      location: cfg.location,
      expectedP95: cfg.p95,
      actual,
      deviation: Math.round(actual - cfg.mean),
      riskPercent: Math.round(riskPercent),
      severity: riskPercent > 100 ? 'High Risk' : riskPercent > 70 ? 'Warning' : 'Normal',
      zScore: Number(((actual - cfg.mean) / cfg.std).toFixed(2)),
    });
  }
  return rows;
};

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */


export function DemoPage() {
  const [phase, setPhase] = useState<DemoPhase>('dashboard');
  const [selectedDataset, setSelectedDataset] = useState<DatasetType | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<any[]>([]);

  // Simulation runner
  useEffect(() => {
    if (phase === 'analyzing') {
      let current = 0;
      const runCycle = () => {
        if (current >= analysisSteps.length) {
          setTimeout(() => {
            setData(generateData(selectedDataset || 'events'));
            setPhase('results');
          }, 600);
          return;
        }
        setActiveStep(current);
        setTimeout(() => { current++; runCycle(); }, analysisSteps[current].duration);
      };
      runCycle();
    }
  }, [phase, selectedDataset]);



  return (
    <div className="min-h-screen bg-surface flex font-sans">
      <main className="flex-1 p-8 relative">
        <AnimatePresence mode="wait">
          
          {/* DASHBOARD PHASE */}
          {phase === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto space-y-8 mt-16">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange/10 rounded-full border border-orange/20 mb-4">
                    <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                    <span className="text-[10px] font-black text-orange uppercase tracking-widest">Sandbox Environment Active</span>
                  </div>
                  <h1 className="text-3xl font-bold text-navy">Logistics Overview</h1>
                  <p className="text-content-secondary mt-1">Select a demo dataset to preview and analyze.</p>
                </div>
              </div>

              {/* Fake KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {[
                  { title: 'Total Analyses', val: '142', icon: Package, col: 'text-navy', bg: 'bg-navy-50' },
                  { title: 'Avg Network Risk', val: '42.4', icon: Activity, col: 'text-orange', bg: 'bg-orange-50' },
                  { title: 'Total Anomalies', val: '891', icon: AlertTriangle, col: 'text-danger', bg: 'bg-danger-50' },
                  { title: 'Stable Operations', val: '14,309', icon: CheckCircle2, col: 'text-success', bg: 'bg-success-50' }
                ].map(k => (
                  <div key={k.title} className="bg-white p-6 rounded-2xl border border-border shadow-card">
                    <div className={`p-2.5 rounded-xl ${k.bg} ${k.col} w-10 h-10 mb-4 flex items-center justify-center`}><k.icon className="w-5 h-5"/></div>
                    <p className="text-content-muted text-xs font-semibold uppercase tracking-wider">{k.title}</p>
                    <h3 className={`text-3xl font-black mt-1 ${k.col}`}>{k.val}</h3>
                  </div>
                ))}
              </div>

              {/* Datasets Table */}
              <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="font-bold text-navy">Demo Datasets Library</h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border bg-surface/50">
                      <th className="px-6 py-4 font-semibold text-content-muted uppercase text-xs">Dataset Name</th>
                      <th className="px-6 py-4 font-semibold text-content-muted uppercase text-xs">Volume</th>
                      <th className="px-6 py-4 font-semibold text-content-muted uppercase text-xs">Status</th>
                      <th className="px-6 py-4 font-semibold text-content-muted uppercase text-xs text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {datasetOptions.map(opt => (
                      <tr key={opt.id} className="hover:bg-navy-50/20 group transition-colors">
                        <td className="px-6 py-4 font-semibold text-navy flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${opt.bg} ${opt.color}`}><opt.icon className="w-4 h-4"/></div>
                          {opt.name}
                        </td>
                        <td className="px-6 py-4 text-content-muted">{opt.rows.toLocaleString()} rows</td>
                        <td className="px-6 py-4">
                          <Badge variant={opt.status === 'Elevated' ? 'danger' : opt.status === 'Warning' ? 'warning' : 'success'} dot>
                            {opt.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="outline" size="sm" icon={<Eye className="w-4 h-4"/>}
                            onClick={() => { setSelectedDataset(opt.id); setPhase('preview'); }}
                          >
                            Preview Data
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* PREVIEW PHASE (Secure) */}
          {phase === 'preview' && selectedDataset && (
            <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl mx-auto mt-16 flex flex-col h-[80vh]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <button onClick={() => setPhase('dashboard')} className="text-orange text-sm font-semibold hover:underline mb-2 flex items-center gap-1">
                    &larr; Back to Dashboard
                  </button>
                  <h2 className="text-3xl font-bold text-navy flex items-center gap-3">
                    Dataset Preview: {datasetOptions.find(d => d.id === selectedDataset)?.name}
                  </h2>
                </div>
                <Button size="lg" onClick={() => setPhase('analyzing')} glow icon={<Zap className="w-4 h-4"/>}>
                  Run AI Analysis
                </Button>
              </div>

              {/* Secure Table Container */}
              <div className="flex-1 bg-white rounded-2xl border border-border shadow-card overflow-hidden relative flex flex-col">
                <div className="p-4 border-b border-border bg-surface/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-danger flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4"/> END-TO-END ENCRYPTION SIMULATED (COPY/DOWNLOAD DISABLED)
                  </span>
                  <span className="text-xs text-content-muted font-mono">Showing first 25 rows</span>
                </div>
                
                <div 
                  className="flex-1 overflow-auto select-none relative" 
                  onContextMenu={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                >
                  {/* Invisible overlay blocking interactions */}
                  <div className="absolute inset-0 z-10 bg-transparent" />
                  
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-border text-content-muted uppercase font-bold sticky top-0 z-0">
                      <tr>
                        {demoDatasets[selectedDataset]?.headers.map((h: string, i: number) => (
                          <th key={i} className="px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-mono text-navy">
                      {demoDatasets[selectedDataset]?.rows.map((row: string[], i: number) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          {row.map((cell: string, j: number) => (
                            <td key={j} className="px-4 py-2">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Gradient Fade for Preview */}
                  <div className="sticky bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-8 z-20 pointer-events-none">
                    <div className="bg-navy px-6 py-2 rounded-full text-white text-sm font-bold shadow-lg pointer-events-auto">
                      Upgrade to unlock all {datasetOptions.find(d => d.id === selectedDataset)?.rows.toLocaleString()} rows
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ANALYZING PHASE */}
          {phase === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center py-10 max-w-lg mx-auto w-full mt-16">
              <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mb-6 relative">
                <Loader2 className="w-10 h-10 text-orange animate-spin absolute" />
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center z-10 shadow-sm text-navy font-black text-xl">
                  AI
                </div>
              </div>
              
              <div className="text-center mb-10 w-full">
                <h3 className="text-2xl font-bold text-navy">Analyzing Process Flow</h3>
                <p className="text-sm text-content-secondary mt-2">
                  Sit tight while our engine processes your events.
                </p>

                <div className="w-full bg-surface h-2 rounded-full overflow-hidden mt-6 border border-border">
                  <div 
                    className="bg-orange h-full transition-all duration-1000 ease-in-out" 
                    style={{ width: `${Math.min(100, (activeStep / (analysisSteps.length - 1)) * 100)}%` }} 
                  />
                </div>
              </div>

              <div className="w-full space-y-4">
                {analysisSteps.map((step, idx) => {
                  const isCompleted = idx < activeStep;
                  const isActive = idx === activeStep;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-xl border flex items-start gap-4 transition-colors duration-500 ${
                        isActive ? 'bg-orange-50/50 border-orange-100 shadow-sm' : 
                        isCompleted ? 'bg-white border-border' : 'bg-surface/50 border-transparent opacity-60'
                      }`}
                    >
                      <div className="mt-1 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-orange animate-spin" />
                        ) : (
                          <Circle className="w-5 h-5 text-content-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${isActive ? 'text-orange-dark' : isCompleted ? 'text-navy' : 'text-content-secondary'}`}>
                          {step.label}
                        </p>
                        
                        <AnimatePresence>
                          {(isActive || isCompleted) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm text-content-muted mt-1 leading-snug">
                                {step.desc}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* RESULTS PHASE */}
          {phase === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 mt-16 pb-20">
              <button
                onClick={() => setPhase('dashboard')}
                className="flex items-center gap-1.5 text-content-secondary hover:text-navy transition-colors text-sm font-semibold mb-4 group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Dashboard
              </button>

              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-navy">Global Network Analysis Result</h1>
                    <Badge variant="warning">Elevated Risk</Badge>
                  </div>
                  <p className="text-sm text-content-muted mt-1">Dataset: {datasetOptions.find(d=>d.id===selectedDataset)?.name}</p>
                </div>
                <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
                  Export Intelligence Report
                </Button>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Analyzed Cases", value: datasetOptions.find(d=>d.id===selectedDataset)?.rows.toLocaleString(), icon: ShieldCheck, unit: "" },
                  { label: "Total Anomalies", value: "342", icon: AlertTriangle, unit: "" },
                  { label: "Anomaly Rate", value: "2.3", icon: TrendingUp, unit: "%" },
                  { label: "Avg Process Time", value: "48.2", icon: Clock, unit: "hours" }
                ].map(stat => (
                  <div key={stat.label} className="bg-white p-5 rounded-2xl border border-border flex items-start justify-between shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className="text-2xl font-black text-navy">{stat.value}<span className="text-sm font-semibold text-content-secondary ml-1">{stat.unit}</span></p>
                    </div>
                    <div className="p-2.5 bg-surface rounded-xl">
                      <stat.icon className="w-5 h-5 text-content-secondary" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Process Drilldowns */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                  Segment Intelligence Drilldown
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customs */}
                  <div className="bg-white border border-border rounded-2xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-navy-50 text-navy rounded-xl"><Globe className="w-6 h-6" /></div>
                      <div>
                        <h4 className="font-bold text-navy text-lg">Customs Clearance</h4>
                        <p className="text-sm text-content-muted">4,291 cases processed</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-sm text-content-secondary">Segment Risk Score</span>
                        <span className="font-bold text-orange">68.5</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-sm text-content-secondary">Avg Inspection Delay</span>
                        <span className="font-bold text-navy">12.4h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-content-secondary">Recheck Rate</span>
                        <span className="font-bold text-navy">15%</span>
                      </div>
                    </div>
                  </div>

                  {/* Trucking */}
                  <div className="bg-white border border-border rounded-2xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-orange-50 text-orange rounded-xl"><Truck className="w-6 h-6" /></div>
                      <div>
                        <h4 className="font-bold text-navy text-lg">Trucking & Transit</h4>
                        <p className="text-sm text-content-muted">8,401 cases processed</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-sm text-content-secondary">Segment Risk Score</span>
                        <span className="font-bold text-success">42.1</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-sm text-content-secondary">Avg Transit Delay</span>
                        <span className="font-bold text-navy">4.2h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-content-secondary">Avg Hub Touches</span>
                        <span className="font-bold text-navy">2.4</span>
                      </div>
                    </div>
                  </div>

                  {/* Warehouse */}
                  <div className="bg-white border border-border rounded-2xl p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-success-50 text-success rounded-xl"><Warehouse className="w-6 h-6" /></div>
                      <div>
                        <h4 className="font-bold text-navy text-lg">Warehouse Fulfillment</h4>
                        <p className="text-sm text-content-muted">2,508 cases processed</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-sm text-content-secondary">Segment Risk Score</span>
                        <span className="font-bold text-success">15.8</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-sm text-content-secondary">Avg Pick/Pack Time</span>
                        <span className="font-bold text-navy">45.2m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-content-secondary">Avg Staging Wait</span>
                        <span className="font-bold text-navy">12.1m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Anomalies Deep Dive */}
              <div className="mt-12 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange" />
                    Detected Critical Anomalies
                  </h3>
                  <Badge variant="warning">342 Flagged</Badge>
                </div>
                
                <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_2fr] gap-4 px-6 py-4 border-b border-border bg-surface/50 text-[11px] font-semibold text-content-muted uppercase tracking-wider">
                    <span>Record ID</span>
                    <span>Type</span>
                    <span>Risk Score</span>
                    <span>Diagnostic Context</span>
                  </div>
                  <div className="divide-y divide-border">
                    {data.slice(0, 10).map((anomaly: any, i: number) => (
                      <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_2fr] gap-4 px-6 py-4 items-center hover:bg-orange-50/20 transition-colors">
                        <span className="font-mono text-sm font-semibold text-navy">
                          {anomaly.processId}
                        </span>
                        <div>
                          <Badge variant={anomaly.severity === 'High Risk' ? 'danger' : 'warning'}>
                            {anomaly.step}
                          </Badge>
                        </div>
                        <span className="text-sm font-bold text-orange">
                          {anomaly.riskPercent.toFixed(1)}
                        </span>
                        <span className="text-sm text-content-secondary truncate" title={`Deviation of ${anomaly.deviation}ms detected at ${anomaly.location}`}>
                          Deviation of {anomaly.deviation}ms detected at {anomaly.location}.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
