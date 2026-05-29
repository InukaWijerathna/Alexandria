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

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '';

  return (
    <nav className="navbar glass-card">
      <NavLink to="/" className="logo" onClick={close}>
        Alexandria<span className="logo-dot">.</span>
      </NavLink>

      <button
        className="hamburger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>

      <ul className={`nav-links${menuOpen ? ' nav-open' : ''}`}>
        {user ? (
          <>
            <li>
              <NavLink
                to={user.role === 'admin' ? '/admin' : '/books'}
                className={({ isActive }) => isActive ? 'nav-active' : ''}
                onClick={close}
              >
                Books
              </NavLink>
            </li>
            {user.role === 'admin' && (
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => isActive ? 'nav-active' : ''}
                  onClick={close}
                >
                  Members
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => isActive ? 'nav-active' : ''}
                onClick={close}
              >
                Profile
              </NavLink>
            </li>
            <li>
              <div className="user-chip">
                <div className="user-avatar" title={user.username}>{initials}</div>
                <span className="user-name">{user.username}</span>
                {user.role === 'admin' && <span className="role-badge">Admin</span>}
              </div>
            </li>
            <li>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><NavLink to="/login" onClick={close}>Login</NavLink></li>
            <li>
              <NavLink to="/register" className="btn btn-primary btn-sm" onClick={close}>
                Sign Up
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
