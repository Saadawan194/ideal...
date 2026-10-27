import React, { useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  action,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = localStorage.getItem('ideal_admin_auth');
    if (!auth) {
      navigate('/admin/login');
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('ideal_admin_auth');
    navigate('/admin/login');
  };

  const navItems = [
    { label: '📦 Products Catalog', path: '/admin/products' },
    { label: '✨ Add Products & Auto-Upload', path: '/admin/bulk-upload' },
    { label: '📞 Leads & Inquiries', path: '/admin/leads' },
    { label: '⚙️ Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-bone/30 text-ink flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="bg-paper border-b border-line sticky top-0 z-30">
        <div className="max-w-[1520px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" target="_blank" rel="noopener noreferrer" className="flex flex-col group">
              <span className="font-serif text-lg tracking-[0.16em] uppercase text-ink">
                IDEAL FURNITURE
              </span>
              <span className="text-[8px] uppercase tracking-[0.2em] text-muted -mt-0.5">
                Studio CRM
              </span>
            </Link>
            <span className="h-4 w-[1px] bg-line hidden sm:block" />
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-block text-[11px] uppercase tracking-wider text-muted hover:text-ink underline decoration-line"
            >
              Open Live Site ↗
            </a>
          </div>

          <div className="flex items-center space-x-6 text-xs">
            <span className="text-muted hidden md:inline">Logged in as admin@idealfurniture.pk</span>
            <button
              onClick={handleLogout}
              className="text-xs uppercase tracking-wider text-ink hover:text-accent underline decoration-line cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Sub-nav tabs */}
        <div className="max-w-[1520px] mx-auto px-6 lg:px-12 flex space-x-8 overflow-x-auto text-xs uppercase tracking-wider">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `py-3.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-ink text-ink'
                    : 'border-transparent text-muted hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-6 lg:px-12 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-line gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink font-light">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted mt-1 font-sans">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
        {children}
      </main>
    </div>
  );
};
