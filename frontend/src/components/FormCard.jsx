import React from 'react';
import Card from './Card';
import './FormCard.css';

const FormCard = ({ title, description, children, onSubmit }) => {
  return (
    <Card className="form-card">
      <div className="form-card-header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <form onSubmit={onSubmit} className="form-card-body">
        {children}
      </form>
    </Card>
  );
};

export default FormCard;
