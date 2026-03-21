import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className,
  label 
}: LoadingSpinnerProps) => {
  
  const sizeMap = {
    sm: { ring: 'w-5 h-5', dot: 'w-1 h-1' },
    md: { ring: 'w-10 h-10', dot: 'w-1.5 h-1.5' },
    lg: { ring: 'w-14 h-14', dot: 'w-2 h-2' },
    xl: { ring: 'w-20 h-20', dot: 'w-2.5 h-2.5' },
  };

  return (
    <div className={cn("flex flex-col items-center justify-center w-full h-full gap-4", className)}>
      <div className="relative">
        {/* Outer glow ring */}
        <div className={cn(
          "rounded-full border-2 border-border animate-spin",
          sizeMap[size].ring
        )} 
        style={{ 
          borderTopColor: 'var(--color-orange)', 
          borderRightColor: 'var(--color-orange-light)',
          animationDuration: '0.8s' 
        }} 
        />
        {/* Center dot */}
        <div className={cn(
          "absolute inset-0 m-auto rounded-full bg-orange animate-pulse",
          sizeMap[size].dot
        )} />
      </div>
      {label && (
        <p className="text-sm text-content-secondary font-medium animate-pulse">{label}</p>
      )}
    </div>
  );
};