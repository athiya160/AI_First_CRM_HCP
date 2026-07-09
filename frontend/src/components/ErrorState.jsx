import React from 'react';
import { AlertCircle } from 'lucide-react';
import './ErrorState.css';

const ErrorState = ({ message = "An error occurred while loading data." }) => {
  return (
    <div className="error-state">
      <AlertCircle size={48} className="error-icon" />
      <h3>Oops! Something went wrong.</h3>
      <p>{message}</p>
      <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
};

export default ErrorState;
