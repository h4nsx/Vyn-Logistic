import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, hint, id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="flex flex-col gap-1.5 w-full group">
        <label htmlFor={id} className="text-sm font-semibold text-content-primary transition-colors group-focus-within:text-navy">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted transition-colors group-focus-within:text-navy">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            type={resolvedType}
            className={cn(
              "w-full rounded-xl border bg-white px-4 py-3 text-sm text-content-primary placeholder:text-content-muted/60",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:shadow-sm",
              icon && "pl-11",
              isPassword && "pr-11",
              error 
                ? "border-danger focus:border-danger focus:ring-danger/20 bg-danger-50/30" 
                : "border-border hover:border-border-dark focus:border-navy focus:ring-navy/15",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-navy transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-danger font-medium mt-0.5 animate-in slide-in-from-top-1 duration-200">
            {error}
          </span>
        )}
        {hint && !error && (
          <span className="text-xs text-content-muted mt-0.5">{hint}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';