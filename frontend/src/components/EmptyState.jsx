import React from 'react';
import { PackageOpen } from 'lucide-react';
import './EmptyState.css';

const EmptyState = ({ title = "No data found", description = "Try adjusting your filters or search query." }) => {
  return (
    <div className="empty-state">
      <PackageOpen size={48} className="empty-icon" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default EmptyState;
