import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Homepage from './components/pages/Homepage';
import Dashboard from './components/pages/Dashboard';
import Lesson from './components/pages/Lesson';
import Feedback from './components/pages/Feedback';
import Layout from './components/layout/Layout';
import ReactGA from 'react-ga4';

// Initialize Google Analytics
ReactGA.initialize("G-LF025F2XRT");

// Component to track page views
function PageTracker() {
  const location = useLocation();
  
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);
  
  return null;
}

function App() {
  return (
    <Router>
      <PageTracker />
      <Layout>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/lesson/:moduleId" element={<Lesson />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
