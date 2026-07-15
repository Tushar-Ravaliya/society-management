import React from 'react';
import { cn } from '../../lib/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-charcoal mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            'block w-full rounded-lg border border-orchid/20 px-3 py-2 text-charcoal bg-white font-body placeholder:text-charcoal-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-y',
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
Textarea.displayName = 'Textarea';
