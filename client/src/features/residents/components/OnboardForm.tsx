import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { FormField } from '../../../components/form/FormField';
import type { OnboardResidentPayload } from '../../../types/resident.types';

const onboardSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  unitId: z.string().min(1, 'Unit ID is required'),
  residencyType: z.enum(['owner', 'tenant']),
  phoneNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
});

interface OnboardFormProps {
  onSubmit: (data: OnboardResidentPayload) => Promise<void>;
}

export const OnboardForm: React.FC<OnboardFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<OnboardResidentPayload>({
    resolver: zodResolver(onboardSchema),
    defaultValues: {
      residencyType: 'owner'
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Full Name" error={errors.name?.message} required>
          <Input placeholder="John Doe" {...register('name')} />
        </FormField>
        
        <FormField label="Email" error={errors.email?.message} required>
          <Input type="email" placeholder="john@example.com" {...register('email')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Unit ID" error={errors.unitId?.message} required>
          <Input placeholder="e.g. uuid-of-unit" {...register('unitId')} />
        </FormField>

        <FormField label="Residency Type" error={errors.residencyType?.message} required>
          <Select 
            options={[
              { value: 'owner', label: 'Owner' },
              { value: 'tenant', label: 'Tenant' }
            ]}
            onChange={(e) => setValue('residencyType', e.target.value as 'owner' | 'tenant')}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Phone Number" error={errors.phoneNumber?.message}>
          <Input type="tel" placeholder="+91 9876543210" {...register('phoneNumber')} />
        </FormField>

        <FormField label="Vehicle Number" error={errors.vehicleNumber?.message}>
          <Input placeholder="MH 01 AB 1234" {...register('vehicleNumber')} />
        </FormField>
      </div>

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full mt-4">
        Onboard Resident
      </Button>
    </form>
  );
};
