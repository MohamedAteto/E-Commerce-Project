import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Users,
  Store,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isInitialized, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && (!user || user.role !== 'ADMIN')) {
      navigate('/login');
    }
  }, [user, isInitialized, navigate]);

  if (!isInitialized || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Verifying administrative access...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Admin Sidebar */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close admin sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 shadow-2xl transition-transform duration-300 lg:relative lg:z-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className={`border-b border-slate-800 p-4 ${sidebarCollapsed ? 'lg:px-3' : 'lg:p-6'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'justify-between gap-2.5'}`}>
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className={sidebarCollapsed ? 'lg:hidden' : ''}>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Admin Portal</h2>
              <span className="text-[11px] text-brand-400 font-medium">Nexus Engine v1.0</span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:block"
              aria-label={sidebarCollapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Close admin sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className={`flex-1 space-y-1.5 overflow-y-auto p-4 ${sidebarCollapsed ? 'lg:px-3' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''
                } ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className={sidebarCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={`space-y-2 border-t border-slate-800 p-4 ${sidebarCollapsed ? 'lg:px-3' : ''}`}>
          <Link
            to="/"
            onClick={() => setMobileSidebarOpen(false)}
            title={sidebarCollapsed ? 'Return to Store' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white ${
              sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <Store className="w-4 h-4" />
            <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Return to Store</span>
          </Link>

          <div className={`flex items-center justify-between border-t border-slate-800 px-2 pt-2 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className={`text-xs ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              <p className="font-semibold text-white truncate max-w-[120px]">{user.firstName}</p>
              <p className="text-[10px] text-slate-400">Administrator</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 overflow-y-auto max-h-screen">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admin Portal</p>
            <p className="text-sm font-bold text-slate-900">Control Center</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 shadow-sm transition-colors hover:border-brand-300 hover:text-brand-600"
            aria-label="Open admin sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
