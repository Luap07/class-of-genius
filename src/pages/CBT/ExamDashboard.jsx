import React from "react";
import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";

const ExamDashboard = () => {
  const navigate = useNavigate();

  const exams = [
    "WAEC",
    "NECO",
    "JAMB",
    "JUPEB",
    "GCE",
    "IJMB",
    "IGCSE",
    "A-LEVEL",
    "ACT",
    "IB",
    "GCSE",
    "IELTS",
  ];

  const handleSelectExam = (exam) => {
    localStorage.setItem("cbt_exam", exam);

    setTimeout(() => {
      // 🔥 UPDATED ROUTE → goes to ExamSelect.jsx
      navigate("/cbt/select");
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-10">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-10 animate-fadeIn">

        {/* LEFT BRAND */}
        <div className="flex items-center gap-3">
          <img
            src={Cog}
            alt="logo"
            className="w-12 h-12 object-contain animate-spin-slow"
          />

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
              Scholiqen CBT
            </h1>
            <p className="text-gray-400 text-sm">
              Smart Exam Simulation Platform
            </p>
          </div>
        </div>

        {/* RIGHT BADGE */}
        <div className="hidden md:block text-right">
          <p className="text-xs text-gray-400">
            AI Assisted Evaluation Engine
          </p>
          <p className="text-sm text-green-400 font-semibold">
            99% Accuracy Simulation Score
          </p>
        </div>
      </div>

      {/* TRUST MESSAGE */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 leading-relaxed">
          Scholiqen CBT is designed to help you prepare under real examination conditions.
          It simulates exam timing, structure, and question flow so you can build confidence,
          improve speed, and perform better in your actual exams.
        </div>
      </div>

      {/* EXAMS GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">

        {exams.map((exam, index) => (
          <div
            key={exam}
            onClick={() => handleSelectExam(exam)}
            className="
              group relative cursor-pointer
              opacity-0 translate-y-6
              animate-[fadeUp_0.5s_ease_forwards]
            "
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="
              relative p-5 rounded-2xl
              bg-white/5 border border-white/10
              backdrop-blur-md shadow-lg
              transition-all duration-300
              group-hover:scale-105
              group-hover:bg-white/10
              group-hover:border-white/20
              group-hover:shadow-blue-500/10
            ">

              {/* glow effect */}
              <div className="
                absolute inset-0 rounded-2xl
                opacity-0 group-hover:opacity-100
                transition duration-300
                bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10
                blur-xl
              " />

              <div className="relative z-10 text-center">
                <div className="text-xs text-gray-400 mb-2">
                  CBT Board {index + 1}
                </div>

                <h2 className="text-lg font-semibold tracking-wide">
                  {exam}
                </h2>

                <p className="text-xs text-gray-500 mt-2 group-hover:text-gray-300 transition">
                  Click to begin exam →
                </p>
              </div>
            </div>
          </div>
        ))}

      </div>

      {/* FOOTER */}
      <div className="max-w-6xl mx-auto mt-12 text-center text-gray-500 text-sm animate-fadeIn">
        © {new Date().getFullYear()} Scholiqen CBT • Built for real exam simulation
      </div>

      {/* ANIMATIONS */}
      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fadeIn {
            animation: fadeUp 0.6s ease forwards;
          }

          .animate-spin-slow {
            animation: spin 6s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ExamDashboard;