import React from 'react';
import { cn } from '../../lib/cn';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-charcoal mb-1.5">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'block w-full rounded-lg border border-orchid/20 px-3 py-2 text-charcoal bg-white font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none',
            error && 'border-error focus:border-error focus:ring-error/20',
            props.disabled && 'opacity-50 cursor-not-allowed bg-aura'
          )}
          {...props}
        >
          {props.placeholder && (
            <option value="" disabled hidden>
              {props.placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
