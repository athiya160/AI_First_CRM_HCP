import React from 'react';
import { Sparkles, User } from 'lucide-react';
import './ChatBubble.css';

const formatContent = (text) => {
  if (!text) return null;
  // split by new lines to get lines
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // If it's an empty line, just add a small spacer
    if (!line.trim()) return <div key={i} style={{ height: '8px' }} />;
    
    // Handle bold **text**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={i} style={{ marginBottom: '4px', lineHeight: '1.5' }}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} style={{ color: 'var(--text-light)' }}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </div>
    );
  });
};

const ChatBubble = ({ role, content }) => {
  const isAi = role === 'ai';
  return (
    <div className={`chat-bubble-wrapper ${role}`}>
      {isAi && <div className="avatar ai-avatar"><Sparkles size={14}/></div>}
      <div className={`chat-bubble-content ${role}`}>
        {content && <div className="formatted-markdown">{formatContent(content)}</div>}
      </div>
      {!isAi && <div className="avatar user-avatar"><User size={14}/></div>}
    </div>
  );
};

export default ChatBubble;
