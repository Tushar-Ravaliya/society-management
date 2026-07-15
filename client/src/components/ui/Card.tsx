import React from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white border border-neutral-100 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.02)]",
          hover && "hover:border-primary/20 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(99,102,241,0.08)] transition-all duration-300 ease-out",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
