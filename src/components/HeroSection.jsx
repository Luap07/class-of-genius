import React from "react";
import { motion } from "framer-motion";
import {
  FlaskConical,
  Atom,
  Brain,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import labhero from "../assets/labhero.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden text-white">

      {/* =====================================================
          BACKGROUND IMAGE
      ===================================================== */}

      <div className="absolute inset-0 z-0">
        <motion.img
          src={labhero}
          alt="Students performing science experiments in a laboratory"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 1.8,
            ease: "easeOut",
          }}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-center
          "
        />

        {/* Left-heavy overlay for text readability */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-slate-950
            via-slate-950/80
            to-slate-950/25
          "
        />

        {/* Bottom fade */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-48
            bg-gradient-to-t
            from-slate-950/80
            to-transparent
          "
        />

        {/* Subtle blue atmosphere */}

        <div className="absolute inset-0 bg-blue-950/10 mix-blend-multiply" />
      </div>

      {/* =====================================================
          ATMOSPHERIC GLOW
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-[8%]
          top-[20%]
          z-[1]
          h-72
          w-72
          rounded-full
          bg-blue-500/10
          blur-[140px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[10%]
          right-[12%]
          z-[1]
          h-80
          w-80
          rounded-full
          bg-teal-400/10
          blur-[150px]
        "
      />

      {/* =====================================================
          SUBTLE GRID
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-28 lg:px-12">

        <motion.div
          initial={{
            opacity: 0,
            x: -45,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.85,
            ease: "easeOut",
          }}
          className="max-w-3xl"
        >

          {/* =================================================
              BADGE
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.15,
            }}
            className="
              inline-flex
              items-center
              gap-2.5
              rounded-full
              border
              border-cyan-300/20
              bg-slate-950/45
              px-4
              py-2
              text-sm
              font-semibold
              text-cyan-200
              shadow-lg
              backdrop-blur-md
            "
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_14px_rgba(45,212,191,0.9)]" />
            </span>

            Interactive Science Platform
          </motion.div>

          {/* =================================================
              HEADING
          ================================================= */}

          <h1
            className="
              mt-8
              text-5xl
              font-black
              leading-[0.98]
              tracking-[-0.04em]
              drop-shadow-[0_5px_25px_rgba(0,0,0,0.5)]
              sm:text-6xl
              md:text-7xl
              lg:text-8xl
            "
          >
            Learn Science

            <span
              className="
                mt-2
                block
                bg-gradient-to-r
                from-blue-200
                via-cyan-300
                to-teal-300
                bg-clip-text
                text-transparent
              "
            >
              By Doing.
            </span>
          </h1>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p
            className="
              mt-8
              max-w-2xl
              text-lg
              leading-8
              text-slate-200
              drop-shadow-[0_3px_15px_rgba(0,0,0,0.6)]
              md:text-xl
              md:leading-9
            "
          >
            Step beyond the classroom with interactive laboratory
            experiments, simulations and practical learning tools
            that help you understand science by actually doing it.
          </p>

          {/* =================================================
              SUBJECTS
          ================================================= */}

          <div
            className="
              mt-9
              flex
              flex-wrap
              items-center
              gap-x-5
              gap-y-4
              text-sm
              font-medium
              text-slate-200
              md:text-base
            "
          >

            <div className="flex items-center gap-2.5">
              <Atom
                size={19}
                className="text-blue-300"
              />

              Physics
            </div>

            <span className="text-slate-500">
              •
            </span>

            <div className="flex items-center gap-2.5">
              <FlaskConical
                size={19}
                className="text-teal-300"
              />

              Chemistry
            </div>

            <span className="text-slate-500">
              •
            </span>

            <div className="flex items-center gap-2.5">
              <Brain
                size={19}
                className="text-cyan-300"
              />

              Biology
            </div>

            <span className="text-slate-500">
              •
            </span>

            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold text-blue-200">
                ∑
              </span>

              Mathematics
            </div>

          </div>

          {/* =================================================
              CTA
          ================================================= */}

          <div className="mt-11 flex flex-wrap gap-4">

            <motion.button
              type="button"
              onClick={() => navigate("/lab")}
              whileHover={{
                y: -3,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="
                group
                inline-flex
                items-center
                gap-3
                rounded-2xl
                bg-gradient-to-r
                from-blue-500
                via-cyan-500
                to-teal-400
                px-7
                py-4
                text-sm
                font-black
                text-slate-950
                shadow-[0_15px_40px_rgba(6,182,212,0.18)]
                transition-all
                duration-300
                hover:shadow-[0_18px_50px_rgba(6,182,212,0.3)]
              "
            >
              Explore Laboratory

              <ArrowRight
                size={19}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1.5
                "
              />
            </motion.button>

          </div>

          {/* =================================================
              BOTTOM INFORMATION
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
              delay: 0.8,
            }}
            className="mt-10 flex items-center gap-4"
          >

            <div className="h-px w-12 bg-gradient-to-r from-cyan-400/60 to-transparent" />

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300/70">
              Interactive practical learning
            </p>

          </motion.div>

        </motion.div>

      </div>

      {/* =====================================================
          IMAGE-SIDE INDICATOR
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: 30,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.8,
          delay: 1,
        }}
        className="
          pointer-events-none
          absolute
          bottom-10
          right-8
          z-10
          hidden
          items-center
          gap-3
          rounded-full
          border
          border-white/10
          bg-slate-950/40
          px-4
          py-2.5
          text-xs
          font-semibold
          text-slate-300
          backdrop-blur-md
          lg:flex
        "
      >
        <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.8)]" />

        Real-world practical learning
      </motion.div>

    </section>
  );
};

export default Hero;
