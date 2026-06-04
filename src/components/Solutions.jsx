import React from "react";
import course_icon from "../assets/course_icon.png";
import ai_tutoring_icon from "../assets/ai_tutoring_icon.png";
import lms_icon from "../assets/lms_icon.png";
import classroom_icon from "../assets/classroom_icon.png";
import assessment_icon from "../assets/assessment_icon.png";

const Solutions = () => {
  const educationalSolutions = [
    { icon: course_icon, title: "Online Courses", desc: "Comprehensive management and proactive care." },
    { icon: ai_tutoring_icon, title: "AI Tutoring", desc: "Personalized learning for specific goals, including test prep." },
    { icon: lms_icon, title: "LMS Integration", desc: "Harmonious connection with existing school management systems." },
    { icon: classroom_icon, title: "Virtual Classrooms", desc: "Specialized live sessions and interactive virtual environments." },
    { icon: assessment_icon, title: "Skill Assessment", desc: "Targeted skill assessment and growth tracking for progress." },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-950">Building Futures Through Learning</h2>
        <p className="text-gray-600 mt-4 mb-16 max-w-2xl mx-auto">
          We create opportunities for growth by providing quality educational resources, skill-based learning, and a supportive environment where every learner can thrive.
        </p>

        {/* SOLUTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {educationalSolutions.map((solution, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-lg shadow-blue-100/50 border border-gray-100 flex flex-col items-center group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200 hover:border-blue-600 hover:-translate-y-2"
            >
              {/* Blue Theme Icon Container */}
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <img
                  src={solution.icon}
                  alt={`${solution.title} icon`}
                  className="w-10 h-10 group-hover:invert group-hover:brightness-0 transition-all duration-300"
                />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                {solution.title}
              </h4>
              <p className="text-gray-600 text-sm">{solution.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;