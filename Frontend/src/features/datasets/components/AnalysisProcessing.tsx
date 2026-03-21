import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../../../shared/components/feedback/LoadingSpinner';

export const AnalysisProcessing = ({ onFinished }: { onFinished: () => void }) => {
  const [status, setStatus] = useState('Initializing ML models...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const steps = [
      { p: 20, s: 'Cleaning dataset...' },
      { p: 50, s: 'Running feature engineering...' },
      { p: 80, s: 'Detecting anomalies...' },
      { p: 100, s: 'Finalizing results...' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        setStatus(steps[currentStep].s);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(onFinished, 1000);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <div className="flex flex-col items-center py-12 gap-6">
      <LoadingSpinner size="lg" />
      <div className="text-center">
        <h3 className="text-xl font-bold text-navy">Analyzing Data</h3>
        <p className="text-sm text-content-secondary mt-1">{status}</p>
      </div>
      <div className="w-full max-w-xs bg-border h-1.5 rounded-full overflow-hidden">
        <div className="bg-orange h-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};