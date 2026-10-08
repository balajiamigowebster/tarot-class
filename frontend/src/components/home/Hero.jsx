import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { config } from '../../config';
import _ReactLazyLoad from 'react-lazyload';
const LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;

const Hero = () => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [registerStatus, setRegisterStatus] = useState(null);
  const [latestClass, setLatestClass] = useState(null);

  React.useEffect(() => {
    const fetchLatestClass = async () => {
      try {
        const res = await axios.get(`${config.API_BASE_URL}/api/live-classes`);
        if (res.data && res.data.length > 0) {
          // Assuming the backend returns them in order, or we can just take the last one
          setLatestClass(res.data[res.data.length - 1]);
        }
      } catch (err) {
        console.error("Failed to fetch live classes for Hero", err);
      }
    };
    fetchLatestClass();
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name } = decoded;
      
      const res = await axios.post(`${config.API_BASE_URL}/api/live-classes/register`, { email, name });
      if (res.status === 200) {
        setRegisterStatus('Success! You are registered for the Live Class.');
      }
    } catch (error) {
      console.error(error);
      setRegisterStatus('Registration failed. Please try again.');
    }
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className="w-full py-10 md:py-16 px-4 md:px-12 max-w-[1400px] mx-auto flex flex-col gap-16 md:gap-24 min-h-[70vh]">
        
        {/* Decorative Background Elements */}
        {/* <div className="absolute top-10 right-10 opacity-30 pointer-events-none z-0">
          <svg width="200" height="200" viewBox="0 0 100 100" fill="none" stroke="#B89355" strokeWidth="0.5">
            <circle cx="50" cy="50" r="40" strokeDasharray="2 4" />
            <path d="M50 0 L50 100 M0 50 L100 50 M15 15 L85 85 M15 85 L85 15" strokeOpacity="0.3"/>
            <circle cx="50" cy="5" r="2" fill="#B89355" />
            <circle cx="95" cy="50" r="2" fill="#B89355" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none z-0">
          <svg width="300" height="300" viewBox="0 0 100 100" fill="#B89355">
            <path d="M80,50 A30,30 0 0,0 50,20 A40,40 0 0,1 50,80 A30,30 0 0,0 80,50 Z" />
          </svg>
        </div> */}

        {/* --- Top Section: Live Class --- */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center relative z-10 lg:min-h-[50vh]">
          {/* Left Side: NEW.png */}
          <div className="flex-1 w-full max-w-2xl mx-auto flex justify-center" data-aos="fade-right">
            <img 
              src="/images/live.png" 
              alt="Sara Tarot Card Reader Live Class" 
              className="w-auto h-auto max-w-[85%] md:max-w-md max-h-[50vh] md:max-h-[75vh] rounded-2xl md:rounded-3xl drop-shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300" 
              onClick={() => setIsZoomed(true)}
              title="Click to view full image"
            />
          </div>

          {/* Right Side: Poster Content */}
          <div className="flex-1 w-full flex flex-col justify-center items-center text-center lg:items-start lg:text-left lg:pl-10" data-aos="fade-left">
            <p className="text-xl md:text-2xl font-serif italic text-[#B89355] mb-3 font-medium">
              Unlock the Secrets of the Universe with
            </p>
            <h1 className="text-[1.8rem] md:text-[2.8rem] font-serif leading-[1.1] mb-5 font-bold text-[#0C3229] uppercase tracking-tight">
              Sara Tarot Card Reader
            </h1>
            
            {latestClass ? (
              <Link 
                to={`/live-class/${latestClass.meetingUrl}`}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 text-[#0C3229] px-4 py-1.5 rounded-full font-bold tracking-[0.1em] text-sm md:text-base mb-6 shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:shadow-[0_0_25px_rgba(245,158,11,0.8)] inline-flex items-center gap-2 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse border border-white"></div>
                JOIN LIVE CLASS
              </Link>
            ) : (
              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-[#0C3229] px-4 py-1.5 rounded-full font-bold tracking-[0.1em] text-sm md:text-base mb-6 shadow-lg shadow-amber-500/30 inline-block">
                LIVE CLASS
              </div>
            )}

            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[#B89355] mb-5 tracking-wide">
              30 DAYS BASIC TAROT COURSE
            </h2>
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 md:gap-4 text-base md:text-lg lg:text-xl font-bold text-[#0C3229] tracking-wider uppercase mb-8">
              <span>Learn</span>
              <span className="text-[#B89355]">•</span>
              <span>Understand</span>
              <span className="text-[#B89355]">•</span>
              <span>Read</span>
              <span className="text-[#B89355]">•</span>
              <span>Transform</span>
            </div>

            <div className="mt-4 flex flex-col items-center lg:items-start">
              <h3 className="text-lg font-bold text-[#0C3229] mb-3">Register for the Live Class</h3>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setRegisterStatus('Google Sign-In failed');
                }}
                shape="pill"
                theme="filled_blue"
                text="continue_with"
              />
              {registerStatus && (
                <p className={`mt-3 font-semibold ${registerStatus.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                  {registerStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- Bottom Section: Syllabus --- */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center relative z-10 lg:min-h-[50vh]">
          {/* Left Side: Syllabus Graphic Image */}
          <div className="flex-1 w-full max-w-2xl mx-auto flex justify-center" data-aos="fade-right">
            <LazyLoad once><img 
              src="/images/hero-1.webp" 
              alt="Tarot Card Reading Class Syllabus" 
              className="w-full max-w-lg object-contain drop-shadow-xl" 
            /></LazyLoad>
          </div>

          {/* Right Side: Text & CTA */}
          <div className="flex-1 w-full flex flex-col justify-center items-center text-center lg:items-start lg:text-left lg:pl-10" data-aos="fade-left">
            <h2 className="text-[2.2rem] md:text-[3.2rem] font-serif leading-[1.1] mb-8 font-bold tracking-tight">
              <span className="text-[#B89355] block mb-2 whitespace-nowrap">Unlock Your Intuition</span>
              <span className="text-[#0C3229] block">Access Pre-Recorded</span>
              <span className="text-[#0C3229] block">Tarot Classes</span>
            </h2>
            
            <button 
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} 
              className="inline-block bg-[#B69352] hover:bg-[#a38043] text-white text-lg md:text-xl font-semibold py-3 px-8 md:py-3.5 md:px-10 rounded-md transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Learning Now
            </button>
          </div>
        </div>

      </div>

      {/* Image Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8 cursor-pointer backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
        >
          <LazyLoad once><img 
            src="/images/live.png" 
            alt="Sara Tarot Card Reader Live Class Full" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          /></LazyLoad>
        </div>
      )}
    </section>
  );
};

export default Hero;
