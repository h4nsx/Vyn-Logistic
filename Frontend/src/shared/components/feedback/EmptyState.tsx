import { Database } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-dashed border-border rounded-2xl">
    <div className="bg-surface p-4 rounded-full text-content-muted mb-4">
      {icon || <Database className="w-8 h-8" />}
    </div>
    <h3 className="text-lg font-bold text-navy">{title}</h3>
    <p className="text-sm text-content-secondary mt-1 max-w-xs mx-auto">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);