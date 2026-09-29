import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { config } from '../config';

const Navbar = () => {
  const location = useLocation();
  const [syllabusCategories, setSyllabusCategories] = useState([]);
  
  useEffect(() => {
    fetch(`${config.API_BASE_URL}/api/syllabus/categories`)
      .then(res => res.json())
      .then(data => setSyllabusCategories(data))
      .catch(err => console.error("Error fetching categories for navbar:", err));
  }, []);

  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }
  
  const navLinks = [
    { name: 'Home', path: '/home' },
    { 
      name: 'Syllabus', 
      path: '#',
      submenus: syllabusCategories.map(cat => ({
        name: cat.name,
        path: `/syllabus/${cat.slug}`
      }))
    },
    // { name: 'Courses', path: '/videos' },
    { name: 'My Dashboard', path: '/dashboard' }
  ];

  return (
    <nav className="bg-[#FCFBFA] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link to="/home" className="flex flex-col items-center justify-center">
            <img 
              src="/images/website-logo-main.webp" 
              alt="SoulSage" 
              className="h-10 md:h-12 w-auto object-contain" 
            />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-8 items-center text-[15px] font-bold text-[#1D2939]">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <Link 
                  to={link.path}
                  className={`py-2 border-b-[3px] transition-colors flex items-center gap-1 ${
                    location.pathname === link.path || (link.name === 'Home' && location.pathname === '/home') || (link.name === 'Syllabus' && location.pathname.includes('/syllabus'))
                      ? 'border-[#0F3C34] text-[#1D2939]' 
                      : 'border-transparent hover:text-[#0F3C34] hover:border-slate-200'
                  }`}
                >
                  {link.name}
                  {link.submenus && (
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-[#0F3C34] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  )}
                </Link>

                {link.submenus && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-white shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-slate-100 flex flex-col py-3 max-h-[70vh] overflow-y-auto">
                    {link.submenus.map(sub => (
                      <Link 
                        key={sub.name} 
                        to={sub.path}
                        className={`px-5 py-2.5 transition-colors text-sm font-semibold ${
                          location.pathname === sub.path ? 'bg-[#B89355]/10 text-[#0F3C34]' : 'text-gray-600 hover:bg-[#B89355]/10 hover:text-[#0F3C34]'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden lg:block text-[15px] font-bold text-[#1D2939]">
              Gen Torn Reader Profile
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
