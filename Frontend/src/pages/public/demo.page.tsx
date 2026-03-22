import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar
} from 'recharts';
import {
  CheckCircle2, AlertTriangle, 
  Zap, X, Download, ChevronRight, Truck, Warehouse, 
  Ship, Globe, ShieldCheck, Search, Filter, History, Brain, Clock, Activity, Target, Database
} from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';
import { cn } from '../../shared/utils/cn';

/* ═══════════════════════════════════════════
   TYPES & MOCK DATA LOGIC
   ═══════════════════════════════════════════ */

type DemoPhase = 'select' | 'uploading' | 'analyzing' | 'results';
type Severity = 'Normal' | 'Warning' | 'High Risk';
type DatasetType = 'standard' | 'volatility' | 'benchmark';

interface ProcessRow {
  id: string;
  processId: string;
  step: string;
  location: string;
  expectedP95: number;
  actual: number;
  deviation: number;
  riskPercent: number;
  severity: Severity;
  zScore: number;
  baselineMean: number;
  baselineStd: number;
}

interface SegmentStat {
  name: string;
  case_count: number;
  risk_score: number;
  anomaly_rate: number;
  key_metric_label: string;
  key_metric_value: string;
  accent: string;
  bg: string;
  icon: any;
}

interface DatasetOption {
  id: DatasetType;
  name: string;
  icon: any;
  description: string;
  rows: number;
  color: string;
  bg: string;
}

const datasetOptions: DatasetOption[] = [
  { id: 'standard', name: 'Global Standard', icon: Database, description: 'Baseline APAC-EU trade data with 22% average noise.', rows: 15200, color: 'text-orange', bg: 'bg-orange-50' },
  { id: 'volatility', name: 'Systemic Stress', icon: ShieldCheck, description: 'High-volatility cross-border loops with systemic risk clusters.', rows: 28400, color: 'text-anomaly', bg: 'bg-anomaly/5' },
  { id: 'benchmark', name: 'Historical Baseline', icon: History, description: 'Clean historical benchmarks for training validation.', rows: 8900, color: 'text-cyan', bg: 'bg-cyan-50' },
];

interface AnalysisStep {
  label: string;
  duration: number;
}

const analysisSteps: AnalysisStep[] = [
  { label: 'Parsing CSV data', duration: 800 },
  { label: 'Neural Mapping active', duration: 1000 },
  { label: 'Computing Process Baselines', duration: 1200 },
  { label: 'Isolation Forest Anomaly Check', duration: 1500 },
  { label: 'Bottleneck Pattern Recognition', duration: 900 },
  { label: 'Generating AI Insight Layer', duration: 700 },
];

const generateData = (type: DatasetType): ProcessRow[] => {
  const steps = [
    { step: 'Sanitization', location: 'System Core', mean: 12, std: 4, p95: 18 },
    { step: 'Clustering', location: 'Neural Node', mean: 120, std: 30, p95: 160 },
    { step: 'Stress Check', location: 'Vulnerability Loop', mean: 55, std: 22, p95: 90 },
    { step: 'Final Synthesis', location: 'Outcome Layer', mean: 20, std: 8, p95: 35 },
  ];
  
  const rows: ProcessRow[] = [];
  for (let i = 0; i < 60; i++) {
    const cfg = steps[i % steps.length];
    const isAnomaly = Math.random() > (type === 'volatility' ? 0.6 : type === 'benchmark' ? 0.9 : 0.75);
    const actual = isAnomaly 
      ? Math.round(cfg.mean + cfg.std * (3 + Math.random() * 2)) 
      : Math.round(cfg.mean + (Math.random() - 0.5) * cfg.std);
    const zScore = (actual - cfg.mean) / cfg.std;
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
      zScore: Number(zScore.toFixed(2)),
      baselineMean: cfg.mean,
      baselineStd: cfg.std
    });
  }
  return rows;
};

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

