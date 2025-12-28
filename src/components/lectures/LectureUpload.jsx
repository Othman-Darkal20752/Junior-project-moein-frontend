import { useState, useRef } from 'react';
import { uploadLecture } from '../../services/lectureService';
import { validateFileType, validateFileSize } from '../../utils/validation';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './LectureUpload.css';

const LectureUpload = ({ courseId, onClose, onSuccess }) => {
  const [lectureName, setLectureName] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!validateFileType(selectedFile)) {
      setError('Only PDF, Word (.docx), and PowerPoint (.pptx) files are allowed');
      return;
    }

    if (!validateFileSize(selectedFile)) {
      setError('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    setLectureName((prev) => prev || selectedFile.name.replace(/\.[^/.]+$/, ''));
    setError('');
  };

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    } else {
      setLectureName(e.target.value);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!lectureName.trim()) {
      setError('Lecture name is required');
      return;
    }

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('lecture_name', lectureName.trim());
    formData.append('file', file);

    setLoading(true);

    try {
      await uploadLecture(courseId, formData);
      onSuccess();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.lecture_name?.[0] ||
        err.message ||
        'Failed to upload lecture';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Lecture</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="lecture-upload-form">
          <ErrorMessage message={error} />

          <div className="form-group">
            <label>
              Lecture Name <span className="required">*</span>
            </label>
            <input
              type="text"
              value={lectureName}
              onChange={(e) => setLectureName(e.target.value)}
              required
              maxLength={200}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              File <span className="required">*</span>
            </label>
            <div
              className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="file-selected">
                  <span>{file.name}</span>
                  <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <button type="button" onClick={removeFile}>Remove</button>
                </div>
              ) : (
                <>
                  <p>Drag & drop a file here or click to select</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    onChange={handleChange}
                    accept=".pdf,.docx,.pptx"
                    disabled={loading}
                    hidden
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    Select File
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !file}>
              {loading ? <LoadingSpinner size="small" /> : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LectureUpload;
