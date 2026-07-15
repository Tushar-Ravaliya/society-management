import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';
import type { CreateAnnouncementPayload } from '../../../types/announcement.types';

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  audience: z.enum(['all', 'residents', 'committee']),
  isPinned: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
});

interface AnnouncementFormProps {
  onSubmit: (data: CreateAnnouncementPayload) => Promise<void>;
}

export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateAnnouncementPayload>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      audience: 'all',
      isPinned: false
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Title" error={errors.title?.message} required>
        <Input placeholder="E.g. Scheduled Water Maintenance" {...register('title')} />
      </FormField>

      <FormField label="Content" error={errors.content?.message} required>
        <Textarea rows={6} placeholder="Provide details about the announcement..." {...register('content')} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Audience" error={errors.audience?.message} required>
          <Select 
            options={[
              { value: 'all', label: 'Everyone' },
              { value: 'residents', label: 'Residents Only' },
              { value: 'committee', label: 'Committee Only' }
            ]}
            onChange={(val) => setValue('audience', val as any)}
          />
        </FormField>
        
        <FormField label="Expires At (Optional)" error={errors.expiresAt?.message}>
          <Input type="date" {...register('expiresAt')} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 cursor-pointer mt-2">
        <input type="checkbox" {...register('isPinned')} className="rounded border-gray-300 text-primary focus:ring-primary" />
        <span className="text-sm text-charcoal">Pin this announcement to the top</span>
      </label>

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full mt-4">
        Publish Announcement
      </Button>
    </form>
  );
};
