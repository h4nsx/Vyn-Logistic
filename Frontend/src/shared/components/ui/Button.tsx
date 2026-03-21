import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../../features/auth/store';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'navy';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: boolean | React.ReactNode;
  isLoading?: boolean;
  smartAuth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, icon, isLoading, smartAuth, onClick, children, ...props }, ref) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-orange text-white hover:bg-orange-light active:bg-orange-dark focus:ring-orange",
      secondary: "bg-surface text-navy hover:bg-surface-dark focus:ring-navy",
      navy: "bg-navy text-white hover:bg-navy-light active:bg-navy-dark focus:ring-navy",
      outline: "border border-border text-navy hover:border-border-dark hover:bg-surface focus:ring-navy",
      ghost: "text-content-secondary hover:text-navy hover:bg-surface focus:ring-navy",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3.5 text-sm",
      lg: "px-8 py-4 text-base",
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
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
        {icon === true ? <ArrowRight className="w-4 h-4 ml-2" /> : icon && <span className="ml-2">{icon}</span>}
      </>
    );

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (href && !smartAuth) {
      return (
        <Link to={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} onClick={handleSmartClick} disabled={isLoading} {...props}>
        {content}
      </button>
    );
  }
);
Button.displayName = 'Button';