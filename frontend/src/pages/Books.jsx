import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const PLACEHOLDER = 'https://placehold.co/400x600/132440/c3cdd9?text=No+Cover';

function BookCard({ book, myBorrows, onCheckout, onClick }) {
  const isBorrowedByMe = myBorrows.some((b) => b.bookId === book.id);
  const available = book.status === 'available';

  return (
    <div className="book-tile" onClick={() => onClick(book)}>
      <div className="book-tile-cover">
        <img src={book.coverImage || PLACEHOLDER} alt={book.title} loading="lazy" />
        <span className={`book-tile-status status-${book.status}`}>{book.status}</span>
      </div>
      <div className="book-tile-body">
        <span className="book-tile-genre">{book.genre || 'General'}</span>
        <h3 className="book-tile-title">{book.title}</h3>
        <p className="book-tile-author">by {book.author}</p>
        <button
          className={`btn btn-sm ${available ? 'btn-accent' : 'btn-outline'} book-tile-btn`}
          onClick={(e) => { e.stopPropagation(); if (available) onCheckout(book.id); }}
          disabled={!available}
        >
          {available ? 'Borrow Now' : (isBorrowedByMe ? 'Borrowed by you' : 'Unavailable')}
        </button>
      </div>
    </div>
  );
}

function Books() {
  const [books, setBooks] = useState([]);
  const [myBorrows, setMyBorrows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [error, setError] = useState('');
  const searchTimer = useRef(null);

  const fetchBooks = useCallback(async (s = '', g = '', page = 1) => {
    try {
      const res = await api.get(`/books?title=${encodeURIComponent(s)}&genre=${encodeURIComponent(g)}&page=${page}&limit=20`);
      setBooks(res.data.books);
      setPagination(res.data.pagination);
    } catch {
      setError('Failed to load books. Please try again.');
    }
  }, []);

  const fetchMyBorrows = useCallback(async () => {
    try {
      const res = await api.get('/borrow/my-borrows');
      setMyBorrows(res.data);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchMyBorrows();
    api.get('/books/genres').then((r) => setGenres(r.data)).catch(() => {});
  }, [fetchBooks, fetchMyBorrows]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchBooks(val, genreFilter, 1), 400);
  };

  const handleGenreChange = (e) => {
    const val = e.target.value;
    setGenreFilter(val);
    fetchBooks(search, val, 1);
  };

  const handleCheckout = async (bookId) => {
    setError('');
    try {
      await api.post('/borrow/checkout', { bookId });
      fetchBooks(search, genreFilter, pagination.page);
      fetchMyBorrows();
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed.');
    }
  };

  const handleReturn = async (bookId) => {
    setError('');
    try {
      await api.post('/borrow/return', { bookId });
      fetchBooks(search, genreFilter, pagination.page);
      fetchMyBorrows();
    } catch (err) {
      setError(err.response?.data?.message || 'Return failed.');
    }
  };

  return (
    <div className="page-enter">

      <div className="page-header">
        <div>
          <h1>Library Catalog</h1>
          <p className="page-header-meta">{pagination.total} book{pagination.total !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {/* Search + genre filter */}
      <div className="glass-card books-filter-bar">
        <div className="search-bar">
          <span className="search-bar-icon">🔍</span>
          <input type="text" placeholder="Search by title…" value={search} onChange={handleSearch} />
        </div>
        <select className="genre-select" value={genreFilter} onChange={handleGenreChange}>
          <option value="">All Genres</option>
          {genres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Active borrows strip */}
      {myBorrows.length > 0 && (
        <section className="borrows-section">
          <h2 className="section-title">My Borrowed Books</h2>
          <div className="borrows-strip">
            {myBorrows.map((borrow) => {
              const overdue = new Date(borrow.dueDate) < new Date();
              return (
                <div key={borrow.id} className={`borrow-card${overdue ? ' overdue' : ''}`}>
                  <div className="borrow-card-info">
                    <strong>{borrow.title}</strong>
                    <span className="borrow-author">by {borrow.author}</span>
                    <span className={`borrow-due${overdue ? ' borrow-due-overdue' : ''}`}>
                      {overdue ? 'Overdue · ' : 'Due · '}{new Date(borrow.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => handleReturn(borrow.bookId)}>Return</button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Book tiles */}
      <div className="book-tiles-grid">
        {books.map((book) => (
          <BookCard key={book.id} book={book} myBorrows={myBorrows} onCheckout={handleCheckout} onClick={setSelectedBook} />
        ))}
      </div>

      {books.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No books found</h3>
          <p>Try a different search term or genre.</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" onClick={() => fetchBooks(search, genreFilter, pagination.page - 1)} disabled={pagination.page <= 1}>← Prev</button>
          <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-outline btn-sm" onClick={() => fetchBooks(search, genreFilter, pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>Next →</button>
        </div>
      )}

      {/* Book detail modal */}
      {selectedBook && (
        <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="modal-content glass-card" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBook.title}</h2>
              <button className="modal-close" onClick={() => setSelectedBook(null)}>&times;</button>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <img src={selectedBook.coverImage || PLACEHOLDER} alt={selectedBook.title} style={{ width: '150px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '0.75rem' }}>by {selectedBook.author}</p>
                <span className={`status-pill status-${selectedBook.status}`}>{selectedBook.status}</span>
                {selectedBook.genre && <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedBook.genre}</p>}
                {selectedBook.isbn && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>ISBN: {selectedBook.isbn}</p>}
                <button
                  className={`btn ${selectedBook.status === 'available' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%', marginTop: '1.5rem' }}
                  disabled={selectedBook.status !== 'available'}
                  onClick={() => { handleCheckout(selectedBook.id); setSelectedBook(null); }}
                >
                  {selectedBook.status === 'available' ? 'Borrow Now' : (myBorrows.some((b) => b.bookId === selectedBook.id) ? 'Borrowed by you' : 'Currently Unavailable')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;
