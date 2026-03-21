import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor={id} className="text-sm font-semibold text-content-primary">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              "w-full rounded-lg border bg-surface px-4 py-2.5 text-sm text-content-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1",
              icon && "pl-10",
              error 
                ? "border-danger focus:border-danger focus:ring-danger-light" 
                : "border-border hover:border-border-dark focus:border-navy focus:ring-navy-100",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-danger mt-0.5">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';