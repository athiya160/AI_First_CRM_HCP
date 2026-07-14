import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import CopilotPanel from './CopilotPanel';
import { fetchHcps } from '../features/hcpSlice';
import { fetchInteractions, fetchFollowUps } from '../features/interactionSlice';

const Layout = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchHcps());
    dispatch(fetchInteractions());
    dispatch(fetchFollowUps());
  }, [dispatch]);
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopNavbar />
        <main className="main-content animate-fade-in" style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <CopilotPanel />
    </div>
  );
};

export default Layout;
