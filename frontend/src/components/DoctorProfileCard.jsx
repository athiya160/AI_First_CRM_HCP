import React from 'react';
import Card from './Card';
import './DoctorProfileCard.css';
import { UserCircle, MapPin, Building, Mail, Phone, Sparkles } from 'lucide-react';

const DoctorProfileCard = ({ hcp }) => {
  if (!hcp) return null;

  return (
    <Card className="doctor-profile-card">
      <div className="profile-header-banner"></div>
      <div className="profile-content">
        <UserCircle size={64} className="profile-avatar" />
        <div className="profile-header-text">
          <h2>{hcp.name}</h2>
          <p className="specialty">{hcp.specialty}</p>
        </div>
        
        <div className="profile-details-grid">
          <div className="detail-item">
            <Building size={16} />
            <span>{hcp.hospital || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <MapPin size={16} />
            <span>{hcp.location || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <Mail size={16} />
            <span>{hcp.email}</span>
          </div>
          <div className="detail-item">
            <Phone size={16} />
            <span>{hcp.phone || 'N/A'}</span>
          </div>
        </div>

        <div className="ai-insight-box">
          <div className="insight-header">
            <Sparkles size={16} />
            <h4>AI Insight</h4>
          </div>
          <ul className="insight-list">
            <li>Doctor prefers morning meetings.</li>
            <li>Positive engagement score (92%).</li>
            <li><strong>Recommended Action:</strong> Follow up with clinical trial data.</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default DoctorProfileCard;
