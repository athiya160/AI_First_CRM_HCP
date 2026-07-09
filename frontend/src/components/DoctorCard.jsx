import React from 'react';
import Badge from './Badge';
import './DoctorCard.css';
import { UserCircle } from 'lucide-react';

const DoctorCard = ({ name, specialty, email, actionText = "View" }) => {
  return (
    <div className="doctor-card">
      <div className="doc-info-wrapper">
        <UserCircle size={40} className="doc-avatar" />
        <div className="doc-details">
          <h4>{name}</h4>
          <p>{specialty}</p>
        </div>
      </div>
      <Badge type="primary">{actionText}</Badge>
    </div>
  );
};

export default DoctorCard;
