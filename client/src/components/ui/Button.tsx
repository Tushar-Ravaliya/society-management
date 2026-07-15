import React from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon: Icon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-dark shadow-[0_2px_8px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)] hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'bg-white border border-charcoal-muted/20 text-charcoal hover:bg-primary-light/40 hover:text-primary hover:border-primary/30 hover:-translate-y-0.5 active:translate-y-0',
      danger: 'bg-error text-white hover:bg-error/90 shadow-[0_2px_8px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 active:translate-y-0',
      ghost: 'bg-transparent text-charcoal-muted hover:bg-primary-light/40 hover:text-primary',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-5 py-2.5 text-base rounded-lg',
    };


    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-body font-medium transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:-translate-y-0 disabled:shadow-none select-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Spinner size="sm" className="mr-2" />}
        {!loading && Icon && <Icon className={cn('mr-2', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
