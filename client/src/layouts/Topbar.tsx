import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../stores/ui.store';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColors = {
    admin: 'danger',
    committee: 'warning',
    resident: 'info',
  } as const;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100/80">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-charcoal-muted hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-xs font-semibold text-charcoal tracking-tight">{user?.email}</span>
          <Badge variant={role ? roleColors[role] : 'neutral'} className="mt-1">
            {role?.toUpperCase()}
          </Badge>
        </div>
        <Avatar name={user?.email || 'User'} size="sm" className="shadow-[0_2px_8px_rgba(99,102,241,0.15)]" />
        <button 
          onClick={handleLogout}
          className="p-2 ml-1 text-charcoal-muted/70 hover:text-error hover:bg-error/5 rounded-xl transition-all duration-300 ease-out cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
};
