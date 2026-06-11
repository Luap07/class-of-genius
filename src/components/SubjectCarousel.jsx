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
    <section className="relative py-24 px-6 md:px-12 overflow-hidden">

      {/* ================= SOFT GRADIENT BACKGROUND (LIKE SOLUTIONS) ================= */}
      <div className="absolute inset-0 -z-10">
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            darkMode
              ? "bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070a12]"
              : "bg-gradient-to-br from-blue-50 via-white to-slate-100"
          }`}
        />

        {/* soft glowing orbs (professional feel) */}
        <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-blue-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-indigo-300/10 blur-[120px] rounded-full" />
      </div>

      {/* ================= TITLE ================= */}
      <h2 className={`text-3xl font-bold text-center mb-12 ${
        darkMode ? "text-white" : "text-slate-900"
      }`}>
        Explore Our Subjects
      </h2>

      {/* ================= CAROUSEL ================= */}
      <div className="overflow-hidden w-full">

        <div className="flex gap-8 w-max animate-scroll">

          {[...subjectData, ...subjectData].map((sub, index) => (
            <div
              key={index}
              className="relative group w-64 h-80 flex-shrink-0 rounded-3xl overflow-hidden
              transition-transform duration-500 hover:scale-105"
            >

              <img
                src={sub.img}
                alt={sub.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              {/* card */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[88%]">
                <div
                  className={`backdrop-blur-xl rounded-2xl px-5 py-4 border shadow-lg
                  ${
                    darkMode
                      ? "bg-white/10 border-white/10"
                      : "bg-white/70 border-white/40 shadow-blue-100"
                  }`}
                >
                  <h3 className={`text-lg font-bold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}>
                    {sub.name}
                  </h3>

                  <p className={`text-xs mt-1 ${
                    darkMode ? "text-gray-300" : "text-slate-600"
                  }`}>
                    {sub.desc}
                  </p>
                </div>
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* ================= ANIMATION FIX ================= */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-scroll {
          animation: scroll 28s linear infinite;
        }
      `}</style>

    </section>
  );
};

export default SubjectCarousel;