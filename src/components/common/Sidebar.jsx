import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserInfo } from '../../services/authService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EditAccount from './EditAccount';
import DeleteAccountDialog from './DeleteAccountDialog';
import './Sidebar.css';

const SIDEBAR_STORAGE_KEY = 'sidebar_open';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });

  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, isOpen);
  }, [isOpen]);

  const closeSidebar = () => setIsOpen(false);
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGetUserInfo = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserInfo();
      setUserInfo(data.user || data || null);
      setShowUserInfo(true);
      closeSidebar();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to load user information'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditAccount = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserInfo();
      setUserInfo(data.user || data || null);
      setShowEditAccount(true);
      closeSidebar();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to load user information'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hamburger */}
      <button
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img
              src="/src/assest/navbar_logo.png"
              alt="Moein Logo"
              className="sidebar-logo-img"
            />
            <h2 className="sidebar-logo-text">Moein</h2>
          </div>
          <button className="sidebar-close" onClick={closeSidebar}>×</button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {user && (
            <>
              <Link
                to="/my-summary"
                className={`sidebar-link ${isActive('/my-summary') ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="sidebar-link-icon">👤</span>
                <span className="sidebar-link-text">My Summary</span>
                <span className="sidebar-link-arrow">→</span>
              </Link>

              <Link
                to="/dashboard"
                className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="sidebar-link-icon">📚</span>
                <span className="sidebar-link-text">Course Content</span>
                <span className="sidebar-link-arrow">→</span>
              </Link>

              <button className="sidebar-link" onClick={handleGetUserInfo}>
                <span className="sidebar-link-icon">👤</span>
                <span className="sidebar-link-text">User Info</span>
                <span className="sidebar-link-arrow">→</span>
              </button>

              <button className="sidebar-link" onClick={handleEditAccount}>
                <span className="sidebar-link-icon">✏️</span>
                <span className="sidebar-link-text">Edit Account</span>
                <span className="sidebar-link-arrow">→</span>
              </button>

              <button
                className="sidebar-link sidebar-link-danger"
                onClick={() => setShowDeleteDialog(true)}
              >
                <span className="sidebar-link-icon">🗑️</span>
                <span className="sidebar-link-text">Delete Account</span>
                <span className="sidebar-link-arrow">→</span>
              </button>

              <div className="sidebar-footer">
                <div className="sidebar-user-info">
                  👤 {user.username}
                </div>

                <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
                  <span className="sidebar-link-icon">🚪</span>
                  <span className="sidebar-link-text">Logout</span>
                  <span className="sidebar-link-arrow">→</span>
                </button>
              </div>
            </>
          )}
        </nav>
      </aside>

      {/* 🔥 GLOBAL LOADING (CENTERED) */}
      {loading && (
        <div className="global-loading-overlay">
          <LoadingSpinner size="large" />
        </div>
      )}

      {/* User Info Modal */}
      {showUserInfo && userInfo && (
        <div className="modal-overlay" onClick={() => setShowUserInfo(false)}>
          <div className="modal-content user-info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Information</h2>
              <button className="modal-close" onClick={() => setShowUserInfo(false)}>×</button>
            </div>

            <div className="user-info-content">
              {error && <ErrorMessage message={error} />}

              <div className="user-info-item">
                <strong>Username</strong>
                <span>{userInfo.username}</span>
              </div>

              <div className="user-info-item">
                <strong>Email</strong>
                <span>{userInfo.email}</span>
              </div>

              {userInfo.phone && (
                <div className="user-info-item">
                  <strong>Phone</strong>
                  <span>{userInfo.phone}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {showEditAccount && userInfo && (
        <EditAccount
          userInfo={userInfo}
          onClose={() => setShowEditAccount(false)}
          onSuccess={() => setShowEditAccount(false)}
        />
      )}

      <DeleteAccountDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={handleLogout}
      />
    </>
  );
};

export default Sidebar;
