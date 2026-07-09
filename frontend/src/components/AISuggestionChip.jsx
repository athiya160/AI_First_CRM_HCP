import React from 'react';
import { Sparkles } from 'lucide-react';
import './AISuggestionChip.css';

const AISuggestionChip = ({ text, onClick }) => {
  return (
    <button className="ai-suggestion-chip" onClick={onClick} type="button">
      <Sparkles size={14} className="chip-icon" />
      {text}
    </button>
  );
};

export default AISuggestionChip;
