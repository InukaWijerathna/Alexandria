import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const PLACEHOLDER = 'https://placehold.co/400x600/132440/c3cdd9?text=Cover';

function BookCard({ book, myBorrows, onCheckout, onClick }) {
  const isBorrowedByMe = myBorrows.some((b) => b.bookId === book.id);
  return (
    <div
      className="glass-card book-card"
      style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}
      onClick={() => onClick(book)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span className={`status-pill status-${book.status}`}>{book.status}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{book.genre}</span>
      </div>
      <div style={{ height: '200px', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
        <img
          src={book.coverImage || PLACEHOLDER}
          alt={book.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
      </div>
      <h3 style={{ marginBottom: '0.5rem' }}>{book.title}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>by {book.author}</p>
      <button
        className={`btn ${book.status === 'available' ? 'btn-accent' : 'btn-outline'}`}
        style={{ width: '100%', position: 'relative', zIndex: 2 }}
        onClick={(e) => { e.stopPropagation(); if (book.status === 'available') onCheckout(book.id); }}
        disabled={book.status !== 'available'}
      >
        {book.status === 'available' ? 'Borrow Now' : (isBorrowedByMe ? 'Borrowed' : 'Currently Out')}
      </button>
    </div>
  );
}

function Pagination({ pagination, onPageChange }) {
  if (pagination.totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
      <button
        className="btn btn-outline"
        style={{ padding: '8px 20px' }}
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page <= 1}
      >
        &larr; Prev
      </button>
      <span style={{ color: 'var(--text-secondary)' }}>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <button
        className="btn btn-outline"
        style={{ padding: '8px 20px' }}
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page >= pagination.totalPages}
      >
        Next &rarr;
      </button>
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
    } catch {
      // Non-critical, don't block the page
    }
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
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Library Catalog</h1>

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--danger)', color: '#fff', borderRadius: '8px' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>&times;</button>
        </div>
      )}

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
          <input type="text" placeholder="Search by title..." value={search} onChange={handleSearch} />
        </div>
        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
          <select
            value={genreFilter}
            onChange={handleGenreChange}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'white', color: 'var(--text-main)', outline: 'none' }}
          >
            <option value="">All Genres</option>
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {myBorrows.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>My Borrowed Books</h2>
          <div className="grid">
            {myBorrows.map((borrow) => (
              <div key={borrow.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
                <h3>{borrow.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                  Due: {new Date(borrow.dueDate).toLocaleDateString()}
                  {new Date(borrow.dueDate) < new Date() && (
                    <span style={{ color: 'var(--danger)', marginLeft: '0.5rem', fontWeight: 'bold' }}>(Overdue)</span>
                  )}
                </p>
                <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={() => handleReturn(borrow.bookId)}>
                  Return Book
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
        <h2>
          {genreFilter ? genreFilter : 'All Books'}
        </h2>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{pagination.total} book{pagination.total !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            myBorrows={myBorrows}
            onCheckout={handleCheckout}
            onClick={setSelectedBook}
          />
        ))}
      </div>

      {books.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '3rem' }}>
          No books found matching your search.
        </p>
      )}

      <Pagination pagination={pagination} onPageChange={(p) => fetchBooks(search, genreFilter, p)} />

      {/* Book detail modal */}
      {selectedBook && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(19,36,64,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
          onClick={() => setSelectedBook(null)}
        >
          <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '800px', width: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', fontSize: '2rem', cursor: 'pointer', color: 'var(--text-main)' }} onClick={() => setSelectedBook(null)}>
              &times;
            </button>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 200px' }}>
                <img src={selectedBook.coverImage || PLACEHOLDER} alt={selectedBook.title} style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <span className={`status-pill status-${selectedBook.status}`}>{selectedBook.status}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedBook.genre}</span>
                </div>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem', lineHeight: 1.2 }}>{selectedBook.title}</h2>
                <p style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>by {selectedBook.author}</p>
                {selectedBook.isbn && <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}><strong>ISBN:</strong> {selectedBook.isbn}</p>}
                <button
                  className={`btn ${selectedBook.status === 'available' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                  onClick={() => { if (selectedBook.status === 'available') { handleCheckout(selectedBook.id); setSelectedBook(null); } }}
                  disabled={selectedBook.status !== 'available'}
                >
                  {selectedBook.status === 'available' ? 'Borrow Now' : (myBorrows.some((b) => b.bookId === selectedBook.id) ? 'Borrowed by You' : 'Currently Out')}
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
