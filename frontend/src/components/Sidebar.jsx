import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toggleCopilot } from '../features/chatSlice';
import { LayoutDashboard, History, ListTodo, FilePlus2, Settings, Sparkles } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const dispatch = useDispatch();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/log', label: 'Log Interaction', icon: <FilePlus2 size={20} /> },
    { path: '/history', label: 'History', icon: <History size={20} /> },
    { path: '/tasks', label: 'Follow-ups', icon: <ListTodo size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <div className="logo-glow"></div>
        <h2>CRM Copilot</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        <div style={{ marginTop: 'auto', marginBottom: '16px' }}></div>

        <button 
          className="nav-item copilot-toggle" 
          onClick={() => dispatch(toggleCopilot())}
          style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', cursor: 'pointer' }}
        >
          <Sparkles size={20} className="text-primary" />
          <span style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>Ask Copilot</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
