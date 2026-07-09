import React from 'react';
import Badge from './Badge';

const StatusBadge = ({ status }) => {
  const getBadgeType = (s) => {
    switch (s.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'meeting': return 'primary';
      default: return 'default';
    }
  };

  return <Badge type={getBadgeType(status)}>{status}</Badge>;
};

export default StatusBadge;
