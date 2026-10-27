import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@idealfurniture.pk');
  const [password, setPassword] = useState('luxury2026');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@idealfurniture.pk' && password === 'luxury2026') {
      localStorage.setItem('ideal_admin_auth', 'true');
      navigate('/admin/bulk-upload');
    } else {
      setError('Invalid studio credentials. Please check the prefilled values.');
    }
  };

  return (
    <div className="min-h-screen bg-bone flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 text-ink">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-block">
          <span className="font-serif text-2xl sm:text-3xl tracking-[0.18em] uppercase text-ink block">
            IDEAL FURNITURE
          </span>
          <span className="text-[9px] uppercase tracking-[0.24em] font-sans text-muted block mt-1">
            Studio Portal & CRM
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-paper border border-line p-8 sm:p-10 space-y-6">
          <div className="border-b border-line pb-4">
            <span className="eyebrow block mb-1">Administrative Access</span>
            <h1 className="font-serif text-2xl text-ink">Sign In</h1>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1.5" htmlFor="admin-email">
                Studio Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-paper border border-line focus:outline-hidden focus:border-accent text-sm text-ink"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-muted mb-1.5" htmlFor="admin-pass">
                Password
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-paper border border-line focus:outline-hidden focus:border-accent text-sm text-ink"
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary w-full py-3 text-center text-xs tracking-widest">
                Access Studio Dashboard
              </button>
            </div>
          </form>

          {/* Demo Credentials Box */}
          <div className="p-4 bg-bone/70 border border-line text-[11px] font-sans text-muted space-y-1">
            <p className="font-medium text-ink uppercase tracking-wider">Demo Credentials:</p>
            <p>Email: <span className="font-mono text-ink">admin@idealfurniture.pk</span></p>
            <p>Password: <span className="font-mono text-ink">luxury2026</span></p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs font-sans uppercase tracking-wider text-muted hover:text-ink underline">
            Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
