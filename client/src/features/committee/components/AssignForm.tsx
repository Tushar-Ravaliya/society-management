import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';
import type { AssignCommitteeMemberPayload } from '../../../types/committee.types';

const assignSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  designation: z.string().min(2, 'Designation is required'),
  portfolio: z.string().min(2, 'Portfolio is required'),
  termStart: z.string().min(1, 'Term start date is required'),
  termEnd: z.string().min(1, 'Term end date is required'),
});

interface AssignFormProps {
  onSubmit: (data: AssignCommitteeMemberPayload) => Promise<void>;
}

export const AssignForm: React.FC<AssignFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AssignCommitteeMemberPayload>({
    resolver: zodResolver(assignSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="User ID" error={errors.userId?.message} required>
        <Input placeholder="e.g. uuid-of-user" {...register('userId')} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Designation" error={errors.designation?.message} required>
          <Input placeholder="e.g. Chairman" {...register('designation')} />
        </FormField>
        
        <FormField label="Portfolio" error={errors.portfolio?.message} required>
          <Input placeholder="e.g. Finance & Billing" {...register('portfolio')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Term Start Date" error={errors.termStart?.message} required>
          <Input type="date" {...register('termStart')} />
        </FormField>

        <FormField label="Term End Date" error={errors.termEnd?.message} required>
          <Input type="date" {...register('termEnd')} />
        </FormField>
      </div>

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full mt-4">
        Assign Member
      </Button>
    </form>
  );
};
