import { useEffect, useState } from 'react';
import { getUserInfo } from '../../services/authService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EditAccount from './EditAccount';
import DeleteAccountDialog from './DeleteAccountDialog';
import './AccountManagement.css';

const AccountManagement = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // ✅ تحميل بيانات المستخدم مرة واحدة
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getUserInfo();
        setUserInfo(data.user || data);
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

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="account-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!userInfo) return null;

  return (
    <div className="account-page">
      <h1 className="account-title">Account Management</h1>

      {/* User Info */}
      <div className="account-card">
        <h2>User Information</h2>

        <div className="account-row">
          <span>Username</span>
          <strong>{userInfo.username}</strong>
        </div>

        <div className="account-row">
          <span>Email</span>
          <strong>{userInfo.email}</strong>
        </div>

        {userInfo.phone && (
          <div className="account-row">
            <span>Phone</span>
            <strong>{userInfo.phone}</strong>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="account-card actions">
        <button className="btn primary" onClick={() => setShowEdit(true)}>
          Edit Account
        </button>

        <button className="btn danger" onClick={() => setShowDelete(true)}>
          Delete Account
        </button>
      </div>

      {/* Modals */}
      {showEdit && (
        <EditAccount
          userInfo={userInfo}
          onClose={() => setShowEdit(false)}
          onSuccess={() => setShowEdit(false)}
        />
      )}

      <DeleteAccountDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
};

export default AccountManagement;
