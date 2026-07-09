import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addInteraction } from '../features/interactionSlice';
import FormCard from '../components/FormCard';
import Input from '../components/Input';
import Button from '../components/Button';
import DoctorProfileCard from '../components/DoctorProfileCard';
import Timeline, { TimelineItem } from '../components/Timeline';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import './LogInteraction.css';
import { Sparkles, Calendar, Mail, Phone, Users, CheckCircle2 } from 'lucide-react';

const LogInteraction = () => {
  const dispatch = useDispatch();
  const hcps = useSelector(state => state.hcps.list);
  const interactions = useSelector(state => state.interactions.logs);
  const followUps = useSelector(state => state.interactions.followUps);
  
  const [formData, setFormData] = useState({
    hcp_id: '',
    type: 'Meeting',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    aiSummary: ''
  });
  
  const [validationError, setValidationError] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedHcpData = hcps.find(h => h.id.toString() === formData.hcp_id);
  const hcpInteractions = interactions.filter(i => i.hcp_id.toString() === formData.hcp_id);
  const hcpFollowUps = followUps.filter(f => f.hcp_id.toString() === formData.hcp_id);

  // Auto-generate AI summary mock logic
  useEffect(() => {
    if (formData.notes.length > 20) {
      setIsGenerating(true);
      const timer = setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          aiSummary: `Confidence: 95%\n\nDetected Entities:\n- Doctor: ${selectedHcpData?.name || 'Unknown'}\n- Topic: Medicine\n- Date: Today\n\nSummary:\nTopic discussed: ${prev.notes.substring(0, 30)}...\nSentiment: Positive\nAction Items:\n- Schedule follow up.`
        }));
        setIsGenerating(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setFormData(prev => ({ ...prev, aiSummary: '' }));
    }
  }, [formData.notes, selectedHcpData]);

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

    dispatch(addInteraction({ ...formData, notes: formData.notes + (formData.aiSummary ? `\n\nAI Summary: ${formData.aiSummary}` : '') }));
    toast.success('Interaction Logged successfully!');
    setFormData({ ...formData, notes: '', aiSummary: '' });
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
      </header>

      <div className="split-layout">
        {/* Left: Structured Form */}
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
              {['Meeting', 'Call', 'Email', 'Visit'].map(type => (
                <div 
                  key={type} 
                  className={`pill ${formData.type === type ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, type})}
                >
                  {type}
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

          <Input 
            label="Notes" 
            multiline 
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="What was discussed?"
            required
          />

          <div className="input-group">
            <label className="input-label ai-summary-label">
              <Sparkles size={16} className={isGenerating ? "spin-animation" : ""} /> 
              AI Summary (Generated)
            </label>
            <textarea 
              className="input-field read-only-summary" 
              value={formData.aiSummary} 
              readOnly 
              placeholder={isGenerating ? "Generating summary..." : "Start typing notes to generate AI summary..."}
              rows={10}
            />
          </div>

          <Button type="submit" className="submit-btn">Save Interaction</Button>
        </FormCard>

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
            <div className="empty-context glass">
              <Users size={48} className="empty-icon" />
              <h3>Select a Doctor</h3>
              <p>Choose an HCP from the form to view their profile and interaction history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogInteraction;
