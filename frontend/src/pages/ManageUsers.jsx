import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member? This will remove all their borrowing history.')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting user');
      }
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>Loading members...</div>;

  return (
    <div className="container">
      <div style={{ marginBottom: '3rem' }}>
        <h1>Manage Members</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View and manage all registered library members.</p>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <tr>
              <th style={{ padding: '1.5rem' }}>ID</th>
              <th style={{ padding: '1.5rem' }}>Username</th>
              <th style={{ padding: '1.5rem' }}>Role</th>
              <th style={{ padding: '1.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '1.5rem' }}>{user.id}</td>
                <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{user.username}</td>
                <td style={{ padding: '1.5rem' }}>
                    <span className={`status-pill status-${user.role === 'admin' ? 'borrowed' : 'available'}`} style={{ textTransform: 'capitalize' }}>
                        {user.role}
                    </span>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.8rem', padding: '6px 12px' }}
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete Member
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUsers;
