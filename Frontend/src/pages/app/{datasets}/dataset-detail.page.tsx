import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { datasetService } from '../../../features/datasets/api/datasets.service';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../../shared/components/feedback/LoadingSpinner';
import { ChevronLeft, Activity, AlertCircle, Clock, Zap, Download, TrendingUp } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { motion } from 'framer-motion';

export function DatasetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dataset', id],
    queryFn: () => datasetService.getCaseDetail(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner className="h-[80vh]" label="Loading analysis..." />;

  if (error || !data) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-border">
        <AlertCircle className="w-10 h-10 text-content-muted mx-auto mb-3" />
        <p className="font-semibold text-navy">Analysis not found</p>
        <p className="text-sm text-content-secondary mt-1">No results for this Case ID.</p>
        <Button variant="ghost" onClick={() => navigate('/app/datasets')} className="mt-4">
          ← Back to Datasets
        </Button>
      </div>
    );
  }

  const riskLevel = data.risk_score > 70 ? 'critical' : data.risk_score > 40 ? 'warning' : 'healthy';
  const riskConfig = {
    critical: { color: 'text-danger', bg: 'bg-danger-50', ring: 'ring-danger/20', badge: 'danger' as const, label: 'Critical' },
    warning: { color: 'text-warning', bg: 'bg-warning-50', ring: 'ring-warning/20', badge: 'warning' as const, label: 'Warning' },
    healthy: { color: 'text-success', bg: 'bg-success-50', ring: 'ring-success/20', badge: 'success' as const, label: 'Healthy' },
  }[riskLevel];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-content-secondary hover:text-navy transition-colors text-sm font-semibold mb-4 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to History
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-navy">{data.filename || `Case ${data.case_id}`}</h1>
              <Badge variant={riskConfig.badge}>{riskConfig.label}</Badge>
            </div>
            <p className="text-xs text-content-muted mt-1 font-mono">ID: {id}</p>
          </div>
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Core Insight Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT — Primary Risk Score + Bottleneck */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Risk Score Card */}
          <div className={`bg-white rounded-2xl border border-border shadow-card p-6 ring-1 ${riskConfig.ring}`}>
            <p className="text-xs font-bold text-content-muted uppercase tracking-widest mb-3">Process Risk Score</p>
            <div className="flex items-center gap-5">
              {/* Circular indicator */}
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${riskConfig.bg} ring-4 ${riskConfig.ring} shrink-0`}>
                <span className={`text-3xl font-black ${riskConfig.color}`}>{data.risk_score || 0}</span>
                <span className="absolute bottom-3 text-[10px] font-bold text-content-muted">/100</span>
              </div>
              <div>
                <p className={`text-2xl font-bold ${riskConfig.color}`}>{riskConfig.label}</p>
                <p className="text-sm text-content-secondary mt-1 leading-snug">
                  {riskLevel === 'critical' ? 'Immediate action required on this process.' :
                   riskLevel === 'warning' ? 'Moderate irregularities detected.' :
                   'Process performing within normal bounds.'}
                </p>
              </div>
            </div>
          </div>

          {/* Bottleneck Highlight Card */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange to-orange-light" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-orange" />
                <h3 className="font-bold text-navy text-base">Bottleneck Detected</h3>
              </div>
              <div className="bg-orange-50/70 rounded-xl px-4 py-3 font-mono text-sm font-bold text-orange-dark border border-orange-100 mb-4">
                {data.bottleneck_step || 'No bottleneck identified'}
              </div>
              <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-2">AI Insight</h4>
              <p className="text-sm text-content-secondary leading-relaxed">
                This step exceeded its expected duration by <strong className="text-navy font-bold">1.85×</strong>.
                This indicates a potential queue pileup or resource contention at this process stage.
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Flow Visualization + Secondary Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-4"
        >
          {/* Process Flow Card */}
          <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold text-navy">Process Flow</h3>
              <Badge variant="info">Bottleneck Highlighted</Badge>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {['Start', 'Intake', 'Processing', data.bottleneck_step || 'Bottleneck', 'Dispatch', 'Complete'].map((step, idx, arr) => (
                  <div key={idx} className="flex items-center gap-2 shrink-0">
                    <div className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition-all ${
                      step === (data.bottleneck_step || 'Bottleneck')
                        ? 'bg-gradient-to-b from-orange to-orange-dark text-white shadow-md shadow-orange/30 ring-2 ring-orange/20'
                        : idx === 0 || idx === arr.length - 1
                        ? 'bg-navy text-white'
                        : 'bg-surface border border-border text-navy'
                    }`}>
                      {step === (data.bottleneck_step || 'Bottleneck') && <Zap className="w-3 h-3 mx-auto mb-0.5" />}
                      {step}
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="w-6 h-px bg-border shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Avg Duration', value: `${data.avg_duration || 0} hrs`, icon: Clock, color: 'text-cyan', bg: 'bg-cyan-50' },
              { label: 'Anomaly Score', value: data.anomaly_score || 0, icon: AlertCircle, color: 'text-anomaly', bg: 'bg-anomaly-50' },
              { label: 'Risk Score', value: data.risk_score || 0, icon: Activity, color: riskConfig.color, bg: riskConfig.bg },
              { label: 'Processes', value: data.total_processes || '—', icon: TrendingUp, color: 'text-success', bg: 'bg-success-50' },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-2xl border border-border shadow-card p-5 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${m.bg} ${m.color} shrink-0`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-content-muted uppercase tracking-wider">{m.label}</p>
                  <p className={`text-2xl font-black mt-0.5 ${m.color}`}>{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}