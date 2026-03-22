import { Truck, Warehouse, Globe } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

const flows = [
  { id: 'TRUCKING', title: 'Trucking Delivery', icon: Truck, desc: 'Last-mile and long-haul transport' },
  { id: 'WAREHOUSE', title: 'Warehouse Fulfillment', icon: Warehouse, desc: 'Inbound, picking, and dispatch' },
  { id: 'CUSTOMS', title: 'Import/Export', icon: Globe, desc: 'Customs clearance and port logistics' },
];

export const WorkflowDetector = ({ onConfirm }: { onConfirm: () => void }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-bold text-navy">Detected Workflow</h3>
        <p className="text-sm text-content-secondary">We've analyzed your steps. Is this a Trucking flow?</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {flows.map((flow) => (
          <button key={flow.id} className="flex items-center gap-4 p-4 border-2 border-border rounded-2xl hover:border-orange hover:bg-orange-50/10 transition-all text-left group">
            <div className="bg-surface p-3 rounded-xl group-hover:bg-orange-100 group-hover:text-orange transition-colors">
              <flow.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-navy">{flow.title}</p>
              <p className="text-xs text-content-secondary">{flow.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <Button onClick={onConfirm} className="w-full mt-4">Start Analysis</Button>
    </div>
  );
};