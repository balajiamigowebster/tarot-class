import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../config';
import _ReactLazyLoad from 'react-lazyload';
const LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;

const getIcon = (idx) => {
  const icons = [
    (
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="15" width="24" height="34" rx="2" fill="#0C3229" stroke="#B89355" strokeWidth="2" />
        <rect x="12" y="20" width="24" height="34" rx="2" transform="rotate(-15 12 20)" fill="#0C3229" stroke="#B89355" strokeWidth="2" />
        <rect x="28" y="10" width="24" height="34" rx="2" transform="rotate(15 28 10)" fill="#0C3229" stroke="#B89355" strokeWidth="2" />
        <circle cx="32" cy="32" r="6" fill="#B89355" />
      </svg>
    ),
    (
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="24" r="10" fill="#0C3229" stroke="#B89355" strokeWidth="2" />
        <circle cx="44" cy="40" r="10" fill="#0C3229" stroke="#B89355" strokeWidth="2" />
        <line x1="26" y1="28" x2="38" y2="36" stroke="#B89355" strokeWidth="2" />
        <circle cx="32" cy="32" r="3" fill="#B89355" />
      </svg>
    ),
    (
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="24" fill="#0C3229" />
        <circle cx="32" cy="32" r="22" stroke="#B89355" strokeWidth="1" strokeDasharray="4 2" />
        <path d="M24 24 Q32 36 40 24 M32 30 V44" stroke="#B89355" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    (
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 36 C10 36 10 20 24 20 C30 20 32 28 32 28 C32 28 34 20 40 20 C54 20 54 36 44 36" fill="#0C3229" stroke="#B89355" strokeWidth="2" />
        <path d="M26 26 L38 38 M38 26 L26 38" stroke="#B89355" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="32" r="4" fill="#B89355" />
      </svg>
    )
  ];
  return icons[idx % icons.length];
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    fetch(`${config.API_BASE_URL}/api/syllabus/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setLoadingVideos(true);
      fetch(`${config.API_BASE_URL}/api/syllabus/categories/${selectedCategory.id}/videos`)
        .then(res => res.json())
        .then(data => {
          setVideos(data);
          setLoadingVideos(false);
        })
        .catch(err => {
          console.error("Error fetching videos:", err);
          setLoadingVideos(false);
        });
    }
  }, [selectedCategory]);

  return (
    <>
      <section id="categories" className="w-full py-16 px-4 md:px-12 relative z-20">
        <div className="max-w-[1400px] mx-auto" data-aos="fade-up">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-[#0C3229] font-serif mb-4">
              Comprehensive Tarot Syllabus
            </h2>
            <p className="text-[#475467] md:text-lg max-w-2xl mx-auto">
              Everything you need to master the art of Tarot reading, from basic meanings to advanced spreads and intuition building.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {categories.map((cat, idx) => (
              <div 
                key={cat.id || idx} 
                className="bg-white rounded-xl p-4 md:p-5 border border-slate-100 hover:border-[#B89355]/30 transition-all flex flex-col items-center text-center shadow-md hover:shadow-xl hover:-translate-y-1"
                data-aos="fade-up"
                data-aos-delay={(idx % 5) * 50}
              >
                <div className="mb-3 flex justify-center w-full">
                  {getIcon(idx)}
                </div>
                <h3 className="font-bold text-[#0C3229] text-lg mb-2 font-serif">{cat.name}</h3>
                <p className="text-[#475467] text-xs md:text-sm mb-5 flex-1 leading-relaxed font-medium">{cat.description}</p>
                
                <button 
                  onClick={() => setSelectedCategory(cat)}
                  className="w-[90%] py-2 px-4 rounded-md bg-[#B89355] hover:bg-[#9c7d48] text-white font-semibold transition-colors shadow-sm text-xs uppercase tracking-wide"
                >
                  View Course
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video List Popup Modal */}
      {selectedCategory && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-white/80 backdrop-blur-md overflow-y-auto" 
          onClick={() => setSelectedCategory(null)}
        >
          <div 
            className="relative w-full max-w-6xl bg-white p-6 md:p-10 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] my-auto border border-slate-200" 
            onClick={(e) => e.stopPropagation()}
            data-aos="zoom-in"
            data-aos-duration="300"
          >
            <button 
              onClick={() => setSelectedCategory(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-500 hover:text-[#E41E5D] transition-colors bg-gray-100 hover:bg-red-50 rounded-full p-2 z-10"
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h3 className="text-2xl md:text-3xl font-bold font-serif text-[#0C3229] mb-8 border-b border-slate-100 pb-4 pr-12">
              Category: <span className="text-[#B89355]">{selectedCategory.name}</span> - Pre Recorded Classes
            </h3>
            
            {selectedCategory.slug === 'cards-meaning' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { title: 'Minor Arcana', view: 'minor-images', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { title: 'Major Arcana', view: 'major-images', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                  { title: 'Minor Arcana', view: 'minor-videos', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z' },
                  { title: 'Major Arcana', view: 'major-videos', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' }
                ].map((item, idx) => (
                  <Link 
                    key={idx}
                    to={`/syllabus/${selectedCategory.slug}?view=${item.view}`}
                    onClick={() => setSelectedCategory(null)}
                    className="relative group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col items-center text-center overflow-hidden"
                  >
                    <div className="w-16 h-16 bg-[#F4ECD8] rounded-full flex items-center justify-center mb-4 text-[#0C3229] group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon}></path></svg>
                    </div>
                    <h4 className="font-bold text-[#1D2939] text-lg mb-2 leading-tight">
                      {item.title}
                    </h4>
                    <div className="mt-auto pt-4 w-full border-t border-slate-100">
                      <span className="text-[#B89355] font-medium group-hover:text-[#9c7d48] flex items-center justify-center gap-1">
                        Explore <span className="text-xl leading-none">&rarr;</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : loadingVideos ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C3229] mx-auto"></div>
                <p className="mt-4 text-slate-500">Loading classes...</p>
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, idx) => (
                  <div key={video.id || idx} className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div 
                      className="relative bg-black h-48 flex items-center justify-center cursor-pointer group overflow-hidden"
                      onClick={() => setPlayingVideo(video)}
                    >
                      {video.thumbnail_url ? (
                        <LazyLoad once><img 
                          src={`${config.API_BASE_URL}${video.thumbnail_url}`} 
                          alt={video.title} 
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        /></LazyLoad>
                      ) : (
                        <LazyLoad once><video 
                          src={`${config.API_BASE_URL}${video.video_url}#t=0.1`} 
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                          preload="metadata"
                          muted
                          playsInline
                        /></LazyLoad>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 rounded-full p-4 shadow-xl backdrop-blur-sm group-hover:bg-black group-hover:scale-110 transition-all border border-white/10">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <h4 className="font-bold text-[#1D2939] text-lg mb-1 leading-tight line-clamp-2">
                        {video.title}
                      </h4>
                      <p className="text-sm text-[#475467] font-medium mb-5">
                        {video.duration || 'N/A'} min
                      </p>
                      <div className="mt-auto">
                        <button 
                          onClick={() => setPlayingVideo(video)}
                          className="w-full py-2.5 rounded-md bg-[#B89355] hover:bg-[#9c7d48] text-white font-bold transition-colors shadow-sm"
                        >
                          Play Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-500 text-lg">No pre-recorded classes available for this category yet.</p>
              </div>
            )}
            
            <div className="mt-10 text-center">
              <Link 
                to={`/syllabus/${selectedCategory.slug}`} 
                onClick={() => setSelectedCategory(null)}
                className="inline-block py-3 px-10 rounded-md bg-[#0C3229] hover:bg-[#08201a] text-white font-bold shadow-lg transition-transform hover:-translate-y-0.5 tracking-wide"
              >
                View More Classes
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setPlayingVideo(null)}>
          <div className="w-full max-w-5xl bg-black rounded-2xl overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start pointer-events-none">
              <h3 className="text-white font-bold text-xl drop-shadow-md pr-10">{playingVideo.title}</h3>
            </div>
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 hover:bg-[#E41E5D] p-2 rounded-full transition-all z-20"
              aria-label="Close video"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <LazyLoad once><video 
                src={`${config.API_BASE_URL}${playingVideo.video_url}`} 
                controls 
                autoPlay 
                className="w-full h-full"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video></LazyLoad>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;
