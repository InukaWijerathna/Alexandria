import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await api.post('/auth/signup', { username, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', padding: '1rem' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '820px', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>

        {/* Left panel */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(160deg, #1a3550 0%, var(--primary-light) 100%)',
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
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Your personal library portal</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '📖', text: 'Browse hundreds of books' },
              { icon: '🔖', text: 'Borrow & track your reads' },
              { icon: '👤', text: 'Personal reading profile' },
            ].map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>Free to join. No credit card required.</p>
        </div>

        {/* Right panel — form */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(14px)', padding: '3rem 2.5rem', minWidth: 0 }}>
          <h2 style={{ marginBottom: '0.4rem' }}>Create account</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Join the Alexandria library today</p>

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
                placeholder="At least 3 characters"
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
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '13px' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '1.75rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
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

export default Register;
