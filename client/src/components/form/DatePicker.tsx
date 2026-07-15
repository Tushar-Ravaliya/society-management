import React from 'react';
import { cn } from '../../lib/cn';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
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
          type="date"
          id={inputId}
          ref={ref}
          className={cn(
            'block w-full rounded-lg border border-orchid/20 px-3 py-2 text-charcoal bg-white font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
            error && 'border-error focus:border-error focus:ring-error/20',
            props.disabled && 'opacity-50 cursor-not-allowed bg-aura'
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';
