import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { login as loginService } from '../../services/authService';
import { setToken, setUser } from '../../utils/tokenUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginService(formData);
      setToken(response.token);
      setUser(response.user);
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err) {
      let errorMessage;
      if (err.isCorsError) {
        errorMessage = 'CORS Error: The backend server is not allowing requests. Please check backend CORS configuration to allow requests from localhost:3000 and allow the ngrok-skip-browser-warning header.';
      } else if (err.isNetworkError) {
        errorMessage = 'Network Error: Unable to connect to the server. Please check if the backend server is running.';
      } else if (err.isHtmlResponse) {
        errorMessage = 'Server returned HTML instead of JSON. This might be ngrok\'s warning page. Please configure ngrok or update backend CORS settings.';
      } else {
        errorMessage =
          err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.error ||
          err.message ||
          'Invalid username or password';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Welcome back! Please login to continue.</p>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

