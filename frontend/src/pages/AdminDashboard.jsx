import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState({ title: '', author: '', isbn: '', genre: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (err) {
      console.error('Error fetching books', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/books/${currentBook.id}`, currentBook);
      } else {
        await api.post('/books', currentBook);
      }
      setIsModalOpen(false);
      setCurrentBook({ title: '', author: '', isbn: '', genre: '' });
      setIsEditing(false);
      fetchBooks();
    } catch (err) {
      console.error('Error saving book', err);
    }
  };

  const handleEdit = (book) => {
    setCurrentBook(book);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await api.delete(`/books/${id}`);
        fetchBooks();
      } catch (err) {
        console.error('Error deleting book', err);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1>Manage Books</h1>
        <button className="btn btn-primary" onClick={() => { setIsModalOpen(true); setIsEditing(false); setCurrentBook({ title: '', author: '', isbn: '', genre: '' }); }}>
          Add New Book
        </button>
      </div>

      <div className="grid">
        {books.map(book => (
          <div key={book.id} className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className={`status-pill status-${book.status}`}>{book.status}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{book.isbn}</span>
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{book.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>by {book.author}</p>
            <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{book.genre}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleEdit(book)}>Edit</button>
              <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleDelete(book.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
              <div className="input-group">
                <label>Title</label>
                <input type="text" value={currentBook.title} onChange={(e) => setCurrentBook({ ...currentBook, title: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Author</label>
                <input type="text" value={currentBook.author} onChange={(e) => setCurrentBook({ ...currentBook, author: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>ISBN</label>
                <input type="text" value={currentBook.isbn} onChange={(e) => setCurrentBook({ ...currentBook, isbn: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Genre</label>
                <input type="text" value={currentBook.genre} onChange={(e) => setCurrentBook({ ...currentBook, genre: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditing ? 'Update' : 'Save'}</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
