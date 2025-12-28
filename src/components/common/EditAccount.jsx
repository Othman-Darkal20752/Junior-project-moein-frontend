import { useState, useEffect } from 'react';
import { updateAccount } from '../../services/authService';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validation';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './EditAccount.css';

const EditAccount = ({ userInfo, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        username: userInfo.username || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        password: '',
        password_confirm: '',
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Phone must be 1-10 digits';
    }

    // Password is optional, but if provided, must be valid
    if (formData.password && !validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password && formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Only send fields that have values (password is optional)
      const updateData = {
        username: formData.username,
        email: formData.email,
      };

      if (formData.phone) {
        updateData.phone = formData.phone;
      }

      if (formData.password) {
        updateData.password = formData.password;
        updateData.password_confirm = formData.password_confirm;
      }

      await updateAccount(updateData);
      onSuccess();
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: err.message || 'An error occurred during update' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Account</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-account-form">
          {errors.general && <ErrorMessage message={errors.general} />}

          <div className="form-group">
            <label htmlFor="username">
              Username <span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone (Optional)</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && (
              <span className="field-error">{errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">New Password (Optional)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={errors.password ? 'error' : ''}
              placeholder="Leave empty to keep current password"
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          {formData.password && (
            <div className="form-group">
              <label htmlFor="password_confirm">Confirm New Password</label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                disabled={loading}
                className={errors.password_confirm ? 'error' : ''}
              />
              {errors.password_confirm && (
                <span className="field-error">{errors.password_confirm}</span>
              )}
            </div>
          )}

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
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="small" /> : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccount;












