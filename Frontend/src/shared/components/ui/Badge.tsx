import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'anomaly' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge = ({ children, variant = 'info', size = 'sm', dot, className }: BadgeProps) => {
  const variants = {
    success: 'bg-success-50 text-success ring-success/20',
    warning: 'bg-warning-50 text-warning ring-warning/20',
    danger: 'bg-danger-50 text-danger ring-danger/20',
    info: 'bg-navy-50 text-navy ring-navy/20',
    anomaly: 'bg-anomaly-50 text-anomaly ring-anomaly/20',
    neutral: 'bg-surface text-content-secondary ring-border',
  };

  const dotColors = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-navy',
    anomaly: 'bg-anomaly',
    neutral: 'bg-content-muted',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 uppercase tracking-wider whitespace-nowrap transition-colors",
      variants[variant],
      sizes[size],
      className
    )}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColors[variant])} />
      )}
      {children}
    </span>
  );
};