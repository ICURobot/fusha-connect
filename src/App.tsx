import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/pages/Homepage';
import Dashboard from './components/pages/Dashboard';
import Lesson from './components/pages/Lesson';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson" element={<Lesson />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
