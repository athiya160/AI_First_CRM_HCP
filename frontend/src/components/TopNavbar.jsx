import React from 'react';
import './TopNavbar.css';
import { Search, Bell, User } from 'lucide-react';

const TopNavbar = () => {
  return (
    <header className="top-navbar glass">
      <div className="search-bar">
        <Search size={18} className="text-muted" />
        <input type="text" placeholder="Search HCPs, interactions..." />
      </div>
      <div className="nav-actions">
        <button className="icon-btn"><Bell size={20} /></button>
        <div className="user-profile">
          <div className="avatar"><User size={18} /></div>
          <span>Jane Doe</span>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
