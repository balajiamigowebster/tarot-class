import React, { useState, useEffect } from 'react';
import { useContent } from '../../hooks/useContent';
import Navigation from '../../components/Navigation';
import PdfModal from '../../components/PdfModal';
import { Play, PlayCircle, FileText, Download, Eye, Clock, BookOpen, LayoutDashboard, Video, FileEdit, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import SyllabusManagement from '../../components/dashboard/SyllabusManagement';

const Dashboard = () => {
  const { videos, pdfs, loading } = useContent();
  const [activeVideo, setActiveVideo] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [activeTab, setActiveTab] = useState('course'); // 'course', 'manage_videos', 'manage_pdfs'

  useEffect(() => {
    if (videos.length > 0 && !activeVideo && activeTab === 'course') {
      setActiveVideo(videos[0]);
    }
  }, [videos, activeVideo, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-900 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderCourseContent = () => (
    <>
      {/* Hero Section */}
      <section className="relative pt-8 pb-10 overflow-hidden" data-aos="fade-up">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 z-0 rounded-3xl" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 px-8 py-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Welcome to your <span className="text-amber-500">Mystical Journey</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Explore the ancient wisdom of Tarot through our comprehensive video lessons and detailed study guides. Your progress is saved automatically.
            </p>
            
            <div className="bg-slate-900/50 border border-indigo-900/50 p-6 rounded-2xl backdrop-blur-sm max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 font-medium">Course Progress</span>
                <span className="text-amber-500 font-bold">35%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-2.5 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Player Section */}
      <section id="video-lessons" className="mt-8 relative z-20">
        <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row" data-aos="zoom-in">
          
          {/* Main Player */}
          <div className="flex-1 bg-black p-0 relative group">
            {activeVideo ? (
              <div className="aspect-video relative">
                <video 
                  key={activeVideo.id}
                  controls 
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-contain bg-black"
                  preload="metadata"
                  src={activeVideo.video_url || activeVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="aspect-video bg-slate-900 flex items-center justify-center">
                <span className="text-slate-500">Select a lesson to begin</span>
              </div>
            )}
            
            {activeVideo && (
              <div className="p-6 bg-slate-900">
                <h2 className="text-2xl font-bold text-white mb-2">{activeVideo.title}</h2>
                <p className="text-slate-400">{activeVideo.description}</p>
              </div>
            )}
          </div>

          {/* Playlist Sidebar */}
          <div className="w-full lg:w-96 bg-slate-800/50 border-l border-indigo-900/50 flex flex-col h-full max-h-[600px] overflow-y-auto">
            <div className="p-5 border-b border-indigo-900/50 bg-slate-900 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-amber-500" />
                Course Modules
              </h3>
            </div>
            
            <div className="flex flex-col p-3 gap-2">
              {videos.map((video, idx) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={`flex items-start text-left p-4 rounded-xl transition-all ${
                    activeVideo?.id === video.id 
                      ? 'bg-indigo-900/40 border border-indigo-500/50 shadow-inner' 
                      : 'hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className={`mt-1 mr-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activeVideo?.id === video.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {activeVideo?.id === video.id ? <Play className="w-4 h-4 ml-0.5 fill-current" /> : (idx + 1)}
                  </div>
                  <div>
                    <h4 className={`font-medium mb-1 ${activeVideo?.id === video.id ? 'text-white' : 'text-slate-300'}`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center text-xs text-slate-500 gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course Materials Section */}
      <section id="study-guides" className="mt-12 mb-12">
        <div className="flex items-center gap-3 mb-8" data-aos="fade-right">
          <BookOpen className="w-7 h-7 text-amber-500" />
          <h2 className="text-3xl font-bold text-white tracking-tight">Study Guides & Material</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf, idx) => (
            <div 
              key={pdf.id} 
              className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all flex flex-col h-full group"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="w-12 h-12 bg-indigo-950 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-amber-500" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{pdf.title}</h3>
              <p className="text-slate-400 text-sm flex-1 mb-6">{pdf.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                  {pdf.file_size || pdf.size}
                </span>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setPreviewPdf(pdf)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors tooltip-trigger relative"
                    title="Preview Guide"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a 
                    href={pdf.file_url || pdf.url} 
                    download 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Save
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-amber-500/30 flex flex-col bg-slate-950">
      <Navigation />
      
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-indigo-900/50 flex flex-col hidden md:flex overflow-y-auto z-30">
          <div className="p-6 border-b border-indigo-900/50">
            <h2 className="text-xl font-bold text-white tracking-tight">Dashboard</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('course')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'course' 
                  ? 'bg-amber-500/10 text-amber-500' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">My Course</span>
            </button>
            <button
              onClick={() => setActiveTab('manage_syllabus')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'manage_syllabus' 
                  ? 'bg-amber-500/10 text-amber-500' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Manage Syllabus</span>
            </button>
            <div className="pt-4 mt-4 border-t border-indigo-900/50">
              <Link
                to="/"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">Go to Website</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] relative z-10">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'course' && renderCourseContent()}
            {activeTab === 'manage_syllabus' && <SyllabusManagement />}
          </div>
        </main>
      </div>

      {/* PDF Modal */}
      {previewPdf && (
        <PdfModal 
          pdfUrl={previewPdf.file_url || previewPdf.url} 
          title={previewPdf.title} 
          onClose={() => setPreviewPdf(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
