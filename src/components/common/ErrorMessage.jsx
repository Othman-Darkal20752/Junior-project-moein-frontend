import './ErrorMessage.css';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-message">
      <span>{message}</span>
      {onClose && (
        <button className="error-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;


