import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const EMPTY_BOOK = { title: '', author: '', isbn: '', genre: '' };

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(EMPTY_BOOK);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
    fetchBooks();
    api.get('/books/genres').then((r) => setGenres(r.data)).catch(() => {});
  }, [fetchBooks]);

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

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      if (isEditing) {
        await api.put(`/books/${currentBook.id}`, currentBook);
      } else {
        await api.post('/books', currentBook);
      }
      closeModal();
      fetchBooks(search, pagination.page);
      // Refresh genres in case a new one was added
      api.get('/books/genres').then((r) => setGenres(r.data)).catch(() => {});
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error saving book.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book? This cannot be undone.')) return;
    setError('');
    try {
      await api.delete(`/books/${id}`);
      fetchBooks(search, pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting book.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Manage Books</h1>
        <button className="btn btn-primary" onClick={openAdd}>Add New Book</button>
      </div>

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--danger)', color: '#fff', borderRadius: '8px' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>&times;</button>
        </div>
      )}

      <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search books by title..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); fetchBooks(e.target.value, 1); }}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'white', outline: 'none' }}
        />
      </div>

      <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        {pagination.total} book{pagination.total !== 1 ? 's' : ''} total
      </div>

      <div className="grid">
        {books.map((book) => (
          <div key={book.id} className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className={`status-pill status-${book.status}`}>{book.status}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{book.isbn}</span>
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{book.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>by {book.author}</p>
            <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{book.genre}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => openEdit(book)}>Edit</button>
              <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleDelete(book.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '3rem' }}>No books found.</p>
      )}

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-outline" style={{ padding: '8px 20px' }} onClick={() => fetchBooks(search, pagination.page - 1)} disabled={pagination.page <= 1}>
            &larr; Prev
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-outline" style={{ padding: '8px 20px' }} onClick={() => fetchBooks(search, pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
            Next &rarr;
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
            {modalError && (
              <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{modalError}</p>
            )}
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
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
                <input type="text" value={currentBook.isbn || ''} onChange={(e) => setCurrentBook({ ...currentBook, isbn: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Genre</label>
                <input
                  type="text"
                  list="genre-options"
                  value={currentBook.genre || ''}
                  onChange={(e) => setCurrentBook({ ...currentBook, genre: e.target.value })}
                  placeholder="Type or choose a genre"
                />
                <datalist id="genre-options">
                  {genres.map((g) => <option key={g} value={g} />)}
                </datalist>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditing ? 'Update' : 'Save'}</button>
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
