import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../../../stores/auth.store';
import type { LoginPayload } from '../../../types/auth.types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginPayload) => {
    try {
      const response = await authApi.login(data);
      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success('Successfully logged in!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Email" error={errors.email?.message} required>
        <Input 
          type="email" 
          placeholder="your@email.com"
          {...register('email')}
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        <Input 
          type="password" 
          placeholder="••••••••"
          {...register('password')}
        />
      </FormField>

      <Button type="submit" className="w-full mt-4" loading={isSubmitting}>
        Sign in
      </Button>

      <div className="text-center mt-4 text-sm text-charcoal-muted">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:underline font-medium">
          Register
        </Link>
      </div>

      <div className="mt-8 border-t border-orchid/10 pt-6">
        <p className="text-xs text-charcoal-muted text-center mb-3 uppercase tracking-wider font-semibold">Quick Login (Demo)</p>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            type="button" 
            variant="secondary" 
            size="sm"
            className="text-xs"
            onClick={() => {
              setValue('email', 'admin@society.com');
              setValue('password', 'Password@123');
            }}
          >
            Admin
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm"
            className="text-xs"
            onClick={() => {
              setValue('email', 'committee@society.com');
              setValue('password', 'Password@123');
            }}
          >
            Committee
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm"
            className="text-xs"
            onClick={() => {
              setValue('email', 'john@society.com');
              setValue('password', 'Password@123');
            }}
          >
            Resident
          </Button>
        </div>
      </div>
    </form>
  );
};
