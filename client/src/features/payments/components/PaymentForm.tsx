import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { FormField } from '../../../components/form/FormField';

const paymentSchema = z.object({
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  transactionReference: z.string().min(1, 'Reference is required'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  defaultAmount?: number;
  onSubmit: (data: PaymentFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function PaymentForm({ defaultAmount = 0, onSubmit, isLoading }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'bank_transfer',
      amount: defaultAmount,
      transactionReference: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Payment Method" error={errors.paymentMethod?.message} required>
        <Select 
          {...register('paymentMethod')} 
          disabled={isLoading}
          options={[
            { label: 'Bank Transfer (NEFT/IMPS/UPI)', value: 'bank_transfer' },
            { label: 'Cheque', value: 'cheque' },
            { label: 'Cash', value: 'cash' },
          ]}
        />
      </FormField>

      <FormField label="Amount (₹)" error={errors.amount?.message} required>
        <Input 
          type="number" 
          step="0.01" 
          {...register('amount', { valueAsNumber: true })} 
          disabled={isLoading}
        />
      </FormField>

      <FormField 
        label="Transaction Reference / Receipt No." 
        error={errors.transactionReference?.message} 
        required
      >
        <Input 
          {...register('transactionReference')} 
          placeholder="e.g. UTR number, Cheque number" 
          disabled={isLoading}
        />
      </FormField>

      <div className="pt-2">
        <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
          Record Offline Payment
        </Button>
      </div>
    </form>
  );
}
