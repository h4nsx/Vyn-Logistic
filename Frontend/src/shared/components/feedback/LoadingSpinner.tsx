import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Optional additional classes for the container
   */
  className?: string;
  /**
   * Optional additional classes for the spinner icon itself
   */
  iconClassName?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className, 
  iconClassName 
}: LoadingSpinnerProps) => {
  
  // Map size props to Tailwind dimensions
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={cn("flex items-center justify-center w-full h-full", className)}>
      <Loader2 
        className={cn(
          "animate-spin text-orange", // Brand color + animation
          sizeClasses[size], 
          iconClassName
        )} 
      />
    </div>
  );
};