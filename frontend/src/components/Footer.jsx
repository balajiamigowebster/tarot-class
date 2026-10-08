import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { config } from '../config';
import _ReactLazyLoad from 'react-lazyload';
const LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;

const Footer = () => {
  const [syllabusCategories, setSyllabusCategories] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${config.API_BASE_URL}/api/syllabus/categories`)
      .then(res => res.json())
      .then(data => setSyllabusCategories(data))
      .catch(err => console.error("Error fetching categories for footer:", err));
  }, []);

  // Hide footer on dashboard and login page
  if (location.pathname.startsWith('/dashboard') || location.pathname === '/') {
    return null;
  }

  return (
    <footer className="bg-[#0C3229] border-t-4 border-[#B89355] pt-16 pb-8 relative overflow-hidden z-20">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
          
          {/* Logo & Brand */}
          <div className="flex flex-col items-center lg:items-start lg:col-span-4">
            <Link to="/home" className="inline-block mb-6">
              <LazyLoad once><img 
                src="/images/website-logo-main.webp" 
                alt="Sara Tarot" 
                className="h-24 md:h-28 w-auto object-contain rounded-2xl shadow-lg" 
              /></LazyLoad>
            </Link>
            <p className="text-[#B89355] font-serif text-lg italic text-center lg:text-left mb-2">
              Unlock the Secrets of the Universe
            </p>
            <p className="text-white/70 text-sm text-center lg:text-left leading-relaxed">
              Empowering your spiritual journey with intuitive guidance, personalized classes, and absolute clarity.
            </p>
          </div>

          {/* Quick Links - Home & Syllabus */}
          <div className="lg:col-span-8 flex flex-col sm:flex-row justify-center lg:justify-end gap-10 sm:gap-16 text-center sm:text-left">
            <div className="min-w-[120px]">
              <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Explore</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/home" className="text-white/80 hover:text-[#B89355] transition-colors font-medium">
                    Home Page
                  </Link>
                </li>
                <li>
                  <button onClick={() => {
                    if (location.pathname === '/home') {
                      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate('/home#categories');
                    }
                  }} className="text-white/80 hover:text-[#B89355] transition-colors font-medium">
                    All Classes
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex-1 max-w-xl">
              <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Syllabus</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-left">
                {syllabusCategories.map(cat => (
                  <li key={cat.id}>
                    <Link to={`/syllabus/${cat.slug}`} className="text-white/80 hover:text-[#B89355] transition-colors font-medium text-[15px]">
                      {cat.name}
                    </Link>
                  </li>
                ))}
                {syllabusCategories.length === 0 && (
                  <li><span className="text-white/50 italic text-sm">Loading...</span></li>
                )}
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            &copy; {new Date().getFullYear()} Sara Tarot Classes. All rights reserved.
          </p>
          <p className="text-white/80 text-sm font-medium">
            Design by <a href="https://amigowebster.com/" target="_blank" rel="noopener noreferrer" className="text-[#B89355] hover:text-[#c19b52] font-bold hover:underline transition-colors">AmigoWebster</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
