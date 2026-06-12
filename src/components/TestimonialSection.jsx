import React, { useContext } from "react";
import { ConnectContext } from "../context/ConnectContext";
import { thomas } from "../assets/index";

const TestimonialSection = () => {
  const { darkMode } = useContext(ConnectContext);

  return (
    <section className="relative py-24 px-6 overflow-hidden">

      {/* PROFESSIONAL BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div
          className={`absolute inset-0 ${
            darkMode
              ? "bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#0a0f1a]"
              : "bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#060913]"
          }`}
        />

        {/* Glow Effects */}
        <div className="absolute -top-20 left-1/4 w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[380px] h-[380px] rounded-full bg-indigo-500/10 blur-[130px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* HEADER */}
        <h2
          className={`text-4xl font-bold text-center mb-4 ${
            darkMode ? "text-white" : "text-white/90"
          }`}
        >
          What Our Leaders Say
        </h2>

        <p
          className={`text-center mb-14 max-w-2xl mx-auto ${
            darkMode ? "text-gray-300" : "text-gray-400"
          }`}
        >
          Hear from learners and leaders who have experienced the impact of
          Scholiqen on modern education.
        </p>

        {/* CARD */}
        <div
          className={`relative text-center p-10 md:p-16 rounded-3xl border backdrop-blur-2xl transition-all duration-300 ${
            darkMode
              ? "bg-white/5 border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.12)]"
              : "bg-[#070b14] border-white shadow-xl"
          }`}
        >
          {/* Avatar */}
          <div
            className={`w-24 h-24 rounded-full mx-auto mb-8 overflow-hidden ${
              darkMode
                ? "ring-4 ring-blue-500/20"
                : "ring-4 ring-blue-100"
            }`}
          >
            <img
              src={thomas}
              alt="Tutor"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Quote */}
          <div className="text-6xl text-white/80 leading-none font-serif">
            “
          </div>

          <p
            className={`mt-4 text-xl md:text-2xl italic leading-relaxed ${
              darkMode ? "text-gray-200" : "text-white/90"
            }`}
          >
            Scholiqen has completely transformed our educational
            approach. The platform's expert tools and intuitive design have
            made it incredibly easy for our students to thrive and reach
            their full potential. It is truly the gold standard for modern
            learning.
          </p>

          <div className="text-6xl text-white/80 leading-none font-serif rotate-180 inline-block mt-4">
            “
          </div>

          {/* Divider */}
          <div
            className={`w-20 h-[2px] mx-auto my-8 ${
              darkMode ? "bg-blue-500/40" : "bg-blue-300"
            }`}
          />

          {/* Author */}
          <h4
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-white/90"
            }`}
          >
            Thomas Anderson
          </h4>

          <p
            className={`mt-1 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Student
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;