import React from 'react';
import Card from './Card';
import './KPICard.css';

const KPICard = ({ title, value, icon, highlight = false }) => {
  return (
    <Card className={`kpi-card ${highlight ? 'highlight-kpi' : ''}`}>
      <div className="kpi-header">
        <h3>{title}</h3>
        {icon && <div className="kpi-icon">{icon}</div>}
      </div>
      <div className="kpi-value">{value}</div>
    </Card>
  );
};

export default KPICard;
