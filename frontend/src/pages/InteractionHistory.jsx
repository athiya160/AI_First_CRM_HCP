import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openCopilot, sendMessage } from '../features/chatSlice';
import Timeline, { TimelineItem } from '../components/Timeline';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { SkeletonCard } from '../components/Skeleton';
import './InteractionHistory.css';
import { Calendar, Mail, Phone, Users, Sparkles, Search } from 'lucide-react';

const InteractionHistory = () => {
  const { logs: interactions, isLoadingLogs, error } = useSelector(state => state.interactions);
  const hcps = useSelector(state => state.hcps.list);
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [doctorFilter, setDoctorFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('');

  const filteredInteractions = interactions.filter(log => {
    const hcp = hcps.find(h => h.id === log.hcp_id) || {};
    const matchesSearch = log.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          hcp.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDoctor = doctorFilter ? log.hcp_id === parseInt(doctorFilter) : true;
    const matchesType = typeFilter ? log.type === typeFilter : true;
    
    let matchesDate = true;
    if (dateFilter) {
      const logDate = new Date(log.date);
      const now = new Date();
      if (dateFilter === '7') {
        matchesDate = (now - logDate) / (1000 * 60 * 60 * 24) <= 7;
      } else if (dateFilter === '30') {
        matchesDate = (now - logDate) / (1000 * 60 * 60 * 24) <= 30;
      }
    }
    
    return matchesSearch && matchesDoctor && matchesType && matchesDate;
  });

  const uniqueTypes = [...new Set(interactions.map(log => log.type).filter(Boolean))];

  const getIcon = (type) => {
    switch(type) {
      case 'Email': return <Mail size={16} />;
      case 'Call': return <Phone size={16} />;
      case 'Meeting': return <Users size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  return (
    <div className="history-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Interaction History</h1>
          <p>Review past engagements with your HCP network.</p>
        </div>
        <button 
          onClick={() => {
            dispatch(openCopilot());
            dispatch(sendMessage({ message: "Can you summarize my recent interaction history?", hcp_id: 1 }));
          }} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', 
            padding: '8px 16px', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer' 
          }}>
          <Sparkles size={16} /> Ask AI about this history
        </button>
      </header>

      <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search notes or doctors..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="filter-select">
          <option value="">All Doctors</option>
          {hcps.map(hcp => (
            <option key={hcp.id} value={hcp.id}>{hcp.name}</option>
          ))}
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="filter-select">
          <option value="">All Meeting Types</option>
          {uniqueTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select">
          <option value="">All Time</option>
          <option value="7">Past 7 Days</option>
          <option value="30">Past 30 Days</option>
        </select>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : isLoadingLogs ? (
        <div style={{ marginTop: '2rem' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredInteractions.length === 0 ? (
        <EmptyState title="No interactions found" description="Try clearing your filters or search query." />
      ) : (
        <Timeline>
          {filteredInteractions.map((log, i) => {
            const hcp = hcps.find(h => h.id === log.hcp_id) || { name: 'Unknown HCP' };
          return (
            <div key={log.id} className={`animate-fade-in stagger-${(i % 5) + 1}`}>
              <TimelineItem icon={getIcon(log.type)}>
                  <Card className="timeline-card">
                    <div className="timeline-card-header">
                      <div className="header-info">
                        <h3>{hcp.name}</h3>
                        <span className="date-time">
                          {new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <StatusBadge status={log.type} />
                    </div>
                    <p className="notes">{log.notes}</p>
                    
                    {log.summary && (
                      <div className="history-ai-insights" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                          <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>AI Analysis</h4>
                        </div>
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>{log.summary}</p>
                        
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {log.sentiment && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span>{log.sentiment.toLowerCase() === 'positive' ? '😊' : log.sentiment.toLowerCase() === 'negative' ? '😞' : '😐'}</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-dark)' }}>{log.sentiment}</span>
                            </div>
                          )}
                          {log.confidence && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span>🎯</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-dark)' }}>{log.confidence}% Confident</span>
                            </div>
                          )}
                        </div>
                        
                        {(log.entities?.length > 0 || log.action_items?.length > 0) && (
                          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {log.entities?.length > 0 && (
                              <div>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Entities</strong>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                                  {log.entities.map((e, idx) => (
                                    <span key={idx} style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border-light)' }}>{e}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {log.action_items?.length > 0 && (
                              <div>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Action Items</strong>
                                <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1rem', fontSize: '0.8rem' }}>
                                  {log.action_items.map((a, idx) => <li key={idx}>{a}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
              </TimelineItem>
            </div>
            );
          })}
        </Timeline>
      )}
    </div>
  );
};

export default InteractionHistory;
