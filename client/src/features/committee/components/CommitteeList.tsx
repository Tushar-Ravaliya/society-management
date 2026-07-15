import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../lib/formatDate';
import type { CommitteeMember } from '../../../types/committee.types';

interface CommitteeListProps {
  members: CommitteeMember[];
  isAdmin: boolean;
  onEdit?: (member: CommitteeMember) => void;
}

export const CommitteeList: React.FC<CommitteeListProps> = ({ members, isAdmin, onEdit }) => {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-orchid/10">
        <p className="text-charcoal-muted">No committee members assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map(member => (
        <Card key={member.id} hover className="p-6 relative">
          {isAdmin && onEdit && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-4 right-4 text-xs"
              onClick={() => onEdit(member)}
            >
              Edit
            </Button>
          )}
          
          <div className="flex flex-col items-center text-center">
            <Avatar name={member.name} size="lg" className="mb-4" />
            <h3 className="font-display text-lg font-semibold text-charcoal">{member.name}</h3>
            <p className="text-primary font-medium mt-1">{member.designation}</p>
            <p className="text-charcoal-muted text-sm">{member.portfolio}</p>
            
            <div className="mt-4 flex items-center justify-center gap-4 text-charcoal-muted">
              <a href={`mailto:${member.email}`} className="hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              {member.phoneNumber && (
                <a href={`tel:${member.phoneNumber}`} className="hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-orchid/10 w-full flex justify-between items-center text-xs text-charcoal-muted">
              <span>{formatDate(member.termStart)} – {formatDate(member.termEnd)}</span>
              <Badge variant={member.isActive ? 'success' : 'neutral'}>
                {member.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
