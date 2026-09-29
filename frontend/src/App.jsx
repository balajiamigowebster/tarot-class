import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/dashboard/Dashboard';
import VideoClasses from './pages/VideoClasses';
import StudyMaterial from './pages/StudyMaterial';
import Navbar from './components/Navbar';
import SyllabusCategoryPage from './pages/SyllabusCategoryPage';
import LiveClassManager from './components/dashboard/LiveClassManager';
import LiveClassRoom from './pages/LiveClassRoom';
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  useEffect(() => {
    AOS.init({ 
      duration: 800, 
      once: true 
    });
  }, []);

  return (
    <div className="bg-[radial-gradient(ellipse_80%_100%_at_100%_50%,rgba(161,61,142,0.10)_0%,rgba(161,61,142,0.04)_40%,transparent_70%),linear-gradient(135deg,#FFFFFF_0%,#FDFCFF_40%,#F5EEFF_70%,#EAD6FA_100%)] text-slate-900 min-h-screen font-sans selection:bg-[#c19b52]/30">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/videos" element={<VideoClasses />} />
          <Route path="/materials" element={<StudyMaterial />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/live-classes" element={<LiveClassManager />} />
          <Route path="/live-class/:id" element={<LiveClassRoom />} />
          <Route path="/syllabus/:slug" element={<SyllabusCategoryPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
