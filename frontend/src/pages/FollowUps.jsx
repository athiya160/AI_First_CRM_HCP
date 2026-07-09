import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFollowUpStatus } from '../features/interactionSlice';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { SkeletonCard } from '../components/Skeleton';
import './FollowUps.css';
import { CheckCircle2, Circle, Sparkles, Search } from 'lucide-react';

const FollowUps = () => {
  const { followUps, isLoadingTasks, error } = useSelector(state => state.interactions);
  const hcps = useSelector(state => state.hcps.list);
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [doctorFilter, setDoctorFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const filteredFollowUps = followUps.filter(task => {
    const hcp = hcps.find(h => h.id === task.hcp_id) || {};
    const matchesSearch = task.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          hcp.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDoctor = doctorFilter ? task.hcp_id === parseInt(doctorFilter) : true;
    const matchesStatus = statusFilter !== 'all' ? task.status === statusFilter : true;
    
    return matchesSearch && matchesDoctor && matchesStatus;
  });

  const handleToggle = (id) => {
    dispatch(toggleFollowUpStatus(id));
  };

  return (
    <div className="follow-ups-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Follow-ups</h1>
          <p>Manage your pending and completed tasks.</p>
        </div>
        <button 
          onClick={() => dispatch({ type: 'chat/openCopilot' })} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', 
            padding: '8px 16px', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer' 
          }}>
          <Sparkles size={16} /> Generate reminder with AI
        </button>
      </header>

      <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search tasks or doctors..." 
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

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : isLoadingTasks ? (
        <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
          <div style={{flex: 1}}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div style={{flex: 1}}>
            <SkeletonCard />
          </div>
        </div>
      ) : filteredFollowUps.length === 0 ? (
        <EmptyState title="No follow-ups found" description="Try adjusting your filters or search query." />
      ) : (
        <div className="kanban-board">
          {/* Pending Column */}
          {(statusFilter === 'all' || statusFilter === 'pending') && (
          <div className="kanban-column">
            <div className="column-header">
              <h2>Pending</h2>
              <StatusBadge status="pending" />
            </div>
            <div className="task-list-full">
              {filteredFollowUps.filter(f => f.status === 'pending').map((task, i) => {
              const hcp = hcps.find(h => h.id === task.hcp_id);
              return (
                <Card key={task.id} className={`task-card pending animate-fade-in stagger-${(i % 5) + 1}`}>
                  <div className="task-check" onClick={() => handleToggle(task.id)}>
                    <Circle size={22} />
                  </div>
                  <div className="task-details">
                    <h4>{task.description}</h4>
                    <p className="hcp-name">{hcp?.name || 'Unknown'}</p>
                    <span className="due-date">Due: {new Date(task.date).toLocaleDateString()}</span>
                  </div>
                </Card>
              );
              })}
            </div>
          </div>
          )}

          {/* Completed Column */}
          {(statusFilter === 'all' || statusFilter === 'completed') && (
          <div className="kanban-column">
            <div className="column-header">
              <h2>Completed</h2>
              <StatusBadge status="completed" />
            </div>
            <div className="task-list-full">
              {filteredFollowUps.filter(f => f.status === 'completed').map((task, i) => {
              const hcp = hcps.find(h => h.id === task.hcp_id);
              return (
                <Card key={task.id} className={`task-card completed animate-fade-in stagger-${(i % 5) + 1}`}>
                  <div className="task-check checked" onClick={() => handleToggle(task.id)}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div className="task-details">
                    <h4>{task.description}</h4>
                    <p className="hcp-name">{hcp?.name || 'Unknown'}</p>
                  </div>
                </Card>
              );
              })}
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FollowUps;
