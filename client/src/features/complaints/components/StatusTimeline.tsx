import React from 'react';
import { CheckCircle2, Clock, UserCheck, XCircle } from 'lucide-react';

interface TimelineEvent {
  title: string;
  description?: string;
  date?: string | null;
  status: 'completed' | 'current' | 'pending';
  icon?: 'clock' | 'assign' | 'check' | 'close';
}

interface StatusTimelineProps {
  events: TimelineEvent[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ events }) => {
  const getIcon = (icon?: string, status?: string) => {
    if (status === 'pending') return <div className="w-3 h-3 rounded-full bg-charcoal-muted/30" />;
    
    switch (icon) {
      case 'clock': return <Clock className="w-5 h-5 text-warning" />;
      case 'assign': return <UserCheck className="w-5 h-5 text-info" />;
      case 'check': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'close': return <XCircle className="w-5 h-5 text-danger" />;
      default: return <div className="w-3 h-3 rounded-full bg-primary" />;
    }
  };

  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-orchid/10 rounded" />
      <div className="space-y-6">
        {events.map((event, idx) => (
          <div key={idx} className="relative">
            <div className={`absolute -left-[30px] flex items-center justify-center w-6 h-6 bg-white ${event.status === 'pending' ? 'mt-1' : ''}`}>
              {getIcon(event.icon, event.status)}
            </div>
            <div className={event.status === 'pending' ? 'opacity-50' : ''}>
              <h4 className="text-sm font-semibold text-charcoal">{event.title}</h4>
              {event.description && <p className="text-sm text-charcoal-muted mt-1">{event.description}</p>}
              {event.date && <p className="text-xs text-charcoal-muted mt-1">{event.date}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
