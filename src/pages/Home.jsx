import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  School,
  Trophy,
  Sparkles,
  BookOpen,
  Brain,
  GraduationCap,
} from "lucide-react";

import Solutions from "../components/Solutions";
import CTASection from "../components/CTASection";
import SubjectCarousel from "../components/SubjectCarousel";
import TestimonialSection from "../components/TestimonialSection";
import Footer from "../components/Footer";
import Login from "../components/Login";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const stagger = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

/* =========================================================
   EDUCATION HERO VISUAL
   EVERYTHING IS CREATED MANUALLY
========================================================= */

const EducationVisual = () => {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="absolute left-[15%] top-[20%] w-[180px] h-[180px] rounded-full bg-cyan-500/5 blur-[80px]" />

      <div className="absolute right-[5%] bottom-[15%] w-[220px] h-[220px] rounded-full bg-indigo-500/10 blur-[90px]" />

      {/* =====================================================
          ORBIT RINGS
      ===================================================== */}

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-[430px] h-[430px] rounded-full border border-blue-400/10"
      />

      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-[520px] h-[520px] rounded-full border border-indigo-400/10"
      />

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-[590px] h-[590px] rounded-full border border-cyan-400/5"
      />

      {/* =====================================================
          SMALL ORBIT DOTS
      ===================================================== */}

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-[430px] h-[430px]"
      >
        <div className="absolute top-[-4px] left-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.9)]" />
      </motion.div>

      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-[520px] h-[520px]"
      >
        <div className="absolute bottom-[20px] right-[55px] w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.9)]" />
      </motion.div>

      {/* =====================================================
          GLOBE
      ===================================================== */}

      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-[7%] -translate-x-1/2 z-30"
      >
        <div className="relative w-[260px] h-[260px]">

          {/* Globe glow */}

          <div className="absolute inset-[-50px] rounded-full bg-blue-500/15 blur-[55px]" />

          <div className="absolute inset-[-20px] rounded-full border border-blue-400/10" />

          <svg
            viewBox="0 0 300 300"
            className="relative w-full h-full overflow-visible"
          >

            <defs>

              <radialGradient id="globeGradient">
                <stop
                  offset="0%"
                  stopColor="#38bdf8"
                  stopOpacity="0.32"
                />

                <stop
                  offset="55%"
                  stopColor="#2563eb"
                  stopOpacity="0.16"
                />

                <stop
                  offset="100%"
                  stopColor="#020617"
                  stopOpacity="0.04"
                />
              </radialGradient>

              <filter id="globeGlow">
                <feGaussianBlur
                  stdDeviation="2.5"
                  result="blur"
                />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <clipPath id="globeClip">
                <circle
                  cx="150"
                  cy="150"
                  r="112"
                />
              </clipPath>

            </defs>

            {/* Main globe */}

            <circle
              cx="150"
              cy="150"
              r="112"
              fill="url(#globeGradient)"
              stroke="#38bdf8"
              strokeWidth="2"
              filter="url(#globeGlow)"
            />

            {/* Globe longitude */}

            <g
              clipPath="url(#globeClip)"
              fill="none"
              stroke="#38bdf8"
              strokeOpacity="0.35"
              strokeWidth="1"
            >

              <ellipse
                cx="150"
                cy="150"
                rx="42"
                ry="112"
              />

              <ellipse
                cx="150"
                cy="150"
                rx="78"
                ry="112"
              />

              <ellipse
                cx="150"
                cy="150"
                rx="110"
                ry="112"
              />

              {/* Latitude */}

              <ellipse
                cx="150"
                cy="105"
                rx="100"
                ry="32"
              />

              <ellipse
                cx="150"
                cy="150"
                rx="112"
                ry="45"
              />

              <ellipse
                cx="150"
                cy="195"
                rx="100"
                ry="32"
              />

              <line
                x1="38"
                y1="150"
                x2="262"
                y2="150"
              />

            </g>

            {/* Digital continents */}

            <g
              clipPath="url(#globeClip)"
              fill="#38bdf8"
              fillOpacity="0.42"
            >

              <path d="M91 91 L105 76 L122 81 L131 94 L122 108 L108 104 L100 116 L84 108 Z" />

              <path d="M135 72 L154 62 L170 70 L166 86 L151 91 L141 84 Z" />

              <path d="M171 91 L194 82 L211 91 L205 104 L218 111 L207 126 L189 121 L179 108 Z" />

              <path d="M116 122 L133 117 L143 132 L137 148 L125 153 L118 141 Z" />

              <path d="M156 128 L173 120 L184 132 L179 145 L167 151 L153 145 Z" />

              <path d="M94 165 L111 158 L123 168 L119 183 L104 190 L94 180 Z" />

              <path d="M143 166 L158 157 L173 166 L169 181 L153 189 L143 181 Z" />

              <path d="M186 159 L207 151 L221 163 L212 177 L195 174 Z" />

              <path d="M133 199 L149 190 L160 201 L154 218 L140 222 L129 211 Z" />

            </g>

            {/* Digital points */}

            <g fill="#bae6fd">

              <circle cx="88" cy="111" r="2" />

              <circle cx="123" cy="94" r="2" />

              <circle cx="160" cy="78" r="2" />

              <circle cx="203" cy="112" r="2" />

              <circle cx="126" cy="149" r="2" />

              <circle cx="174" cy="146" r="2" />

              <circle cx="106" cy="177" r="2" />

              <circle cx="192" cy="166" r="2" />

              <circle cx="151" cy="208" r="2" />

            </g>

          </svg>

        </div>
      </motion.div>

      {/* =====================================================
          LIGHT FROM GLOBE INTO BOOK
      ===================================================== */}

      <div className="absolute left-1/2 top-[35%] -translate-x-1/2 z-20 pointer-events-none">

        {/* Wide light */}

        <motion.div
          animate={{
            opacity: [0.25, 0.6, 0.25],
            scaleX: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[130px] h-[220px] bg-cyan-400/25 blur-[38px]"
          style={{
            clipPath:
              "polygon(42% 0%, 58% 0%, 100% 100%, 0% 100%)",
          }}
        />

        {/* Strong light beam */}

        <motion.div
          animate={{
            opacity: [0.45, 0.9, 0.45],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[18px] h-[220px] bg-gradient-to-b from-blue-300 via-cyan-200 to-white blur-[2px]"
          style={{
            clipPath:
              "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)",
          }}
        />

        {/* Center ray */}

        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
          }}
          className="absolute left-1/2 -translate-x-1/2 top-[10px] w-[3px] h-[200px] rounded-full bg-white shadow-[0_0_20px_6px_rgba(125,211,252,0.7)]"
        />

      </div>

      {/* =====================================================
          OPEN BOOK
          DIRECTLY UNDER THE GLOBE
      ===================================================== */}

      <motion.div
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 bottom-[13%] -translate-x-1/2 z-40"
      >

        <div className="relative w-[410px] h-[150px]">

          {/* Book glow */}

          <div className="absolute left-1/2 bottom-[-30px] -translate-x-1/2 w-[370px] h-[70px] rounded-full bg-blue-500/25 blur-[38px]" />

          {/* Left page */}

          <div
            className="absolute left-0 bottom-0 w-[208px] h-[108px] rounded-bl-[22px] rounded-tl-[8px] border border-white/25 bg-gradient-to-br from-white via-slate-200 to-slate-500 shadow-[0_20px_45px_rgba(0,0,0,0.65)]"
            style={{
              transform: "skewY(8deg) rotate(-2deg)",
              transformOrigin: "bottom right",
            }}
          >

            <div className="absolute inset-[18px] opacity-40">

              <div className="h-[2px] bg-slate-700/40 mb-3" />

              <div className="h-[2px] bg-slate-700/25 mb-3 w-[85%]" />

              <div className="h-[2px] bg-slate-700/25 mb-3 w-[92%]" />

              <div className="h-[2px] bg-slate-700/25 mb-3 w-[75%]" />

              <div className="h-[2px] bg-slate-700/25 w-[88%]" />

            </div>

          </div>

          {/* Right page */}

          <div
            className="absolute right-0 bottom-0 w-[208px] h-[108px] rounded-br-[22px] rounded-tr-[8px] border border-white/25 bg-gradient-to-bl from-white via-slate-200 to-slate-500 shadow-[0_20px_45px_rgba(0,0,0,0.65)]"
            style={{
              transform: "skewY(-8deg) rotate(2deg)",
              transformOrigin: "bottom left",
            }}
          >

            <div className="absolute inset-[18px] opacity-40">

              <div className="h-[2px] bg-slate-700/40 mb-3" />

              <div className="h-[2px] bg-slate-700/25 mb-3 w-[88%]" />

              <div className="h-[2px] bg-slate-700/25 mb-3 w-[75%]" />

              <div className="h-[2px] bg-slate-700/25 mb-3 w-[92%]" />

              <div className="h-[2px] bg-slate-700/25 w-[82%]" />

            </div>

          </div>

          {/* Book spine */}

          <div className="absolute left-1/2 bottom-[2px] -translate-x-1/2 w-[12px] h-[105px] rounded-full bg-gradient-to-r from-slate-500 via-white to-slate-500 shadow-[0_0_25px_rgba(59,130,246,0.5)]" />

          {/* Light inside book */}

          <motion.div
            animate={{
              opacity: [0.35, 0.9, 0.35],
              scale: [0.85, 1.1, 0.85],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-[5px] -translate-x-1/2 w-[100px] h-[80px] rounded-full bg-cyan-300/50 blur-[35px]"
          />

          <motion.div
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute left-1/2 top-[25px] -translate-x-1/2 w-[7px] h-[45px] rounded-full bg-white shadow-[0_0_25px_10px_rgba(125,211,252,0.7)]"
          />

        </div>

      </motion.div>

      {/* =====================================================
          GRADUATION CAP
      ===================================================== */}

      <motion.div
        animate={{
          y: [0, -9, 0],
          rotate: [0, 1, 0, -1, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[1%] bottom-[18%] z-50"
      >

        <div className="relative w-[150px] h-[110px]">

          {/* Cap glow */}

          <div className="absolute inset-0 bg-blue-500/10 blur-[30px]" />

          {/* Cap diamond */}

          <div
            className="absolute top-[20px] left-[15px] w-[115px] h-[55px] bg-gradient-to-br from-slate-900 via-slate-800 to-black border border-blue-300/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            style={{
              transform: "rotate(12deg) skewX(-12deg)",
              clipPath:
                "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            }}
          />

          {/* Cap center */}

          <div className="absolute left-[69px] top-[43px] w-[14px] h-[14px] rounded-full bg-slate-700 border border-blue-300/30" />

          {/* Cap base */}

          <div
            className="absolute left-[35px] top-[57px] w-[90px] h-[25px] rounded-[50%] bg-gradient-to-b from-slate-800 to-black border border-white/10"
            style={{
              transform: "rotate(8deg)",
            }}
          />

          {/* Tassel */}

          <div className="absolute left-[108px] top-[48px]">

            <div className="w-[2px] h-[48px] bg-gradient-to-b from-yellow-400 to-yellow-600 rotate-[-15deg] origin-top" />

            <motion.div
              animate={{
                rotate: [-4, 4, -4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute top-[39px] left-[-9px] w-[18px] h-[25px]"
            >

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[9px] h-[9px] rounded-full bg-yellow-400" />

              <div className="absolute top-[7px] left-0 w-[18px] h-[18px] bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-b-md" />

            </motion.div>

          </div>

        </div>

      </motion.div>

      {/* =====================================================
          FLOATING KNOWLEDGE CARD
      ===================================================== */}

      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[0%] bottom-[23%] z-50"
      >

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#07101f]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <BookOpen size={21} />
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Knowledge
            </p>

            <p className="text-sm font-bold text-white">
              Starts Here
            </p>
          </div>

        </div>

      </motion.div>

      {/* =====================================================
          FLOATING LEARNING CARD
      ===================================================== */}

      <motion.div
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[0%] top-[30%] z-50"
      >

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#07101f]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Brain size={21} />
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Learning
            </p>

            <p className="text-sm font-bold text-white">
              Made Smarter
            </p>
          </div>

        </div>

      </motion.div>

    </div>
  );
};


/* =========================================================
   HOME
========================================================= */

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);

  // Scroll to top on load or refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 z-0 bg-[#030712]" />

      {/* Blue glow */}

      <div className="fixed inset-0 z-0 pointer-events-none">

        <div className="absolute top-[-250px] left-[-200px] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute top-[200px] right-[-250px] h-[650px] w-[650px] rounded-full bg-indigo-600/10 blur-[150px]" />

        <div className="absolute bottom-[-300px] left-[35%] h-[600px] w-[600px] rounded-full bg-purple-600/5 blur-[150px]" />

      </div>

      {/* Grid */}

      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          maskImage:
            "linear-gradient(to bottom, black 0%, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 85%)",
        }}
      />

      {/* =====================================================
          HERO
      ===================================================== */}

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10"
      >

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-20 lg:pt-28 pb-20">

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-8 items-center">

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <motion.div
              variants={fadeUp}
              className="relative z-20"
            >

              {/* Live badge */}

              <div className="inline-flex items-center gap-3 mb-7">

                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl">

                  <span className="relative flex h-2.5 w-2.5">

                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />

                  </span>

                  <span className="text-sm font-medium text-emerald-300">
                    LIVE
                  </span>

                  <span className="h-4 w-px bg-white/10" />

                  <span className="text-sm text-gray-400">
                    Smart Educational Experience
                  </span>

                </div>

              </div>

              {/* Small label */}

              <div className="flex items-center gap-2 mb-5 text-blue-400">

                <Sparkles size={17} />

                <span className="text-sm font-semibold tracking-wide uppercase">
                  Learn • Grow • Become
                </span>

              </div>

              {/* Heading */}

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.03] tracking-tight">

                Empowering

                <br />

                <span className="text-white">
                  Minds Through
                </span>

                <br />

                <span className="relative inline-block">

                  <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                    Knowledge
                  </span>

                  <motion.span
                    initial={{
                      scaleX: 0,
                    }}
                    animate={{
                      scaleX: 1,
                    }}
                    transition={{
                      delay: 0.9,
                      duration: 0.8,
                      ease: "easeOut",
                    }}
                    className="absolute -bottom-3 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-blue-500 to-transparent"
                  />

                </span>

            </h1>

              {/* Description */}

              <p className="mt-7 max-w-xl text-lg leading-8 text-gray-400">

                Scholiqen helps learners build real understanding through
                structured learning, practical educational tools, and
                experiences designed to make learning clearer and more
                engaging.

              </p>

              {/* Start learning */}

              <div className="flex items-center mt-9">

                <motion.button
                  whileHover={{
                    scale: 1.04,
                    boxShadow:
                      "0 15px 45px rgba(37,99,235,0.35)",
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={() => setShowLogin(true)}
                  className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-7 py-4 font-semibold text-white shadow-xl shadow-blue-600/20 transition"
                >

                  Start Learning

                  <ArrowRight
                    size={19}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />

                </motion.button>

              </div>

              {/* Trust / value line */}

              <div className="mt-8 flex items-center gap-3 text-sm text-gray-500">

                <div className="flex -space-x-2">

                  <div className="h-7 w-7 rounded-full border-2 border-[#030712] bg-blue-500 flex items-center justify-center">
                    <BookOpen size={13} />
                  </div>

                  <div className="h-7 w-7 rounded-full border-2 border-[#030712] bg-indigo-500 flex items-center justify-center">
                    <Brain size={13} />
                  </div>

                  <div className="h-7 w-7 rounded-full border-2 border-[#030712] bg-purple-500 flex items-center justify-center">
                    <GraduationCap size={13} />
                  </div>

                </div>

                <span>
                  Everything you need to learn with purpose
                </span>

              </div>

            </motion.div>


            {/* =================================================
                RIGHT SIDE — MANUAL VISUAL
            ================================================= */}

            <motion.div
              variants={fadeUp}
              className="relative flex items-center justify-center min-h-[600px]"
            >

              <EducationVisual />

            </motion.div>

          </div>


          {/* =====================================================
              SCHOLIQEN FEATURES
         ===================================================== */}

          <motion.div
            variants={fadeUp}
            className="relative mt-12"
          >

            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-purple-600/10 blur-xl" />

            <div className="relative grid grid-cols-1 sm:grid-cols-3 overflow-hidden rounded-3xl border border-white/10 bg-[#070d19]/90 backdrop-blur-2xl">


              {/* Structured Learning */}

              <div className="relative flex items-center gap-5 px-7 py-7 sm:px-8">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">

                  <BookOpen size={25} />

                </div>

                <div>

                  <h2 className="text-xl font-black text-blue-400">
                    Structured
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Learning paths
                  </p>

                </div>

              </div>


              {/* Divider */}

              <div className="hidden sm:block absolute left-1/3 top-1/2 h-12 w-px -translate-y-1/2 bg-white/10" />


              {/* Practical Tools */}

              <div className="relative flex items-center gap-5 px-7 py-7 sm:px-8">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">

                  <Brain size={25} />

                </div>

                <div>

                  <h2 className="text-xl font-black text-indigo-400">
                    Practical
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Educational tools
                  </p>

                </div>

              </div>


              {/* Divider */}

              <div className="hidden sm:block absolute left-2/3 top-1/2 h-12 w-px -translate-y-1/2 bg-white/10" />


              {/* Growth */}

              <div className="flex items-center gap-5 px-7 py-7 sm:px-8">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">

                  <GraduationCap size={25} />

                </div>

                <div>

                  <h2 className="text-xl font-black text-emerald-400">
                    Growth
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Learn with purpose
                  </p>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </motion.section>


      {/* =====================================================
          OTHER SECTIONS
      ===================================================== */}

      <div className="relative z-10">

        <Solutions />

        <CTASection />

        <SubjectCarousel />

        <TestimonialSection />

        <Footer />

      </div>


      {/* =====================================================
          LOGIN MODAL
      ===================================================== */}

      {showLogin && (

        <motion.div
          initial={{
            opacity: 0,
         }}
          animate={{
            opacity: 1,
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
          onClick={() => setShowLogin(false)}
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
          animate={{
              opacity: 1,
              scale: 1,
              y: 0,
          }}
          transition={{
              duration: 0.25,
          }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#080d18] p-6 shadow-2xl"
          >

            {/* Close */}

            <button
              onClick={() => setShowLogin(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>

            <Login />

          </motion.div>

        </motion.div>

      )}

    </div>
  );
};

export default Home;