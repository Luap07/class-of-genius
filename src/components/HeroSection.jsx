import React from "react";
import { motion } from "framer-motion";
import {
  FlaskConical,
  Atom,
  Brain,
  ArrowRight,
} from "lucide-react";

const Hero = () => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#020617] text-white">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="pointer-events-none absolute left-20 top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-20 right-20 h-72 w-72 rounded-full bg-purple-500/20 blur-[120px]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[160px]" />

      {/* =====================================================
          GRID
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-12">

        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
          >

            {/* Badge */}

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />

              Interactive Science Platform
            </div>

            {/* Heading */}

            <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">

              Virtual

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                Laboratory
              </span>

            </h1>

            {/* Description */}

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              Experience science beyond the classroom with
              interactive simulations, practical experiments,
              intelligent guidance and visual learning tools
              designed for deeper understanding.
            </p>

            {/* =================================================
                LAB INFORMATION
            ================================================= */}

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-400">

              <div className="flex items-center gap-2">
                <Atom
                  size={17}
                  className="text-cyan-400"
                />

                Physics
              </div>

              <span className="text-slate-700">•</span>

              <div className="flex items-center gap-2">
                <FlaskConical
                  size={17}
                  className="text-emerald-400"
                />

                Chemistry
              </div>

              <span className="text-slate-700">•</span>

              <div className="flex items-center gap-2">
                <Brain
                  size={17}
                  className="text-purple-400"
                />

                Biology
              </div>

              <span className="text-slate-700">•</span>

              <div className="flex items-center gap-2">
                <span className="text-orange-400 font-bold">
                  ∑
                </span>

                Mathematics
              </div>

            </div>

            {/* =================================================
                PREMIUM INFORMATION
            ================================================= */}

            <div className="mt-8 flex items-center gap-3">

              <div className="h-px w-10 bg-cyan-500/40" />

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Premium interactive laboratories
              </p>

            </div>

          </motion.div>

          {/* =================================================
              RIGHT VISUAL
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.8,
            }}
            className="relative flex justify-center"
          >

            {/* =================================================
                MAIN ORB
            ================================================= */}

            <div
              className="
                relative
                flex
                h-[400px]
                w-[400px]
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-gradient-to-br
                from-cyan-500/20
                via-blue-500/10
                to-purple-500/20
                shadow-[0_0_100px_rgba(34,211,238,0.08)]
                backdrop-blur-xl
              "
            >

              {/* Outer Ring */}

              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 18,
                  ease: "linear",
                }}
                className="
                  absolute
                  h-full
                  w-full
                  rounded-full
                  border
                  border-cyan-500/20
                "
              />

              {/* Middle Ring */}

              <motion.div
                animate={{
                  rotate: -360,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 25,
                  ease: "linear",
                }}
                className="
                  absolute
                  h-[320px]
                  w-[320px]
                  rounded-full
                  border
                  border-purple-500/20
                "
              />

              {/* Inner Glow */}

              <div className="absolute h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

              <Atom
                size={120}
                strokeWidth={1.2}
                className="relative z-10 text-cyan-400"
              />

            </div>

            {/* =================================================
                CHEMISTRY CARD
            ================================================= */}

            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
              }}
              className="
                absolute
                left-0
                top-8
                rounded-2xl
                border
                border-emerald-400/20
                bg-slate-900/80
                p-4
                shadow-xl
                backdrop-blur-xl
              "
            >

              <FlaskConical
                className="mb-2 text-emerald-400"
              />

              <p className="text-sm font-semibold">
                Chemistry
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Interactive Experiments
              </p>

            </motion.div>

            {/* =================================================
                AI CARD
            ================================================= */}

            <motion.div
              animate={{
                y: [0, 15, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 5,
              }}
              className="
                absolute
                bottom-10
                left-8
                rounded-2xl
                border
                border-purple-400/20
                bg-slate-900/80
                p-4
                shadow-xl
                backdrop-blur-xl
              "
            >

              <Brain
                className="mb-2 text-purple-400"
              />

              <p className="text-sm font-semibold">
                AI Guidance
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Learn Smarter
              </p>

            </motion.div>

            {/* =================================================
                PHYSICS CARD
            ================================================= */}

            <motion.div
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4.5,
              }}
              className="
                absolute
                right-0
                top-24
                rounded-2xl
                border
                border-cyan-400/20
                bg-slate-900/80
                p-4
                shadow-xl
                backdrop-blur-xl
              "
            >

              <Atom
                className="mb-2 text-cyan-400"
              />

              <p className="text-sm font-semibold">
                Physics
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Real-time Simulations
              </p>

            </motion.div>

            {/* =================================================
                SMALL DECORATIVE LINE
            ================================================= */}

            <div className="absolute -bottom-4 right-16 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Virtual Science Environment
            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
};

export default Hero;
