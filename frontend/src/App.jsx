import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={user.role === 'admin' ? '/admin' : '/member'} />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin' : '/member'} />} />
          
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/member" element={user?.role === 'member' ? <MemberDashboard /> : <Navigate to="/login" />} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
