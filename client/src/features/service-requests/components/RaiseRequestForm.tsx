import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';
import type { RaiseServiceRequestPayload } from '../../../types/service-request.types';

const raiseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  requestType: z.enum(['noc', 'clubhouse_booking', 'renovation_permission', 'parking_allocation', 'other']),
  preferredDate: z.string().optional().nullable(),
});

interface RaiseRequestFormProps {
  onSubmit: (data: RaiseServiceRequestPayload) => Promise<void>;
}

export const RaiseRequestForm: React.FC<RaiseRequestFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<RaiseServiceRequestPayload>({
    resolver: zodResolver(raiseSchema),
    defaultValues: {
      requestType: 'noc',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Title" error={errors.title?.message} required>
        <Input placeholder="E.g. Passport NOC required" {...register('title')} />
      </FormField>

      <FormField label="Description" error={errors.description?.message} required>
        <Textarea rows={5} placeholder="Provide details about the request..." {...register('description')} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Request Type" error={errors.requestType?.message} required>
          <Select 
            options={[
              { value: 'noc', label: 'NOC (No Objection Certificate)' },
              { value: 'clubhouse_booking', label: 'Clubhouse Booking' },
              { value: 'renovation_permission', label: 'Renovation Permission' },
              { value: 'parking_allocation', label: 'Parking Allocation' },
              { value: 'other', label: 'Other' },
            ]}
            onChange={(e) => setValue('requestType', e.target.value as any)}
          />
        </FormField>
        
        <FormField label="Preferred Date (Optional)" error={errors.preferredDate?.message}>
          <Input type="date" {...register('preferredDate')} min={new Date().toISOString().split('T')[0]} />
        </FormField>
      </div>

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full mt-4">
        Submit Request
      </Button>
    </form>
  );
};
