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
          "bg-white border border-orchid/10 rounded-xl shadow-[0_8px_30px_rgba(109,40,217,0.04)]",
          hover && "hover:border-orchid/30 hover:shadow-[0_12px_40px_rgba(109,40,217,0.08)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
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
