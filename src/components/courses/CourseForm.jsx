import { useState, useEffect } from 'react';
import { createCourse, updateCourse } from '../../services/courseService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './CourseForm.css';

const CourseForm = ({ course, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    course_name: '',
    course_teacher: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        course_name: course.course_name || '',
        course_teacher: course.course_teacher || '',
      });
    }
  }, [course]);

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
      if (course) {
        await updateCourse(course.course_id, formData);
      } else {
        await createCourse(formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving course:', err);
      if (err.isCorsError) {
        setError('CORS Error: Backend is blocking requests. Please update backend CORS configuration.');
      } else if (err.isNetworkError) {
        setError('Network Error: Unable to connect to the server. Please check if the backend server is running.');
      } else if (err.isHtmlResponse) {
        setError('Server returned HTML instead of JSON. This might be ngrok\'s warning page. Please configure ngrok or update backend CORS settings.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.course_name?.[0] ||
          err.message ||
          'Failed to save course';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{course ? 'Edit Course' : 'Create New Course'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          <ErrorMessage message={error} />

          <div className="form-group">
            <label htmlFor="course_name">
              Course Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="course_name"
              name="course_name"
              value={formData.course_name}
              onChange={handleChange}
              required
              maxLength={200}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="course_teacher">Teacher (Optional)</label>
            <input
              type="text"
              id="course_teacher"
              name="course_teacher"
              value={formData.course_teacher}
              onChange={handleChange}
              maxLength={100}
              disabled={loading}
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
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                course ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;

