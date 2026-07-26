import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../context/UIContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className={`sticky top-0 z-40 w-full flex items-center justify-between px-4 transition-all duration-300 ${
        isHome ? 'bg-white/70 backdrop-blur-sm' : 'bg-white'
      } ${compact ? 'py-2 shadow-md' : 'py-3 shadow-sm'}`}
    >
      <div className="flex items-center gap-3">
        <button
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg className="h-6 w-6 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <Link to="/" className="text-lg font-bold gradient-text">STP</Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-slate-600 hidden sm:inline">
              {user?.firstName || user?.username || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-[var(--color-danger)] hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
