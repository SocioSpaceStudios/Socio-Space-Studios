
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import ContentPlanner from './pages/Calendar';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import UGCJobs from './pages/UGCJobs';
import ScriptsGenerator from './pages/ScriptsGenerator';
import MediaKit from './pages/MediaKit';
import Communications from './pages/Communications';
import Team from './pages/Team';
import UserProfile from './pages/UserProfile';
import TemplatesLibrary from './pages/TemplatesLibrary';
import AIAssist from './pages/AIAssist';

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="content-planner" element={<ContentPlanner />} />
            <Route path="brand-outreach" element={<Campaigns />} />
            <Route path="scripts" element={<ScriptsGenerator />} />
            <Route path="templates" element={<TemplatesLibrary />} />
            <Route path="ugc-jobs" element={<UGCJobs />} />
            <Route path="finance" element={<Payments />} />
            <Route path="media-kit" element={<MediaKit />} />
            <Route path="communications" element={<Communications />} />
            <Route path="ai-assist" element={<AIAssist />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
};

export default App;
