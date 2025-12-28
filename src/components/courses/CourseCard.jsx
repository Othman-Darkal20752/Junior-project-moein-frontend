import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import CourseForm from './CourseForm';
import ConfirmDialog from '../common/ConfirmDialog';
import { deleteCourse } from '../../services/courseService';
import { useState } from 'react';
import './CourseCard.css';

const CourseCard = ({ course, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteCourse(course.course_id);
      setShowDeleteDialog(false);
      onDelete();
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

  // Ensure we properly count lectures - handle both array and undefined cases
  // Check if lectures exists and is an array, otherwise default to 0
  const lectureCount = (course.lectures && Array.isArray(course.lectures)) ? course.lectures.length : 0;

  return (
    <>
      <div className="course-card">
        <div
          className="course-card-content"
          onClick={() => navigate(`/courses/${course.course_id}`)}
        >
          <h3 className="course-card-title">{course.course_name}</h3>
          {course.course_teacher && (
            <p className="course-card-teacher">👨‍🏫 {course.course_teacher}</p>
          )}
          <div className="course-card-meta">
            <span className="course-card-lectures">
              {lectureCount} {lectureCount === 1 ? 'lecture' : 'lectures'}
            </span>
            <span className="course-card-date">
              {formatDate(course.created_at)}
            </span>
          </div>
        </div>
        <div className="course-card-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowEditForm(true);
            }}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {showEditForm && (
        <CourseForm
          course={course}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            onUpdate();
          }}
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
    </>
  );
};

export default CourseCard;

