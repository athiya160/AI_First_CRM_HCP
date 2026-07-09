import React from 'react';
import './Timeline.css';

const Timeline = ({ children }) => {
  return (
    <div className="timeline-container-atomic">
      {children}
    </div>
  );
};

export const TimelineItem = ({ icon, children }) => (
  <div className="timeline-item-atomic animate-fade-in">
    <div className="timeline-node-atomic">
      {icon}
    </div>
    <div className="timeline-content-atomic">
      {children}
    </div>
  </div>
);

export default Timeline;
