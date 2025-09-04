import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/pages/Homepage';
import Dashboard from './components/pages/Dashboard';
import Lesson from './components/pages/Lesson';
import Feedback from './components/pages/Feedback';
import GrammarHub from './components/GrammarHub';
import Layout from './components/layout/Layout';
import ReactGA from 'react-ga4';

// Initialize Google Analytics
ReactGA.initialize("G-LF025F2XRT");

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/lesson/:moduleId" element={<Lesson />} />
          <Route path="/reference" element={<GrammarHub />} />
          <Route path="/feedback" 
          element={<Feedback />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
