import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <FileQuestion size={64} className="not-found-icon" />
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <button className="back-btn" onClick={() => navigate('/')}>
        Return to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
