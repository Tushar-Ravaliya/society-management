import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { FormField } from '../../../components/form/FormField';
import type { CreateUnitPayload } from '../../../types/unit.types';

const createUnitSchema = z.object({
  block: z.string().min(1, 'Block is required'),
  flatNumber: z.string().min(1, 'Flat Number is required'),
  floor: z.number().int().min(0, 'Floor must be >= 0'),
  bhkType: z.string().min(1, 'BHK Type is required'),
});

interface CreateUnitFormProps {
  onSubmit: (data: CreateUnitPayload) => Promise<void>;
}

export const CreateUnitForm: React.FC<CreateUnitFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateUnitPayload>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: {
      bhkType: '1BHK'
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Block" error={errors.block?.message} required>
          <Input placeholder="e.g. A, Tower-1" {...register('block')} />
        </FormField>
        
        <FormField label="Flat Number" error={errors.flatNumber?.message} required>
          <Input placeholder="e.g. 101, A-101" {...register('flatNumber')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Floor" error={errors.floor?.message} required>
          <Input type="number" placeholder="e.g. 1" {...register('floor', { valueAsNumber: true })} />
        </FormField>

        <FormField label="BHK Type" error={errors.bhkType?.message} required>
          <Select 
            options={[
              { value: '1BHK', label: '1BHK' },
              { value: '2BHK', label: '2BHK' },
              { value: '3BHK', label: '3BHK' },
              { value: '4BHK', label: '4BHK' },
              { value: 'Studio', label: 'Studio' }
            ]}
            onChange={(e) => setValue('bhkType', e.target.value)}
          />
        </FormField>
      </div>

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full mt-4">
        Create Unit
      </Button>
    </form>
  );
};
