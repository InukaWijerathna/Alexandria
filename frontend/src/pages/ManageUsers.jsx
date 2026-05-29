import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      const res = await api.get(`/users?page=${page}&limit=50`);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch {
      setError('Failed to load members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member and all their borrowing records? This cannot be undone.')) return;
    setError('');
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Loading members...</div>;

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1>Manage Members</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {pagination.total} registered member{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--danger)', color: '#fff', borderRadius: '8px' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>&times;</button>
        </div>
      )}

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
            {users.map((user) => (
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
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>No members found.</p>
      )}

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-outline" style={{ padding: '8px 20px' }} onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1}>
            &larr; Prev
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-outline" style={{ padding: '8px 20px' }} onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
