import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LogInteraction from './pages/LogInteraction';
import InteractionHistory from './pages/InteractionHistory';
import FollowUps from './pages/FollowUps';
import { Toaster } from 'react-hot-toast';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogInteraction />} />
          <Route path="/history" element={<InteractionHistory />} />
          <Route path="/tasks" element={<FollowUps />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
