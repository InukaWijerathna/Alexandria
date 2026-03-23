import React, { useState, useEffect } from 'react';
import api from '../services/api';

function MemberDashboard() {
  const [books, setBooks] = useState([]);
  const [myBorrows, setMyBorrows] = useState([]);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');

  useEffect(() => {
    fetchBooks();
    fetchMyBorrows();
  }, []);

  const fetchBooks = async (s = '', g = '') => {
    try {
      const response = await api.get(`/books?title=${s}&genre=${g}`);
      setBooks(response.data);
    } catch (err) {
      console.error('Error fetching books', err);
    }
  };

  const fetchMyBorrows = async () => {
    try {
      const response = await api.get('/borrow/my-borrows');
      setMyBorrows(response.data);
    } catch (err) {
      console.error('Error fetching borrows', err);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchBooks(val, genreFilter);
  };

  const handleCheckout = async (bookId) => {
    try {
      await api.post('/borrow/checkout', { bookId });
      fetchBooks(search, genreFilter);
      fetchMyBorrows();
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  const handleReturn = async (bookId) => {
    try {
      await api.post('/borrow/return', { bookId });
      fetchBooks(search, genreFilter);
      fetchMyBorrows();
    } catch (err) {
      alert(err.response?.data?.message || 'Return failed');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Library Catalog</h1>
      
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
          <input type="text" placeholder="Search by title..." value={search} onChange={handleSearch} />
        </div>
        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
          <input type="text" placeholder="Genre..." value={genreFilter} onChange={(e) => { setGenreFilter(e.target.value); fetchBooks(search, e.target.value); }} />
        </div>
      </div>

      {myBorrows.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>My Borrowed Books</h2>
          <div className="grid">
            {myBorrows.map(borrow => (
              <div key={borrow.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
                <h3>{borrow.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>Due Date: {new Date(borrow.dueDate).toLocaleDateString()}</p>
                <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={() => handleReturn(borrow.bookId)}>Return Book</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 style={{ marginBottom: '1.5rem' }}>Available Books</h2>
      <div className="grid">
        {books.map(book => (
          <div key={book.id} className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className={`status-pill status-${book.status}`}>{book.status}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{book.genre}</span>
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{book.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>by {book.author}</p>
            <button 
              className={`btn ${book.status === 'available' ? 'btn-accent' : 'btn-outline'}`} 
              style={{ width: '100%' }}
              onClick={() => book.status === 'available' ? handleCheckout(book.id) : null}
              disabled={book.status !== 'available'}
            >
              {book.status === 'available' ? 'Borrow Now' : 'Currently Out'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemberDashboard;
