import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getLectureStatus,
  getLectureSummary,
} from '../../services/lectureService';
import './MySummary.css';

const STORAGE_KEY = 'my_summaries';
const POLLING_INTERVAL = 4000;

const MySummary = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();

  const [lectureInfo, setLectureInfo] = useState(null);
  const [summaryStatus, setSummaryStatus] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(!!lectureId);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [storedSummaries, setStoredSummaries] = useState([]);

  const pollingRef = useRef(null);
  const fetchedRef = useRef(false);

  /* ---------- helpers ---------- */

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const loadStoredSummaries = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setStoredSummaries(JSON.parse(stored));
      } catch {
        setStoredSummaries([]);
      }
    }
  };

  const deleteSummary = (id) => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = stored.filter((s) => s.lecture_id !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setStoredSummaries(updated);

    if (lectureId) {
      navigate('/my-summary');
    }
  };

  /* ---------- fetch flow ---------- */

  const fetchLectureStatus = async () => {
    try {
      const data = await getLectureStatus(lectureId);
      setLectureInfo(data);
      setSummaryStatus(data.summary_status);

      if (data.summary_status === 'READY' && !fetchedRef.current) {
        fetchedRef.current = true;
        stopPolling();
        await fetchSummary();
      }

      if (data.summary_status === 'FAILED') {
        stopPolling();
        setError('Summary generation failed.');
        setLoading(false);
      }
    } catch {
      stopPolling();
      setError('Failed to fetch lecture status.');
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await getLectureSummary(lectureId); // 👈 object

      setSummary(data.summary); // ✅ النص فقط
      setLoading(false);

      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      );

      const newSummary = {
        lecture_id: lectureId,
        lecture_name: lectureInfo?.lecture_name,
        course_name: lectureInfo?.course_info?.course_name,
        summary: data.summary,
        created_at: new Date().toISOString(),
      };

      const updated = stored.filter(
        (item) => item.lecture_id !== lectureId
      );

      updated.unshift(newSummary);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );

      setStoredSummaries(updated);
    } catch {
      setError('Failed to fetch summary.');
      setLoading(false);
    }
  };

  /* ---------- effects ---------- */

  useEffect(() => {
    if (!lectureId) {
      loadStoredSummaries();
      return;
    }

    fetchLectureStatus();
    pollingRef.current = setInterval(
      fetchLectureStatus,
      POLLING_INTERVAL
    );

    return () => stopPolling();
  }, [lectureId]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  /* ---------- render ---------- */

  // DASHBOARD MODE
  if (!lectureId) {
    return (
      <div className="my-summary-container">
        <h1>My Summaries</h1>

        {!storedSummaries.length ? (
          <p className="summary-empty">No summaries available yet.</p>
        ) : (
          <div className="summary-grid">
            {storedSummaries.map((item) => {
              const expanded = expandedId === item.lecture_id;
              return (
                <div
                  key={item.lecture_id}
                  className="summary-card summary-card-full"
                >
                  <div className="summary-card-header">
                    <div>
                      <h2>{item.lecture_name}</h2>
                      <p className="summary-course-title">
                        {item.course_name}
                      </p>
                    </div>

                    <div className="summary-actions">
                      <button
                        className="summary-toggle-btn"
                        onClick={() =>
                          toggleExpand(item.lecture_id)
                        }
                      >
                        {expanded ? '▲' : '▼'}
                      </button>

                      <button
                        className="summary-delete-btn"
                        onClick={() =>
                          deleteSummary(item.lecture_id)
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="summary-card-content">
                      <div className="summary-markdown">
                        <ReactMarkdown>{item.summary}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // SINGLE SUMMARY MODE
  if (loading) {
    return (
      <div className="my-summary-container">
        <h1>Processing Summary...</h1>
        <p>Status: {summaryStatus || 'Processing'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-summary-container">
        <p className="summary-empty">{error}</p>
      </div>
    );
  }

  return (
    <div className="my-summary-container">
      <div className="summary-card-header">
        <div>
          <h1>{lectureInfo?.lecture_name}</h1>
          <p className="summary-course-title">
            {lectureInfo?.course_info?.course_name}
          </p>
        </div>

        <button
          className="summary-delete-btn"
          onClick={() => deleteSummary(lectureId)}
        >
          Delete
        </button>
      </div>

      <div className="summary-card summary-card-full">
        <div className="summary-card-content">
          <p className="summary-lecture-text">{summary}</p>
        </div>
      </div>
    </div>
  );
};

export default MySummary;
