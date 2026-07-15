import React from 'react';
import { Outlet } from 'react-router-dom';
import { Card } from '../components/ui/Card';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-aura via-white to-primary/5 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative blurred background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="mb-8 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 0V3h12v18H9V11h6" />
              <path d="M9 17h2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-charcoal tracking-tight">
              Society Management
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">Admin, Committee & Resident Portal</p>
          </div>
        </div>
        <Card className="p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-100/80 rounded-3xl bg-white/95 backdrop-blur-md">
          <Outlet />
        </Card>
      </div>
    </div>
  );
};
