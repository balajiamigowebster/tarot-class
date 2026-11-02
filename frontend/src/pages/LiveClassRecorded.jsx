import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';
import { Play, Clock, Calendar, Search, Film, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import VideoModal from '../components/VideoModal';
import _ReactLazyLoad from 'react-lazyload';
const LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;

const LiveClassRecorded = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('active'); // 'active' | 'all'
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.API_BASE_URL}/api/live-classes/recordings`);
      setRecordings(res.data);
    } catch (err) {
      console.error('Error fetching live class recordings:', err);
      setError('Failed to load recorded classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  // Filter recordings
  const filteredRecordings = recordings.filter(rec => {
    const matchesSearch = 
      rec.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === 'active') {
      return !rec.isExpired;
    }
    return true;
  });

  return (
    <div className="min-h-screen font-sans selection:bg-[#c19b52]/30 pb-20">
      
      {/* Top Banner / Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#103E34]/10 via-transparent to-transparent pt-12 pb-8 px-4 md:px-12">
        <div className="max-w-7xl mx-auto" data-aos="fade-up">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#c19b52]/20">
            <div className="w-1.5 h-8 bg-[#c19b52] rounded-full"></div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0C3229] uppercase tracking-wide">
              Live Class <span className="text-[#B89355]">Recordings</span>
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <p className="text-slate-600 text-base md:text-lg max-w-3xl leading-relaxed">
              Missed a live interactive session or want to revise? Replay the live classes here. All live class recordings remain accessible on the website for <strong className="text-[#0C3229] font-bold">30 days</strong> from the class date.
            </p>

            <div className="flex items-center gap-2 bg-[#B89355]/10 border border-[#B89355]/30 text-[#0C3229] px-4 py-2 rounded-xl text-xs font-bold tracking-wide w-fit">
              <ShieldCheck className="w-4 h-4 text-[#B89355]" />
              <span>30-Day Student Replay Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Controls: Search & Filter */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 mb-10">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search recordings by topic or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B89355]/30 focus:border-[#B89355] text-sm text-slate-800 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilterType('active')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterType === 'active'
                  ? 'bg-gradient-to-r from-[#B89355] to-[#c19b52] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Active Recordings
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-[#B89355] to-[#c19b52] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Recordings ({recordings.length})
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-12">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-[#c19b52]/30 border-t-[#c19b52] rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm">Loading live class recordings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p>{error}</p>
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="bg-white/80 border border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm" data-aos="zoom-in">
            <div className="w-16 h-16 bg-[#B89355]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#B89355]">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {searchQuery ? 'No matching recordings found' : 'No Active Live Class Recordings'}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filter.' 
                : 'Live classes will be recorded and published here after each live session. Each recording remains available for 30 days.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecordings.map((rec, idx) => {
              const isExpired = rec.isExpired;
              const formattedDate = new Date(rec.recordedDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div 
                  key={rec.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                  data-aos="fade-up"
                  data-aos-delay={idx * 80}
                >
                  {/* Thumbnail / Video Preview */}
                  <div 
                    className="aspect-video relative overflow-hidden bg-slate-950 cursor-pointer flex items-center justify-center"
                    onClick={() => {
                      if (!isExpired) setSelectedVideo(rec);
                    }}
                  >
                    {rec.thumbnailUrl ? (
                      <LazyLoad once>
                        <img 
                          src={rec.thumbnailUrl?.startsWith('http') ? rec.thumbnailUrl : `${config.API_BASE_URL}${rec.thumbnailUrl}`} 
                          alt={rec.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        />
                      </LazyLoad>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
                        <Film className="w-10 h-10 text-amber-500/70 mb-2" />
                        <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Live Class Recording</span>
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    {!isExpired && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-[#c19b52] group-hover:scale-110 shadow-lg transition-all duration-300">
                          <Play className="w-6 h-6 text-white ml-1 fill-white" />
                        </div>
                      </div>
                    )}

                    {/* Expiry Pill Tag on Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                      {isExpired ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600/90 text-white backdrop-blur-md shadow-md">
                          Expired
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rec.daysRemaining} days left
                        </span>
                      )}
                    </div>

                    {/* Duration badge on bottom right */}
                    {rec.duration && (
                      <div className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-mono">
                        {rec.duration}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-[#B89355]" />
                      <span>Class Date: {formattedDate}</span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 group-hover:text-[#0C3229] transition-colors">
                      {rec.title}
                    </h3>

                    {rec.description && (
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                        {rec.description}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        30-Day Replay
                      </span>

                      {isExpired ? (
                        <span className="text-xs font-semibold text-slate-400">
                          Replay expired
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedVideo(rec)}
                          className="text-sm font-bold text-[#0C3229] flex items-center gap-1.5 hover:text-[#B89355] transition-colors group/btn"
                        >
                          Watch Class <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Video Modal Player */}
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          video={{
            ...selectedVideo,
            video_url: selectedVideo.videoUrl,
            thumbnail_url: selectedVideo.thumbnailUrl
          }}
        />
      )}
    </div>
  );
};

export default LiveClassRecorded;

