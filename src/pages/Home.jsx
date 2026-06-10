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
    <div className={`min-h-screen relative transition-colors duration-300 ${ darkMode ? "bg-slate-900 text-white" : "bg-white text-black" }`}>
      {/* HERO */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={dropVariants}
        className={`relative transition-colors duration-300 ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-white via-blue-50 to-white"
        }`}
      >
        {/* DOT BG */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #2563eb 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-12 pt-28 pb-16">

          {/* HERO CONTENT */}
          <section className="grid lg:grid-cols-2 gap-16 items-center py-20">

            <div>
              <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                darkMode ? "bg-slate-700 text-blue-300" : "bg-blue-100 text-blue-700"
              }`}>
                Best Educational Services
              </span>

              <h1 className="text-5xl font-bold mt-6">
                Empowering Minds <br />
                Through <span className="text-blue-600">Knowledge</span>
              </h1>

              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mt-6 text-lg`}>
                Class Of Genius helps learners build real understanding.
              </p>

              <button
                onClick={() => setShowLogin(true)}
                className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full"
              >
                Start Learning
              </button>
            </div>

            <div className="relative flex justify-center">
              <div className={`absolute w-[90%] h-[400px] rounded-3xl rotate-3 ${
                darkMode ? "bg-slate-700/40" : "bg-blue-200/50"
              }`}></div>

              <img
                src={home_bg}
                className="relative w-[90%] h-[400px] object-cover rounded-3xl shadow-xl"
                alt="Education"
              />
            </div>

          </section>

          {/* STATS */}
          <div className={`grid grid-cols-3 gap-6 backdrop-blur-md p-8 rounded-3xl border w-full max-w-4xl mx-auto ${
            darkMode
              ? "bg-slate-800/60 border-slate-700"
              : "bg-white/40 border-gray-200"
          }`}>

            <div className="text-center flex flex-col items-center">
              <h2 className="text-2xl font-bold">2M+</h2>
              <p className="text-sm text-gray-400">Students</p>
            </div>

            <div className="text-center flex flex-col items-center">
              <h2 className="text-2xl font-bold">800+</h2>
              <p className="text-sm text-gray-400">Schools</p>
            </div>

            <div className="text-center flex flex-col items-center">
              <h2 className="text-2xl font-bold">95%</h2>
              <p className="text-sm text-gray-400">Success</p>
            </div>

          </div>
        </div>
      </motion.section>

      {/* SECTIONS */}
      <Solutions />
      <CTASection />
      <SubjectCarousel />
      <TestimonialSection />
      <Footer />

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`p-6 rounded-2xl shadow-xl relative ${
            darkMode ? "bg-slate-900 text-white" : "bg-white text-black"
          }`}>
            <button
              onClick={() => setShowLogin(false)}
              className="absolute -top-10 right-0 text-red-500"
            >
              Close
            </button>
            <Login />
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;