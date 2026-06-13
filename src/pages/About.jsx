import React from "react";
import { motion } from "framer-motion";
import { Sparkles, GraduationCap, Brain, Rocket } from "lucide-react";

/* ===== ANIMATION ===== */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0 },
};

/* ===== SPARK BORDER WRAPPER ===== */
const GlowCard = ({ children }) => {
  return (
    <div className="relative group">

      {/* GLOW BORDER */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 opacity-40 blur-md group-hover:opacity-70 transition" />

      {/* MOVING LIGHT SPARK */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="spark" />
      </div>

      {/* CONTENT */}
      <div className="relative bg-slate-900 p-6 rounded-2xl border border-slate-700">
        {children}
      </div>
    </div>
  );
};

const About = () => {
  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      {/* ADD TOP SPACING (FIX NAVBAR ISSUE) */}
      <div className="pt-28 px-6 pb-20">

        {/* HERO */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1
            variants={item}
            className="text-5xl font-bold mb-6"
          >
            About <span className="text-blue-400">Scholiqen</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-gray-400 leading-relaxed"
          >
            Scholiqen is an innovative educational platform designed to transform
            the way students learn and teachers teach. Our mission is to make
            quality education accessible, intelligent, and engaging for everyone.
          </motion.p>
        </motion.div>

        {/* FEATURE GRID */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-6xl mx-auto"
        >

          <motion.div variants={item}>
            <GlowCard>
              <Sparkles className="text-blue-400 mb-3" />
              <h3 className="font-bold text-lg">AI Learning Tools</h3>
              <p className="text-gray-400 text-sm mt-2">
                Smart AI-powered learning assistance for students.
              </p>
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <GraduationCap className="text-green-400 mb-3" />
              <h3 className="font-bold text-lg">LMS System</h3>
              <p className="text-gray-400 text-sm mt-2">
                Structured learning management for all subjects.
              </p>
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <Brain className="text-purple-400 mb-3" />
              <h3 className="font-bold text-lg">CBT Practice</h3>
              <p className="text-gray-400 text-sm mt-2">
                Exam preparation with past questions & tests.
              </p>
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <Rocket className="text-red-400 mb-3" />
              <h3 className="font-bold text-lg">Live Classes</h3>
              <p className="text-gray-400 text-sm mt-2">
                Connect with tutors in real-time sessions.
              </p>
            </GlowCard>
          </motion.div>

        </motion.div>

        {/* MISSION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mt-20 bg-slate-900 p-10 rounded-2xl border border-slate-700"
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-400">
            Our Mission
          </h2>

          <p className="text-gray-400 leading-relaxed">
            At Scholiqen, students can explore topics across different subjects, generate learning content, 
            practice examinations, and connect with qualified tutors through live interactive classes. 
            Our platform supports multiple educational curricula, ensuring learners receive relevant 
            and structured learning experiences.We believe that education should be smart, accessible,
            and future-focused. Through innovation and technology, Scholiqen is building a generation 
            of confident learners, critical thinkers, and future leaders.
          </p>
        </motion.div>

        {/* SLOGAN */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold">
            Scholiqen — One Platform, Every Curriculum
          </h3>
          <p className="text-gray-400 mt-2">
            Learn. Practice. Excel.
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;