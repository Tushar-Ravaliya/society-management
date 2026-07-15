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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-orchid/10">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-charcoal-muted hover:bg-aura rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-sm font-medium text-charcoal">{user?.email}</span>
          <Badge variant={role ? roleColors[role] : 'neutral'} className="mt-0.5">
            {role?.toUpperCase()}
          </Badge>
        </div>
        <Avatar name={user?.email || 'User'} size="sm" />
        <button 
          onClick={handleLogout}
          className="p-2 ml-2 text-charcoal-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
