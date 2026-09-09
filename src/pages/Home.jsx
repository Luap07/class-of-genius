import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
} from "lucide-react";

import homeImage from "../assets/home.jpeg";
import Solutions from "../components/Solutions";
import CTASection from "../components/CTASection";
import SubjectCarousel from "../components/SubjectCarousel";
import TestimonialSection from "../components/TestimonialSection";
import Footer from "../components/Footer";
import Login from "../components/Login";


import { useNavigate } from "react-router-dom";
/* =========================================================
   ANIMATION VARIANTS
========================================================= */

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
   HOME
========================================================= */

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  /* =========================================================
     SCROLL TO TOP
  ========================================================= */

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* =====================================================
          GLOBAL BACKGROUND
      ==================================================== */}

      <div className="fixed inset-0 z-0 bg-[#030712]" />

      {/* =====================================================
          SUBTLE GLOBAL BLUE GLOW
      ==================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">

        <div className="absolute left-[-200px] top-[-250px] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute right-[-250px] top-[200px] h-[650px] w-[650px] rounded-full bg-indigo-600/10 blur-[150px]" />

        <div className="absolute bottom-[-300px] left-[35%] h-[600px] w-[600px] rounded-full bg-purple-600/5 blur-[150px]" />

      </div>

      {/* =====================================================
          GLOBAL GRID
      ==================================================== */}

      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
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
      ==================================================== */}

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 pb-16"
      >

        {/* ===================================================
            HERO BACKGROUND
        ================================================   */}

        <div className="absolute inset-0 min-h-[850px] overflow-hidden">

          {/* =================================================
              HERO IMAGE
          ================================================ */}

          <img
            src={homeImage}
            alt="Scholiqen educational environment"
            className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
          />

          {/* =================================================
              LEFT → RIGHT DARK GRADIENT

              Left stays very dark for the text.

              Right is now slightly dimmed compared with the
              previous version, but the image remains visible.
          ================================================ */}

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(2,6,23,0.98) 0%, rgba(2,6,23,0.93) 17%, rgba(2,6,23,0.76) 31%, rgba(2,6,23,0.48) 45%, rgba(2,6,23,0.22) 58%, rgba(2,6,23,0.10) 72%, rgba(2,6,23,0.08) 100%)",
            }}
          />

          {/* =================================================
              VERY SUBTLE OVERALL DIM

              This slightly reduces the brightness of the
              photograph without killing the details.
          ================================================ */}

          <div className="absolute inset-0 bg-[#020617]/[0.06]" />

          {/* =================================================
              TOP FADE
          ================================================ */}

          <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-[#030712]/45 to-transparent" />

          {/* =================================================
              BOTTOM FADE
          ================================================ */}

          <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-t from-[#030712] via-[#030712]/50 to-transparent" />

          {/* =================================================
              VERY SUBTLE RIGHT ATMOSPHERIC GLOW
          ================================================ */}

          <div className="pointer-events-none absolute right-[5%] top-[18%] h-[420px] w-[420px] rounded-full bg-indigo-500/[0.018] blur-[130px]" />

          {/* =================================================
              FADED CIRCULAR LINE DESIGN
              LEFT SIDE
          ================================================ */}

          <div className="pointer-events-none absolute -left-[285px] top-[120px] z-[3] h-[560px] w-[560px] opacity-25">

            {/* Outer circle */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
              }}
              className="absolute inset-0 rounded-full border border-blue-300/20"
            />

            {/* Middle circle */}

            <div className="absolute left-[55px] top-[55px] h-[450px] w-[450px] rounded-full border border-cyan-300/10" />

            {/* Inner circle */}

            <div className="absolute left-[105px] top-[105px] h-[350px] w-[350px] rounded-full border border-blue-400/[0.07]" />

            {/* Diagonal line */}

            <div className="absolute left-[280px] top-[25px] h-[130px] w-px rotate-[28deg] bg-gradient-to-b from-transparent via-blue-300/20 to-transparent" />

          </div>

          {/* =================================================
              SMALL LEFT BLUE LIGHT
          ================================================ */}

          <div className="pointer-events-none absolute left-[7%] top-[42%] h-[180px] w-[180px] rounded-full bg-blue-500/[0.035] blur-[90px]" />

        </div>

        {/* ===================================================
            HERO CONTENT
        ================================================   */}

        <div className="relative min-h-[850px]">

          <div className="mx-auto flex min-h-[850px] max-w-7xl items-center px-6 pb-28 pt-28 sm:px-10 lg:px-16">

            <motion.div
              variants={fadeUp}
              className="relative z-20 max-w-3xl"
            >

              {/* =================================================
                  LIVE BADGE
              ================================================ */}

              <motion.div
                variants={fadeUp}
                className="mb-7 inline-flex items-center gap-3"
              >

                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2 shadow-2xl backdrop-blur-xl">

                  <span className="relative flex h-2.5 w-2.5">

                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />

                  </span>

                  <span className="text-sm font-medium text-emerald-300">
                    LIVE
                  </span>

                  <span className="h-4 w-px bg-white/15" />

                  <span className="text-sm text-gray-300">
                    Smart Educational Experience
                  </span>

                </div>

              </motion.div>

              {/* =================================================
                  SMALL LABEL
              ================================================ */}

              <motion.div
                variants={fadeUp}
                className="mb-5 flex items-center gap-2 text-blue-300"
              >

                <Sparkles size={17} />

                <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Learn • Grow • Become
                </span>

              </motion.div>

              {/* =================================================
                  MAIN HEADING
              ================================================ */}

              <motion.h1
                variants={fadeUp}
                className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl xl:text-[82px]"
              >

                Empowering

                <br />

                <span className="text-white">
                  Minds Through
                </span>

                <br />

                <span className="relative inline-block">

                  <span className="bg-gradient-to-r from-blue-300 via-blue-500 to-indigo-300 bg-clip-text text-transparent">
                    Knowledge
                  </span>

                  {/* Underline */}

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
                    className="absolute -bottom-3 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-transparent"
                  />

                </span>

              </motion.h1>

              {/* =================================================
                  DESCRIPTION
              ================================================ */}

              <motion.p
                variants={fadeUp}
                className="mt-7 max-w-2xl text-base leading-8 text-gray-300 sm:text-lg"
              >
                Scholiqen helps learners build real understanding through
                structured learning, practical educational tools, and
                experiences designed to make learning clearer and more
                engaging.
              </motion.p>

              {/* =================================================
                  START LEARNING BUTTON
              ================================================ */}

              <motion.div
                variants={fadeUp}
                className="mt-9 flex items-center"
              >

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.04,
                    boxShadow:
                      "0 15px 45px rgba(37,99,235,0.45)",
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={() => navigate("/login")}
                  className="group flex items-center gap-3 rounded-xl border border-blue-400/20 bg-gradient-to-r from-blue-600 to-blue-500 px-7 py-4 font-semibold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:from-blue-500 hover:to-indigo-500"
                >

                  <span>
                    Start Learning
                  </span>

                  <ArrowRight
                    size={19}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />

                </motion.button>

              </motion.div>

              {/* =================================================
                  TRUST / VALUE LINE
              ================================================ */}

              <motion.div
                variants={fadeUp}
                className="mt-8 flex items-center gap-3 text-sm text-gray-300"
              >

                <div className="flex -space-x-2">

                  {/* Book */}

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#07101f] bg-blue-500 text-white shadow-lg">
                    <BookOpen size={13} />
                  </div>

                  {/* Graduation */}

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#07101f] bg-indigo-500 text-white shadow-lg">
                    <GraduationCap size={13} />
                  </div>

                </div>

                <span>
                  Everything you need to learn with purpose
                </span>

              </motion.div>

            </motion.div>

          </div>

        </div>

      </motion.section>

      {/* ===================================================
          HERO BOTTOM FEATURE BAR (NOW IN DOCUMENT FLOW)
      ================================================   */}

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative z-30 px-6 sm:px-10 lg:px-16 -mt-12 sm:-mt-16 mb-16"
      >

        <div className="relative mx-auto max-w-7xl">

          {/* =================================================
              OUTER GLOW
          ================================================ */}

          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/15 via-indigo-500/10 to-purple-600/15 blur-xl" />

          {/* =================================================
              FEATURE CONTAINER
          ================================================ */}

          <div className="relative grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-[#070d19]/90 shadow-2xl backdrop-blur-2xl sm:grid-cols-3">

            {/* =================================================
                STRUCTURED
            ================================================ */}

            <div className="relative flex items-center gap-5 px-6 py-6 sm:px-8">

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

            <div className="absolute left-1/3 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-white/10 sm:block" />

            {/* =================================================
                PRACTICAL
            ================================================ */}

            <div className="relative flex items-center gap-5 px-6 py-6 sm:px-8">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">

                <Sparkles size={25} />

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

            <div className="absolute left-2/3 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-white/10 sm:block" />

            {/* =================================================
                GROWTH
            ================================================ */}

            <div className="flex items-center gap-5 px-6 py-6 sm:px-8">

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

        </div>

      </motion.div>

      {/* =====================================================
          OTHER SECTIONS
      ================================================     */}

      <div className="relative z-10 pt-6">

        {/* ===================================================
            SOLUTIONS
        ================================================   */}

        <section id="solutions">
          <Solutions />
        </section>

        {/* ===================================================
            CTA
        ================================================   */}

        <CTASection />

        {/* ===================================================
            SUBJECT CAROUSEL
        ================================================   */}

        <SubjectCarousel />

        {/* ===================================================
            TESTIMONIALS
        ================================================   */}

        <TestimonialSection />

        {/* ===================================================
            FOOTER
        ================================================   */}

        <Footer />

      </div>

      {/* =====================================================
          LOGIN MODAL
      ==================================================== */}

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

            {/* =================================================
                CLOSE BUTTON
            ================================================ */}

            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close login"
            >
              ×
            </button>

            {/* =================================================
                LOGIN
            ================================================ */}

            <Login />

          </motion.div>

        </motion.div>

      )}

    </div>
  );
};

export default Home;