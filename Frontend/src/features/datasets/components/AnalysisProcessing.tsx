import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useDatasetStore } from '../store';
import { datasetService } from '../api/datasets.service';

export const AnalysisProcessing = ({ onFinished }: { onFinished: () => void }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const { activeFile, mappingData, setCurrentDataset, setAnalysisResult } = useDatasetStore();
  const hasStartedAnalysis = useRef(false);

  const steps = [
    { label: 'Structuring Data', desc: 'Parsing logs and building activity graph' },
    { label: 'Calculating Metrics', desc: 'Computing duration and sequence transitions' },
    { label: 'Running AI Model', desc: 'Comparing against standard operating bounds' },
    { label: 'Detecting Bottlenecks', desc: 'Identifying root causes and risk levels' },
  ];

  useEffect(() => {
    let current = 0;
    let simulationInterval: any;

    const performAnalysis = async () => {
      if (hasStartedAnalysis.current) return;
      hasStartedAnalysis.current = true;

      // Animate progress up to "Running AI Model" while waiting for API
      simulationInterval = setInterval(() => {
        current = Math.min(current + 1, steps.length - 2);
        setActiveStepIndex(current);
      }, 2000);

      try {
        if (activeFile && mappingData) {
          const response = await datasetService.analyzeCsv(activeFile, mappingData);
          setAnalysisResult(response); // Store the entire ML JSON response
          if (response && (response.id || response.dataset_id || response.upload_id)) {
            setCurrentDataset(response.id || response.dataset_id || response.upload_id);
          } else {
            setCurrentDataset('latest'); // Used as fallback ID routing
          }
        }
      } catch (error: any) {
        console.error("AI Analysis encountered an error:", error);
        if (error.response && error.response.data) {
          console.error("Backend Error Details:", JSON.stringify(error.response.data, null, 2));
        }
      } finally {
        // Finalize state
        clearInterval(simulationInterval);
        setActiveStepIndex(steps.length); // Jump to fully completed state
        setTimeout(onFinished, 1500); // Give user time to see full completion before switching screen
      }
    };

    performAnalysis();

    return () => clearInterval(simulationInterval);
  }, [activeFile, mappingData, onFinished, setCurrentDataset]);

  return (
    <div className="flex flex-col items-center py-10 max-w-lg mx-auto w-full">
      
      <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mb-6 relative">
        <Loader2 className="w-10 h-10 text-orange animate-spin absolute" />
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center z-10 shadow-sm text-navy font-black text-xl">
          AI
        </div>
      </div>
      
      <div className="text-center mb-10 w-full">
        <h3 className="text-2xl font-bold text-navy">Analyzing Process Flow</h3>
        <p className="text-sm text-content-secondary mt-2">
          Sit tight while our engine processes your events.
        </p>

        {/* Global progress indicator */}
        <div className="w-full bg-surface h-2 rounded-full overflow-hidden mt-6 border border-border">
          <div 
            className="bg-orange h-full transition-all duration-1000 ease-in-out" 
            style={{ width: `${Math.min(100, (activeStepIndex / (steps.length - 1)) * 100)}%` }} 
          />
        </div>
      </div>

      <div className="w-full space-y-4">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeStepIndex;
          const isActive = idx === activeStepIndex;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-xl border flex items-start gap-4 transition-colors duration-500 ${
                isActive ? 'bg-orange-50/50 border-orange-100 shadow-sm' : 
                isCompleted ? 'bg-white border-border' : 'bg-surface/50 border-transparent opacity-60'
              }`}
            >
              <div className="mt-1 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-orange animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-content-muted" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-bold ${isActive ? 'text-orange-dark' : isCompleted ? 'text-navy' : 'text-content-secondary'}`}>
                  {step.label}
                </p>
                
                {/* Reveal description dynamically when active/completed */}
                <AnimatePresence>
                  {(isActive || isCompleted) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-content-muted mt-1 leading-snug">
                        {step.desc}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};