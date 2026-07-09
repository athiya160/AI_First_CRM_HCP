import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, toggleCopilot, closeCopilot, sendMessage } from '../features/chatSlice';
import ChatBubble from './ChatBubble';
import AISuggestionChip from './AISuggestionChip';
import './CopilotPanel.css';
import { Send, Sparkles, X, Loader2 } from 'lucide-react';

const CopilotPanel = () => {
  const { messages, isOpen, isLoading } = useSelector(state => state.chat);
  const dispatch = useDispatch();
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message to UI immediately
    dispatch(addMessage({ role: 'user', content: input }));
    
    // Send to LangGraph API
    dispatch(sendMessage({ message: input, hcp_id: 1 })); // Default HCP ID for now or grab from selectedHcp
    
    setInput('');
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
          <div className="header-title">
            <Sparkles className="header-icon" size={20} />
            <h3>CRM Copilot</h3>
          </div>
          <button className="close-btn" onClick={() => dispatch(closeCopilot())}>
            <X size={20} />
          </button>
        </div>
        
        <div className="copilot-stream">
          {messages.map(msg => (
             <ChatBubble 
               key={msg.id} 
               role={msg.role} 
               content={msg.content} 
               richContent={msg.richContent}
             />
          ))}
          
          {isLoading && (
            <div className="processing-indicator">
              <Loader2 className="spinner" size={16} />
              <span>Thinking... executing tool...</span>
            </div>
          )}
        </div>
        
        <div className="copilot-suggestions">
          <AISuggestionChip text="Summarize my day" onClick={() => setInput("Summarize my day")} />
          <AISuggestionChip text="Any pending tasks?" onClick={() => setInput("Any pending tasks?")} />
        </div>

        <form className="copilot-input-area" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Ask Copilot..."
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
