import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const EMPTY_USER = { username: '', password: '', confirmPassword: '', role: 'member' };

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_USER);
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

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

  const openModal = () => {
    setNewUser(EMPTY_USER);
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError('');
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setModalError('');
    if (newUser.password !== newUser.confirmPassword) {
      return setModalError('Passwords do not match.');
    }
    setSaving(true);
    try {
      await api.post('/users', { username: newUser.username, password: newUser.password, role: newUser.role });
      setSuccess(`Account "${newUser.username}" created successfully.`);
      setTimeout(() => setSuccess(''), 4000);
      closeModal();
      fetchUsers(1);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error creating user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete "${username}" and all their borrowing records? This cannot be undone.`)) return;
    setError('');
    try {
      await api.delete(`/users/${id}`);
      setSuccess(`User "${username}" deleted.`);
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user.');
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <span>Loading members...</span>
      </div>
    );
  }

  return (
    <div className="container page-enter">
      <div className="page-header">
        <div>
          <h1>Manage Members</h1>
          <p className="page-header-meta">{pagination.total} registered member{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          + Add Member
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}>&times;</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button className="alert-close" onClick={() => setSuccess('')}>&times;</button>
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{user.id}</td>
                <td style={{ fontWeight: 600 }}>{user.username}</td>
                <td>
                  <span className={`status-pill ${user.role === 'admin' ? 'status-borrowed' : 'status-available'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline"
                    style={{ borderColor: 'rgba(192,57,43,0.3)', color: 'var(--danger)' }}
                    onClick={() => handleDelete(user.id, user.username)}
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
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No members yet</h3>
          <p>Click "Add Member" to create the first account.</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1}>
            &larr; Prev
          </button>
          <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-outline btn-sm" onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
            Next &rarr;
          </button>
        </div>
      )}

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Member</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            {modalError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddMember}>
              <div className="input-group">
                <label>Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="At least 3 characters"
                  required
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div className="input-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                  required
                />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
