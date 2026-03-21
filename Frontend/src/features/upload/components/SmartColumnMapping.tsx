import { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

interface SmartColumnMappingProps {
  onConfirm: () => void;
}

export function SmartColumnMapping({ onConfirm }: SmartColumnMappingProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  
  // This would ideally come from the backend's initial parse
  // For the UX proof of concept, we mock the auto-detected columns
  const mockSystemFields = ['case_id', 'activity', 'timestamp', 'resource', 'cost', 'location'];
  
  const [mappings, setMappings] = useState([
    { id: 1, uploaded: 'TrackingNumber', suggested: 'case_id', confidence: 'high' as const },
    { id: 2, uploaded: 'StatusUpdate', suggested: 'activity', confidence: 'high' as const },
    { id: 3, uploaded: 'EventTime', suggested: 'timestamp', confidence: 'high' as const },
    { id: 4, uploaded: 'HandlerName', suggested: 'resource', confidence: 'medium' as const },
    { id: 5, uploaded: 'HubLocation', suggested: 'location', confidence: 'medium' as const },
  ]);

  const handleConfirm = () => {
    setIsConfirming(true);
    // Simulate a brief save operation
    setTimeout(() => {
      setIsConfirming(false);
      onConfirm();
    }, 600);
  };

  const handleSelectChange = (id: number, newSuggested: string) => {
    setMappings(prev => prev.map(m => m.id === id ? {
      ...m,
      suggested: newSuggested,
      confidence: 'medium' // User overridden
    } : m));
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center pt-2 pb-4">
        <div className="mx-auto bg-success-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-navy">AI Column Mapping</h2>
        <p className="text-content-secondary mt-2 max-w-md mx-auto">
          We've automatically matched your CSV columns to our system fields. Please review and confirm below.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-content-secondary">Your CSV Column</th>
              <th className="px-6 py-4 w-12 text-center text-border-dark"></th>
              <th className="px-6 py-4 font-semibold text-navy flex items-center gap-2">
                System Field
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-50 text-navy uppercase">Required</span>
              </th>
              <th className="px-6 py-4 font-semibold text-content-secondary text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mappings.map((row) => (
              <tr key={row.id} className="hover:bg-white transition-colors">
                <td className="px-6 py-4 font-bold text-navy bg-white/50">{row.uploaded}</td>
                <td className="px-6 py-4 text-center">
                  <ArrowRight className="w-4 h-4 text-content-muted inline-block" />
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={row.suggested}
                    onChange={(e) => handleSelectChange(row.id, e.target.value)}
                    className="w-full bg-white border border-border rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange font-medium"
                  >
                    <option value="">-- Ignore Column --</option>
                    {mockSystemFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  {row.confidence === 'high' ? (
                    <Badge variant="success" className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> High
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Medium
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleConfirm}
          isLoading={isConfirming}
          className="min-w-[200px]"
        >
          Confirm & Process Data
        </Button>
      </div>
    </div>
  );
}
