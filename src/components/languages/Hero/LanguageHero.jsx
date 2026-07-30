// src/pages/languages/LanguageHero.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  Globe2,
  Sparkles,
  Play,
  ArrowRight,
  Languages,
  Mic,
  Brain,
  Users,
  BookOpen,
  Award,
} from "lucide-react";

const stats = [
  {
    title: "Languages",
    value: "50+",
    icon: Globe2,
  },
  {
    title: "Interactive Lessons",
    value: "1,000+",
    icon: BookOpen,
  },
  {
    title: "Active Learners",
    value: "Worldwide",
    icon: Users,
  },
];

export default function LanguageHero() {
  const scrollToExplore = () => {
    document
      .getElementById("language-explore")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const startLearning = () => {
    document
      .getElementById("language-explore")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
      {/* Background Glow Effects */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      <div className="relative grid items-center gap-12 lg:grid-cols-2">
        
        {/* LEFT COLUMN: HERO CONTENT & STATS */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-bold text-cyan-300 backdrop-blur-md">
            <Sparkles size={16} />
            AI Powered Language Learning
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl text-white">
            Master Any
            <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent pb-1">
              Language Faster
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Learn languages through interactive lessons, AI conversations, vocabulary training, pronunciation practice, and worldwide communication.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={startLearning}
              className="flex items-center gap-3 rounded-2xl bg-cyan-400 px-7 py-4 font-black text-black transition-all hover:scale-105 hover:bg-cyan-300 shadow-lg shadow-cyan-400/25 active:scale-95"
            >
              <Play size={18} className="fill-black" />
              Start Learning
            </button>

            <button
              onClick={scrollToExplore}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-bold text-white transition-all hover:bg-white/10 active:scale-95"
            >
              Explore Languages
              <ArrowRight size={18} />
            </button>
          </div>

          {/* STATS SECTION */}
          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Icon size={18} />
                    <span className="text-xl font-black text-white">{stat.value}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-400">{stat.title}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL / GLOBE AREA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative flex justify-center"
        >
          <div className="relative flex h-[420px] w-[420px] items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
            
            {/* Center Orb Glow */}
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-cyan-400/30 to-purple-500/30 blur-2xl pointer-events-none" />

            {/* Rotating World Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Globe2 size={160} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]" />
            </motion.div>

            {/* Floating Card 1: Languages */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-0 top-16 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md"
            >
              <Languages className="text-purple-400" size={24} />
              <p className="mt-2 text-xs font-bold text-white">50+ Languages</p>
            </motion.div>

            {/* Floating Card 2: Speaking AI */}
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-16 left-0 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md"
            >
              <Mic className="text-green-400" size={24} />
              <p className="mt-2 text-xs font-bold text-white">Speaking AI</p>
            </motion.div>

            {/* Floating Card 3: Smart Practice */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 right-8 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md"
            >
              <Brain className="text-yellow-400" size={24} />
              <p className="mt-2 text-xs font-bold text-white">Smart Practice</p>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}