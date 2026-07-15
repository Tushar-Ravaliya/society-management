import React from 'react';
import { cn } from '../../lib/cn';
import { CheckCircle2, Circle } from 'lucide-react';

interface TimelineEvent {
  date: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StatusTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ events, className }) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-[11px] top-4 bottom-4 w-px bg-orchid/20" />
      <ul className="space-y-6">
        {events.map((event, idx) => (
          <li key={idx} className="relative flex items-start gap-4">
            <div className="relative z-10 flex h-6 items-center justify-center bg-white mt-0.5">
              {event.status === 'completed' ? (
                <CheckCircle2 className="w-6 h-6 text-success bg-white" />
              ) : event.status === 'current' ? (
                <div className="w-6 h-6 rounded-full border-2 border-primary bg-white flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
              ) : (
                <Circle className="w-6 h-6 text-charcoal-muted/30 bg-white" />
              )}
            </div>
            <div>
              <p className={cn(
                "text-sm font-medium",
                event.status === 'upcoming' ? "text-charcoal-muted" : "text-charcoal"
              )}>
                {event.label}
              </p>
              <p className="text-xs text-charcoal-muted">{event.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
