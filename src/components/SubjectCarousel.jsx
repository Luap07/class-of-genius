import React, { useContext } from "react";
import { ConnectContext } from "../context/ConnectContext";
import {
  biology,
  chemistry,
  physics,
  maths,
  art,
  geography,
  science,
  accounting
} from "../assets/index.js";

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
  const { darkMode } = useContext(ConnectContext);

  return (
    <section
      className={`py-16 overflow-hidden px-6 md:px-12 transition-colors duration-300 ${ darkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900" }`}
    >
      <h2 className="text-3xl font-bold mb-10 text-center">Explore Our Subjects</h2>
      <div className="flex w-full overflow-hidden">
        <div className="flex space-x-6 animate-bounce-scroll whitespace-nowrap w-max">
          {[...subjectData, ...subjectData].map((sub, index) => (
            <div
              key={index}
              className="relative group w-64 h-80 flex-shrink-0 rounded-3xl overflow-hidden cursor-pointer transition-transform duration-500 hover:scale-105"
            >
              {/* IMAGE */}
              <img
                src={sub.img}
                alt={sub.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* SOFT OVERLAY */}
              <div
                className={`absolute inset-0 ${
                  darkMode
                    ? "bg-black/40"
                    : "bg-blue-900/20"
                }`}
              />

              {/* GLASS CARD */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%]">
                <div
                  className={`backdrop-blur-xl rounded-2xl px-4 py-3 border shadow-lg transition-all duration-300 ${
                    darkMode
                      ? "bg-white/10 border-white/10"
                      : "bg-white/40 border-white/50"
                  }`}
                >
                  <h3 className="text-lg font-bold">
                    {sub.name}
                  </h3>

                  <p
                    className={`text-xs mt-1 ${
                      darkMode ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    {sub.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default SubjectCarousel;