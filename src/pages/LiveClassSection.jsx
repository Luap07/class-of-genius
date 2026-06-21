import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Cog from "../assets/cog.png";


const liveClasses = [
  {
    
    title: "WAEC Live Class",
    desc: "Structured WAEC preparation with expert guidance",
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "JAMB Live Class",
    desc: "Focused UTME exam mastery sessions",
    color: "from-purple-500 to-pink-400",
  },
  {
    title: "NECO Live Class",
    desc: "Comprehensive NECO revision program",
    color: "from-green-500 to-emerald-400",
  },
  {
    title: "IELTS Live Class",
    desc: "Academic English training: speaking, writing & listening",
    color: "from-orange-500 to-yellow-400",
  },
];

const LiveClassSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen py-20 px-6 text-white bg-[#05060a] overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full top-[-200px] left-[-200px] animate-pulse" />
        <div className="absolute w-[600px] h-[600px] bg-purple-600/10 blur-[140px] rounded-full bottom-[-200px] right-[-200px] animate-pulse" />
      </div>

      {/* HEADER */}
      <div className="relative z-10 text-center mb-12">

        <div className="flex items-center justify-center gap-4 mb-3">
          <img
            src={Cog}
            alt="logo"
            className="w-14 h-14 object-contain"
          />

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-300 via-white to-purple-400 bg-clip-text text-transparent">
            Scholiqen AI Academy
          </h1>
        </div>

        <p className="text-gray-400 mt-3 text-sm md:text-base">
          Structured learning sessions powered by AI-assisted tutoring systems
        </p>
      </div>

      {/* CARDS */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

        {liveClasses.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/live")}
            className="relative cursor-pointer rounded-2xl p-6 bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden shadow-lg"
          >
            <div className={`h-1 w-full rounded-full mb-4 bg-gradient-to-r ${item.color}`} />

            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-xs text-gray-400 mt-2">{item.desc}</p>

            <div className="mt-5">
              <button className="px-4 py-2 text-xs rounded-lg bg-blue-600/20 border border-blue-400/30 hover:bg-blue-500/30 transition">
                Enter Class
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* START CLASS BUTTON (IMPORTANT FIX) */}
      <div className="relative z-10 flex justify-center mt-12">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/ai-tutor-session")}
          className="px-10 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 border border-white/10 shadow-lg"
        >
          Start Class 🚀
        </motion.button>
      </div>

      {/* DIVIDER (FULL SCREEN ANIMATION FIXED) */}
      <div className="relative mt-20 max-w-5xl mx-auto">
        <div className="h-[2px] bg-white/10 overflow-hidden rounded-full relative">

          <motion.div
            className="absolute h-full w-28 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{ x: ["-200%", "200%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="absolute h-full w-20 bg-gradient-to-r from-transparent via-blue-300 to-transparent"
            animate={{ x: ["-250%", "250%"] }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "linear",
              delay: 2,
            }}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 mt-20 max-w-5xl mx-auto text-center">

        <p className="text-gray-300 text-sm md:text-base">
          Powered by <span className="text-blue-300 font-semibold">Scholiqen</span> — AI-driven academic learning platform for WAEC, JAMB, NECO & IELTS preparation.
        </p>

        <p className="text-xs text-gray-500 mt-3">
          © {new Date().getFullYear()} Scholiqen Learning System
        </p>
      </div>

    </div>
  );
};

export default LiveClassSection;