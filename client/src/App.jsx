import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LevelPage from './components/LevelPage';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/level/:levelId" element={<LevelPage />} />
        <Route path="*" element={<div className="text-center mt-5">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;