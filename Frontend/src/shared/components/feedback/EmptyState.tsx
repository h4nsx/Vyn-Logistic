import { Database } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-dashed border-border rounded-2xl"
  >
    <div className="bg-gradient-to-br from-surface to-border/30 p-5 rounded-2xl text-content-muted mb-5 shadow-inner">
      {icon || <Database className="w-8 h-8" />}
    </div>
    <h3 className="text-lg font-bold text-navy">{title}</h3>
    <p className="text-sm text-content-secondary mt-2 max-w-xs mx-auto leading-relaxed">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </motion.div>
);