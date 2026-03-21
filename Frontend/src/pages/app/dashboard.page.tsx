import { useNavigate } from 'react-router-dom';
import { useDatasetStore } from '../../features/datasets/store';
import { Button } from '../../shared/components/ui/Button';
import { Plus } from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { resetWorkflow } = useDatasetStore();

  const startNewUpload = () => {
    resetWorkflow(); // Clear any old stuck state
    navigate('/app/upload');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Welcome back, Jane</h1>
          <p className="text-content-secondary">Here is what's happening with your logistics nodes.</p>
        </div>
        <Button onClick={startNewUpload} icon={<Plus className="w-4 h-4" />}>
          New Analysis
        </Button>
      </div>

      {/* Recent Analysis Table Component would go here */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-card">
          <h3 className="font-bold text-navy mb-4">Recent Analyses</h3>
          {/* Table implementation */}
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-border shadow-card">
          <h3 className="font-bold text-navy mb-4">Anomaly Alerts</h3>
          {/* Alerts list */}
        </div>
      </div>
    </div>
  );
}