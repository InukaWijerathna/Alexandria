import React from 'react';
import { Link } from 'react-router-dom';

function Footer({ user }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-body">
        <div className="footer-inner">

          {/* Brand column */}
          <div className="footer-col footer-brand-col">
            <div className="footer-logo">
              <img src={import.meta.env.BASE_URL + 'favicon.ico'} className="footer-logo-mark" alt="Alexandria" />
              <span className="footer-logo-name">Alexandria</span>
            </div>
            <p className="footer-tagline">
              A modern library management system built for readers, by readers.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">React</span>
              <span className="footer-badge">Node.js</span>
              <span className="footer-badge">PostgreSQL</span>
            </div>
          </div>

          {/* Navigation column */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              {user ? (
                <>
                  <li><Link to={user.role === 'admin' ? '/admin' : '/books'}>Library</Link></li>
                  {user.role === 'admin' && <li><Link to="/admin/users">Members</Link></li>}
                  <li><Link to="/profile">My Profile</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Create Account</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* About column */}
          <div className="footer-col">
            <h4 className="footer-heading">About</h4>
            <ul className="footer-links">
              <li>
                <a href="https://github.com/InukaWijerathna/Alexandria" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://inukawijerathna.me" target="_blank" rel="noopener noreferrer">
                  Developer Portfolio
                </a>
              </li>
              <li>
                <Link to="/login">API Status</Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>&copy; {year} Alexandria. All rights reserved.</span>
          <span className="footer-credit">
            Built by{' '}
            <a href="https://inukawijerathna.me" target="_blank" rel="noopener noreferrer">
              Inuka Wijerathna
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
