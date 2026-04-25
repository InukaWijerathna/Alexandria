import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Profile({ user }) {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load profile from localStorage initially for simplicity (or fetch from API)
    const storedProfile = JSON.parse(localStorage.getItem(`profile_${user.id}`)) || {
      fullName: '',
      email: '',
      phone: '',
      bio: ''
    };
    setProfile(storedProfile);
    setLoading(false);
  }, [user.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>
      
      <form onSubmit={handleSave} className="glass-card" style={{ padding: '2rem' }}>
        {message && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--success)', color: 'var(--text-main)', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
            {message}
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
          <label>About Me (Bio)</label>
          <textarea 
            name="bio" 
            value={profile.bio} 
            onChange={handleChange} 
            placeholder="Tell us about yourself and your favorite genres..."
            style={{
              width: '100%', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              border: '1px solid var(--glass-border)', 
              background: 'white', 
              color: 'var(--text-main)',
              outline: 'none',
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;