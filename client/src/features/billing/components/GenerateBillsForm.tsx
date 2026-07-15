import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DatePicker } from '../../../components/form/DatePicker';
import { FormField } from '../../../components/form/FormField';
import type { GenerateBatchPayload } from '../../../types/billing.types';

const generateSchema = z.object({
  billingPeriod: z.string().min(1, 'Billing period is required').max(50),
  dueDate: z.string().min(1, 'Due date is required'),
  defaultMaintenance: z.number().min(0, 'Must be positive'),
  defaultWater: z.number().min(0, 'Must be positive'),
  defaultElectricity: z.number().min(0, 'Must be positive'),
});

type GenerateFormValues = z.infer<typeof generateSchema>;

interface GenerateBillsFormProps {
  onSubmit: (data: GenerateBatchPayload) => Promise<void>;
  isLoading?: boolean;
}

export function GenerateBillsForm({ onSubmit, isLoading }: GenerateBillsFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      billingPeriod: '',
      dueDate: '',
      defaultMaintenance: 0,
      defaultWater: 0,
      defaultElectricity: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Billing Period" error={errors.billingPeriod?.message} required>
          <Input 
            {...register('billingPeriod')} 
            placeholder="e.g. Jul 2025" 
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Due Date" error={errors.dueDate?.message} required>
          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                disabled={isLoading}
              />
            )}
          />
        </FormField>
      </div>

      <div className="space-y-4">
        <h3 className="font-display font-semibold text-charcoal text-lg">Default Amounts (₹)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Maintenance" error={errors.defaultMaintenance?.message} required>
            <Input 
              type="number" 
              step="0.01" 
              {...register('defaultMaintenance', { valueAsNumber: true })} 
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Water" error={errors.defaultWater?.message} required>
            <Input 
              type="number" 
              step="0.01" 
              {...register('defaultWater', { valueAsNumber: true })} 
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Electricity" error={errors.defaultElectricity?.message} required>
            <Input 
              type="number" 
              step="0.01" 
              {...register('defaultElectricity', { valueAsNumber: true })} 
              disabled={isLoading}
            />
          </FormField>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" variant="primary" loading={isLoading}>
          Generate Bills
        </Button>
      </div>
    </form>
  );
}
