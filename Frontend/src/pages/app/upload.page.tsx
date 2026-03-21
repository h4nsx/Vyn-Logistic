import { useDatasetStore } from '../../features/datasets/store';
import { FileUploadZone } from '../../features/upload/components/FileUploadZone';
import { ColumnMapper } from '../../features/datasets/components/ColumnMapper';
import { WorkflowDetector } from '../../features/datasets/components/WorkflowDetector';
import { AnalysisProcessing } from '../../features/datasets/components/AnalysisProcessing';
import { useNavigate } from 'react-router-dom';

export function UploadPage() {
  const { activeStep, currentDatasetId, setStep, resetWorkflow } = useDatasetStore();
  const navigate = useNavigate();

  const handleComplete = () => {
    const id = currentDatasetId;
    resetWorkflow();
    navigate(`/app/datasets/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-12">
        {['upload', 'mapping', 'detection', 'processing'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs 
              ${activeStep === s ? 'bg-orange text-white' : 'bg-border text-content-muted'}`}>
              {i + 1}
            </div>
            <span className={`text-sm font-semibold capitalize ${activeStep === s ? 'text-navy' : 'text-content-muted'}`}>
              {s}
            </span>
            {i < 3 && <div className="w-12 h-[2px] bg-border mx-2" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white p-8 rounded-2xl border border-border shadow-card">
        {activeStep === 'upload' && <FileUploadZone onSuccess={() => setStep('mapping')} />}
        {activeStep === 'mapping' && <ColumnMapper onConfirm={() => setStep('detection')} />}
        {activeStep === 'detection' && <WorkflowDetector onConfirm={() => setStep('processing')} />}
        {activeStep === 'processing' && <AnalysisProcessing onFinished={handleComplete} />}
      </div>
    </div>
  );
}