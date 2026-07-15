import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuthStore } from '../../../stores/auth.store';

export const LoginPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-charcoal text-center mb-1">
          Welcome back
        </h2>
        <p className="text-charcoal-muted text-center text-sm">
          Sign in to your account
        </p>
      </div>
      <LoginForm />
    </div>
  );
};
