import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'anomaly';
  className?: string;
}

export const Badge = ({ children, variant = 'info', className }: BadgeProps) => {
  const variants = {
    success: 'bg-success-50 text-success border-success/20',
    warning: 'bg-warning-50 text-warning border-warning/20',
    danger: 'bg-danger-50 text-danger border-danger/20',
    info: 'bg-navy-50 text-navy border-navy/20',
    anomaly: 'bg-anomaly-50 text-anomaly border-anomaly/20',
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};