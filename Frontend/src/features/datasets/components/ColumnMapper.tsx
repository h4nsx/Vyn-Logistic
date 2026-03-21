import { Button } from '../../../shared/components/ui/Button';
import { useDatasetStore } from '../../../features/datasets/store';

export const ColumnMapper = ({ onConfirm }: { onConfirm: () => void }) => {
  const { currentDatasetId } = useDatasetStore();
  
  
  const columns = ['timestamp', 'node_id', 'event_type', 'duration', 'cost_center'];
  const targets = ['Event Time', 'Location ID', 'Activity Name', 'Duration', 'Cost'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-navy">Map your columns</h3>
        <p className="text-sm text-content-secondary">Align your CSV headers with our logistics schema.</p>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="px-6 py-3 font-semibold text-navy">CSV Column</th>
              <th className="px-6 py-3 font-semibold text-navy">System Field</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {columns.map((col, i) => (
              <tr key={col}>
                <td className="px-6 py-4 font-mono text-xs text-content-secondary">{col}</td>
                <td className="px-6 py-4">
                  <select className="w-full bg-white border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-navy-100">
                    <option>{targets[i]}</option>
                    <option>Ignore Column</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button onClick={onConfirm} className="w-full">Confirm Mapping</Button>
    </div>
  );
};