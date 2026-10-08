import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { config } from '../config';
import _ReactLazyLoad from 'react-lazyload';
const LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;

const SyllabusCategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const queryParams = new URLSearchParams(window.location.search);
  const [activeView, setActiveView] = useState(queryParams.get('view') || null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories to find the one matching the slug
        const catRes = await fetch(`${config.API_BASE_URL}/api/syllabus/categories`);
        if (!catRes.ok) throw new Error('Failed to fetch categories');
        const categories = await catRes.json();
        
        const currentCategory = categories.find(c => c.slug === slug);
        if (!currentCategory) {
          throw new Error('Category not found');
        }
        
        setCategory(currentCategory);
        
        // Fetch videos, images, and pdfs for this category
        const [vidRes, imgRes, pdfRes] = await Promise.all([
          fetch(`${config.API_BASE_URL}/api/syllabus/categories/${currentCategory.id}/videos`),
          fetch(`${config.API_BASE_URL}/api/syllabus/categories/${currentCategory.id}/images`),
          fetch(`${config.API_BASE_URL}/api/syllabus/categories/${currentCategory.id}/pdfs`)
        ]);
        
        if (vidRes.ok) {
          setVideos(await vidRes.json());
        }
        if (imgRes.ok) {
          setImages(await imgRes.json());
        }
        if (pdfRes.ok) {
          setPdfs(await pdfRes.json());
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C3229]"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
        <p className="text-slate-600 mb-6">{error || 'Category not found'}</p>
        <Link to="/" className="bg-[#B89355] text-white px-6 py-2 rounded-md hover:bg-[#9c7d48] transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  const renderVideoCard = (video) => (
    <div key={video.id} className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
      <Link 
        to={`/syllabus/${slug}/video/${video.id}`}
        className="relative bg-black h-48 flex items-center justify-center cursor-pointer group overflow-hidden block"
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
          <div className="bg-black/70 rounded-full p-4 shadow-xl backdrop-blur-sm group-hover:bg-[#B89355] group-hover:scale-110 transition-all border border-white/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-1">
        <h4 className="font-bold text-[#1D2939] text-lg mb-2 leading-tight line-clamp-2">
          {video.title}
        </h4>
        {video.description && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">
            {video.description}
          </p>
        )}
        <p className="text-sm text-[#B89355] font-semibold mb-5">
          {video.duration || 'N/A'}
        </p>
        <div className="mt-auto">
          <Link 
            to={`/syllabus/${slug}/video/${video.id}`}
            className="w-full py-2.5 rounded-md bg-[#0C3229] hover:bg-[#08201a] text-white font-bold transition-colors shadow-sm block text-center"
          >
            Play Now
          </Link>
        </div>
      </div>
    </div>
  );

  const renderImageCard = (image) => (
    <div 
      key={image.id} 
      className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
      onClick={() => setSelectedImage(image)}
    >
      <div className="relative h-48 bg-slate-100 w-full" onContextMenu={(e) => e.preventDefault()}>
        <LazyLoad once><img 
          src={`${config.API_BASE_URL}${image.image_url}`} 
          alt={image.title || 'Study image'} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
        /></LazyLoad>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>
      {image.title && (
        <div className="p-4 border-t border-slate-100 flex-1 flex items-center justify-center">
          <p className="font-semibold text-slate-800 text-center text-sm">{image.title}</p>
        </div>
      )}
    </div>
  );

  const renderImageWithContentCard = (image) => (
    <div key={image.id} className="flex flex-col md:flex-row gap-8 py-8 border-b border-slate-200 last:border-0">
      {/* Image Side */}
      <div className="w-full md:w-1/2">
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
          <div 
            className="relative h-[600px] bg-slate-100 w-full cursor-pointer group"
            onClick={() => setSelectedImage(image)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <LazyLoad once><img 
              src={`${config.API_BASE_URL}${image.image_url}`} 
              alt={image.title || 'Study image'} 
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
            /></LazyLoad>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
          {image.title && (
            <div className="p-4 border-t border-slate-100 flex justify-center items-center">
              <p className="font-bold text-[#0C3229] text-center text-sm">{image.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4">
        {image.content ? (
          <div className="prose prose-slate max-w-none text-[#4A645D] font-sans">
            {image.content.split('\n').map((line, i) => (
              <p key={i} className="mb-4 leading-relaxed text-lg">{line}</p>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center">
             <p className="text-slate-400 italic">No content provided for this image.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-[#0C3229] mb-4">
          <span className="text-[#B89355]">{category.name}</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">{category.description}</p>
      </div>

      {category.slug === 'cards-meaning' ? (
          activeView === null ? (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
              {/* Study Images Column */}
              <div className="flex-1 w-full lg:w-1/2">
                <div className="flex flex-col mb-8">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#F4ECD8] rounded-full flex items-center justify-center">
                         <svg className="w-6 h-6 text-[#0C3229]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <h2 className="text-3xl font-bold text-[#0C3229] font-serif border-b-2 border-[#B89355] pb-1">Study Images</h2>
                   </div>
                   <p className="text-xs font-bold tracking-widest text-[#B89355] uppercase ml-14">Explore the visual meanings</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Minor Images Card */}
                  <div className="flex-1 bg-gradient-to-br from-[#FFFDF9] to-[#F3E8D3] rounded-2xl p-8 border border-[#E8DCC4] shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#E8DCC4]">
                        <svg className="w-8 h-8 text-[#0C3229]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                     </div>
                     <h3 className="text-2xl font-bold text-[#0C3229] font-serif mb-3">Minor Arcana Images</h3>
                     <p className="text-[#4A645D] text-sm mb-8 leading-relaxed">Explore the meaning of minor arcana cards through visual representations.</p>
                     <button onClick={() => setActiveView('minor-images')} className="mt-auto bg-[#EAD4AB] hover:bg-[#D9BE8E] text-[#0C3229] font-bold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2 cursor-pointer">View Images &rarr;</button>
                  </div>
                  
                  {/* Major Images Card */}
                  <div className="flex-1 bg-[#0A261F] rounded-2xl p-8 border border-[#17463A] shadow-md flex flex-col items-center text-center relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#B89355]/20 to-transparent opacity-70"></div>
                     <div className="absolute bottom-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#B89355]/20 to-transparent opacity-70"></div>
                     <div className="w-16 h-16 bg-[#081F19] rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#B89355]/30">
                        <svg className="w-8 h-8 text-[#EAD4AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                     </div>
                     <h3 className="text-2xl font-bold text-white font-serif mb-3 relative z-10">Major Arcana Images</h3>
                     <p className="text-[#A3B8B2] text-sm mb-8 leading-relaxed relative z-10">Explore the meaning of major arcana cards through visual representations.</p>
                     <button onClick={() => setActiveView('major-images')} className="mt-auto bg-[#EAD4AB] hover:bg-[#D9BE8E] text-[#0C3229] font-bold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2 relative z-10 cursor-pointer">View Images &rarr;</button>
                  </div>
                </div>
              </div>

              {/* Video Classes Column */}
              <div className="flex-1 w-full lg:w-1/2">
                <div className="flex flex-col mb-8">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#F4ECD8] rounded-full flex items-center justify-center">
                         <svg className="w-6 h-6 text-[#0C3229]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <h2 className="text-3xl font-bold text-[#0C3229] font-serif border-b-2 border-[#B89355] pb-1">Video Classes</h2>
                   </div>
                   <p className="text-xs font-bold tracking-widest text-[#B89355] uppercase ml-14">Learn with video explanations</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Minor Videos Card */}
                  <div className="flex-1 bg-gradient-to-br from-[#FFFDF9] to-[#F3E8D3] rounded-2xl p-8 border border-[#E8DCC4] shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#E8DCC4]">
                        <svg className="w-8 h-8 text-[#0C3229]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                     </div>
                     <h3 className="text-2xl font-bold text-[#0C3229] font-serif mb-3">Minor Arcana Videos</h3>
                     <p className="text-[#4A645D] text-sm mb-8 leading-relaxed">Watch detailed video explanations for minor arcana cards.</p>
                     <button onClick={() => setActiveView('minor-videos')} className="mt-auto bg-[#EAD4AB] hover:bg-[#D9BE8E] text-[#0C3229] font-bold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2 cursor-pointer">Watch Videos &rarr;</button>
                  </div>
                  
                  {/* Major Videos Card */}
                  <div className="flex-1 bg-[#0A261F] rounded-2xl p-8 border border-[#17463A] shadow-md flex flex-col items-center text-center relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#B89355]/20 to-transparent opacity-70"></div>
                     <div className="absolute bottom-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#B89355]/20 to-transparent opacity-70"></div>
                     <div className="w-16 h-16 bg-[#081F19] rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#B89355]/30">
                        <svg className="w-8 h-8 text-[#EAD4AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                     </div>
                     <h3 className="text-2xl font-bold text-white font-serif mb-3 relative z-10">Major Arcana Videos</h3>
                     <p className="text-[#A3B8B2] text-sm mb-8 leading-relaxed relative z-10">Watch detailed video explanations for major arcana cards.</p>
                     <button onClick={() => setActiveView('major-videos')} className="mt-auto bg-[#EAD4AB] hover:bg-[#D9BE8E] text-[#0C3229] font-bold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2 relative z-10 cursor-pointer">Watch Videos &rarr;</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-16">
               <button onClick={() => setActiveView(null)} className="mb-8 flex items-center gap-2 text-[#0C3229] hover:text-[#B89355] font-bold transition-colors">
                 <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                 Back to Menu
               </button>
               {activeView === 'minor-images' && (
                 <>
                   <h3 className="text-3xl font-bold text-[#0C3229] mb-2 font-serif border-b pb-4">Minor Arcana Images</h3>
                   <div className="flex flex-col">
                     {images.filter(i => i.subcategory !== 'major').map(renderImageWithContentCard)}
                     {images.filter(i => i.subcategory !== 'major').length === 0 && <p className="text-slate-500 mt-6">No minor images uploaded yet.</p>}
                   </div>
                 </>
               )}
               {activeView === 'major-images' && (
                 <>
                   <h3 className="text-3xl font-bold text-[#0C3229] mb-2 font-serif border-b pb-4">Major Arcana Images</h3>
                   <div className="flex flex-col">
                     {images.filter(i => i.subcategory === 'major').map(renderImageWithContentCard)}
                     {images.filter(i => i.subcategory === 'major').length === 0 && <p className="text-slate-500 mt-6">No major images uploaded yet.</p>}
                   </div>
                 </>
               )}
               {activeView === 'minor-videos' && (
                 <>
                   <h3 className="text-3xl font-bold text-[#0C3229] mb-6 font-serif border-b pb-4">Minor Arcana Videos</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {videos.filter(v => v.subcategory !== 'major').map(renderVideoCard)}
                     {videos.filter(v => v.subcategory !== 'major').length === 0 && <p className="text-slate-500">No minor videos uploaded yet.</p>}
                   </div>
                 </>
               )}
               {activeView === 'major-videos' && (
                 <>
                   <h3 className="text-3xl font-bold text-[#0C3229] mb-6 font-serif border-b pb-4">Major Arcana Videos</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {videos.filter(v => v.subcategory === 'major').map(renderVideoCard)}
                     {videos.filter(v => v.subcategory === 'major').length === 0 && <p className="text-slate-500">No major videos uploaded yet.</p>}
                   </div>
                 </>
               )}
            </div>
          )
      ) : (
        <>
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#0C3229] mb-8 font-serif border-b pb-4">Video Classes</h2>
            
            {videos.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm">
                <svg className="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-500 font-medium">No videos have been uploaded for this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(renderVideoCard)}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0C3229] mb-8 font-serif border-b pb-4">Study Images</h2>
            
            {images.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm">
                <svg className="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-500 font-medium">No images have been uploaded for this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {images.map(renderImageCard)}
              </div>
            )}
          </div>
        </>
      )}

      {/* Image Popup Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="w-full max-w-4xl bg-black rounded-lg overflow-hidden relative shadow-2xl flex flex-col items-center max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 hover:bg-[#E41E5D] p-2 rounded-full transition-all z-20"
              aria-label="Close image"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="p-2 overflow-auto flex-1 w-full flex items-center justify-center bg-zinc-900" onContextMenu={(e) => e.preventDefault()}>
              <LazyLoad once><img 
                src={`${config.API_BASE_URL}${selectedImage.image_url}`} 
                alt={selectedImage.title || 'Study image'} 
                className="max-w-full max-h-[75vh] object-contain rounded select-none pointer-events-none"
              /></LazyLoad>
            </div>
            <div className="w-full p-4 bg-black border-t border-white/10 flex justify-between items-center">
              <h3 className="text-white font-bold">{selectedImage.title || 'Study Image'}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Study PDFs Section */}
      <div className="mt-16 border-t border-slate-200 pt-16">
        <h2 className="text-2xl font-bold text-[#0C3229] mb-8 font-serif border-b pb-4">Study PDFs & Reference Guides</h2>
        
        {pdfs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm">
            <svg className="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-500 font-medium">No PDF materials have been uploaded for this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfs.map(pdf => (
              <div 
                key={pdf.id} 
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="w-12 h-12 bg-[#f0ebd8] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-[#B89355]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-[#1D2939] mb-2 leading-tight">{pdf.title || 'Untitled Reference Guide'}</h3>
                
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {pdf.file_size || 'PDF'}
                  </span>
                  
                  <div className="flex space-x-3">
                    <a 
                      href={`${config.API_BASE_URL}${pdf.pdf_url}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#0C3229] hover:text-[#B89355] transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusCategoryPage;
