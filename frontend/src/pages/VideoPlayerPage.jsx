import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { config } from '../config';
import _ReactLazyLoad from 'react-lazyload';
const LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;

const VideoPlayerPage = () => {
  const { slug, videoId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await fetch(`${config.API_BASE_URL}/api/syllabus/categories`);
        if (!catRes.ok) throw new Error('Failed to fetch categories');
        const categories = await catRes.json();
        
        const currentCategory = categories.find(c => c.slug === slug);
        if (!currentCategory) {
          throw new Error('Category not found');
        }
        setCategory(currentCategory);
        
        const vidRes = await fetch(`${config.API_BASE_URL}/api/syllabus/categories/${currentCategory.id}/videos`);
        if (vidRes.ok) {
          const vids = await vidRes.json();
          setVideos(vids);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-12 flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C3229]"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
        <p className="text-slate-600 mb-6">{error || 'Category not found'}</p>
        <Link to={`/syllabus/${slug}`} className="bg-[#B89355] text-white px-6 py-2 rounded-md hover:bg-[#9c7d48]">
          Go Back
        </Link>
      </div>
    );
  }

  const currentVideo = videos.find(v => v.id.toString() === videoId) || videos[0];
  const otherVideos = videos.filter(v => v.id.toString() !== currentVideo?.id.toString());

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[85vh]">
      <Link to={`/syllabus/${slug}`} className="inline-flex items-center text-[#B89355] hover:text-[#0C3229] font-bold mb-6 transition-colors">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to {category.name}
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Video Section */}
        <div className="flex-grow lg:w-2/3 xl:w-3/4 flex flex-col">
          {currentVideo ? (
            <>
              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-xl border border-slate-200">
                <LazyLoad once><video 
                  key={currentVideo.id} // Forces video reload when switching
                  src={`${config.API_BASE_URL}${currentVideo.video_url}`} 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video></LazyLoad>
              </div>
              <div className="mt-6 p-1">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0C3229] mb-3">{currentVideo.title}</h1>
                <div className="flex items-center gap-4 text-sm font-semibold text-slate-500 mb-6 pb-6 border-b border-slate-200">
                  <span className="bg-[#B89355]/10 text-[#B89355] px-3 py-1 rounded-full">{category.name}</span>
                  {currentVideo.duration && <span>• {currentVideo.duration}</span>}
                </div>
                {currentVideo.description && (
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <p className="text-slate-700 whitespace-pre-wrap">{currentVideo.description}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="aspect-video w-full bg-slate-100 rounded-xl flex items-center justify-center">
              <p className="text-slate-500">Video not found</p>
            </div>
          )}
        </div>

        {/* Next Videos Sidebar */}
        <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col max-h-[85vh]">
          <h2 className="text-xl font-bold text-[#0C3229] mb-4">Up Next in this Category</h2>
          
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-8 custom-scrollbar">
            {otherVideos.length > 0 ? (
              otherVideos.map(video => (
                <Link 
                  key={video.id} 
                  to={`/syllabus/${slug}/video/${video.id}`}
                  className="flex gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="w-40 min-w-[160px] h-24 bg-black rounded-lg overflow-hidden relative border border-slate-200 flex-shrink-0">
                    {video.thumbnail_url ? (
                      <LazyLoad once><img 
                        src={`${config.API_BASE_URL}${video.thumbnail_url}`} 
                        alt={video.title} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                      /></LazyLoad>
                    ) : (
                      <LazyLoad once><video 
                        src={`${config.API_BASE_URL}${video.video_url}#t=0.1`} 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        preload="metadata"
                      /></LazyLoad>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {video.duration}
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex flex-col py-1">
                    <h4 className="font-bold text-[#1D2939] text-sm leading-tight line-clamp-2 group-hover:text-[#B89355] transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{category.name}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg">No other videos in this category.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
