import React from 'react';
import './Input.css';

const Input = ({ label, multiline, ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      {multiline ? (
        <textarea className="input-field" rows={4} {...props} />
      ) : (
        <input className="input-field" {...props} />
      )}
    </div>
  );
};

export default Input;
