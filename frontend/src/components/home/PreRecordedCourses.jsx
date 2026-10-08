import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { Link } from 'react-router-dom';
import VideoModal from '../VideoModal';
import _ReactLazyLoad from 'react-lazyload';
const LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;

const PreRecordedCourses = () => {
  const { videos, loading } = useContent();
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (loading) {
    return (
      <section id="videos" className="w-full py-16 px-4 md:px-12 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#c19b52]/30 border-t-[#c19b52] rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section id="videos" className="w-full py-16 px-4 md:px-12">
      <div className="max-w-7xl mx-auto" data-aos="fade-up">
        
        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="aspect-[16/10] relative overflow-hidden bg-black flex items-center justify-center group cursor-pointer"
                  onClick={() => setSelectedVideo(course)}
                >
                  <LazyLoad once><video 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    preload="metadata"
                    src={course.video_url || course.url}
                  >
                  </video></LazyLoad>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-[#c19b52] transition-colors">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {course.duration || 'N/A'}
                      </span>
                      <Link to="/videos" className="text-sm font-bold text-slate-800 flex items-center gap-1 hover:text-[#c19b52] transition-colors group">
                        View <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
      
      <VideoModal 
        isOpen={!!selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
        video={selectedVideo} 
      />
    </section>
  );
};

export default PreRecordedCourses;
