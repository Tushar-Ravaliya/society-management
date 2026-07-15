import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';
import type { LodgeComplaintPayload } from '../../../types/complaint.types';

const lodgeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['Plumbing', 'Electrical', 'Noise', 'Parking', 'Maintenance', 'Security', 'Other']),
  priority: z.enum(['low', 'medium', 'high']),
  image: z.any().optional(), // handled via file list
});

interface ComplaintFormProps {
  onSubmit: (data: LodgeComplaintPayload) => Promise<void>;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<any>({
    resolver: zodResolver(lodgeSchema),
    defaultValues: {
      category: 'Maintenance',
      priority: 'medium',
    }
  });

  const onSubmitWrap = async (data: any) => {
    const payload: LodgeComplaintPayload = {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
    };
    if (data.image && data.image.length > 0) {
      payload.image = data.image[0];
    }
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitWrap)} className="space-y-4">
      <FormField label="Title" error={errors.title?.message as string} required>
        <Input placeholder="E.g. Leaking pipe in bathroom" {...register('title')} />
      </FormField>

      <FormField label="Description" error={errors.description?.message as string} required>
        <Textarea rows={5} placeholder="Provide details about the issue..." {...register('description')} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Category" error={errors.category?.message as string} required>
          <Select 
            options={[
              { value: 'Plumbing', label: 'Plumbing' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Noise', label: 'Noise' },
              { value: 'Parking', label: 'Parking' },
              { value: 'Maintenance', label: 'Maintenance' },
              { value: 'Security', label: 'Security' },
              { value: 'Other', label: 'Other' },
            ]}
            onChange={(e) => setValue('category', e.target.value)}
          />
        </FormField>
        
        <FormField label="Priority" error={errors.priority?.message as string} required>
          <Select 
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]}
            onChange={(e) => setValue('priority', e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Upload Image (Optional)" error={errors.image?.message as string}>
        <Input type="file" accept="image/*" {...register('image')} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
      </FormField>

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full mt-4">
        Submit Complaint
      </Button>
    </form>
  );
};
