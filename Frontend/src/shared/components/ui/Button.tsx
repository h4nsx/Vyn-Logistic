import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../../features/auth/store';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'navy' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: boolean | React.ReactNode;
  isLoading?: boolean;
  smartAuth?: boolean;
  glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, icon, isLoading, smartAuth, glow, onClick, children, ...props }, ref) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const baseStyles = [
      "inline-flex items-center justify-center rounded-xl font-semibold",
      "transition-all duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none",
      "active:scale-[0.97]",
      "select-none",
    ].join(' ');
    
    const variants = {
      primary: "bg-gradient-to-b from-orange to-orange-dark text-white shadow-md shadow-orange/25 hover:shadow-lg hover:shadow-orange/30 hover:-translate-y-0.5 focus-visible:ring-orange",
      secondary: "bg-surface text-navy hover:bg-surface-dark border border-border hover:border-border-dark focus-visible:ring-navy",
      navy: "bg-gradient-to-b from-navy to-navy-dark text-white shadow-md shadow-navy/25 hover:shadow-lg hover:shadow-navy/30 hover:-translate-y-0.5 focus-visible:ring-navy",
      outline: "border border-border text-navy hover:border-navy/30 hover:bg-navy-50/50 focus-visible:ring-navy",
      ghost: "text-content-secondary hover:text-navy hover:bg-surface active:scale-100 focus-visible:ring-navy",
      danger: "bg-gradient-to-b from-danger to-danger/90 text-white shadow-md shadow-danger/25 hover:shadow-lg hover:shadow-danger/30 hover:-translate-y-0.5 focus-visible:ring-danger",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm gap-1.5",
      md: "px-6 py-3 text-sm gap-2",
      lg: "px-8 py-4 text-base gap-2",
    };

    const handleSmartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (smartAuth) {
        e.preventDefault();
        navigate(isAuthenticated ? '/app' : '/register');
        return;
      }
      if (onClick) onClick(e);
    };

    const content = (
      <>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && children}
        {!isLoading && icon === true ? <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /> : icon && !isLoading && <span>{icon}</span>}
      </>
    );

    const classes = cn(
      baseStyles, 
      variants[variant], 
      sizes[size], 
      glow && variant === 'primary' && 'animate-pulse-glow',
      'group',
      className
    );

    if (href && !smartAuth) {
      return (
        <Link to={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} onClick={handleSmartClick} disabled={isLoading || props.disabled} {...props}>
        {content}
      </button>
    );
  }
);
Button.displayName = 'Button';