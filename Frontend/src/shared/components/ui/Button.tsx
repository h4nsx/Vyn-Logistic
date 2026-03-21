import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../features/auth/store';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'navy';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: boolean | React.ReactNode;
  isLoading?: boolean;
  smartAuth?: boolean; // If true, changes destination & text if authenticated
  glow?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  icon = false,
  isLoading = false,
  smartAuth = false,
  glow = false,
  disabled,
  ...props
}) => { 
  const { isAuthenticated } = useAuthStore();

  const baseStyles = 'inline-flex items-center justify-center gap-2 font-black transition-all duration-200 active:scale-[0.97] rounded-xl whitespace-nowrap outline-none tracking-tight italic';
  
  const variants = {
    primary: 'bg-orange hover:bg-orange-dark text-white shadow-lg hover:shadow-xl hover:shadow-orange/20',
    secondary: 'bg-surface hover:bg-border text-navy',
    navy: 'bg-navy hover:bg-navy-dark text-white shadow-lg hover:shadow-xl shadow-navy/20',
    outline: 'border-2 border-border hover:border-navy/30 text-navy hover:bg-navy-50/50',
    ghost: 'bg-transparent text-content-secondary hover:text-navy hover:bg-surface active:scale-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3.5 text-base',
    lg: 'px-10 py-4.5 text-lg',
  };

  const finalClassName = cn(
    baseStyles, 
    variants[variant], 
    sizes[size], 
    (disabled || isLoading) && 'opacity-60 pointer-events-none grayscale',
    glow && variant === 'primary' && 'shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]',
    glow && variant === 'navy' && 'shadow-[0_0_20px_rgba(12,18,34,0.3)] hover:shadow-[0_0_30px_rgba(12,18,34,0.5)]',
    className
  );

  let targetHref = href;
  let text = children;

  if (smartAuth) {
    targetHref = isAuthenticated ? '/app' : '/register';
    text = isAuthenticated ? 'Go to Dashboard' : children;
  }

  const renderIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin shrink-0" />;
    if (typeof icon === 'boolean' && icon) return <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />;
    if (React.isValidElement(icon)) return icon;
    return null;
  };

  if (targetHref) {
    return (
      <Link to={targetHref} className={cn(finalClassName, "group")}>
        {text}
        {renderIcon()}
      </Link>
    );
  }

  return (
    <button className={cn(finalClassName, "group")} disabled={disabled || isLoading} {...props}>
      {text}
      {renderIcon()}
    </button>
  );
};

export default Button;
export { Button }; // Support both default and named export