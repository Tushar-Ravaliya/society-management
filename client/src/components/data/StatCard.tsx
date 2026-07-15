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
    <Card hover className={cn("p-6 flex flex-col justify-between select-none cursor-pointer duration-300", className)}>
      <div className="flex justify-between items-start mb-5">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border",
              trend.positive 
                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                : "bg-rose-50 text-rose-700 border-rose-100"
            )}
          >
            {trend.positive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted/80 mb-1">{label}</p>
        <h4 className="text-2xl font-display font-bold text-charcoal tracking-tight">{value}</h4>
      </div>
    </Card>
  );
};
