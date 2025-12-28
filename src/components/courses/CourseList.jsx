import { useState, useEffect } from 'react';
import { getAllCourses } from '../../services/courseService';
import CourseCard from './CourseCard';
import CourseForm from './CourseForm';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './CourseList.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllCourses();
      // Handle different response formats
      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else if (data && Array.isArray(data)) {
        setCourses(data);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      if (err.isCorsError) {
        setError('CORS Error: Backend is blocking requests. Please update backend CORS to allow requests from this origin and allow the ngrok-skip-browser-warning header.');
      } else if (err.isNetworkError) {
        setError('Network Error: Unable to connect to the server. Please check if the backend server is running.');
      } else if (err.isHtmlResponse) {
        setError('Server returned HTML instead of JSON. This might be ngrok\'s warning page. Please configure ngrok or update backend CORS settings.');
      } else {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Failed to load courses. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseCreated = () => {
    setShowCreateForm(false);
    fetchCourses();
  };

  const handleCourseUpdated = () => {
    fetchCourses();
  };

  const handleCourseDeleted = () => {
    fetchCourses();
  };

  if (loading) {
    return (
      <div className="course-list-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <div className="course-list-header">
        <h1>My Courses</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          + Create Course
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {showCreateForm && (
        <CourseForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCourseCreated}
        />
      )}

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h2>No courses yet</h2>
          <p>Create your first course to get started!</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Course
          </button>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.course_id}
              course={course}
              onUpdate={handleCourseUpdated}
              onDelete={handleCourseDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;


