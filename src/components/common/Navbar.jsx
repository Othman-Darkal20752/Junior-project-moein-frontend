import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AccountManagement from './AccountManagement';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <h2>Moein</h2>
        </Link>

        <div className="navbar-menu">
          {user && (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>

              <Link to="/my-summary" className="navbar-link">
                My Summary
              </Link>

              <AccountManagement />

              <div className="navbar-user">
                <span className="navbar-username">{user.username}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
