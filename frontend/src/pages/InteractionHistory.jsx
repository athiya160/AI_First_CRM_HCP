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
