import { useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { Download, Info, TrendingDown, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { Button } from '../../shared/components/ui/Button';
// FIX 2: Removed unused 'Badge' import
import { LoadingSpinner } from '../../shared/components/feedback/LoadingSpinner';
import { analyticsService } from '../../features/analytics/api/analytics.service';
import { useAnalyticsStore } from '../../features/analytics/store';

const stepDurationData = [
  { step: 'Order Placed', baseline: 1.2, actual: 1.3 },
  { step: 'Payment Processed', baseline: 0.5, actual: 0.8 },
  { step: 'Picked', baseline: 2.1, actual: 2.0 },
  { step: 'Packed', baseline: 1.5, actual: 1.6 },
  { step: 'Dispatched', baseline: 3.0, actual: 5.2 }, // Bottleneck step
  { step: 'In Transit', baseline: 24.0, actual: 24.5 },
];

export function AnalyticsPage() {
  const { dateRange, setDateRange } = useAnalyticsStore();

  const { data: resultsData, isLoading: loadingResults } = useQuery({
    queryKey: ['results'],
    queryFn: analyticsService.getResults,
  });

  const { data: anomaliesData, isLoading: loadingAnomalies } = useQuery({
    queryKey: ['anomalies'],
    queryFn: analyticsService.getAnomalies,
  });

  const results = Array.isArray(resultsData) ? resultsData : [];
  const anomalies = Array.isArray(anomaliesData) ? anomaliesData : [];

  const trendData = useMemo(() => {
    return results
      .slice(-10)
      .map(item => ({
        date: dayjs(item.timestamp).format('DD MMM'),
        risk: item.risk_score || 0,
        efficiency: 100 - (item.risk_score || 0)
      }));
  }, [results]);

  const nodeData = useMemo(() => {
    const counts: Record<string, number> = {};
    anomalies.forEach(a => {
      const type = a.type || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [anomalies]);

  if (loadingResults || loadingAnomalies) return <LoadingSpinner className="h-[80vh]" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Intelligence Center</h1>
          <p className="text-content-secondary">Aggregated AI insights from your logistics stream.</p>
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
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Avg. Risk Score" 
          value={results.length ? (results.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / results.length).toFixed(1) : 0} 
          trend="down" 
          label="-12% vs last month"
        />
        <KpiCard 
          title="Total Anomalies" 
          value={anomalies.length} 
          trend="up" 
          label="+4 detected today"
        />
        <KpiCard 
          title="System Health" 
          value="94.2%" 
          trend="up" 
          label="Optimal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-card">
          <h3 className="font-bold text-navy mb-6">Risk vs. Efficiency Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="risk" stroke="#dc2626" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="efficiency" stroke="#0891b2" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-card">
          <h3 className="font-bold text-navy mb-6">Anomaly Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nodeData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#475569'}} width={100} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {nodeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1e3a5f' : '#0891b2'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="font-bold text-navy">Step Duration Distribution</h3>
          <Info className="w-4 h-4 text-content-muted cursor-help" />
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stepDurationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="step" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#475569'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#475569'}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="baseline" stroke="#0891b2" fillOpacity={1} fill="url(#colorBaseline)" name="Baseline Expected (hrs) " />
              <Area type="monotone" dataKey="actual" stroke="#f97316" fillOpacity={1} fill="url(#colorActual)" name="Actual Average (hrs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, label }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-card">
      <p className="text-sm font-semibold text-content-secondary">{title}</p>
      <div className="flex items-end justify-between mt-2">
        <h3 className="text-3xl font-bold text-navy">{value}</h3>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
          trend === 'down' ? 'bg-success-50 text-success' : 'bg-danger-50 text-danger'
        }`}>
          {trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          {label}
        </div>
      </div>
    </div>
  );
}