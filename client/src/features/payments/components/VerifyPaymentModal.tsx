import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import type { Payment } from '../../../types/payment.types';
import { formatCurrency } from '../../../lib/formatCurrency';

interface VerifyPaymentModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
  onVerify: (id: string, data: { status: 'verified' | 'failed', verificationNotes?: string }) => Promise<void>;
}

export function VerifyPaymentModal({ open, onClose, payment, onVerify }: VerifyPaymentModalProps) {
  const [status, setStatus] = useState<'verified' | 'failed'>('verified');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!payment) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onVerify(payment.id, { status, verificationNotes: notes });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Verify Payment">
      <div className="space-y-6">
        <div className="bg-aura p-4 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Resident:</span>
            <span className="font-medium text-charcoal">{payment.residentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Amount:</span>
            <span className="font-medium text-charcoal">{formatCurrency(Number(payment.amount))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Method:</span>
            <span className="font-medium text-charcoal capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Reference:</span>
            <span className="font-medium text-charcoal">{payment.transactionReference}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Action</label>
            <Select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as 'verified' | 'failed')}
              options={[
                { label: 'Verify (Mark Paid)', value: 'verified' },
                { label: 'Reject (Failed)', value: 'failed' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Notes (Optional)</label>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any verification notes..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant={status === 'verified' ? 'primary' : 'danger'} 
            onClick={handleSubmit} 
            loading={isSubmitting}
          >
            {status === 'verified' ? 'Verify Payment' : 'Reject Payment'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
