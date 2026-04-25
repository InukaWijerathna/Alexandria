import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass-card">
      <Link to="/" className="logo">Alexandria</Link>
      <ul className="nav-links">
        {user ? (
          <>
            <li><Link to={user.role === 'admin' ? '/admin' : '/books'}>Books</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><span style={{ color: 'var(--text-secondary)' }}>Hello, {user.username}</span></li>
            <li><button className="btn btn-outline" onClick={handleLogout} style={{ padding: '8px 16px' }}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
