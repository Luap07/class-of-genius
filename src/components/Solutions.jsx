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
    <section className="relative py-24 overflow-hidden">

      {/* ================= CLEAN GRADIENT BACKGROUND (NO TABLE / NO DOTS) ================= */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#060913]" />

        {/* soft glow ambient light */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-white">
          Building Futures Through Learning
        </h2>

        <p className="mt-4 mb-16 max-w-2xl mx-auto text-center text-gray-300">
          We create opportunities for growth through structured learning,
          skill development, and guided educational systems.
        </p>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

          {educationalSolutions.map((solution, index) => (
            <div
              key={index}
              className="
                relative group
                rounded-3xl p-6 text-center
                bg-white/5 border border-white/10
                backdrop-blur-xl
                transition-all duration-300
                hover:-translate-y-2
                hover:border-yellow-400/50
                hover:shadow-[0_0_30px_rgba(250,204,21,0.18)]
              "
            >

              {/* ICON BOX (MORE VISIBLE + GLOW) */}
              <div
                className="
                  relative w-20 h-20 mx-auto mb-5
                  rounded-full flex items-center justify-center
                  bg-yellow-400/10
                  border border-yellow-400/30
                  shadow-[0_0_20px_rgba(250,204,21,0.15)]
                  group-hover:shadow-[0_0_35px_rgba(250,204,21,0.25)]
                  transition-all duration-300
                "
              >
                <img
                  src={solution.icon}
                  alt={solution.title}
                  className="
                    w-10 h-10
                    brightness-125
                    drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]
                    group-hover:scale-110
                    transition
                  "
                />
              </div>

              {/* TITLE */}
              <h4 className="text-lg font-semibold text-white mb-2">
                {solution.title}
              </h4>

              {/* DESC */}
              <p className="text-sm text-gray-300">
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