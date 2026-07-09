import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, sendMessage } from '../features/chatSlice';
import ChatBubble from '../components/ChatBubble';
import AISuggestionChip from '../components/AISuggestionChip';
import './AIChat.css';
import { Send, Sparkles } from 'lucide-react';

const AIChat = () => {
  const { messages, isLoading } = useSelector(state => state.chat);
  const dispatch = useDispatch();
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    dispatch(addMessage({ role: 'user', content: input }));
    
    dispatch(sendMessage({ message: input, hcp_id: 1 }));
    
    setInput('');
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  return (
    <div className="ai-chat-page">
      <div className="chat-container glass">
        <div className="chat-header-full">
          <Sparkles className="glow-icon" />
          <div>
            <h1>CRM Assistant</h1>
            <p>Ask me anything about your network, history, or pipeline.</p>
          </div>
        </div>
        
        <div className="chat-stream">
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
              <span>Thinking... analyzing CRM data...</span>
            </div>
          )}
        </div>
        
        <div className="full-suggestions">
          <AISuggestionChip text="Show pending follow-ups" onClick={() => handleSuggestion("Show pending follow-ups")} />
          <AISuggestionChip text="Who haven't I seen this month?" onClick={() => handleSuggestion("Who haven't I seen this month?")} />
          <AISuggestionChip text="Generate weekly report" onClick={() => handleSuggestion("Generate weekly report")} />
        </div>

        <form className="chat-input-wrapper" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
