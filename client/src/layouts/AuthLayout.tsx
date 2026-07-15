import React from 'react';
import { Outlet } from 'react-router-dom';
import { Card } from '../components/ui/Card';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-aura flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-display font-bold text-charcoal">
          Society Management
        </h1>
      </div>
      <Card className="w-full max-w-md p-8">
        <Outlet />
      </Card>
    </div>
  );
};
