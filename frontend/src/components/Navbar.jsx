import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = {
  admin: '/admin',
  mess_manager: '/mess',
  student: '/student',
  visitor: '/student',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-forest tracking-tight">
          Mess Board
        </Link>

        <button
          className="md:hidden text-ink"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <nav className="hidden md:flex items-center gap-6 font-body text-sm">
          {user ? (
            <>
              <Link to={roleHome[user.role] || '/'} className="text-ink/80 hover:text-forest transition-colors">
                Dashboard
              </Link>
              <span className="text-ink/40">|</span>
              <span className="text-ink/60">
                {user.name} <span className="text-turmeric-dark">· {user.role.replace('_', ' ')}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-forest text-paper hover:bg-forest-dark transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-ink/80 hover:text-forest transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full bg-forest text-paper hover:bg-forest-dark transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>

      {open && (
        <nav className="md:hidden px-5 pb-4 flex flex-col gap-3 font-body text-sm border-t border-ink/10 pt-3">
          {user ? (
            <>
              <Link to={roleHome[user.role] || '/'} onClick={() => setOpen(false)} className="text-ink/80">
                Dashboard
              </Link>
              <span className="text-ink/60">{user.name} · {user.role.replace('_', ' ')}</span>
              <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-forest text-paper w-fit">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-ink/80">
                Log in
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="px-4 py-2 rounded-full bg-forest text-paper w-fit">
                Get started
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
