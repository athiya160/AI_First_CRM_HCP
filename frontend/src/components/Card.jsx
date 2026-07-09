import React from 'react';
import './Card.css';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`card glass ${className}`}>
      {children}
    </div>
  );
};

export default Card;
