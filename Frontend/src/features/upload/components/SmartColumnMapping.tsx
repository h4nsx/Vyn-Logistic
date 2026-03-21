import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, CornerRightDown } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { useDatasetStore } from '../../../features/datasets/store';

interface SmartColumnMappingProps {
  onConfirm: () => void;
}

const SYSTEM_FIELDS = [
  { key: 'row_group', label: 'Row Group', required: true },
  { key: 'scenario_id', label: 'Scenario ID', required: true },
  { key: 'entity_type', label: 'Entity Type', required: true },
  { key: 'record_id', label: 'Record ID', required: true },
  { key: 'process_branch', label: 'Process Branch', required: true },
  { key: 'process_code', label: 'Process Code', required: true },
  { key: 'case_id', label: 'Case ID', required: true },
  { key: 'timestamp', label: 'Event Timestamp', required: false },
  { key: 'activity', label: 'Activity Name', required: false },
  { key: 'location', label: 'Location ID', required: false },
  { key: 'resource', label: 'Resource / User', required: false },
  { key: 'cost', label: 'Execution Cost', required: false },
];

export function SmartColumnMapping({ onConfirm }: SmartColumnMappingProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { validationData, setMappingData } = useDatasetStore();
  
  // State holds: { systemFieldKey: "uploaded_csv_column_name" }
  const [mappings, setMappings] = useState<Record<string, string>>({});

  useEffect(() => {
    // Auto-match if possible based on exact lowercase text matches
    if (validationData && validationData.columns.length > 0) {
      const initialMap: Record<string, string> = {};
      const availableCols = validationData.columns;

      SYSTEM_FIELDS.forEach(field => {
        const match = availableCols.find(c => c.toLowerCase() === field.key.toLowerCase());
        if (match) initialMap[field.key] = match;
      });
      setMappings(initialMap);
    }
  }, [validationData]);

  const handleSelectChange = (systemField: string, uploadedCol: string) => {
    setMappings(prev => ({ ...prev, [systemField]: uploadedCol }));
  };

  const isFormValid = SYSTEM_FIELDS.filter(f => f.required).every(f => !!mappings[f.key]);

  const handleConfirm = () => {
    if (!isFormValid) return;
    setIsConfirming(true);
    
    // Construct exactly as requested: user-defined rows matching standard system targets
    // Assuming backend wants: { "Uploaded CSV Column": "System Required Field" }
    const finalMapping: Record<string, string> = {};
    Object.entries(mappings).forEach(([sysField, csvCol]) => {
      if (csvCol) finalMapping[csvCol] = sysField;
    });
    
    setMappingData(finalMapping);

    setTimeout(() => {
      setIsConfirming(false);
      onConfirm();
    }, 400);
  };

  const csvColumns = validationData?.columns || [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center pt-2 pb-4">
        <div className="mx-auto bg-success-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-navy">Data Schema Mapping</h2>
        <p className="text-content-secondary mt-2 max-w-lg mx-auto">
          Please select which columns from your uploaded file correspond to our required system fields. Unmapped optional fields will be ignored.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold text-navy w-1/3">
                System Requirement
              </th>
              <th className="px-6 py-4 w-12 text-center text-border-dark"></th>
              <th className="px-6 py-4 font-bold text-navy w-1/2">
                Your File Column
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {SYSTEM_FIELDS.map((field) => {
              const currentValue = mappings[field.key] || '';
              const isMapped = !!currentValue;

              return (
                <tr key={field.key} className={`transition-colors ${isMapped ? 'bg-white' : 'bg-surface/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${field.required ? 'text-navy' : 'text-content-secondary'}`}>
                        {field.label}
                      </span>
                      {field.required ? (
                        <Badge variant="danger" className="text-[9px] uppercase tracking-widest px-1.5 py-0">Required</Badge>
                      ) : (
                        <span className="text-[10px] text-content-muted uppercase font-bold tracking-wider rounded bg-surface border border-border px-1.5 py-0.5">Optional</span>
                      )}
                    </div>
                    <p className="text-xs text-content-muted mt-1 font-mono">{field.key}</p>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <CornerRightDown className="w-4 h-4 text-content-muted inline-block" />
                  </td>

                  <td className="px-6 py-4">
                    <select 
                      value={currentValue}
                      onChange={(e) => handleSelectChange(field.key, e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange/40 transition-colors ${
                        isMapped 
                          ? 'bg-success-50/30 border-success/30 text-success-dark' 
                          : field.required 
                            ? 'bg-white border-danger/30 text-content-primary' 
                            : 'bg-white border-border text-content-primary'
                      }`}
                    >
                      <option value="">-- Select specific row header --</option>
                      {csvColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-4 flex justify-between items-center">
        {!isFormValid ? (
          <p className="text-danger text-sm font-semibold flex items-center gap-2">
             * Please map all required system fields to proceed.
          </p>
        ) : (
          <p className="text-success text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> All required fields mapped
          </p>
        )}
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleConfirm}
          isLoading={isConfirming}
          disabled={!isFormValid}
          className="min-w-[200px]"
        >
          Confirm Schema & Analyze
        </Button>
      </div>
    </div>
  );
}
