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

const navSections = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'committee', 'resident'] },
    ]
  },
  {
    title: 'Directory',
    items: [
      { label: 'Residents', icon: Users, path: '/residents', roles: ['admin', 'committee'] },
      { label: 'Units', icon: Building2, path: '/units', roles: ['admin'] },
      { label: 'Committee', icon: Shield, path: '/committee', roles: ['admin', 'committee', 'resident'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { label: 'Announcements', icon: Megaphone, path: '/announcements', roles: ['admin', 'committee', 'resident'] },
      { label: 'Complaints', icon: MessageSquareWarning, path: '/complaints', roles: ['admin', 'committee', 'resident'] },
      { label: 'Service Requests', icon: Wrench, path: '/service-requests', roles: ['admin', 'committee', 'resident'] },
    ]
  },
  {
    title: 'Financials',
    items: [
      { label: 'Billing Settings', icon: Receipt, path: '/billing', roles: ['admin'] },
      { label: 'My Bills', icon: Receipt, path: '/my-bills', roles: ['resident'] },
      { label: 'Transactions', icon: CreditCard, path: '/payments', roles: ['admin', 'committee'] },
      { label: 'Make Payment', icon: CreditCard, path: '/payments/new', roles: ['resident'] },
      { label: 'Defaulters Report', icon: AlertTriangle, path: '/reports/defaulters', roles: ['admin', 'committee'] },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Audit Logs', icon: ScrollText, path: '/audit-logs', roles: ['admin'] },
    ]
  }
];

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const filteredSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(role || ''))
    }))
    .filter(section => section.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center shadow-md shadow-primary/10">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-base font-display font-bold text-charcoal tracking-tight">SocietyApp</span>
          </div>
          <button 
            className="lg:hidden text-charcoal-muted hover:text-charcoal p-1 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted/50">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 select-none group",
                        isActive 
                          ? "bg-primary text-white shadow-md shadow-primary/15 font-semibold" 
                          : "text-charcoal-muted hover:bg-slate-100/60 hover:text-charcoal"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-charcoal-muted group-hover:text-charcoal")} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

