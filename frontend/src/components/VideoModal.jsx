import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import _ReactLazyLoad from 'react-lazyload';
const LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;

const VideoModal = ({ isOpen, onClose, video }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!video) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-slate-900/60"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.16, 1, 0.3, 1],
              delay: 0.1 
            }}
            className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
          >
            {/* Header/Close button */}
            <div className="absolute top-0 inset-x-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <h3 className="text-white/90 font-medium text-lg pointer-events-auto truncate pr-8 drop-shadow-md">
                {video.title}
              </h3>
              <button
                onClick={onClose}
                className="pointer-events-auto text-white/70 hover:text-white bg-black/20 hover:bg-black/50 p-2 rounded-full backdrop-blur-md transition-all group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video w-full bg-slate-950">
              <LazyLoad once><video
                src={video.video_url || video.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video></LazyLoad>
            </div>
            
            {/* Optional glow effect behind modal */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#c19b52]/0 via-[#c19b52]/20 to-[#c19b52]/0 blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;
