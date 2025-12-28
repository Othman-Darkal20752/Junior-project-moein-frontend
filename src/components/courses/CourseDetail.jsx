import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, deleteCourse, getAllCourses } from '../../services/courseService';
import { formatDate } from '../../utils/dateUtils';
import CourseForm from './CourseForm';
import LectureList from '../lectures/LectureList';
import LectureUpload from '../lectures/LectureUpload';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPollingSummaries, setIsPollingSummaries] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError('');
      // Get course with lectures
      const data = await getCourse(courseId);
      // Handle different response formats
      // If data is an array (just lectures), we need to get course info separately
      if (Array.isArray(data)) {
        // If it's just lectures array, try to get course from courses list
        try {
          const allCourses = await getAllCourses();
          const courseInfo = Array.isArray(allCourses) 
            ? allCourses.find(c => c.course_id === courseId)
            : (allCourses.courses || []).find(c => c.course_id === courseId);
          
          if (courseInfo) {
            setCourse({ ...courseInfo, lectures: data });
          } else {
            setError('Course not found');
          }
        } catch (err) {
          setError('Failed to load course information');
        }
      } else {
        // If it's an object, it might have course info and lectures
        setCourse(data);
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to load course. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteCourse(courseId);
      navigate('/dashboard');
    } catch (error) {
      alert(
        error.response?.data?.error ||
        error.message ||
        'Failed to delete course'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleCourseUpdated = () => {
    setShowEditForm(false);
    fetchCourse();
  };

  const handleLectureUploaded = () => {
    setShowUploadForm(false);
    fetchCourse();
  };

  const handleLectureDeleted = () => {
    fetchCourse();
  };

  const handleLectureUpdated = () => {
    fetchCourse();
  };

  // Helper to check if any lecture still has summary pending/processing
  const hasPendingSummaries = (courseData) => {
    if (!courseData || !courseData.lectures) return false;
    return courseData.lectures.some((lecture) => {
      const status =
        lecture.summary_status || (lecture.summary_text ? 'READY' : 'PENDING');
      return status !== 'READY' && status !== 'FAILED';
    });
  };

  // Called from lecture items when user clicks "Get Summary"
  const startSummaryPolling = () => {
    if (isPollingSummaries) return;
    setIsPollingSummaries(true);
  };

  // Poll summaries only while isPollingSummaries is true
  useEffect(() => {
    if (!isPollingSummaries) return;

    let isCancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 180; // ~3 minutes at 1s interval

    const intervalId = setInterval(async () => {
      attempts += 1;
      if (isCancelled || attempts > MAX_ATTEMPTS) {
        clearInterval(intervalId);
        setIsPollingSummaries(false);
        return;
      }

      try {
        const data = await getCourse(courseId);
        if (isCancelled) return;

        setCourse(data);

        const pending = hasPendingSummaries(data);
        if (!pending) {
          clearInterval(intervalId);
          setIsPollingSummaries(false);
        }
      } catch (err) {
        console.error('Error polling lecture summaries:', err);
        clearInterval(intervalId);
        setIsPollingSummaries(false);
      }
    }, 1000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [courseId, isPollingSummaries]);

  if (loading) {
    return (
      <div className="course-list-container course-list-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  

  if (error && !course) {
    return (
      <div className="course-detail-container">
        <ErrorMessage message={error} />
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="course-detail-container">
      {isPollingSummaries && (
        <div className="summary-wait-overlay">
          <div className="summary-wait-box">
            <div className="hourglass-spinner" />
            <p>Generating lecture summaries...</p>
          </div>
        </div>
      )}
      <div className="course-detail-header">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/dashboard')}
        >
          ← Back
        </button>
        <div className="course-detail-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowEditForm(true)}
          >
            Edit Course
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Course
          </button>
        </div>
      </div>

      
        <h1 className="course-name-bold">{course.course_name}</h1>
        {course.course_teacher && (
          <p className="course-teacher">👨‍🏫 {course.course_teacher}</p>
        )}
      

      <div className="course-detail-section">
        <div className="section-header">
          <h2>Lectures</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowUploadForm(true)}
          >
            + Upload Lecture
          </button>
        </div>

        <LectureList
          courseId={courseId}
          lectures={course.lectures || []}  
          onDelete={handleLectureDeleted}
          onUpdate={handleLectureUpdated}
          onStartSummaryPolling={startSummaryPolling}
        />
      </div>

      {showEditForm && (
        <CourseForm
          course={course}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleCourseUpdated}
        />
      )}

      {showUploadForm && (
        <LectureUpload
          courseId={courseId}
          onClose={() => setShowUploadForm(false)}
          onSuccess={handleLectureUploaded}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Course"
        message={`Are you sure you want to delete "${course.course_name}"? This will also delete all lectures in this course.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        danger={true}
      />
    </div>
  );
};

export default CourseDetail;

