import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', padding: '1rem' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '820px', gap: 0, borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>

        {/* Left panel */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(160deg, var(--primary) 0%, var(--primary-light) 100%)',
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
        }}
          className="auth-panel-left"
        >
          <div>
            <div style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, color: 'white', letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
              Alexandria<span style={{ color: 'var(--accent)' }}>.</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Library Management System</p>
          </div>
          <div>
            <blockquote style={{ color: 'rgba(255,255,255,0.85)', fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              "A library is not a luxury but one of the necessities of life."
            </blockquote>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>— Henry Ward Beecher</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['Borrow Books', 'Track History', 'Manage Collection'].map((t) => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(14px)', padding: '3rem 2.5rem', minWidth: 0 }}>
          <h2 style={{ marginBottom: '0.4rem' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Sign in to your library account</p>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
              <button className="alert-close" onClick={() => setError('')}>&times;</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                required
                autoFocus
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '13px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '1.75rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .auth-panel-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default Login;
