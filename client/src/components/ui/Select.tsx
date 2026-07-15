import React from 'react';
import { cn } from '../../lib/cn';
import { ChevronDown } from 'lucide-react';

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
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-sm text-charcoal bg-white font-body focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 appearance-none cursor-pointer',
              error && 'border-error focus:border-error focus:ring-error/10',
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
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-charcoal-muted/50">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

