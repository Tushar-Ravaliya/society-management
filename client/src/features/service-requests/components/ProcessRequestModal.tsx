import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';
import type { ServiceRequestStatus } from '../../../types/service-request.types';

const processSchema = z.object({
  status: z.enum(['approved', 'rejected', 'completed']),
  adminRemarks: z.string().optional().nullable(),
});

interface ProcessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcess: (data: { status: ServiceRequestStatus; adminRemarks?: string | null }) => Promise<void>;
  defaultStatus?: 'approved' | 'rejected' | 'completed';
}

export const ProcessRequestModal: React.FC<ProcessRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  onProcess,
  defaultStatus = 'approved'
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(processSchema),
    defaultValues: {
      status: defaultStatus
    }
  });

  // Update default value when defaultStatus prop changes
  React.useEffect(() => {
    setValue('status', defaultStatus);
  }, [defaultStatus, setValue]);

  const onSubmit = async (data: any) => {
    await onProcess(data);
    reset();
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Process Service Request">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Action" error={errors.status?.message as string} required>
          <Select 
            options={[
              { value: 'approved', label: 'Approve' },
              { value: 'rejected', label: 'Reject' },
              { value: 'completed', label: 'Mark Completed' }
            ]}
            value={defaultStatus}
            onChange={(e) => setValue('status', e.target.value as any)}
          />
        </FormField>

        <FormField label="Admin Remarks (Optional)" error={errors.adminRemarks?.message as string}>
          <Textarea rows={3} placeholder="Add any notes for the resident..." {...register('adminRemarks')} />
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
