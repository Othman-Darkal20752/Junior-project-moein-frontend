import LectureItem from './LectureItem';
import './LectureList.css';

const LectureList = ({ courseId, lectures, onDelete, onUpdate, onStartSummaryPolling }) => {
  if (lectures.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📄</div>
        <h3>No lectures yet</h3>
        <p>Upload your first lecture to get started!</p>
      </div>
    );
  }

  return (
    <div className="lecture-list">
      {lectures.map((lecture) => (
        <LectureItem
          key={lecture.lecture_id}
          courseId={courseId}
          lecture={lecture}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onStartSummaryPolling={onStartSummaryPolling}
        />
      ))}
    </div>
  );
};

export default LectureList;


