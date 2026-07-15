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
      primary: 'bg-primary text-white hover:bg-primary-dark active:scale-95',
      secondary: 'bg-white border border-orchid text-primary hover:bg-aura',
      danger: 'bg-error text-white active:scale-95 hover:bg-error/90',
      ghost: 'bg-transparent text-charcoal-muted hover:bg-aura hover:text-charcoal',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-body font-medium transition-all duration-200 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed',
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
