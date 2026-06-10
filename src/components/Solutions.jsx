import React, { useContext } from "react";
import { ConnectContext } from "../context/ConnectContext";
import course_icon from "../assets/course_icon.png";
import ai_tutoring_icon from "../assets/ai_tutoring_icon.png";
import lms_icon from "../assets/lms_icon.png";
import classroom_icon from "../assets/classroom_icon.png";
import assessment_icon from "../assets/assessment_icon.png";

const Solutions = () => {
  const { darkMode } = useContext(ConnectContext);
  const educationalSolutions = [
    { icon: course_icon, title: "Online Courses", desc: "Comprehensive structured learning paths." },
    { icon: ai_tutoring_icon, title: "AI Tutoring", desc: "Personalized learning for your progress." },
    { icon: lms_icon, title: "LMS Integration", desc: "Seamless school system connection." },
    { icon: classroom_icon, title: "Virtual Classrooms", desc: "Interactive live learning experience." },
    { icon: assessment_icon, title: "Skill Assessment", desc: "Track your performance and improvement." },
  ];

  return (
    <section
      className={`py-24 transition-colors duration-300 ${ darkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900" }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center">
          Building Futures Through Learning
        </h2>

        <p
          className={`mt-4 mb-16 max-w-2xl mx-auto text-center ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          We create opportunities for growth through structured learning,
          skill development, and guided educational systems.
        </p>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {educationalSolutions.map((solution, index) => (
            <div
              key={index}
              className={`group rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 ${
                darkMode
                  ? "bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10"
                  : "bg-white border border-gray-100 shadow-md hover:shadow-xl"
              }`}
            >
              {/* ICON BOX */}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-all duration-300 ${
                  darkMode
                    ? "bg-white/10 group-hover:bg-blue-500/20"
                    : "bg-blue-50 group-hover:bg-blue-600"
                }`}
              >
                <img
                  src={solution.icon}
                  alt={solution.title}
                  className={`w-10 h-10 transition-all duration-300 ${
                    darkMode ? "opacity-90" : "group-hover:invert"
                  }`}
                />
              </div>

              <h4 className="text-lg font-semibold mb-2">
                {solution.title}
              </h4>

              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {solution.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Solutions;