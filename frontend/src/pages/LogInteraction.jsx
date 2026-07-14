import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import { useDispatch, useSelector } from 'react-redux';
import { addInteraction } from '../features/interactionSlice';
import { sendMessage, addMessage } from '../features/chatSlice';
import { selectHcp } from '../features/hcpSlice';
import FormCard from '../components/FormCard';
import Input from '../components/Input';
import Button from '../components/Button';
import DoctorProfileCard from '../components/DoctorProfileCard';
import Timeline, { TimelineItem } from '../components/Timeline';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import ChatBubble from '../components/ChatBubble';
import './LogInteraction.css';
import { Sparkles, Calendar, Mail, Phone, Users, CheckCircle2, Send, Loader2, X } from 'lucide-react';

const LogInteraction = () => {
  const dispatch = useDispatch();
  const hcps = useSelector(state => state.hcps.list);
  const interactions = useSelector(state => state.interactions.logs);
  const followUps = useSelector(state => state.interactions.followUps);
  const { messages, isLoading: chatLoading } = useSelector(state => state.chat);
  
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'chat'
  
  const [formData, setFormData] = useState({
    hcp_id: '',
    type: 'Meeting',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [aiData, setAiData] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const selectedHcpData = hcps.find(h => h.id.toString() === formData.hcp_id);
  const hcpInteractions = interactions.filter(i => i.hcp_id.toString() === formData.hcp_id);
  const hcpFollowUps = followUps.filter(f => f.hcp_id.toString() === formData.hcp_id);

  useEffect(() => {
    if (selectedHcpData) {
      dispatch(selectHcp(selectedHcpData));
      // Tell the Copilot Chat about the selection
      dispatch(addMessage({ 
        role: 'ai', 
        content: `I see you selected **Dr. ${selectedHcpData.name}**. How can I assist you with this interaction?` 
      }));
    } else {
      dispatch(selectHcp(null));
    }
  }, [selectedHcpData, dispatch]);

  // Auto-generate AI summary
  useEffect(() => {
    const generateSummary = async () => {
      if (formData.notes.trim().length < 20) {
        setAiData(null);
        return;
      }

      setIsGenerating(true);

      try {
        const response = await axiosClient.post("/interactions/analyze", {
          notes: `Doctor: ${selectedHcpData?.name || ""}\nInteraction Type: ${formData.type}\nDate: ${formData.date}\nNotes: ${formData.notes}`
        });

        const ai = response.data;
        setAiData({
          summary: ai.summary || '',
          sentiment: ai.sentiment || 'Neutral',
          confidence: ai.confidence || 0,
          entities: ai.entities || [],
          action_items: ai.action_items || []
        });
      } catch (err) {
        console.error(err);
        setAiData(null);
      }

      setIsGenerating(false);
    };

    const timer = setTimeout(generateSummary, 1000);
    return () => clearTimeout(timer);
  }, [formData.notes, formData.type, formData.date, selectedHcpData]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (!formData.hcp_id) {
      setValidationError('Please select a Doctor from the network.');
      return;
    }
    if (!formData.date) {
      setValidationError('Please select a valid date.');
      return;
    }
    if (formData.notes.trim().length < 5) {
      setValidationError('Notes must be at least 5 characters long.');
      return;
    }

    dispatch(addInteraction({ 
      ...formData, 
      ...aiData 
    }));
    toast.success('Interaction Logged successfully!');
    setFormData({ ...formData, notes: '' });
    setAiData(null);
  };

  const generateNotes = () => {
    setShowAIPrompt(false);
    if (!selectedHcpData) {
      toast.error("Please select a doctor first");
      return;
    }
    setFormData(prev => ({
      ...prev,
      notes: `Met with Dr. ${selectedHcpData.name} on ${formData.date} regarding recent updates. Dr. ${selectedHcpData.name} showed interest in our new treatments and requested follow-up information next week. Overall, the ${formData.type.toLowerCase()} was very positive.`
    }));
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    // Using the same chat functionality built in chatSlice
    dispatch(sendMessage({ message: chatInput, hcp_id: formData.hcp_id || null }));
    setChatInput('');
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Email': return <Mail size={16} />;
      case 'Call': return <Phone size={16} />;
      case 'Meeting': return <Users size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  return (
    <div className="log-interaction-page">
      <header className="page-header">
        <h1>Log Interaction</h1>
        <p>Record details of your recent engagement.</p>
        
        <div className="tabs-container" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <button 
            className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
            style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'form' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'form' ? 'var(--primary)' : 'var(--text-light)', fontWeight: activeTab === 'form' ? '600' : '400', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Structured Form
          </button>
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'chat' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'chat' ? 'var(--primary)' : 'var(--text-light)', fontWeight: activeTab === 'chat' ? '600' : '400', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            AI Copilot Chat
          </button>
        </div>
      </header>

      <div className="split-layout">
        {/* Left: Input Area */}
        {activeTab === 'form' ? (
          <FormCard 
            title="Interaction Details" 
            onSubmit={handleFormSubmit}
          >
            {validationError && (
              <div className="validation-error" style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {validationError}
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Doctor</label>
              <select 
                className="input-field" 
                value={formData.hcp_id} 
                onChange={(e) => setFormData({...formData, hcp_id: e.target.value})}
                required
              >
                <option value="">-- Choose HCP --</option>
                {hcps.map(hcp => (
                  <option key={hcp.id} value={hcp.id}>{hcp.name}</option>
                ))}
              </select>
            </div>
            
            <div className="input-group">
              <label className="input-label">Interaction</label>
              <div className="type-pills">
                {[{type: 'Meeting', icon: '👥'}, {type: 'Call', icon: '📞'}, {type: 'Email', icon: '✉️'}, {type: 'Visit', icon: '🏥'}].map(({type, icon}) => (
                  <div 
                    key={type} 
                    className={`pill ${formData.type === type ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, type})}
                  >
                    {icon} {type}
                  </div>
                ))}
              </div>
            </div>
            
            <Input 
              label="Date" 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Notes</label>
                {!formData.notes && selectedHcpData && (
                  <button type="button" onClick={generateNotes} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--primary-light, #e0e7ff)', color: 'var(--primary)', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                    <Sparkles size={12} />
                    Will you type, or should I generate notes?
                  </button>
                )}
              </div>
              <Input 
                multiline 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="What was discussed?"
                required
              />
            </div>

            {/* Beautiful AI Insights Display */}
            {(aiData || isGenerating) && (
              <div className="ai-insights-container" style={{ marginTop: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <Sparkles size={18} className={isGenerating ? "spin-animation" : ""} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>AI Insights</h3>
                </div>
                
                {isGenerating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', padding: '1rem 0' }}>
                    <Loader2 size={16} className="spin-animation" />
                    <span>Analyzing notes...</span>
                  </div>
                ) : aiData ? (
                  <div className="ai-insights-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Summary</h4>
                      <p style={{ margin: 0, color: 'var(--text-dark)', fontSize: '0.95rem', lineHeight: 1.5 }}>{aiData.summary}</p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>{aiData.sentiment?.toLowerCase() === 'positive' ? '😊' : aiData.sentiment?.toLowerCase() === 'negative' ? '😞' : '😐'}</span>
                          <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sentiment</h4>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-dark)', fontWeight: '600' }}>{aiData.sentiment || 'Neutral'}</p>
                      </div>
                      <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>🎯</span>
                          <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</h4>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-dark)', fontWeight: '600' }}>{aiData.confidence || 0}%</p>
                      </div>
                    </div>

                    {aiData.entities?.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem' }}>💊</span>
                          <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medical Entities</h4>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                          {aiData.entities.map((entity, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{entity}</li>)}
                        </ul>
                      </div>
                    )}

                    {aiData.action_items?.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem' }}>📋</span>
                          <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action Items</h4>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-dark)', fontSize: '0.95rem', listStyleType: 'none', marginLeft: '-1.5rem' }}>
                          {aiData.action_items.map((item, i) => (
                            <li key={i} style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                              <CheckCircle2 size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            <Button type="submit" className="submit-btn" style={{ marginTop: '1.5rem' }}>Save Interaction</Button>
          </FormCard>
        ) : (
          <Card className="chat-tab-container" style={{ display: 'flex', flexDirection: 'column', height: '600px', padding: 0, overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-main)' }}>
              {messages.map(msg => (
                <ChatBubble 
                  key={msg.id} 
                  role={msg.role} 
                  content={msg.content} 
                  richContent={msg.richContent}
                />
              ))}
              {chatLoading && (
                <div className="processing-indicator" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.9rem', padding: '1rem' }}>
                  <Loader2 className="spin-animation" size={16} />
                  <span>Thinking... executing tools...</span>
                </div>
              )}
            </div>
            
            <form onSubmit={handleChatSubmit} style={{ display: 'flex', padding: '1rem', borderTop: '1px solid var(--border-light)', background: 'var(--bg-card)', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="E.g. Log today's meeting with Dr Sarah"
                style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '8px', outline: 'none' }}
                disabled={chatLoading}
              />
              <button 
                type="submit" 
                disabled={chatLoading || !chatInput.trim()}
                style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={18} />
              </button>
            </form>
          </Card>
        )}

        {/* Right: Context Panel */}
        <div className="context-panel">
          {selectedHcpData ? (
            <>
              <DoctorProfileCard hcp={selectedHcpData} />
              
              <div className="context-timeline-wrapper glass">
                <h3>Recent History</h3>
                <Timeline>
                  {hcpFollowUps.map(f => (
                    <TimelineItem key={`f-${f.id}`} icon={<CheckCircle2 size={16} />}>
                      <Card className="timeline-card compact">
                        <div className="header-info">
                          <h4>Follow Up: {f.description}</h4>
                        </div>
                        <StatusBadge status={f.status} />
                      </Card>
                    </TimelineItem>
                  ))}
                  {hcpInteractions.map(log => (
                    <TimelineItem key={`l-${log.id}`} icon={getIcon(log.type)}>
                      <Card className="timeline-card compact">
                        <div className="timeline-card-header">
                          <div className="header-info">
                            <h4>{log.type}</h4>
                            <span className="date-time">
                              {new Date(log.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="notes-snippet">{log.notes.substring(0, 60)}...</p>
                      </Card>
                    </TimelineItem>
                  ))}
                  {hcpInteractions.length === 0 && hcpFollowUps.length === 0 && (
                     <p className="no-history">No history found for this doctor.</p>
                  )}
                </Timeline>
              </div>
            </>
          ) : (
            <div className="empty-context glass" style={{ textAlign: 'left', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <Users size={28} className="empty-icon" style={{ margin: 0, color: 'var(--primary)' }} />
                <h3 style={{ margin: 0 }}>Select a Healthcare Professional</h3>
              </div>
              
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Once selected you'll see:</p>
              
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-dark)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} style={{color: 'var(--primary)'}} /> Doctor Profile</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} style={{color: 'var(--primary)'}} /> Previous Meetings</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} style={{color: 'var(--primary)'}} /> AI Insights</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} style={{color: 'var(--primary)'}} /> Follow-up Timeline</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} style={{color: 'var(--primary)'}} /> Interaction History</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogInteraction;
