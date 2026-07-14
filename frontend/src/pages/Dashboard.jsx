import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openCopilot } from '../features/chatSlice';
import KPICard from '../components/KPICard';
import DoctorCard from '../components/DoctorCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { SkeletonCard } from '../components/Skeleton';
import './Dashboard.css';
import { Users, Activity, Clock, Sparkles, Search, Filter, Smile, Target, TrendingUp, Calendar as CalendarIcon, ArrowRight, MessageSquare, Briefcase, Zap } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { list: hcps, isLoading: hcpsLoading, error: hcpsError } = useSelector(state => state.hcps);
  const { logs: interactions, followUps, isLoadingTasks, error: interactionsError } = useSelector(state => state.interactions);

  // Local state for search & filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [specialtyFilter, setSpecialtyFilter] = React.useState('');

  const pendingTasks = followUps.filter(f => f.status === 'pending').length;

  const aiInsightsCount = interactions.filter(i => i.summary).length;
  
  // Calculate today's insights
  const today = new Date().toISOString().split('T')[0];
  const todayInsights = interactions.filter(i => i.summary && i.date && i.date.startsWith(today)).length;
  
  const positiveInteractions = interactions.filter(i => i.sentiment && i.sentiment.toLowerCase() === 'positive').length;
  const neutralInteractions = interactions.filter(i => i.sentiment && i.sentiment.toLowerCase() === 'neutral').length;
  const negativeInteractions = interactions.filter(i => i.sentiment && i.sentiment.toLowerCase() === 'negative').length;
  const totalSentiment = positiveInteractions + neutralInteractions + negativeInteractions || 1;
  
  const interactionsWithConfidence = interactions.filter(i => i.confidence);
  const averageConfidence = interactionsWithConfidence.length > 0 
    ? Math.round(interactionsWithConfidence.reduce((acc, curr) => acc + curr.confidence, 0) / interactionsWithConfidence.length) 
    : 0;

  // Interaction Trends
  const meetingCount = interactions.filter(i => i.type === 'Meeting').length;
  const callCount = interactions.filter(i => i.type === 'Call').length;
  const emailCount = interactions.filter(i => i.type === 'Email').length;
  const visitCount = interactions.filter(i => i.type === 'Visit').length;
  const maxInteraction = Math.max(meetingCount, callCount, emailCount, visitCount, 1);

  const filteredHcps = hcps.filter(hcp => {
    const matchesSearch = hcp.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          hcp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = specialtyFilter ? hcp.specialty === specialtyFilter : true;
    return matchesSearch && matchesSpecialty;
  });

  const uniqueSpecialties = [...new Set(hcps.map(h => h.specialty).filter(Boolean))];

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour >= 0 && hour < 12) greeting = "Good Morning";
  else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>{greeting}, Athiya 👋</h1>
        <p>You have <strong>{pendingTasks} follow-ups</strong> today. AI generated <strong>{aiInsightsCount} insights</strong> this week.</p>
      </header>
      
      {/* Dynamic Copilot Suggestions Banner */}
      <div className="ai-banner glass">
        <div className="ai-banner-header">
          <Sparkles size={20} className="ai-icon" />
          <h3>Copilot Suggestions</h3>
        </div>
        <div className="ai-suggestions-list">
          <div className="ai-suggestion-card warning" onClick={() => dispatch(openCopilot())}>
            <div className="card-top">
              <Zap size={14} /> <span>High Priority</span>
            </div>
            <h4>Call Dr Sarah</h4>
            <p>Positive engagement recently. Follow-up is overdue.</p>
          </div>
          <div className="ai-suggestion-card success" onClick={() => dispatch(openCopilot())}>
            <div className="card-top">
              <TrendingUp size={14} /> <span>Opportunity</span>
            </div>
            <h4>Dr Marcus</h4>
            <p>Interested in Neurology trial. Schedule a meeting.</p>
          </div>
          <div className="ai-suggestion-card info" onClick={() => dispatch(openCopilot())}>
            <div className="card-top">
              <Briefcase size={14} /> <span>Product Reminder</span>
            </div>
            <h4>Diabetes Campaign</h4>
            <p>5 key doctors haven't been visited this quarter.</p>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <KPICard 
          title="Healthcare Professionals" 
          value={hcps.length} 
          icon={<Users size={20} />} 
        />
        <KPICard 
          title="Interactions" 
          value={interactions.length} 
          icon={<Activity size={20} />} 
        />
        <KPICard 
          title="Pending Follow-ups" 
          value={pendingTasks} 
          icon={<Clock size={20} />} 
          highlight={true} 
        />
        <KPICard 
          title="AI Insights Generated" 
          value={
            <div style={{display: 'flex', alignItems: 'baseline', gap: '8px'}}>
              {aiInsightsCount} 
              {todayInsights > 0 && <span style={{fontSize: '0.8rem', color: '#10b981'}}>↑ +{todayInsights} Today</span>}
            </div>
          } 
          icon={<Sparkles size={20} />} 
        />
        <KPICard 
          title="Positive AI Insights" 
          value={positiveInteractions} 
          icon={<Smile size={20} />} 
        />
        <KPICard 
          title="Average AI Confidence" 
          value={`${averageConfidence}%`} 
          icon={<Target size={20} />} 
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="charts-row">
        <div className="chart-card glass">
          <h3>Interaction Trend</h3>
          <div className="chart-bars">
            <div className="bar-row">
              <span className="bar-label">Meeting</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(meetingCount/maxInteraction)*100}%`, backgroundColor: 'var(--primary)' }}></div>
              </div>
              <span className="bar-value">{meetingCount}</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Call</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(callCount/maxInteraction)*100}%`, backgroundColor: '#10b981' }}></div>
              </div>
              <span className="bar-value">{callCount}</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Email</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(emailCount/maxInteraction)*100}%`, backgroundColor: '#8b5cf6' }}></div>
              </div>
              <span className="bar-value">{emailCount}</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Visit</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(visitCount/maxInteraction)*100}%`, backgroundColor: '#f59e0b' }}></div>
              </div>
              <span className="bar-value">{visitCount}</span>
            </div>
          </div>
        </div>

        <div className="chart-card glass">
          <h3>Sentiment Distribution</h3>
          <div className="sentiment-stats">
            <div className="sentiment-stat">
              <span className="emoji">😊</span>
              <div className="details">
                <span className="label">Positive</span>
                <span className="value">{Math.round((positiveInteractions/totalSentiment)*100)}%</span>
              </div>
            </div>
            <div className="sentiment-stat">
              <span className="emoji">😐</span>
              <div className="details">
                <span className="label">Neutral</span>
                <span className="value">{Math.round((neutralInteractions/totalSentiment)*100)}%</span>
              </div>
            </div>
            <div className="sentiment-stat">
              <span className="emoji">😟</span>
              <div className="details">
                <span className="label">Negative</span>
                <span className="value">{Math.round((negativeInteractions/totalSentiment)*100)}%</span>
              </div>
            </div>
          </div>
          
          {/* AI Activity Feed */}
          <div className="ai-activity-feed">
            <h4 style={{fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '1.5rem', marginBottom: '0.5rem', textTransform: 'uppercase'}}>Recent AI Activity</h4>
            <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'var(--text-dark)'}}>
              <li style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px'}}><Sparkles size={14} color="var(--primary)"/> ✓ Meeting logged</li>
              <li style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px'}}><Sparkles size={14} color="var(--primary)"/> ✓ Summary generated</li>
              <li style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px'}}><Sparkles size={14} color="var(--primary)"/> ✓ Follow-up created</li>
              <li style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px'}}><Sparkles size={14} color="var(--primary)"/> ✓ Sentiment detected</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="split-view">
        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Top Doctors</h2>
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
          <div className="list-container top-doctors-list">
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
              filteredHcps.map((hcp, i) => {
                const docInteractions = interactions.filter(int => int.hcp_id === hcp.id);
                const lastInteraction = docInteractions.length > 0 ? docInteractions[0] : null;
                const nextFollowup = followUps.find(f => f.hcp_id === hcp.id && f.status === 'pending');
                
                return (
                  <div key={hcp.id} className={`top-doctor-card glass animate-fade-in stagger-${(i % 5) + 1}`}>
                    <div className="doc-header">
                      <h3>{hcp.name}</h3>
                      <div className="stars">★★★★★</div>
                    </div>
                    <p className="specialty">{hcp.specialty}</p>
                    
                    <div className="doc-stats">
                      <div className="stat-col">
                        <span className="stat-label">Last Interaction</span>
                        <span className="stat-value" style={{color: lastInteraction?.sentiment === 'Positive' ? '#10b981' : 'var(--text-dark)'}}>
                          {lastInteraction ? lastInteraction.sentiment || 'Neutral' : 'None'}
                        </span>
                      </div>
                      <div className="stat-col">
                        <span className="stat-label">Next Follow-up</span>
                        <span className="stat-value">
                          {nextFollowup ? new Date(nextFollowup.date).toLocaleDateString() : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>Pending Tasks</h2>
          <div className="list-container">
            {interactionsError ? (
               <ErrorState message={interactionsError} />
            ) : isLoadingTasks ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : followUps.filter(f => f.status === 'pending').length === 0 ? (
              <EmptyState title="No pending tasks" description="You're all caught up for today! Use Copilot to schedule more." />
            ) : (
              followUps.filter(f => f.status === 'pending').map((task, i) => (
                <div key={task.id} className={`task-item glass animate-fade-in stagger-${(i % 5) + 1}`}>
                  <div className="task-indicator"></div>
                  <div>
                    <h4>{task.description}</h4>
                    <p style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <CalendarIcon size={12}/> {new Date(task.date).toLocaleDateString()}
                    </p>
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
