import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Download, Info } from 'lucide-react';

import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { useAnalyticsStore } from '../../features/analytics/store';

// --- Mock Data ---
const trendData = [
  { date: '01 Jan', risk: 45, efficiency: 70 },
  { date: '05 Jan', risk: 52, efficiency: 65 },
  { date: '10 Jan', risk: 38, efficiency: 82 },
  { date: '15 Jan', risk: 65, efficiency: 60 },
  { date: '20 Jan', risk: 48, efficiency: 75 },
  { date: '25 Jan', risk: 30, efficiency: 88 },
];

const nodeData = [
  { name: 'Warehouse A', delay: 120 },
  { name: 'Port Terminal', delay: 250 },
  { name: 'Customs Check', delay: 180 },
  { name: 'Distribution', delay: 90 },
];

const initialNodes = [
  { id: '1', position: { x: 0, y: 50 }, data: { label: 'Inbound' }, className: 'bg-navy text-white rounded-xl p-4 border-none' },
  { id: '2', position: { x: 200, y: 50 }, data: { label: 'Customs (Bottleneck)' }, className: 'bg-danger-50 text-danger border-danger rounded-xl p-4' },
  { id: '3', position: { x: 400, y: 50 }, data: { label: 'Delivery' }, className: 'bg-success-50 text-success border-success rounded-xl p-4' },
];
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, label: '4.2 days', style: { stroke: '#dc2626' } },
  { id: 'e2-3', source: '2', target: '3', label: '1.1 days' },
];

export function AnalyticsPage() {
  const { dateRange, setDateRange } = useAnalyticsStore();

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Intelligence Center</h1>
          <p className="text-content-secondary">Aggregated performance across all logistics nodes.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-border rounded-xl p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  dateRange === range ? 'bg-navy text-white shadow-sm' : 'text-content-muted hover:text-navy'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Avg. Risk Score" value="32.4" change="-12%" trend="down" />
        <KpiCard title="Process Velocity" value="4.2 days" change="+0.8d" trend="up" />
        <KpiCard title="Anomaly Frequency" value="2.1%" change="-0.4%" trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-navy">Risk vs. Efficiency Trend</h3>
            <Badge variant="info">Live Data</Badge>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="risk" stroke="#dc2626" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="efficiency" stroke="#0891b2" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Node Performance */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-card">
          <h3 className="font-bold text-navy mb-6">Node Latency (Hours)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nodeData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#475569'}} width={100} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="delay" radius={[0, 4, 4, 0]} barSize={20}>
                  {nodeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.delay > 200 ? '#f97316' : '#1e3a5f'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* React Flow: Bottleneck Map */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="font-bold text-navy">Supply Chain Topology</h3>
          <Info className="w-4 h-4 text-content-muted cursor-help" />
        </div>
        <div className="h-[400px] w-full bg-surface rounded-xl border border-border overflow-hidden">
          <ReactFlow 
            nodes={initialNodes} 
            edges={initialEdges} 
            fitView
            nodesDraggable={false}
            zoomOnScroll={false}
          >
            <Background color="#cbd5e1" gap={20} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-card">
      <p className="text-sm font-semibold text-content-secondary">{title}</p>
      <div className="flex items-end justify-between mt-2">
        <h3 className="text-3xl font-bold text-navy">{value}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
          trend === 'down' ? 'bg-success-50 text-success' : 'bg-danger-50 text-danger'
        }`}>
          {change}
        </span>
      </div>
    </div>
  );
}