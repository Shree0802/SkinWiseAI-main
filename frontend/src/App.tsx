import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ResultsPage } from './pages/ResultsPage';
import { RoutinePage } from './pages/RoutinePage';
import { ShopPage } from './pages/ShopPage';
import { JournalPage } from './pages/JournalPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-cream-100 text-stone-800 font-sans selection:bg-lavender-200 selection:text-lavender-800">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/analyze" element={<AnalysisPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/results/:reportId" element={<ResultsPage />} />
            <Route path="/routine" element={<RoutinePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
