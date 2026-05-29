import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Profile({ user }) {
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '', bio: '' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    Promise.all([
      api.get('/users/profile'),
      api.get('/borrow/history?limit=5'),
    ])
      .then(([profileRes, historyRes]) => {
        setProfile(profileRes.data);
        setHistory(historyRes.data.history || []);
      })
      .catch(() => setMessage({ text: 'Failed to load profile.', isError: true }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', isError: false });
    try {
      await api.put('/users/profile', profile);
      setMessage({ text: 'Profile updated successfully!', isError: false });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error saving profile.', isError: true });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', isError: false }), 4000);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>

      <form onSubmit={handleSave} className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {message.text && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', background: message.isError ? 'var(--danger)' : 'var(--success)', color: '#fff', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
            {message.text}
          </div>
        )}

        <div className="input-group">
          <label>Username</label>
          <input type="text" value={user.username} disabled style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)' }} />
        </div>
        <div className="input-group">
          <label>Full Name</label>
          <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} placeholder="Enter your full name" />
        </div>
        <div className="input-group">
          <label>Email Address</label>
          <input type="email" name="email" value={profile.email} onChange={handleChange} placeholder="Enter your email" />
        </div>
        <div className="input-group">
          <label>Phone Number</label>
          <input type="tel" name="phone" value={profile.phone} onChange={handleChange} placeholder="Enter your phone number" />
        </div>
        <div className="input-group">
          <label>About Me</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself and your favourite genres..."
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'white', color: 'var(--text-main)', outline: 'none', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {history.length > 0 && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Recent Borrowing History</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Book</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Checked Out</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Returned</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{h.title}</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{h.author}</div>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(h.checkoutDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem', color: h.returnDate ? 'var(--text-secondary)' : 'var(--accent)' }}>
                    {h.returnDate ? new Date(h.returnDate).toLocaleDateString() : 'Active'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Profile;
