import { useEffect } from 'react';
import { useDatasetStore } from '../../features/datasets/store';
import { FileUploadZone } from '../../features/upload/components/FileUploadZone';
import { SmartColumnMapping } from '../../features/upload/components/SmartColumnMapping';
import { AnalysisProcessing } from '../../features/datasets/components/AnalysisProcessing';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowRight, Brain } from 'lucide-react';

const STEPS = ['upload', 'mapping', 'processing'] as const;

const stepLabels = [
  { key: 'upload', label: 'Upload File', icon: Upload },
  { key: 'mapping', label: 'Map Columns', icon: ArrowRight },
  { key: 'processing', label: 'AI Analysis', icon: Brain },
];

export function UploadPage() {
  const { activeStep, setStep, setCurrentDataset, currentDatasetId, resetWorkflow, activeFile } = useDatasetStore();
  const navigate = useNavigate();

  // Ensure lingering workflow states from previous sessions are wiped clean
  useEffect(() => {
    // Zustand's persist ignores `activeFile` due to it being binary. 
    // Thus, if we load the page and we're stuck in 'mapping/processing' but have no file, the memory is stale!
    if (!activeFile && activeStep !== 'upload') {
      resetWorkflow();
    }
  }, [activeFile, activeStep, resetWorkflow]);

  const currentStepIdx = STEPS.indexOf(activeStep as any);

  const handleUploadSuccess = (data: any) => {
    setCurrentDataset(data.id || data.upload_id);
    setStep('mapping');
  };

  const handleMappingConfirmed = () => {
    setStep('processing');
  };

  const handleAnalysisFinished = () => {
    navigate(`/app/datasets/${currentDatasetId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {stepLabels.map((step, idx) => {
          const isDone = idx < currentStepIdx;
          const isActive = idx === currentStepIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-white border border-border shadow-sm' : ''
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone ? 'bg-success text-white'
                  : isActive ? 'bg-orange text-white shadow-md shadow-orange/30'
                  : 'bg-surface text-content-muted border border-border'
                }`}>
                  {isDone ? '✓' : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-sm font-semibold transition-colors ${
                  isActive ? 'text-navy' : isDone ? 'text-success' : 'text-content-muted'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div className={`h-px flex-1 mx-2 transition-colors duration-500 ${idx < currentStepIdx ? 'bg-success' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Content Card */}
      <div className="bg-white p-8 rounded-2xl border border-border shadow-card overflow-hidden">
        <AnimatePresence mode="wait">
          {activeStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <FileUploadZone onSuccess={handleUploadSuccess} />
            </motion.div>
          )}
          {activeStep === 'mapping' && (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <SmartColumnMapping onConfirm={handleMappingConfirmed} />
            </motion.div>
          )}
          {activeStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <AnalysisProcessing onFinished={handleAnalysisFinished} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}