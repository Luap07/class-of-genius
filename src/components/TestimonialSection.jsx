import React from 'react';
import { home_bg } from '../assets/index'; 

const TestimonialSection = () => {
  return (
    <section className="py-20 bg-gray-50 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">What Our Leaders Say</h2>
        
        {/* Shadowed Testimonial Card */}
        <div className="text-center bg-white p-10 md:p-16 rounded-2xl shadow-xl border border-gray-100">
          
          <div className="w-20 h-20 rounded-full mx-auto mb-8 bg-gray-200 overflow-hidden shadow-inner">
            <img src={home_bg} alt="Tutor" className="w-full h-full object-cover" />
          </div>

          <p className="text-5xl text-blue-800 font-serif leading-none mb-4">“</p>
          
          <p className="text-xl md:text-2xl text-gray-800 italic leading-relaxed px-4">
            "Class of Genius has completely transformed our educational approach. 
            The platform's expert tools and intuitive design have made it incredibly 
            easy for our students to thrive and reach their full potential. 
            It is truly the gold standard for modern learning."
          </p>

          <p className="text-5xl text-blue-800 font-serif leading-none mt-4 rotate-180 inline-block">“</p>
          
          <div className="mt-8">
            <h4 className="font-bold text-lg text-gray-900">Emily Watson</h4>
            <p className="text-gray-500 text-sm">Student</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;