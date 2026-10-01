import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/dashboard/Dashboard';
import VideoClasses from './pages/VideoClasses';
import StudyMaterial from './pages/StudyMaterial';
import Navbar from './components/Navbar';
import SyllabusCategoryPage from './pages/SyllabusCategoryPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import LiveClassManager from './components/dashboard/LiveClassManager';
import LiveClassRoom from './pages/LiveClassRoom';
import Login from './pages/Login';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AOS from 'aos';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};
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
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/videos" element={<ProtectedRoute><VideoClasses /></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute><StudyMaterial /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/live-classes" element={<ProtectedRoute><LiveClassManager /></ProtectedRoute>} />
          <Route path="/live-class/:id" element={<ProtectedRoute><LiveClassRoom /></ProtectedRoute>} />
          <Route path="/syllabus/:slug" element={<ProtectedRoute><SyllabusCategoryPage /></ProtectedRoute>} />
          <Route path="/syllabus/:slug/video/:videoId" element={<ProtectedRoute><VideoPlayerPage /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
