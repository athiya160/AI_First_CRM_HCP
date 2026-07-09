import React from 'react';
import { Sparkles, User, CheckCircle2 } from 'lucide-react';
import './ChatBubble.css';

const ChatBubble = ({ role, content, richContent }) => {
  const isAi = role === 'ai';
  return (
    <div className={`chat-bubble-wrapper ${role}`}>
      {isAi && <div className="avatar ai-avatar"><Sparkles size={14}/></div>}
      <div className={`chat-bubble-content ${role}`}>
        {content && <p>{content}</p>}
        
        {richContent && (
          <div className="rich-content-box">
            {richContent.status && (
              <div className="rich-status">
                <CheckCircle2 size={16} />
                <span>{richContent.status}</span>
              </div>
            )}
            
            {richContent.doctor && (
              <div className="rich-section">
                <h4>👨‍⚕️ Doctor</h4>
                <p>{richContent.doctor}</p>
              </div>
            )}
            
            {richContent.summary && richContent.summary.topic && (
              <div className="rich-section">
                <h4>📝 Summary</h4>
                <p>{richContent.summary.topic}</p>
              </div>
            )}
            
            {richContent.summary && richContent.summary.sentiment && (
              <div className="rich-section">
                <h4>😊 Sentiment</h4>
                <p>{richContent.summary.sentiment}</p>
              </div>
            )}

            {richContent.summary && richContent.summary.confidence !== undefined && (
              <div className="rich-section">
                <h4>🎯 Confidence</h4>
                <p>{richContent.summary.confidence}%</p>
              </div>
            )}
            
            {richContent.entities && richContent.entities.length > 0 && (
              <div className="rich-section">
                <h4>🏥 Medical Topics</h4>
                <ul>
                  {richContent.entities.map((entity, idx) => (
                    <li key={idx}>• {entity}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {richContent.actionItems && richContent.actionItems.length > 0 && (
              <div className="rich-section">
                <h4>📅 Next Action</h4>
                <ul>
                  {richContent.actionItems.map((item, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={14} className="check-icon" style={{marginRight: '6px'}}/>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {richContent.interactionId && (
              <div className="rich-section interaction-id">
                <p>Interaction ID #{richContent.interactionId}</p>
              </div>
            )}
          </div>
        )}
      </div>
      {!isAi && <div className="avatar user-avatar"><User size={14}/></div>}
    </div>
  );
};

export default ChatBubble;
