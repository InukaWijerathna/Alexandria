import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Books() {
  const [books, setBooks] = useState([]);
  const [myBorrows, setMyBorrows] = useState([]);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

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
          <select 
            value={genreFilter} 
            onChange={(e) => { 
              setGenreFilter(e.target.value); 
              fetchBooks(search, e.target.value); 
            }}
            style={{ 
              width: '100%', 
              padding: '0.8rem', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)', 
              background: 'white', 
              color: 'var(--text-main)',
              outline: 'none'
            }}
          >
            <option value="">All Genres</option>
            <option value="Adventure">Adventure</option>
            <option value="Biography">Biography</option>
            <option value="Classic">Classic</option>
            <option value="Dystopian">Dystopian</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Fiction">Fiction</option>
            <option value="Historical Fiction">Historical Fiction</option>
            <option value="Mystery">Mystery</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Romance">Romance</option>
            <option value="Science Fiction">Science Fiction</option>
            <option value="Thriller">Thriller</option>
          </select>
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
      <div>
        {genreFilter === '' ? (
          <div className="grid">
            {books.map(book => {
              const isBorrowedByMe = myBorrows.some(borrow => borrow.bookId === book.id);
              return (
              <div 
                key={book.id} 
                className="glass-card book-card" 
                style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }} 
                onClick={() => setSelectedBook(book)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className={`status-pill status-${book.status}`}>{book.status}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{book.genre}</span>
                </div>
                <div style={{ height: '200px', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={book.coverImage || 'https://placehold.co/400x600/132440/c3cdd9?text=Cover'} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>{book.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>by {book.author}</p>
                <button 
                  className={`btn ${book.status === 'available' ? 'btn-accent' : 'btn-outline'}`} 
                  style={{ width: '100%', position: 'relative', zIndex: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (book.status === 'available') handleCheckout(book.id);
                  }}
                  disabled={book.status !== 'available'}
                >
                  {book.status === 'available' ? 'Borrow Now' : (isBorrowedByMe ? 'Borrowed' : 'Currently Out')}
                </button>
              </div>
            )})}
          </div>
        ) : (
          Array.from(new Set(books.map(b => b.genre))).sort().map(genre => {
            const genreBooks = books.filter(b => b.genre === genre);
            return (
              <div key={genre} style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>{genre}</h3>
                <div className="grid">
                  {genreBooks.map(book => {
                    const isBorrowedByMe = myBorrows.some(borrow => borrow.bookId === book.id);
                    return (
                    <div 
                      key={book.id} 
                      className="glass-card book-card" 
                      style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }} 
                      onClick={() => setSelectedBook(book)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span className={`status-pill status-${book.status}`}>{book.status}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{book.genre}</span>
                      </div>
                      <div style={{ height: '200px', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                        <img src={book.coverImage || 'https://placehold.co/400x600/132440/c3cdd9?text=Cover'} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <h3 style={{ marginBottom: '0.5rem' }}>{book.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>by {book.author}</p>
                      <button 
                        className={`btn ${book.status === 'available' ? 'btn-accent' : 'btn-outline'}`} 
                        style={{ width: '100%', position: 'relative', zIndex: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (book.status === 'available') handleCheckout(book.id);
                        }}
                        disabled={book.status !== 'available'}
                      >
                        {book.status === 'available' ? 'Borrow Now' : (isBorrowedByMe ? 'Borrowed' : 'Currently Out')}
                      </button>
                    </div>
                  )})}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Detail Overlay Modal */}
      {selectedBook && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(19, 36, 64, 0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }} 
          onClick={() => setSelectedBook(null)}
        >
          <div 
            className="glass-card" 
            style={{ padding: '2.5rem', maxWidth: '800px', width: '90%', position: 'relative' }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', fontSize: '2rem', cursor: 'pointer', color: 'var(--text-main)' }} 
              onClick={() => setSelectedBook(null)}
            >
              &times;
            </button>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column' }}>
                <img 
                  src={selectedBook.coverImage || 'https://placehold.co/400x600/132440/c3cdd9?text=Cover'} 
                  alt={selectedBook.title} 
                  style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <span className={`status-pill status-${selectedBook.status}`}>{selectedBook.status}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedBook.genre}</span>
                </div>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', lineHeight: '1.2' }}>{selectedBook.title}</h2>
                <p style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>by {selectedBook.author}</p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                  Dive into the world of <strong>{selectedBook.title}</strong>, a captivating {selectedBook.genre.toLowerCase()} masterpiece written by {selectedBook.author}. 
                  This remarkable work promises an unforgettable journey filled with twists, turns, and thoughtful commentary. 
                  {selectedBook.isbn && <><br/><br/><strong>ISBN:</strong> {selectedBook.isbn}</>}
                </p>
                <button 
                  className={`btn ${selectedBook.status === 'available' ? 'btn-primary' : 'btn-outline'}`} 
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                  onClick={() => {
                    if (selectedBook.status === 'available') {
                      handleCheckout(selectedBook.id);
                      setSelectedBook(null); // Optional: close modal when borrowed
                    }
                  }}
                  disabled={selectedBook.status !== 'available'}
                >
                  {selectedBook.status === 'available' ? 'Borrow Now' : (myBorrows.some(b => b.bookId === selectedBook.id) ? 'Borrowed' : 'Currently Out')}
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
