import React from 'react';
import { cn } from '../../lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  };

  return (
    <div
      className={cn(
        "rounded-full animate-spin border-primary border-t-transparent",
        sizes[size],
        className
      )}
      role="status"
    />
  );
};
