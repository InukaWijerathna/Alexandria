import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setMenuOpen(false);
  };

  const close = () => setMenuOpen(false);
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '';

  return (
    <header className="site-header">
      <div className="header-inner">

        {/* Brand */}
        <NavLink to="/" className="header-brand" onClick={close}>
          <div className="header-logo-mark">A</div>
          <div className="header-brand-text">
            <span className="header-logo-name">Alexandria</span>
            <span className="header-logo-sub">Library System</span>
          </div>
        </NavLink>

        {/* Desktop nav — center */}
        {user && (
          <nav className="header-nav">
            <NavLink
              to={user.role === 'admin' ? '/admin' : '/books'}
              className={({ isActive }) => `header-nav-link${isActive ? ' active' : ''}`}
            >
              {user.role === 'admin' ? 'Manage Books' : 'Library'}
            </NavLink>
            {user.role === 'admin' && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `header-nav-link${isActive ? ' active' : ''}`}
              >
                Members
              </NavLink>
            )}
            <NavLink
              to="/profile"
              className={({ isActive }) => `header-nav-link${isActive ? ' active' : ''}`}
            >
              Profile
            </NavLink>
          </nav>
        )}

        {/* Right controls */}
        <div className="header-actions">
          {user ? (
            <>
              <div className="header-user-chip">
                <div className="header-avatar" title={user.username}>{initials}</div>
                <div className="header-user-info">
                  <span className="header-username">{user.username}</span>
                  {user.role === 'admin' && <span className="header-role-badge">Admin</span>}
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="header-nav-link" onClick={close}>Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm" onClick={close}>
                Sign Up
              </NavLink>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-menu">
          {user ? (
            <>
              <div className="mobile-user-row">
                <div className="header-avatar">{initials}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{user.username}</div>
                  {user.role === 'admin' && <div style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>Admin</div>}
                </div>
              </div>
              <NavLink to={user.role === 'admin' ? '/admin' : '/books'} className="mobile-nav-link" onClick={close}>
                {user.role === 'admin' ? 'Manage Books' : 'Library'}
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin/users" className="mobile-nav-link" onClick={close}>Members</NavLink>
              )}
              <NavLink to="/profile" className="mobile-nav-link" onClick={close}>Profile</NavLink>
              <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="mobile-nav-link" onClick={close}>Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center' }} onClick={close}>
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
