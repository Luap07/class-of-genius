import React, { useState } from "react";
import { motion } from "framer-motion";

import home_bg from "../assets/home_bg.png";
import Solutions from "../components/Solutions";
import CTASection from "../components/CTASection";
import Login from "../components/Login";
import SubjectCarousel from "../components/SubjectCarousel";
import TestimonialSection from "../components/TestimonialSection";
import Footer from "../components/Footer";

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

  return (
    <div className="min-h-screen bg-white relative">
      {/* HERO */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={dropVariants}
        className="bg-gradient-to-br from-white via-blue-50 to-white relative"
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
              <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold">
                Best Educational Services
              </span>

              <h1 className="text-5xl font-bold mt-6">
                Empowering Minds <br />
                Through <span className="text-blue-600">Knowledge</span>
              </h1>

              <p className="text-gray-600 mt-6 text-lg">
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
              <div className="absolute w-[90%] h-[400px] bg-blue-200/50 rounded-3xl rotate-3"></div>
              <img
                src={home_bg}
                className="relative w-[90%] h-[400px] object-cover rounded-3xl shadow-xl"
                alt="Education"
              />
            </div>
          </section>

          {/* FIXED STATS SECTION */}
          <div className="grid grid-cols-3 gap-6 bg-white/40 backdrop-blur-md p-8 rounded-3xl border w-full max-w-4xl mx-auto">
            <div className="text-center flex flex-col items-center">
              <h2 className="text-2xl font-bold">2M+</h2>
              <p className="text-sm text-gray-600">Students</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <h2 className="text-2xl font-bold">800+</h2>
              <p className="text-sm text-gray-600">Schools</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <h2 className="text-2xl font-bold">95%</h2>
              <p className="text-sm text-gray-600">Success</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTIONS */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <Solutions />
      </motion.div>

      <CTASection />
      <SubjectCarousel />
      <TestimonialSection />
      <Footer />

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl relative z-[999]">
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