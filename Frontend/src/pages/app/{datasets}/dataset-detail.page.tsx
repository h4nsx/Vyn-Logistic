import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { datasetService } from '../../../features/datasets/api/datasets.service';
import { useDatasetStore } from '../../../features/datasets/store';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../../shared/components/feedback/LoadingSpinner';
import { ChevronLeft, AlertCircle, Clock, Download, TrendingUp, ShieldCheck, AlertTriangle, Truck, Warehouse, Globe } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { motion } from 'framer-motion';

export function DatasetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { analysisResult } = useDatasetStore();

  const isLatest = id === 'latest' || !id;

  const { data: queryData, isLoading, error } = useQuery({
    queryKey: ['dataset', id],
    queryFn: () => datasetService.getCaseDetail(id!),
    enabled: !isLatest && !!id,
  });

  const data = isLatest ? analysisResult : queryData;

  if (isLoading && !isLatest) return <LoadingSpinner className="h-[80vh]" label="Loading analysis..." />;

  if (error || !data || !data.overall_result) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-border">
        <AlertCircle className="w-10 h-10 text-content-muted mx-auto mb-3" />
        <p className="font-semibold text-navy">Analysis Result Not Found</p>
        <p className="text-sm text-content-secondary mt-1">Please upload a valid dataset to view intelligence reports.</p>
        <Button variant="ghost" onClick={() => navigate('/app/upload')} className="mt-4">
          ← New Analysis
        </Button>
      </div>
    );
  }

  const { overall_result: overall, process_results: processes } = data;
  
  const riskScore = overall.avg_risk_score || 0;
  const riskLevel = riskScore >= 50 ? 'warning' : 'healthy'; // Adjusted based on avg score of 50.128
  
  const riskConfig = {
    warning: { color: 'text-orange', bg: 'bg-orange-50', ring: 'ring-orange/20', badge: 'warning' as const, label: 'Elevated Risk' },
    healthy: { color: 'text-success', bg: 'bg-success-50', ring: 'ring-success/20', badge: 'success' as const, label: 'Healthy Operations' },
  }[riskLevel];

  const StatBox = ({ label, value, icon: Icon, unit = '' }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-border flex items-start justify-between shadow-sm">
      <div>
        <p className="text-xs font-bold text-content-muted uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-navy">{value}<span className="text-sm font-semibold text-content-secondary ml-1">{unit}</span></p>
      </div>
      <div className="p-2.5 bg-surface rounded-xl">
        <Icon className="w-5 h-5 text-content-secondary" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate('/app/dashboard')}
          className="flex items-center gap-1.5 text-content-secondary hover:text-navy transition-colors text-sm font-semibold mb-4 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-navy">Global Network Analysis Result</h1>
              <Badge variant={riskConfig.badge}>{riskConfig.label}</Badge>
            </div>
            <p className="text-sm text-content-muted mt-1">Dataset ID: {id === 'latest' ? 'Live Session' : id}</p>
          </div>
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
            Export Intelligence Report
          </Button>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatBox label="Analyzed Cases" value={overall.total_case_count} icon={ShieldCheck} />
        <StatBox label="Total Anomalies" value={overall.anomaly_count} icon={AlertTriangle} />
        <StatBox label="Anomaly Rate" value={(overall.anomaly_rate * 100).toFixed(1)} unit="%" icon={TrendingUp} />
        <StatBox label="Avg Process Time" value={(overall.avg_total_process_time_min / 60).toFixed(1)} unit="hours" icon={Clock} />
      </motion.div>

      {/* Process Drilldowns */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-bold text-navy flex items-center gap-2">
          Segment Intelligence Drilldown
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customs */}
          {processes.customs_result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-navy-50 text-navy rounded-xl"><Globe className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-navy text-lg">Customs Clearance</h4>
                  <p className="text-sm text-content-muted">{processes.customs_result.case_count} cases processed</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-content-secondary">Segment Risk Score</span>
                  <span className="font-bold text-orange">{processes.customs_result.avg_risk_score.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-content-secondary">Avg Inspection Delay</span>
                  <span className="font-bold text-navy">{(processes.customs_result.avg_inspection_delay_min / 60).toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-content-secondary">Recheck Rate</span>
                  <span className="font-bold text-navy">{(processes.customs_result.document_recheck_rate * 100).toFixed(0)}%</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Trucking */}
          {processes.trucking_result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-50 text-orange rounded-xl"><Truck className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-navy text-lg">Trucking & Transit</h4>
                  <p className="text-sm text-content-muted">{processes.trucking_result.case_count} cases processed</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-content-secondary">Segment Risk Score</span>
                  <span className="font-bold text-success">{processes.trucking_result.avg_risk_score.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-content-secondary">Avg Transit Delay</span>
                  <span className="font-bold text-navy">{(processes.trucking_result.avg_transit_delay_min / 60).toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-content-secondary">Avg Hub Touches</span>
                  <span className="font-bold text-navy">{processes.trucking_result.avg_hub_touch_count}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Warehouse */}
          {processes.warehouse_result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-success-50 text-success rounded-xl"><Warehouse className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-navy text-lg">Warehouse Fulfillment</h4>
                  <p className="text-sm text-content-muted">{processes.warehouse_result.case_count} cases processed</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-content-secondary">Segment Risk Score</span>
                  <span className="font-bold text-success">{processes.warehouse_result.avg_risk_score.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-content-secondary">Avg Pick/Pack Time</span>
                  <span className="font-bold text-navy">{processes.warehouse_result.avg_pick_pack_time_min.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-content-secondary">Avg Staging Wait</span>
                  <span className="font-bold text-navy">{processes.warehouse_result.avg_staging_wait_min.toFixed(1)}m</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}