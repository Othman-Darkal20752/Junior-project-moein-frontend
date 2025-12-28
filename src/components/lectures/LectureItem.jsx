import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime, formatDate } from '../../utils/dateUtils';
import { getFileTypeIcon } from '../../utils/validation';
import LectureForm from './LectureForm';
import ConfirmDialog from '../common/ConfirmDialog';
import { deleteLecture } from '../../services/lectureService';
import './LectureItem.css';

const LectureItem = ({ courseId, lecture, onDelete, onUpdate, onStartSummaryPolling }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Summary status helpers
  const summaryStatus = lecture.summary_status || (lecture.summary_text ? 'ready' : 'pending');
  const isSummaryReady = summaryStatus === 'READY' || !!lecture.summary_text;
  const isSummaryFailed = summaryStatus === 'FAILED';

const handleViewSummary = () => {
  navigate(`/my-summary/${lecture.lecture_id}`);
};


  const handleOpenLecture = () => {
    const fileUrl = lecture.file_url || lecture.file || lecture.url;
    if (!fileUrl) {
      alert('No file URL available for this lecture.');
      return;
    }
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteLecture(courseId, lecture.lecture_id);
      setShowDeleteDialog(false);
      onDelete();
    } catch (error) {
      alert(
        error.response?.data?.error ||
        error.message ||
        'Failed to delete lecture'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="lecture-item">
        <div className="lecture-item-icon">
          {getFileTypeIcon(lecture.lecture_name)}
        </div>
        <button
          type="button"
          className="lecture-item-content"
          onClick={handleOpenLecture}
        >
          <h4 className="lecture-item-name">{lecture.lecture_name}</h4>
          <p className="lecture-item-date">
            {formatRelativeTime(lecture.created_at)} • {formatDate(lecture.created_at)}
          </p>
        </button>
        <div className="lecture-item-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowEditForm(true)}
          >
            Edit
          </button>
          <button
            className={`btn btn-secondary btn-sm lecture-summary-btn ${
              isSummaryReady ? 'READY' : isSummaryFailed ? 'FAILED' : 'PENDING'
            }`}
            onClick={handleViewSummary}
            disabled={isSummaryFailed}
          >
            {isSummaryFailed ? 'Summary Failed' : isSummaryReady ? 'View Summary' : 'Get Summary'}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {showEditForm && (
        <LectureForm
          courseId={courseId}
          lecture={lecture}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            onUpdate();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Lecture"
        message={`Are you sure you want to delete "${lecture.lecture_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        danger={true}
      />
    </>
  );
};

export default LectureItem;


