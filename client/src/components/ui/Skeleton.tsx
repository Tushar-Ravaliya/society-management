import React from 'react';
import { cn } from '../../lib/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse bg-aura rounded", className)}
      {...props}
    />
  );
};
