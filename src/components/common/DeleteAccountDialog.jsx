import { useState } from 'react';
import { deleteAccount } from '../../services/authService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './DeleteAccountDialog.css';

const DeleteAccountDialog = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password is required to delete your account');
      return;
    }

    setLoading(true);

    try {
      await deleteAccount(password);
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to delete account. Please check your password.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Account</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="delete-account-content">
          <p className="delete-warning">
            ⚠️ This action cannot be undone. This will permanently delete your account and all your courses and lectures.
          </p>

          <form onSubmit={handleSubmit} className="delete-account-form">
            <ErrorMessage message={error} />

            <div className="form-group">
              <label htmlFor="delete-password">
                Enter your password to confirm <span className="required">*</span>
              </label>
              <input
                type="password"
                id="delete-password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                disabled={loading}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loading || !password}
              >
                {loading ? <LoadingSpinner size="small" /> : 'Delete Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountDialog;












