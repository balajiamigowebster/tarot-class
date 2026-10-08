import React from 'react';
import { Link } from 'react-router-dom';
import _ReactLazyLoad from 'react-lazyload';
const LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Karthik",
      rating: "5/5",
      text: '"Sara\'s pre-recorded classes are incredibly clear. The way she explains complex Tarot concepts is amazing. It really helped me start my journey."',
      author: "Karthik N., Chennai",
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      id: 2,
      name: "Priya",
      rating: "5/5",
      text: '"Very insightful and empowering sessions. I felt a strong connection and her guidance has been life-changing. Highly recommend her tarot classes."',
      author: "Priya S., Coimbatore",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      id: 3,
      name: "Divya",
      rating: "5/5",
      text: '"The classes are so well structured. Sara\'s teaching style is very practical. It has transformed how I do my tarot readings completely!"',
      author: "Divya R., Madurai",
      avatar: "https://i.pravatar.cc/150?img=9"
    }
  ];

  return (
    <section className="w-full py-16 px-4 md:px-12 relative z-20">
      <div className="max-w-6xl mx-auto" data-aos="fade-up">
        
        {/* Testimonials Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0C3229] font-serif mb-10 text-center">
            What Students Are Saying
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <LazyLoad once><img src={review.avatar} alt="Student" className="w-12 h-12 rounded-full object-cover" /></LazyLoad>
                  <div>
                    <h4 className="font-bold text-[#1D2939]">{review.name}</h4>
                    <p className="text-sm font-semibold text-slate-500">{review.rating}</p>
                  </div>
                </div>
                
                <div className="flex text-[#B89355] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-slate-500 font-bold">5/5</span>
                </div>
                
                <p className="text-[#475467] font-medium mb-6 flex-1 text-sm leading-relaxed">
                  {review.text}
                </p>
                
                <p className="text-sm text-[#1D2939] font-bold mt-auto">
                  {review.author}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Instructor Section */}
        <div className="mb-10 mt-16 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mx-auto">
            <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
              <LazyLoad once><img 
                src="/images/tarot-class.webp" 
                alt="Sara Tarot Reader" 
                className="w-56 h-72 md:w-72 md:h-96 rounded-2xl object-cover shadow-lg object-top"
              /></LazyLoad>
            </div>
            
            <div className="flex-1 text-center md:text-left pt-4">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0C3229] font-serif mb-6">
                Meet Your Instructor
              </h2>
              <h3 className="text-2xl font-bold text-[#1D2939] mb-1">Sara Tarot Reader</h3>
              <p className="text-[#0C3229] font-bold mb-6">Certified Tarot Professional</p>
              
              <p className="text-[#475467] mb-4 leading-relaxed text-sm md:text-base">
                Sara's journey into the mystical realm of Tarot and spiritual healing began as a deeply personal calling to help others find alignment. Guided by decades of study and intuitive practice, she founded Sara Tarot to bridge the gap between the material world and divine wisdom.
              </p>
              <p className="text-[#475467] leading-relaxed text-sm md:text-base">
                Through personalized consultations and spiritual classes, Sara provides a compassionate, empowering space. Every reading and session is crafted to decode life's complexities and guide your spirit toward absolute clarity.
              </p>
            </div>
          </div>
        </div>



      </div>
    </section>
  );
};

export default Testimonials;
