import { useState, useEffect } from 'react';
import { updateLectureName } from '../../services/lectureService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './LectureForm.css';

const LectureForm = ({ courseId, lecture, onClose, onSuccess }) => {
  const [lectureName, setLectureName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lecture) {
      setLectureName(lecture.lecture_name || '');
    }
  }, [lecture]);

  const handleChange = (e) => {
    setLectureName(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!lectureName.trim()) {
      setError('Lecture name is required');
      return;
    }

    if (lectureName.trim() === lecture.lecture_name) {
      setError('New name is identical to current name');
      return;
    }

    setLoading(true);

    try {
      await updateLectureName(courseId, lecture.lecture_id, lectureName.trim());
      onSuccess();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.lecture_name?.[0] ||
        err.message ||
        'Failed to update lecture name';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Lecture Name</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="lecture-form">
          <ErrorMessage message={error} />

          <div className="form-group">
            <label htmlFor="lecture_name">
              Lecture Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lecture_name"
              name="lecture_name"
              value={lectureName}
              onChange={handleChange}
              required
              maxLength={200}
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
              {loading ? <LoadingSpinner size="small" /> : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LectureForm;


