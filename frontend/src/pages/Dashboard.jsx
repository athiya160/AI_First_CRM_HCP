import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openCopilot } from '../features/chatSlice';
import KPICard from '../components/KPICard';
import DoctorCard from '../components/DoctorCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { SkeletonCard } from '../components/Skeleton';
import './Dashboard.css';
import { Users, Activity, Clock, Sparkles, Search, Filter } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { list: hcps, isLoading: hcpsLoading, error: hcpsError } = useSelector(state => state.hcps);
  const { logs: interactions, followUps, isLoadingTasks, error: interactionsError } = useSelector(state => state.interactions);

  // Local state for search & filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [specialtyFilter, setSpecialtyFilter] = React.useState('');

  const pendingTasks = followUps.filter(f => f.status === 'pending').length;

  const filteredHcps = hcps.filter(hcp => {
    const matchesSearch = hcp.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          hcp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = specialtyFilter ? hcp.specialty === specialtyFilter : true;
    return matchesSearch && matchesSpecialty;
  });

  const uniqueSpecialties = [...new Set(hcps.map(h => h.specialty).filter(Boolean))];

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Good Evening Athiya 👋</h1>
        <p>Here is your schedule and AI insights for today.</p>
      </header>
      
      {/* AI Suggestions Banner */}
      <div className="ai-banner glass">
        <div className="ai-banner-header">
          <Sparkles size={20} className="ai-icon" />
          <h3>Copilot Suggestions</h3>
        </div>
        <div className="ai-suggestions-list">
          <div className="ai-suggestion-card" onClick={() => dispatch(openCopilot())}>
            <h4>Call Dr Sarah</h4>
            <p>She recently engaged positively regarding the diabetes drug.</p>
          </div>
          <div className="ai-suggestion-card" onClick={() => dispatch(openCopilot())}>
            <h4>Follow up tomorrow</h4>
            <p>You have {pendingTasks} pending follow-ups due tomorrow.</p>
          </div>
          <div className="ai-suggestion-card" onClick={() => dispatch(openCopilot())}>
            <h4>New Opportunity</h4>
            <p>Dr Marcus might be interested in the upcoming neurology trial.</p>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <KPICard 
          title="Total Network" 
          value={hcps.length} 
          icon={<Users size={20} />} 
        />
        <KPICard 
          title="Total Interactions" 
          value={interactions.length} 
          icon={<Activity size={20} />} 
        />
        <KPICard 
          title="Upcoming Follow Ups" 
          value={pendingTasks} 
          icon={<Clock size={20} />} 
          highlight={true} 
        />
      </div>

      <div className="split-view">
        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Your Network</h2>
            <div className="filter-controls" style={{ display: 'flex', gap: '8px' }}>
              <div className="search-box">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search doctors..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className="filter-select">
                <option value="">All Specialties</option>
                {uniqueSpecialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="list-container">
            {hcpsError ? (
               <ErrorState message={hcpsError} />
            ) : hcpsLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredHcps.length === 0 ? (
              <EmptyState title="No doctors found" description="Try adjusting your search or specialty filter." />
            ) : (
              filteredHcps.map((hcp, i) => (
                <div key={hcp.id} className={`animate-fade-in stagger-${(i % 5) + 1}`}>
                  <DoctorCard 
                    name={hcp.name}
                    specialty={hcp.specialty}
                    email={hcp.email}
                  />
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="list-container">
            {interactionsError ? (
               <ErrorState message={interactionsError} />
            ) : isLoadingTasks ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : followUps.filter(f => f.status === 'pending').length === 0 ? (
              <EmptyState title="No pending tasks" description="You're all caught up for today!" />
            ) : (
              followUps.filter(f => f.status === 'pending').map((task, i) => (
                <div key={task.id} className={`task-item glass animate-fade-in stagger-${(i % 5) + 1}`}>
                  <div className="task-indicator"></div>
                  <div>
                    <h4>{task.description}</h4>
                    <p>{new Date(task.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
