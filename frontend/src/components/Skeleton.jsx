import React from 'react';
import './Skeleton.css';

const Skeleton = ({ className = '', style = {} }) => {
  return (
    <div className={`skeleton-loader ${className}`} style={style}></div>
  );
};

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton className="skeleton-avatar" />
    <div className="skeleton-lines">
      <Skeleton className="skeleton-line title" />
      <Skeleton className="skeleton-line" />
      <Skeleton className="skeleton-line short" />
    </div>
  </div>
);

export default Skeleton;
