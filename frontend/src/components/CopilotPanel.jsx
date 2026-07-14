import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, toggleCopilot, closeCopilot, sendMessage } from '../features/chatSlice';
import ChatBubble from './ChatBubble';
import AISuggestionChip from './AISuggestionChip';
import './CopilotPanel.css';
import { Send, Sparkles, X, Loader2 } from 'lucide-react';

const loadingTexts = [
  "Analyzing conversation...",
  "Extracting medical entities...",
  "Generating AI insights...",
  "Saving interaction..."
];

const CopilotPanel = () => {
  const { messages, isOpen, isLoading } = useSelector(state => state.chat);
  const selectedHcp = useSelector(state => state.hcps.selectedHcp);
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 1500);
    } else {
      setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message to UI immediately
    dispatch(addMessage({ role: 'user', content: input }));
    
    // Send to LangGraph API
    dispatch(sendMessage({ message: input, hcp_id: selectedHcp?.id || null }));
    
    setInput('');
  };

  const handleSuggestionClick = (text) => {
    if (isLoading) return;
    dispatch(addMessage({ role: 'user', content: text }));
    dispatch(sendMessage({ message: text, hcp_id: selectedHcp?.id || null }));
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button className="floating-ai-btn" onClick={() => dispatch(toggleCopilot())}>
          <Sparkles size={24} />
        </button>
      )}

      {/* Slide-out Panel */}
      <div className={`copilot-panel glass ${isOpen ? 'open' : ''}`}>
        <div className="copilot-header">
          <div className="header-title" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles className="header-icon" size={20} />
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>CRM Copilot</h3>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Powered by LangGraph, Groq, FastAPI, React, PostgreSQL
            </span>
          </div>
          <button className="close-btn" onClick={() => dispatch(closeCopilot())}>
            <X size={20} />
          </button>
        </div>
        
        <div className="copilot-stream">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const label = isUser ? 'You' : '🤖 CRM Copilot';
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: index === messages.length - 1 ? 0 : '16px' }}>
                <div style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center', padding: '0 4px' }}>
                  <span style={{ fontWeight: 600, color: isUser ? 'var(--primary-hover)' : 'var(--text-light)' }}>{label}</span>
                  <span>Today {time}</span>
                </div>
                <ChatBubble 
                  role={msg.role} 
                  content={msg.content} 
                  richContent={msg.richContent}
                />
              </div>
            );
          })}
          
          {isLoading && (
            <div className="processing-indicator">
              <Loader2 className="spinner" size={16} />
              <span>{loadingTexts[loadingTextIndex]}</span>
            </div>
          )}
        </div>
        
        <div className="copilot-suggestions">
          <AISuggestionChip text="📝 Log Interaction" onClick={() => handleSuggestionClick("Log today's meeting")} />
          <AISuggestionChip text="✏ Edit Interaction" onClick={() => handleSuggestionClick("Edit interaction 3 to add missing details")} />
          <AISuggestionChip text="🔍 Search Interactions" onClick={() => handleSuggestionClick("Search my previous conversations")} />
          <AISuggestionChip text="📄 Summarize Doctor" onClick={() => handleSuggestionClick("Summarize my previous meetings")} />
          <AISuggestionChip text="📅 Schedule Follow-up" onClick={() => handleSuggestionClick("Schedule a follow-up for next Friday")} />
        </div>

        <form className="copilot-input-area" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Ask CRM Copilot... Example: Log today's meeting..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}><Send size={16}/></button>
        </form>
      </div>
    </>
  );
};

export default CopilotPanel;
