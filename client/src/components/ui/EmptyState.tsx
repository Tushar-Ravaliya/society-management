import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-orchid/20 rounded-xl">
      {Icon && (
        <div className="w-12 h-12 mb-4 rounded-full bg-aura flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}
      <h3 className="text-lg font-display font-bold text-charcoal mb-2">{title}</h3>
      <p className="text-sm text-charcoal-muted max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
