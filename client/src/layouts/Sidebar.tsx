import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../stores/ui.store';
import { cn } from '../lib/cn';
import { 
  LayoutDashboard, Users, Building2, Shield, 
  Megaphone, MessageSquareWarning, Wrench, Receipt, 
  CreditCard, AlertTriangle, ScrollText, X
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'committee', 'resident'] },
  { label: 'Residents', icon: Users, path: '/residents', roles: ['admin', 'committee'] },
  { label: 'Units', icon: Building2, path: '/units', roles: ['admin'] },
  { label: 'Committee', icon: Shield, path: '/committee', roles: ['admin', 'committee', 'resident'] },
  { label: 'Announcements', icon: Megaphone, path: '/announcements', roles: ['admin', 'committee', 'resident'] },
  { label: 'Complaints', icon: MessageSquareWarning, path: '/complaints', roles: ['admin', 'committee', 'resident'] },
  { label: 'Service Requests', icon: Wrench, path: '/service-requests', roles: ['admin', 'committee', 'resident'] },
  { label: 'Billing', icon: Receipt, path: '/billing', roles: ['admin'] },
  { label: 'My Bills', icon: Receipt, path: '/my-bills', roles: ['resident'] },
  { label: 'Payments', icon: CreditCard, path: '/payments', roles: ['admin', 'committee'] },
  { label: 'Make Payment', icon: CreditCard, path: '/payments/new', roles: ['resident'] },
  { label: 'Defaulters', icon: AlertTriangle, path: '/reports/defaulters', roles: ['admin', 'committee'] },
  { label: 'Audit Logs', icon: ScrollText, path: '/audit-logs', roles: ['admin'] },
];

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const filteredNav = navItems.filter(item => item.roles.includes(role || ''));

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-charcoal/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-orchid/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-orchid/10 shrink-0">
          <h1 className="text-xl font-display font-bold text-primary">SocietyApp</h1>
          <button 
            className="lg:hidden text-charcoal-muted hover:text-charcoal"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
                  isActive 
                    ? "bg-aura text-primary" 
                    : "text-charcoal-muted hover:bg-aura hover:text-charcoal"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
                )}
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-charcoal-muted group-hover:text-charcoal")} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
