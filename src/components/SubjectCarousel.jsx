import React from 'react';
import { biology, chemistry, physics, maths, art, geography, science, accounting } from '../assets/index.js';

// Note: Ensure your 'assets/index.js' exports these names exactly. 
// If 'math' is exported as 'maths' there, update it here.
const subjectData = [
  { name: "Biology", img: biology, desc: "Life Science" },
  { name: "Mathematics", img: maths, desc: "Core Logic" },
  { name: "Physics", img: physics, desc: "Matter & Energy" },
  { name: "Chemistry", img: chemistry, desc: "Molecular Study" },
  { name: "Art", img: art, desc: "Creative Vision" },
  { name: "Geography", img: geography, desc: "World Systems" },
  { name: "Science", img: science, desc: "Exploration" },
  { name: "Accounting", img: accounting, desc: "Financial Data" }
];

const SubjectCarousel = () => {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <h2 className="text-3xl font-bold mb-10 text-center text-slate-900">Explore Our Subjects</h2>
      
      {/* Wrapper with animation class */}
      <div className="flex w-full overflow-hidden">
        <div className="flex space-x-6 animate-bounce-scroll whitespace-nowrap px-6 w-max">
          {[...subjectData, ...subjectData].map((sub, index) => (
            <div 
              key={index}
              className="relative group w-64 h-80 flex-shrink-0 rounded-3xl overflow-hidden shadow-lg cursor-pointer transition-transform duration-500 hover:scale-105"
            >
              <img 
                src={sub.img} 
                alt={sub.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              
              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent" />
              
              {/* Subject Details */}
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold">{sub.name}</h3>
                <p className="text-sm text-blue-100 opacity-90 mt-1">
                  {sub.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubjectCarousel;