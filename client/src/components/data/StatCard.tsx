import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/cn';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, trend, className }) => {
  return (
    <Card hover className={cn("p-6 flex flex-col justify-between", className)}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-orchid/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              trend.positive ? "text-success" : "text-error"
            )}
          >
            {trend.positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-charcoal-muted mb-1">{label}</p>
        <h4 className="text-2xl font-display font-bold text-charcoal">{value}</h4>
      </div>
    </Card>
  );
};
