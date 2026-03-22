import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertTriangle, CheckCircle2, Package, Activity, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import dayjs from 'dayjs';
import { motion, type Variants } from 'framer-motion';

import { useDatasetStore } from '../../features/datasets/store';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../shared/components/feedback/LoadingSpinner';
import { analyticsService } from '../../features/analytics/api/analytics.service';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { resetWorkflow } = useDatasetStore();

  const { data: anomaliesData, isLoading: loadingAnomalies } = useQuery({
    queryKey: ['anomalies'],
    queryFn: analyticsService.getAnomalies,
  });

  const { data: resultsData, isLoading: loadingResults } = useQuery({
    queryKey: ['results'],
    queryFn: analyticsService.getResults,
  });

  const anomalies = Array.isArray(anomaliesData) 
    ? anomaliesData 
    : (Array.isArray(anomaliesData?.records) ? anomaliesData.records : (Array.isArray(anomaliesData?.data) ? anomaliesData.data : (Array.isArray(anomaliesData?.result) ? anomaliesData.result : [])));

  const results = Array.isArray(resultsData) 
    ? resultsData 
    : (Array.isArray(resultsData?.records) ? resultsData.records : (Array.isArray(resultsData?.data) ? resultsData.data : (Array.isArray(resultsData?.result) ? resultsData.result : [])));

  const highRiskCount = anomalies.filter((a: any) => a.risk_level?.toLowerCase() === 'high' || a.risk?.toLowerCase() === 'high').length;
  const avgRisk = results.length
    ? (results.reduce((acc: number, curr: any) => acc + (curr.risk_score || curr.avg_risk_score || 0), 0) / results.length).toFixed(1)
    : '—';

  if (loadingAnomalies || loadingResults) {
    return <LoadingSpinner className="h-[80vh]" label="Loading intelligence..." />;
  }

  const startNewUpload = () => {
    resetWorkflow();
    navigate('/app/upload');
  };

  const kpis = [
    {
      title: 'Total Analyses',
      value: results.length,
      icon: Package,
      color: 'navy',
      bg: 'bg-navy-50',
      text: 'text-navy',
      trend: null,
    },
    {
      title: 'Avg Risk Score',
      value: avgRisk,
      icon: Activity,
      color: 'orange',
      bg: 'bg-orange-50',
      text: 'text-orange',
      trend: Number(avgRisk) > 50 ? 'up' : 'down',
    },
    {
      title: 'High Risk Alerts',
      value: highRiskCount,
      icon: AlertTriangle,
      color: 'danger',
      bg: 'bg-danger-50',
      text: 'text-danger',
      trend: highRiskCount > 0 ? 'up' : null,
    },
    {
      title: 'Stable Processes',
      value: results.length - highRiskCount,
      icon: CheckCircle2,
      color: 'success',
      bg: 'bg-success-50',
      text: 'text-success',
      trend: null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-navy">Logistics Overview</h1>
          <p className="text-content-secondary text-sm mt-0.5">
            Real-time intelligence from your latest process uploads.
          </p>
        </div>
        <Button onClick={startNewUpload} icon={<Plus className="w-4 h-4" />}>
          New Analysis
        </Button>
      </motion.div>

      {/* KPI Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.title}
            variants={cardVariants}
            className="bg-white p-6 rounded-2xl border border-border shadow-card hover:shadow-elevated transition-shadow duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.text}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              {kpi.trend && (
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  kpi.trend === 'down' ? 'bg-success-50 text-success' : 'bg-danger-50 text-danger'
                }`}>
                  {kpi.trend === 'down'
                    ? <TrendingDown className="w-3 h-3" />
                    : <TrendingUp className="w-3 h-3" />}
                </div>
              )}
            </div>
            <p className="text-content-muted text-xs font-semibold uppercase tracking-wider">{kpi.title}</p>
            <h3 className={`text-3xl font-black mt-1 ${kpi.text}`}>{kpi.value}</h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Lower Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Results Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="font-bold text-navy">Recent Analyses</h3>
            <button
              onClick={() => navigate('/app/datasets')}
              className="flex items-center gap-1 text-sm text-orange font-semibold hover:gap-2 transition-all duration-200"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-6 py-3 text-[11px] font-semibold text-content-muted uppercase tracking-wider">Case ID</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-content-muted uppercase tracking-wider">Risk</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-content-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-content-muted uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-content-muted">
                      No analyses yet. Upload your first dataset.
                    </td>
                  </tr>
                )}
                {results.slice(0, 6).map((row: any) => (
                  <tr
                    key={row.case_id}
                    className="hover:bg-navy-50/20 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/app/datasets/${row.case_id}`)}
                  >
                    <td className="px-6 py-4 font-semibold text-navy font-mono text-xs">{row.case_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${row.risk_score > 70 ? 'bg-danger' : row.risk_score > 40 ? 'bg-warning' : 'bg-success'}`} />
                        <span className={`font-black text-base ${row.risk_score > 70 ? 'text-danger' : row.risk_score > 40 ? 'text-warning' : 'text-success'}`}>
                          {row.risk_score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={row.risk_score > 70 ? 'danger' : row.risk_score > 40 ? 'warning' : 'success'}
                        dot
                      >
                        {row.risk_score > 70 ? 'Critical' : row.risk_score > 40 ? 'Warning' : 'Healthy'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-content-muted text-xs">
                      {dayjs(row.timestamp).format('MMM DD, HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Anomaly Alerts Panel */}
        <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-bold text-navy">Anomaly Alerts</h3>
            <p className="text-xs text-content-muted mt-0.5">{anomalies.length} active signals</p>
          </div>
          <div className="p-4 space-y-3 max-h-[340px] overflow-y-auto">
            {anomalies.length === 0 && (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-success mb-2" />
                <p className="text-sm font-semibold text-navy">All Clear</p>
                <p className="text-xs text-content-muted mt-1">No anomalies detected</p>
              </div>
            )}
            {anomalies.slice(0, 5).map((anomaly: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex gap-3 items-start transition-colors hover:shadow-sm ${
                  anomaly.risk_level === 'high'
                    ? 'border-danger/20 bg-danger-50/50 hover:bg-danger-50'
                    : 'border-warning/20 bg-warning-50/50 hover:bg-warning-50'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${anomaly.risk_level === 'high' ? 'bg-danger-50 text-danger' : 'bg-warning-50 text-warning'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-navy leading-tight">{anomaly.type || 'Process Anomaly'}</p>
                  <p className="text-xs text-content-secondary mt-1 leading-relaxed line-clamp-2">
                    {anomaly.description || `Detected in case ${anomaly.case_id}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Upload CTA */}
          <div className="p-4 border-t border-border bg-surface/50">
            <Button variant="outline" size="sm" className="w-full" onClick={startNewUpload} icon={<Plus className="w-3.5 h-3.5" />}>
              Upload New Dataset
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}