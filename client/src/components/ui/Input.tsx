import React from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-charcoal mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-charcoal bg-white font-body placeholder:text-charcoal-muted/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200',
            error && 'border-error focus:border-error focus:ring-error/10',
            props.disabled && 'opacity-50 cursor-not-allowed bg-aura'
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
