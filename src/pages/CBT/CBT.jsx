import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const exams = [
  "WAEC", "NECO", "GCE", "JAMB", "JUPEB", "IJMB",
  "SAT", "IGCSE", "ACT", "IB", "JEE", "NEET",
  "GCSE", "HSC", "VCE", "QCE", "NCEA", "IELTS",
];

const CBT = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05060a] text-white relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full top-[-200px] left-[-200px] animate-pulse" />
        <div className="absolute w-[600px] h-[600px] bg-purple-600/10 blur-[140px] rounded-full bottom-[-200px] right-[-200px] animate-pulse" />
      </div>

      {/* HERO */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 text-center">

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent"
        >
          Scholiqen CBT Examination Portal
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 mt-4 text-sm md:text-base max-w-2xl mx-auto"
        >
          Structured CBT practice across WAEC, JAMB, SAT and more.
        </motion.p>
      </div>

      {/* TOP DIVIDER (FULL MOVING LIGHT) */}
      <div className="relative z-10 max-w-5xl mx-auto mt-10 px-6">
        <div className="relative h-[2px] bg-white/10 overflow-hidden rounded-full">

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-[move_2.5s_linear_infinite]" />

          {/* edge glow dots */}
          <div className="absolute left-0 top-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-y-1/2 animate-pulse" />
          <div className="absolute right-0 top-1/2 w-2 h-2 bg-purple-400 rounded-full -translate-y-1/2 animate-pulse" />
        </div>
      </div>

      {/* GRID */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">

        {exams.map((exam, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/cbt/exam/${exam}`)}
            className="relative cursor-pointer rounded-2xl p-5 text-center
              border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden group"
          >

            {/* hover light */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 blur-2xl animate-pulse" />
            </div>

            <h2 className="text-sm font-semibold relative z-10 group-hover:text-blue-300">
              {exam}
            </h2>

            <p className="text-[10px] text-gray-500 mt-1 relative z-10">
              Select Subjects
            </p>
          </motion.div>
        ))}
      </div>

      {/* FOOTER DIVIDER (SAME EFFECT) */}
      <div className="relative z-10 max-w-4xl mx-auto mt-20 px-6">
        <div className="relative h-[2px] bg-white/10 overflow-hidden rounded-full">

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-[move_3s_linear_infinite]" />

          <div className="absolute left-0 top-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-y-1/2 animate-pulse" />
          <div className="absolute right-0 top-1/2 w-2 h-2 bg-purple-400 rounded-full -translate-y-1/2 animate-pulse" />
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 mt-10 text-center pb-16">

        <p className="text-gray-400 text-sm">
          Practice exam-standard CBT questions across multiple exam bodies.
        </p>

        <div className="mt-6 text-xs text-gray-600">
          Powered by Scholiqen CBT System © {new Date().getFullYear()}
        </div>
      </div>

      {/* ANIMATION KEYFRAMES */}
      <style>
        {`
          @keyframes move {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .animate-\[move_2\.5s_linear_infinite\] {
            animation: move 2.5s linear infinite;
          }

          .animate-\[move_3s_linear_infinite\] {
            animation: move 3s linear infinite;
          }
        `}
      </style>

    </div>
  );
};

export default CBT;