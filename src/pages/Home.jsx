import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import home_bg from "../assets/home_bg.png";
import Solutions from "../components/Solutions";
import CTASection from "../components/CTASection";
import Login from "../components/Login";
import SubjectCarousel from "../components/SubjectCarousel";
import TestimonialSection from "../components/TestimonialSection";
import Footer from "../components/Footer";
import { ConnectContext } from "../context/ConnectContext";

const dropVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { darkMode } = useContext(ConnectContext);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* BACKGROUND BASE */}
      <div className="fixed inset-0 bg-[#070b14] z-0" />

      {/* TABLE GRID BACKGROUND */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.25,
        }}
      />

      {/* HERO */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={dropVariants}
        className="relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-24">

          <section className="grid lg:grid-cols-2 gap-16 items-center py-16">

            {/* LEFT SIDE */}
            <div>

              {/* LIVE DOT */}
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative h-3 w-3 rounded-full bg-green-500"></span>
                </span>

                <span className="px-4 py-1 rounded-full text-sm font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Best Educational Services
                </span>
              </div>

              <h1 className="text-5xl font-bold leading-tight">
                Empowering Minds <br />
                Through <span className="text-blue-400">Knowledge</span>
              </h1>

              <p className="text-gray-200 mt-6 text-lg max-w-md">
                Class Of Genius helps learners build real understanding with structured learning.
              </p>

              <button className="mt-8 bg-blue-600 px-8 py-3 rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition">
                Start Learning
              </button>
            </div>

            {/* RIGHT IMAGE (SENIOR DEV STYLE BEND EFFECT) */}
            <div className="relative flex justify-center perspective-1000">

              {/* glow layer */}
              <div className="absolute w-[90%] h-[420px] rounded-3xl bg-blue-500/10 blur-3xl animate-pulse" />

              <motion.div
                whileHover={{ rotateY: -8, rotateX: 6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="relative w-[90%]"
                style={{ transformStyle: "preserve-3d" }}
              >

                <img
                  src={home_bg}
                  alt="Education"
                  className="w-full h-[420px] object-cover rounded-3xl border border-white/10 shadow-2xl"
                  style={{
                    transform: "rotateZ(-1deg)", // subtle bend
                  }}
                />

                {/* soft overlay for premium feel */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/30 via-transparent to-white/5" />

              </motion.div>
            </div>

          </section>

          {/* STATS (GLOW TABLE STYLE) */}
          <div className="mt-12 max-w-4xl mx-auto">

            <div className="grid grid-cols-3 divide-x divide-white/10 p-6 rounded-2xl
              bg-[#0a0f1a]
              border border-blue-500/30
              shadow-[0_0_80px_rgba(59,130,246,0.25)]">

              <div className="text-center">
                <h2 className="text-4xl font-bold text-blue-400">2M+</h2>
                <p className="text-gray-300 text-sm mt-1">Students</p>
              </div>

              <div className="text-center">
                <h2 className="text-4xl font-bold text-indigo-400">800+</h2>
                <p className="text-gray-300 text-sm mt-1">Schools</p>
              </div>

              <div className="text-center">
                <h2 className="text-4xl font-bold text-purple-400">95%</h2>
                <p className="text-gray-300 text-sm mt-1">Success</p>
              </div>

            </div>

          </div>

        </div>
      </motion.section>

      {/* SECTIONS */}
      <div className="relative z-10">
        <Solutions />
        <CTASection />
        <SubjectCarousel />
        <TestimonialSection />
        <Footer />
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="p-6 rounded-2xl bg-[#0b0f1a] border border-white/10">
            <Login />
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;