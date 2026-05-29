import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const EMPTY_BOOK = { title: '', author: '', isbn: '', genre: '' };

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(EMPTY_BOOK);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchBooks = useCallback(async (s = '', page = 1) => {
    try {
      const res = await api.get(`/books?title=${encodeURIComponent(s)}&page=${page}&limit=20`);
      setBooks(res.data.books);
      setPagination(res.data.pagination);
    } catch {
      setError('Failed to load books.');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/books/stats');
      setStats(res.data);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchStats();
    api.get('/books/genres').then((r) => setGenres(r.data)).catch(() => {});
  }, [fetchBooks, fetchStats]);

  const openAdd = () => {
    setCurrentBook(EMPTY_BOOK);
    setIsEditing(false);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEdit = (book) => {
    setCurrentBook(book);
    setIsEditing(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setModalError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      if (isEditing) {
        await api.put(`/books/${currentBook.id}`, currentBook);
        setSuccess('Book updated successfully.');
      } else {
        await api.post('/books', currentBook);
        setSuccess('Book added successfully.');
      }
      setTimeout(() => setSuccess(''), 3000);
      closeModal();
      fetchBooks(search, pagination.page);
      fetchStats();
      api.get('/books/genres').then((r) => setGenres(r.data)).catch(() => {});
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error saving book.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setError('');
    try {
      await api.delete(`/books/${id}`);
      setSuccess(`"${title}" deleted.`);
      setTimeout(() => setSuccess(''), 3000);
      fetchBooks(search, pagination.page);
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting book.');
    }
  };

  return (
    <div className="container page-enter">
      <div className="page-header">
        <div>
          <h1>Manage Books</h1>
          <p className="page-header-meta">{pagination.total} books in the library</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Book</button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="stats-bar">
          <div className="stat-card">
            <span className="stat-value">{stats.totalBooks}</span>
            <span className="stat-label">Total Books</span>
          </div>
          <div className="stat-card accent">
            <span className="stat-value">{stats.available}</span>
            <span className="stat-label">Available</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-value">{stats.borrowed}</span>
            <span className="stat-label">Borrowed</span>
          </div>
          <div className="stat-card gold">
            <span className="stat-value">{stats.totalMembers}</span>
            <span className="stat-label">Members</span>
          </div>
        </div>
      )}

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

      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.75rem' }}>
        <div className="search-bar">
          <span className="search-bar-icon">🔍</span>
          <input
            type="text"
            placeholder="Search books by title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); fetchBooks(e.target.value, 1); }}
          />
        </div>
      </div>

      <div className="grid">
        {books.map((book) => (
          <div key={book.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className={`status-pill status-${book.status}`}>{book.status}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{book.isbn || '—'}</span>
            </div>
            <h3 style={{ marginBottom: '0.25rem', fontSize: '1.05rem' }}>{book.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>by {book.author}</p>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{book.genre || '—'}</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(book)}>Edit</button>
              <button
                className="btn btn-sm btn-outline"
                style={{ flex: 1, borderColor: 'rgba(192,57,43,0.3)', color: 'var(--danger)' }}
                onClick={() => handleDelete(book.id, book.title)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No books found</h3>
          <p>Try adjusting your search or add a new book.</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" onClick={() => fetchBooks(search, pagination.page - 1)} disabled={pagination.page <= 1}>
            &larr; Prev
          </button>
          <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-outline btn-sm" onClick={() => fetchBooks(search, pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
            Next &rarr;
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            {modalError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Title *</label>
                <input type="text" value={currentBook.title} onChange={(e) => setCurrentBook({ ...currentBook, title: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Author *</label>
                <input type="text" value={currentBook.author} onChange={(e) => setCurrentBook({ ...currentBook, author: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>ISBN</label>
                <input type="text" value={currentBook.isbn || ''} onChange={(e) => setCurrentBook({ ...currentBook, isbn: e.target.value })} placeholder="Optional" />
              </div>
              <div className="input-group">
                <label>Genre</label>
                <input
                  type="text"
                  list="genre-datalist"
                  value={currentBook.genre || ''}
                  onChange={(e) => setCurrentBook({ ...currentBook, genre: e.target.value })}
                  placeholder="Type or choose a genre"
                />
                <datalist id="genre-datalist">
                  {genres.map((g) => <option key={g} value={g} />)}
                </datalist>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditing ? 'Update' : 'Add Book'}</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
