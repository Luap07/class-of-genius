import React, { useContext } from "react";
import { ConnectContext } from "../context/ConnectContext";
import { thomas } from "../assets/index";

const TestimonialSection = () => {
  const { darkMode } = useContext(ConnectContext);
  return (
    <section
      className={`py-20 px-6 transition-colors duration-300 ${ darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900" }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Leaders Say
        </h2>

        {/* CARD */}
        <div
          className={`text-center p-10 md:p-16 rounded-3xl border transition-all duration-300 backdrop-blur-xl ${
            darkMode
              ? "bg-white/5 border-white/10 shadow-lg"
              : "bg-white border-gray-100 shadow-xl"
          }`}
        >
          {/* AVATAR */}
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-8 overflow-hidden shadow-md ${
              darkMode ? "ring-2 ring-white/10" : "ring-2 ring-gray-100"
            }`}
          >
            <img
              src={thomas}
              alt="Tutor"
              className="w-full h-full object-cover"
            />
          </div>

          {/* QUOTE START */}
          <p className="text-5xl text-blue-600 font-serif leading-none mb-4">
            “
          </p>

          {/* TEXT */}
          <p
            className={`text-xl md:text-2xl italic leading-relaxed px-4 ${
              darkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            "Class of Genius has completely transformed our educational approach.
            The platform's expert tools and intuitive design have made it
            incredibly easy for our students to thrive and reach their full
            potential. It is truly the gold standard for modern learning."
          </p>

          {/* QUOTE END */}
          <p className="text-5xl text-blue-600 font-serif leading-none mt-4 rotate-180 inline-block">
            “
          </p>

          {/* AUTHOR */}
          <div className="mt-8">
            <h4 className="font-bold text-lg">
              Thomas Anderson
            </h4>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Student
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default TestimonialSection;