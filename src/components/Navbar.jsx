import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => setShowLogoutConfirm(true);

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          Fix My Bangalore
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin/dashboard" className="nav-link">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/" className="nav-link">Home</Link>
                  <Link to="/my-reports" className="nav-link">My Reports</Link>
                </>
              )}
              <span className="nav-user">{user.email}</span>
              <button type="button" className="nav-btn-logout" onClick={handleLogoutClick}>
                Logout
              </button>
            </>
          ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Sign up</Link>
          </>
        )}
      </div>
    </nav>

    <ConfirmDialog
      open={showLogoutConfirm}
      onClose={() => setShowLogoutConfirm(false)}
      onConfirm={handleLogoutConfirm}
      title="Log out"
      message="Are you sure you want to log out?"
      confirmLabel="Log out"
      cancelLabel="Cancel"
    />
    </>
  );
}

export default Navbar;
