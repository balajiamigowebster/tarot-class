import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { ArrowRight } from 'lucide-react';
import { useContent } from '../hooks/useContent';
import VideoModal from '../components/VideoModal';
import _ReactLazyLoad from 'react-lazyload';
const LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;

const VideoClasses = () => {
  const { videos, loading } = useContent();
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <div className="min-h-screen font-sans selection:bg-[#c19b52]/30">
      
      <main className="max-w-7xl mx-auto py-16 px-4 md:px-12">
        <div data-aos="fade-up">
          <div className="flex items-center gap-3 mb-10 pb-4 border-b border-[#c19b52]/20">
            <div className="w-1.5 h-8 bg-[#c19b52] rounded-full"></div>
            <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-widest">
              Pre-Recorded <span className="text-[#c19b52]">Video Classes</span>
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-[#c19b52]/30 border-t-[#c19b52] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {videos.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 py-10">
                  No video classes available yet.
                </div>
              ) : (
                videos.map((course, idx) => (
                  <div 
                    key={course.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow flex flex-col"
                    data-aos="fade-up"
                    data-aos-delay={idx * 100}
                  >
                    <div 
                      className="aspect-video relative overflow-hidden bg-black cursor-pointer group flex items-center justify-center"
                      onClick={() => setSelectedVideo(course)}
                    >
                      <LazyLoad once><video 
                        preload="metadata"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        src={course.video_url || course.url}
                      >
                        Your browser does not support the video tag.
                      </video></LazyLoad>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-[#c19b52] group-hover:scale-110 transition-all duration-300">
                          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">Lesson {course.lesson_number}: {course.title}</h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                            {course.duration || 'N/A'}
                          </span>
                          <button 
                            onClick={() => setSelectedVideo(course)}
                            className="text-sm font-bold text-slate-800 flex items-center gap-1 hover:text-[#c19b52] transition-colors group"
                          >
                            Watch <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      
      <VideoModal 
        isOpen={!!selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
        video={selectedVideo} 
      />
    </div>
  );
};

export default VideoClasses;
