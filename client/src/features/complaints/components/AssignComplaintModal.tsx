import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';

const assignSchema = z.object({
  assignedToId: z.string().min(1, 'User ID is required'),
});

interface AssignComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: { assignedToId: string }) => Promise<void>;
}

export const AssignComplaintModal: React.FC<AssignComplaintModalProps> = ({ isOpen, onClose, onAssign }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(assignSchema)
  });

  const onSubmit = async (data: any) => {
    await onAssign(data);
    reset();
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Assign Complaint">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Assign To (User ID)" error={errors.assignedToId?.message as string} required>
          <Input placeholder="Enter user ID..." {...register('assignedToId')} />
        </FormField>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Assign
          </Button>
        </div>
      </form>
    </Modal>
  );
};
