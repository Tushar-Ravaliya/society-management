import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';

const resolveSchema = z.object({
  status: z.enum(['resolved', 'rejected']),
  resolutionDetails: z.string().min(5, 'Please provide more details'),
});

interface ResolveComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (data: { status: 'resolved' | 'rejected'; resolutionDetails: string }) => Promise<void>;
  defaultStatus?: 'resolved' | 'rejected';
}

export const ResolveComplaintModal: React.FC<ResolveComplaintModalProps> = ({ 
  isOpen, 
  onClose, 
  onResolve,
  defaultStatus = 'resolved'
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(resolveSchema),
    defaultValues: {
      status: defaultStatus
    }
  });

  const onSubmit = async (data: any) => {
    await onResolve(data);
    reset();
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Process Complaint">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Action" error={errors.status?.message as string} required>
          <Select 
            options={[
              { value: 'resolved', label: 'Resolve' },
              { value: 'rejected', label: 'Reject' }
            ]}
            defaultValue={defaultStatus}
            onChange={(e) => setValue('status', e.target.value as 'resolved' | 'rejected')}
          />
        </FormField>

        <FormField label="Resolution Details" error={errors.resolutionDetails?.message as string} required>
          <Textarea rows={4} placeholder="Describe the actions taken..." {...register('resolutionDetails')} />
        </FormField>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
