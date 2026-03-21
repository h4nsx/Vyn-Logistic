import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { datasetService } from '../../../features/datasets/api/datasets.service';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../../shared/components/feedback/LoadingSpinner';

export function DatasetDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['dataset', id],
    queryFn: () => datasetService.getResults(id!),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy">Analysis: {data.name}</h1>
            <Badge variant="success">Completed</Badge>
          </div>
          <p className="text-content-secondary mt-1">ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Core Metrics Cards */}
        <MetricCard title="Risk Score" value={data.riskScore} color="danger" />
        <MetricCard title="Anomaly Score" value={data.anomalyScore} color="anomaly" />
        <MetricCard title="Avg Duration" value={data.duration} color="cyan" />
        <MetricCard title="Bottleneck" value={data.bottleneckStep} color="warning" />
      </div>

      {/* Recharts and React Flow components would be rendered here */}
    </div>
  );
}

function MetricCard({ title, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-card">
      <p className="text-xs font-semibold text-content-muted uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-bold mt-2 text-${color}`}>{value}</p>
    </div>
  );
}