const StatusBadge = ({ severity }: { severity: Severity }) => {
  const styles = {
    'Normal': 'bg-success/10 text-success border-success/20',
    'Warning': 'bg-orange/10 text-orange border-orange/20',
    'High Risk': 'bg-anomaly/10 text-anomaly border-anomaly/20'
  };
  return <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase border italic tracking-wider", styles[severity])}>{severity}</span>;
};

const KpiCard = ({ label, value, status, icon: Icon, accent }: { label: string; value: string | number; status?: string; icon: any; accent: string }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all h-40">
    <div className="flex justify-between items-start">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", accent)}>
          <Icon className="w-5 h-5" />
       </div>
       {status && <span className="text-[10px] font-black uppercase text-content-muted tracking-tighter">{status}</span>}
    </div>
    <div>
      <p className="text-sm font-black text-navy mb-1 italic tracking-tighter">{label}</p>
      <div className="flex items-baseline gap-2">
         <span className="text-4xl font-black text-navy tabular-nums leading-none">{value}</span>
         <span className="text-[10px] font-bold text-orange uppercase tracking-widest">{status === '64 → HIGH' ? 'CRITICAL' : ''}</span>
      </div>
    </div>
  </div>
);

const SegmentCard = ({ segment }: { segment: SegmentStat }) => {
  const Icon = segment.icon;
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-border group hover:border-orange/30 hover:shadow-navbar transition-all flex flex-col justify-between h-72">
       <div className="flex justify-between items-start mb-6">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform", segment.bg)}>
             <Icon className={cn("w-7 h-7", segment.accent)} />
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase text-content-muted tracking-widest">{segment.name}</p>
             <p className={cn("text-2xl font-black italic", segment.risk_score > 60 ? 'text-anomaly' : 'text-navy')}>{segment.risk_score}</p>
          </div>
       </div>
       <div className="space-y-4">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tighter italic">
             <span className="text-content-muted">Anomaly Rate</span>
             <span className="text-navy">{segment.anomaly_rate}%</span>
          </div>
          <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
             <motion.div initial={{ width: 0 }} animate={{ width: `${segment.anomaly_rate}%` }} className={cn("h-full", segment.anomaly_rate > 30 ? 'bg-anomaly' : 'bg-success')} />
          </div>
          <div className="flex justify-between items-end pt-2 border-t border-border/50">
             <div>
                <p className="text-[9px] font-black text-content-muted uppercase mb-1">{segment.key_metric_label}</p>
                <p className="text-lg font-black text-navy italic leading-none">{segment.key_metric_value}</p>
             </div>
             <p className="text-[9px] font-black text-content-muted uppercase">Cases: {segment.case_count}</p>
          </div>
       </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */

export function DemoPage() {
  const [phase, setPhase] = useState<DemoPhase>('select');
  const [selectedDataset, setSelectedDataset] = useState<DatasetType>('standard');
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<ProcessRow[]>([]);
  const [detailRow, setDetailRow] = useState<ProcessRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Analysis Pipeline Logic
  useEffect(() => {
    if (phase === 'analyzing') {
      let current = 0;
      const runCycle = () => {
        if (current >= analysisSteps.length) {
          setProgress(100);
          setTimeout(() => {
            const generated = generateData(selectedDataset);
            setData(generated);
            setCurrentPage(1);
            setPhase('results');
          }, 600);
          return;
        }
        setActiveStep(current);
        setProgress(Math.round(((current + 1) / analysisSteps.length) * 100));
        setTimeout(() => {
          current++;
          runCycle();
        }, analysisSteps[current].duration);
      };
      runCycle();
    }
  }, [phase, selectedDataset]);

  const kpis = useMemo(() => {
    return [
      { label: 'Neural Nodes Scanned', value: '15,200', icon: Database, accent: 'bg-orange-50 text-orange' },
      { label: 'Process Bottlenecks', value: '12', status: '64 → HIGH', icon: AlertTriangle, accent: 'bg-anomaly-50 text-anomaly' },
      { label: 'Avg Anomaly Rate', value: '24.2%', icon: Zap, accent: 'bg-cyan-50 text-cyan' },
      { label: 'Time Advantage', value: '+4.2h', icon: Clock, accent: 'bg-[#0C1222] text-white' },
    ];
  }, []);

  const segments: SegmentStat[] = [
    { name: 'Import Customs', case_count: 850, risk_score: 68.5, anomaly_rate: 35.7, key_metric_label: 'Avg Duty Delay', key_metric_value: '+12.5h', accent: 'text-anomaly', bg: 'bg-anomaly-50', icon: Ship },
    { name: 'Last-Mile Transit', case_count: 2400, risk_score: 42.1, anomaly_rate: 12.2, key_metric_label: 'ETA Variance', key_metric_value: '+1.4h', accent: 'text-orange', bg: 'bg-orange-50', icon: Truck },
    { name: 'Neural Sorting', case_count: 1200, risk_score: 15.8, anomaly_rate: 4.5, key_metric_label: 'Sort Accuracy', key_metric_value: '99.2%', accent: 'text-success', bg: 'bg-success/10', icon: Warehouse },
  ];

  const reset = () => { setPhase('select'); setProgress(0); setActiveStep(0); setData([]); };

  return (
    <div className="pt-20 min-h-screen bg-slate-50 flex flex-col font-outfit overflow-hidden">
      
      {/* 🧩 Header Progress 🧩 */}
      <div className="bg-white border-b border-border py-4 sticky top-20 z-40 shadow-sm">
         <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <Zap className="w-5 h-5 text-orange animate-pulse" />
               <h1 className="text-xs font-black uppercase tracking-widest text-navy italic">LIVE LOGISTICS PROBE</h1>
            </div>
            <div className="flex gap-8 items-center">
               {['Datasets', 'Analyze', 'VYN Dashboard'].map((s, i) => {
                 const isActive = (phase==='select' && i===0) || (phase==='analyzing' && i===1) || (phase==='results' && i===2);
                 const isPast = (phase!=='select') && (i===0) || (phase==='results' && i===1);
                 return (
                   <div key={s} className={cn("hidden md:flex items-center gap-2 text-[10px] font-black transition-all italic tracking-widest uppercase", isActive ? 'text-orange translate-y-[-1px]' : isPast ? 'text-navy' : 'text-slate-300')}>
                     <span className={cn("w-5 h-5 rounded-full border flex items-center justify-center text-[9px]", isActive ? 'border-orange bg-orange text-white' : 'border-current')}>
                        {isPast && !isActive ? <CheckCircle2 className="w-3 h-3" /> : i+1}
                     </span>
                     {s}
                   </div>
                 );
               })}
            </div>
            <Button onClick={reset} variant="ghost" size="sm" className="text-[10px]">Reset Simulation</Button>
         </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* 🚀 SELECT PHASE 🚀 */}
        {phase === 'select' && (
                <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col items-center justify-center p-6 space-y-12 max-w-5xl mx-auto">
                   <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/10 rounded-full border border-orange/20 mb-6">
                         <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                         <span className="text-[10px] font-black text-orange uppercase tracking-[0.2em] italic">System Environment Ready</span>
                      </div>
                      <h2 className="text-5xl lg:text-7xl font-black text-navy italic tracking-tighter mb-4 leading-none uppercase">Choose Target Dataset</h2>
                      <p className="text-content-muted text-lg max-w-xl mx-auto font-medium">Pick a specialized logistics dataset to test the Vyn AI Engine&apos;s detection capabilities.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                      {datasetOptions.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedDataset(type.id)}
                          className={cn(
                            "group p-8 rounded-[3.5rem] border-2 transition-all text-left relative overflow-hidden h-80 flex flex-col justify-between active:scale-95",
                            selectedDataset === type.id 
                              ? "bg-navy border-navy text-white shadow-2xl scale-[1.02]" 
                              : "bg-white border-slate-100 hover:border-orange/30 text-navy shadow-sm"
                          )}
                        >
                           {selectedDataset === type.id && (
                             <motion.div layoutId="glow" className="absolute inset-0 bg-gradient-to-br from-orange/20 to-transparent pointer-events-none" />
                           )}
                           <div className="relative z-10">
                              <div className={cn("w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110", selectedDataset === type.id ? "bg-orange text-white" : "bg-slate-50 text-slate-400 group-hover:text-orange")}>
                                 <type.icon className="w-7 h-7" />
                              </div>
                              <h3 className="text-2xl font-black italic mb-2 tracking-tighter">{type.name}</h3>
                              <p className={cn("text-xs font-medium leading-relaxed", selectedDataset === type.id ? "text-slate-300" : "text-content-muted")}>{type.description}</p>
                           </div>
                           <div className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic overflow-hidden h-4">
                              <span className={cn("transition-transform duration-500", selectedDataset === type.id ? "translate-x-0" : "-translate-x-full")}>SELECTED DATASET</span>
                              {selectedDataset === type.id && <div className="w-12 h-px bg-orange" />}
                           </div>
                        </button>
                      ))}
                   </div>

                   <div className="mt-8 text-center">
                      <Button 
                        size="lg" 
                        className="px-16 py-8 text-xl rounded-[2.5rem] hover:scale-105" 
                        glow
                        onClick={() => setPhase('analyzing')}
                      >
                         INITIATE SYSTEM TEST
                      </Button>
                      <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center justify-center gap-2">
                         <Zap className="w-3 h-3 text-orange" />
                         Engine ready to process ~15,000 nodes/sec
                      </p>
                   </div>
                </motion.div>
             )}

        {/* 🔄 ANALYZING PHASE 🔄 */}
        {phase === 'analyzing' && (
                <motion.main key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
                   <div className="relative">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="w-48 h-48 rounded-full border-[8px] border-orange/10 border-t-orange shadow-glow transition-all" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <Brain className="w-12 h-12 text-navy mb-2 animate-pulse" />
                         <span className="text-3xl font-black text-navy tabular-nums">{progress}%</span>
                      </div>
                   </div>
                   
                   <div className="bg-navy p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="w-24 h-24 text-white" /></div>
                      <div className="space-y-4 font-mono text-[11px] h-32 overflow-hidden flex flex-col justify-end">
                         {analysisSteps.slice(0, activeStep + 1).map((s, i) => (
                            <motion.p key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", i === activeStep ? 'text-orange animate-pulse' : 'text-white/30')}>
                               <span>&gt;</span> {s.label}...
                            </motion.p>
                         ))}
                      </div>
                   </div>
                </motion.main>
              )}

        {/* 📊 RESULTS PHASE 📊 */}
        {phase === 'results' && (
          <motion.main key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto bg-slate-50/50 pb-20">
             
             {/* SECTION 1: Insight Header + KPI */}
             <div className="bg-white border-b border-border pb-10 pt-12 shadow-sm">
                <div className="container mx-auto px-6 space-y-12">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                      <div className="space-y-3">
                         <div className="flex items-center gap-2 px-3 py-1 bg-anomaly-50 text-anomaly rounded-lg text-[10px] font-black uppercase tracking-widest border border-anomaly/20"><AlertTriangle className="w-3 h-3" /> Systemic Risk Detected</div>
                         <h2 className="text-5xl font-black text-navy leading-[0.9] italic tracking-tighter">Enterprise Intelligence Brief</h2>
                         <p className="text-slate-500 font-medium italic flex items-center gap-2"><Globe className="w-4 h-4" /> Analyzed: {datasetOptions.find(d=>d.id===selectedDataset)?.name} System Test <span className="text-orange">/</span > Global Regional Dataset</p>
                      </div>
                      <div className="flex gap-4">
                         <Button variant="outline" size="sm" icon={<Download className="w-4 h-4 ml-1" />}>Export Analytics</Button>
                         <Button size="sm" icon={<Activity className="w-4 h-4" />}>Live Monitor</Button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {kpis.map((k: any) => (
                        <KpiCard key={k.label} {...k} />
                      ))}
                   </div>

                   <div className="p-10 rounded-[3.5rem] bg-navy text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group shadow-2xl">
                      <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform"><Brain className="w-32 h-32 text-orange" /></div>
                      <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center shrink-0 border border-orange/20"><Zap className="w-10 h-10 text-orange" /></div>
                      <div className="flex-1 space-y-4">
                         <h3 className="text-2xl font-black italic text-orange tracking-tight underline decoration-orange/20 decoration-8 underline-offset-[-2px]">Neural Intelligence Summary</h3>
                         <p className="text-slate-300 text-lg leading-relaxed max-w-3xl font-medium">
                            Our cross-segment neural probe shows <span className="text-white font-black">Customs</span> as the primary bottleneck with a <span className="text-anomaly font-black italic">68.5 Risk Score</span>. Inspection delays in high-volume hubs are cascading into Trucking transit lags, currently affecting 35.7% of all shipments.
                         </p>
                      </div>
                      <Button variant="ghost" className="text-white hover:bg-white/10 shrink-0">Show Root Cause <ChevronRight className="w-4 h-4 ml-2" /></Button>
                   </div>
                </div>
             </div>

             {/* SECTION 2: Segments + Charts */}
             <div className="container mx-auto px-6 py-16 space-y-16">
                <div>
                   <h3 className="text-2xl font-black text-navy mb-8 italic tracking-tighter">Segment Specific Intelligence</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {segments.map(s => <SegmentCard key={s.name} segment={s} />)}
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-[550px]">
                   <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-12 rounded-[4.5rem] border-2 border-slate-100 flex flex-col shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 font-black text-navy text-8xl pointer-events-none italic">RADAR</div>
                      <div className="flex justify-between items-center mb-10 relative z-10">
                         <div>
                            <h4 className="text-2xl font-black text-navy italic tracking-tighter">Neural Fingerprint</h4>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Multi-Dimensional Risk Mapping</p>
                         </div>
                         <Target className="w-12 h-12 text-orange bg-orange-50 p-3 rounded-2xl" />
                      </div>

                      <div className="flex-1 flex items-center justify-center relative z-10">
                         <ResponsiveContainer width="100%" height={380}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={segments}>
                               <defs>
                                  <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.2}/>
                                    <stop offset="100%" stopColor="#EF233C" stopOpacity={0.4}/>
                                  </radialGradient>
                               </defs>
                               <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                               <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: '900', fontStyle: 'italic' }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                               <Radar name="Risk Score" dataKey="risk_score" stroke="#EF233C" strokeWidth={3} fill="url(#radarGrad)" fillOpacity={0.7} dot={{ r: 4, fill: '#EF233C' }} />
                               <Tooltip content={({ active, payload }) => {
                                  if (active && payload?.[0]) {
                                    return (
                                      <div className="bg-navy p-4 rounded-xl text-white shadow-2xl border border-white/10 backdrop-blur-md">
                                        <p className="text-[10px] font-black text-orange uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                        <p className="text-xl font-black italic">{payload[0].value} <span className="text-[10px] text-white/40">RISK SCORE</span></p>
                                      </div>
                                    );
                                  }
                                  return null;
                               }} />
                            </RadarChart>
                         </ResponsiveContainer>
                      </div>
                   </motion.div>

                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-12 rounded-[4.5rem] border-2 border-slate-100 flex flex-col shadow-2xl relative overflow-hidden group">
                      <div className="flex justify-between items-center mb-10 relative z-20">
                         <div>
                            <h4 className="text-2xl font-black text-navy italic tracking-tighter">Neural Depth</h4>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Anomaly Concentration Hub</p>
                         </div>
                         <Activity className="w-12 h-12 text-orange bg-orange-50 p-3 rounded-2xl" />
                      </div>

                      <div className="flex-1 flex items-center justify-center relative z-10">
                         <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className="text-5xl font-black text-navy italic leading-none">24%</span>
                            <span className="text-[10px] font-black text-orange uppercase tracking-widest mt-2">Scale Factor</span>
                         </div>
                         <ResponsiveContainer width="100%" height={380}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={20} data={segments.map(s => ({ ...s, fill: s.risk_score > 60 ? '#EF233C' : s.risk_score > 45 ? '#F97316' : '#22C55E' }))} startAngle={180} endAngle={-180}>
                               <RadialBar background={{ fill: 'rgba(15,23,34,0.03)' }} dataKey="anomaly_rate" cornerRadius={15} />
                               <Tooltip content={({ active, payload }) => {
                                  if (active && payload?.[0]) {
                                    return (
                                      <div className="bg-navy p-4 rounded-xl text-white shadow-2xl border border-white/10 backdrop-blur-md">
                                        <p className="text-[10px] font-black text-orange uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                        <p className="text-xl font-black italic">{payload[0].value}% <span className="text-[10px] text-white/40">ANOMALY</span></p>
                                      </div>
                                    );
                                  }
                                  return null;
                               }} />
                            </RadialBarChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-8 relative z-20 mt-6">
                         {segments.map(s => (
                           <div key={s.name} className="flex items-center gap-2">
                              <div className={cn("w-3 h-3 rounded-full", s.risk_score > 60 ? 'bg-anomaly' : s.risk_score > 45 ? 'bg-orange' : 'bg-success')} />
                              <span className="text-[10px] font-black text-slate-400 uppercase italic tracking-tighter">{s.name}</span>
                           </div>
                         ))}
                      </div>
                   </motion.div>
                </div>

                {/* SECTION 3: Detailed Case Table */}
                <div className="space-y-8">
                   <div className="flex flex-col md:flex-row justify-between items-center bg-white border border-border p-8 rounded-[3rem] shadow-sm">
                      <div className="flex gap-6 items-center">
                         <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center"><Search className="w-6 h-6 text-slate-400" /></div>
                         <div>
                            <h4 className="text-2xl font-black text-navy italic tracking-tighter">Neural Signal Explorer</h4>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Granular Case-Level Anomaly Detection Matrix</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 mt-6 md:mt-0">
                         <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-border">
                            <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronRight className="w-5 h-5 rotate-180" /></Button>
                            <span className="text-[11px] font-black text-navy px-4 italic tabular-nums">PAGE {currentPage} / {totalPages}</span>
                            <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="w-5 h-5" /></Button>
                         </div>
                         <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>Filter</Button>
                      </div>
                   </div>

                   <div className="bg-white rounded-[3.5rem] border border-border shadow-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                         <table className="w-full text-left">
                              <thead className="bg-[#0C1222] text-white/50 border-b border-white/10 uppercase italic font-black text-[10px] tracking-widest">
                                 <tr>
                                   <th className="px-10 py-7">Probe ID</th>
                                   <th className="px-10 py-7">Focus Step</th>
                                   <th className="px-10 py-7">Delta (Δ)</th>
                                   <th className="px-10 py-7">Risk Profile</th>
                                   <th className="px-10 py-7">Status</th>
                                   <th className="px-10 py-7"></th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {paginatedData.map((r: ProcessRow) => (
                                   <tr key={r.id} onClick={() => setDetailRow(r)} className={cn("hover:bg-slate-50 transition-all group cursor-pointer border-l-4", r.severity === 'High Risk' ? 'border-l-anomaly bg-anomaly/[0.02]' : 'border-l-transparent')}>
                                     <td className="px-10 py-6 font-black text-navy italic text-xs">{r.processId}</td>
                                     <td className="px-10 py-6 text-xs font-black text-navy uppercase italic">{r.step}</td>
                                     <td className={cn("px-10 py-6 text-xs font-black italic tabular-nums", r.deviation > 50 ? 'text-anomaly' : 'text-navy')}>{r.deviation > 0 ? `+${r.deviation}` : r.deviation}ms</td>
                                     <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                           <div className="flex-1 min-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                              <motion.div initial={{ width: 0 }} animate={{ width: `${r.riskPercent}%` }} className={cn("h-full", r.riskPercent > 80 ? 'bg-anomaly' : r.riskPercent > 50 ? 'bg-orange' : 'bg-success')} />
                                           </div>
                                           <span className="text-[10px] font-black text-navy tabular-nums italic w-8">{r.riskPercent}%</span>
                                        </div>
                                     </td>
                                     <td className="px-10 py-6"><StatusBadge severity={r.severity} /></td>
                                     <td className="px-10 py-6 text-right text-slate-200 group-hover:text-navy transition-colors"><ChevronRight className="w-5 h-5" /></td>
                                   </tr>
                                 ))}
                              </tbody>
                         </table>
                      </div>
                      <div className="p-8 border-t border-border bg-slate-50/50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                         <span>Showing {Math.min(data.length, (currentPage-1)*itemsPerPage + 1)}-{Math.min(data.length, currentPage*itemsPerPage)} of {data.length} Signals Captured</span>
                         <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-orange animate-pulse" /><span>In-Memory Inference Active</span></div>
                      </div>
                   </div>
                </div>
             </div>
          </motion.main>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailRow && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/60 backdrop-blur-md">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border-4 border-navy relative">
                <button onClick={() => setDetailRow(null)} className="absolute top-8 right-8 w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all"><X className="w-6 h-6" /></button>
                <div className="bg-navy p-10 text-white flex items-center gap-6">
                   <div className="w-16 h-16 bg-anomaly-50 rounded-2xl flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-anomaly" /></div>
                   <div><h4 className="text-2xl font-black italic uppercase italic tracking-tighter">Neural Drill-Down</h4><p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{detailRow.processId} / Root Cause Analysis</p></div>
                </div>
                <div className="p-10 space-y-8">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Process Step</p>
                         <p className="text-xl font-black text-navy italic uppercase leading-none">{detailRow.step}</p>
                         <p className="text-[10px] text-slate-400 font-bold mt-2 italic">{detailRow.location}</p>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-anomaly/5 border border-anomaly/10">
                         <p className="text-[10px] font-black text-anomaly uppercase tracking-widest mb-2 italic">Impact Delta</p>
                         <p className="text-xl font-black text-anomaly italic leading-none">+{detailRow.deviation}ms</p>
                         <p className="text-[10px] text-anomaly/60 font-bold mt-2 italic">Z-Score: {detailRow.zScore}</p>
                      </div>
                   </div>
                   <div className="p-10 rounded-[2.5rem] bg-navy/5 border-2 border-navy/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform"><Brain className="w-16 h-16 text-orange" /></div>
                      <p className="relative z-10 text-slate-500 font-medium italic leading-relaxed">
                         <span className="text-orange font-black uppercase text-[10px] block mb-2 tracking-[0.2em] italic">Neural Recommendation</span>
                         "This shipment experienced a <span className="text-navy font-black tracking-tight underline italic">{detailRow.deviation}ms spike</span> beyond the p95 ceiling. Statistical significance indicates an operational breakdown rather than random variance. Check resource stacking at the node."
                      </p>
                   </div>
                   <Button onClick={() => setDetailRow(null)} className="w-full py-6 rounded-2xl shadow-xl">Dismiss Insight</Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 p-10 opacity-5 pointer-events-none hidden lg:block"><Truck className="w-64 h-64 text-navy rotate-12" /></div>
      <div className="fixed top-24 right-0 p-10 opacity-5 pointer-events-none hidden lg:block"><Target className="w-48 h-48 text-orange -rotate-12" /></div>
    </div>
  );
}
