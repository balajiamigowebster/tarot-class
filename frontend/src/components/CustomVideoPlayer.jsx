import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Loader2 
} from 'lucide-react';

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds === null) return '0:00';
  const totalSeconds = Math.floor(timeInSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const CustomVideoPlayer = ({
  src,
  poster,
  title,
  autoPlay = false,
  className = '',
  onEnded,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  // Initially show controls so user clearly sees them right away
  const [showControls, setShowControls] = useState(true);
  const [isDraggingSeek, setIsDraggingSeek] = useState(false);

  // Auto-hide controls logic
  const triggerShowControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    // Only auto-hide if currently playing
    if (videoRef.current && !videoRef.current.paused) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, []);

  const handleMouseMove = () => {
    triggerShowControls();
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  };

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().catch(() => {
        // Autoplay or play was blocked
      });
    } else {
      video.pause();
    }
  }, []);

  // Toggle Mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        video.volume = 0.5;
        setVolume(0.5);
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Change Volume Slider
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (video && video.webkitEnterFullscreen) {
        // Fallback for iOS Safari
        video.webkitEnterFullscreen();
      }
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Video Time Update & Buffer
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || isDraggingSeek) return;

    setCurrentTime(video.currentTime);

    // Calculate buffer
    if (video.buffered.length > 0 && video.duration > 0) {
      try {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      } catch {
        // Ignore buffer error
      }
    }
  };

  // Seek calculation from Mouse/Touch event
  const getSeekTimeFromEvent = (e) => {
    const bar = progressRef.current;
    if (!bar || !videoRef.current || !duration) return 0;

    const rect = bar.getBoundingClientRect();
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
    const clickPos = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = clickPos / rect.width;
    return percentage * duration;
  };

  const handleSeek = (e) => {
    const newTime = getSeekTimeFromEvent(e);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressMouseDown = (e) => {
    setIsDraggingSeek(true);
    handleSeek(e);

    const onMouseMove = (moveEvent) => {
      handleSeek(moveEvent);
    };

    const onMouseUp = () => {
      setIsDraggingSeek(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleProgressTouchStart = (e) => {
    setIsDraggingSeek(true);
    handleSeek(e);

    const onTouchMove = (moveEvent) => {
      handleSeek(moveEvent);
    };

    const onTouchEnd = () => {
      setIsDraggingSeek(false);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  // Handle Video State Events
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration || 0);
      setVolume(video.volume);
      setIsMuted(video.muted);
      if (autoPlay) {
        video.play().catch(() => {
          // Autoplay was blocked
          setIsPlaying(false);
        });
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    triggerShowControls();
  };

  const handlePause = () => {
    setIsPlaying(false);
    setShowControls(true); // Keep controls visible when paused!
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
    if (onEnded) onEnded();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const video = videoRef.current;
    if (!video) return;

    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      togglePlay();
      triggerShowControls();
    } else if (e.key === 'f') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'm') {
      e.preventDefault();
      toggleMute();
      triggerShowControls();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      video.currentTime = Math.min(video.duration, video.currentTime + 5);
      triggerShowControls();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 5);
      triggerShowControls();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const v = Math.min(1, video.volume + 0.1);
      video.volume = v;
      setVolume(v);
      if (v > 0) setIsMuted(false);
      triggerShowControls();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const v = Math.max(0, video.volume - 0.1);
      video.volume = v;
      setVolume(v);
      if (v === 0) setIsMuted(true);
      triggerShowControls();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentVolume = isMuted ? 0 : volume;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={triggerShowControls}
      className={`relative w-full h-full bg-black select-none overflow-hidden group outline-none ${
        isFullscreen ? 'fixed inset-0 z-[99999] h-screen w-screen' : ''
      } ${className}`}
    >
      {/* Native Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        webkit-playsinline="true"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onSeeking={() => setIsBuffering(true)}
        onSeeked={() => setIsBuffering(false)}
        onEnded={handleVideoEnded}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        className="w-full h-full object-contain cursor-pointer"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      >
        Your browser does not support the video tag.
      </video>

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="p-4 rounded-full bg-black/60 backdrop-blur-md text-[#B89355] border border-white/10 shadow-2xl">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        </div>
      )}

      {/* Big Center Play Button (Visible when paused or ended) */}
      {!isPlaying && !isBuffering && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-20 group/btn bg-black/20 hover:bg-black/30 transition-all"
        >
          <button
            type="button"
            aria-label="Play video"
            className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#9c7d48] to-[#d4af37] text-white shadow-2xl shadow-amber-900/50 hover:scale-110 active:scale-95 transition-all duration-300 border border-amber-200/40"
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-0.5" />
          </button>
        </div>
      )}

      {/* Optional Title in Fullscreen or Hover */}
      {title && isFullscreen && showControls && (
        <div className="absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-30 pointer-events-none transition-opacity duration-300">
          <h2 className="text-white text-base sm:text-xl font-bold drop-shadow-md truncate max-w-[80%]">
            {title}
          </h2>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-3 sm:px-5 pt-8 pb-3 sm:pb-4 z-30 transition-opacity duration-300 flex flex-col gap-2.5 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline / Progress Bar */}
        <div
          ref={progressRef}
          onMouseDown={handleProgressMouseDown}
          onTouchStart={handleProgressTouchStart}
          className="relative w-full h-2 sm:h-2.5 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer flex items-center group/timeline transition-all"
        >
          {/* Buffered Bar */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-full pointer-events-none"
            style={{ width: `${Math.min(100, Math.max(0, buffered))}%` }}
          />

          {/* Played Progress Bar */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#B89355] to-[#f3cf7a] rounded-full pointer-events-none shadow-sm"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />

          {/* Scrubber Thumb */}
          <div
            className="absolute -top-1 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-white rounded-full shadow-lg border-2 border-[#B89355] scale-90 sm:scale-0 group-hover/timeline:scale-100 transition-transform -translate-x-1/2 pointer-events-none"
            style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 text-white">
          {/* Left Controls: Play/Pause and Time */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Play / Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 sm:p-2 rounded-lg text-white hover:text-[#d4af37] hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              )}
            </button>

            {/* Time Display */}
            <div className="text-xs sm:text-sm font-medium text-white/90 select-none whitespace-nowrap tracking-wide">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/60">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Volume and Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Volume Control (Icon + Slider) */}
            <div className="flex items-center gap-1.5 sm:gap-2 group/volume">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 sm:p-2 rounded-lg text-white hover:text-[#d4af37] hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
                aria-label={isMuted || currentVolume === 0 ? 'Unmute' : 'Mute'}
              >
                {isMuted || currentVolume === 0 ? (
                  <VolumeX className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-red-400" />
                ) : currentVolume < 0.5 ? (
                  <Volume1 className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                ) : (
                  <Volume2 className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                )}
              </button>

              {/* Volume Slider - Increase and Decrease */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={currentVolume}
                onChange={handleVolumeChange}
                aria-label="Volume slider"
                className="w-16 sm:w-20 md:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#B89355] hover:accent-[#d4af37] focus:outline-none transition-all"
                style={{
                  background: `linear-gradient(to right, #B89355 ${currentVolume * 100}%, rgba(255,255,255,0.2) ${currentVolume * 100}%)`,
                }}
              />
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-lg text-white hover:text-[#d4af37] hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
