import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type ToastType } from '../../store/toastStore';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-success" />,
  error: <AlertCircle className="w-5 h-5 text-danger" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
  info: <Info className="w-5 h-5 text-navy" />,
};

const borderColors: Record<ToastType, string> = {
  success: 'border-l-success bg-white',
  error: 'border-l-danger bg-white',
  warning: 'border-l-warning bg-white',
  info: 'border-l-navy bg-white',
};

const progressColors: Record<ToastType, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-navy',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

function ToastItem({ toast, onDismiss }: { toast: { id: string; message: string; type: ToastType }; onDismiss: (id: string) => void }) {
  // Auto-dismiss progress
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border border-border border-l-4 shadow-elevated pointer-events-auto relative overflow-hidden",
        borderColors[toast.type]
      )}
    >
      <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
      <div className="flex-grow min-w-0">
        <p className="text-sm font-semibold text-navy leading-snug">{toast.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(toast.id)}
        className="text-content-muted hover:text-navy transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 4, ease: 'linear' }}
          className={cn("h-full", progressColors[toast.type])}
        />
      </div>
    </motion.div>
  );
}