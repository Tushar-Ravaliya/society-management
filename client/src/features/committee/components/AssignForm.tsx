import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';
import type { AssignCommitteeMemberPayload } from '../../../types/committee.types';
import type { User } from '../../../types/auth.types';

const assignSchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
  designation: z.string().min(2, 'Designation is required'),
  portfolio: z.string().min(2, 'Portfolio is required'),
  termStart: z.string().min(1, 'Term start date is required'),
  termEnd: z.string().min(1, 'Term end date is required'),
});

interface AssignFormProps {
  onSubmit: (data: AssignCommitteeMemberPayload) => Promise<void>;
  users: User[];
}

export const AssignForm: React.FC<AssignFormProps> = ({ onSubmit, users }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AssignCommitteeMemberPayload>({
    resolver: zodResolver(assignSchema)
  });

  const userOptions = users.map((u) => ({
    label: `${u.name || 'Unnamed'} (${u.email}) - ${u.role}`,
    value: u.id,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Select User" error={errors.userId?.message} required>
        <Select 
          placeholder="Select a resident or user to assign..." 
          options={userOptions} 
          {...register('userId')} 
        />
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
