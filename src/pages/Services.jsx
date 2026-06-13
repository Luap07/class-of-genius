import React from "react";
import { motion } from "framer-motion";
import { Brain, BookOpen, Video, FileText, Users, Sparkles } from "lucide-react";

/* ANIMATION */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

/* GLOW CARD */
const GlowCard = ({ children }) => {
  return (
    <div className="relative group">

      {/* GLOW BORDER */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 opacity-40 blur-md group-hover:opacity-70 transition" />

      {/* CARD */}
      <div className="relative bg-slate-900 p-6 rounded-2xl border border-slate-700">
        {children}
      </div>
    </div>
  );
};

const Services = () => {
  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      {/* TOP SPACING (fix navbar overlap) */}
      <div className="pt-28 px-6 pb-20">

        {/* HEADER */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center max-w-3xl mx-auto"
        >
          <motion.h1 variants={item} className="text-5xl font-bold">
            Our <span className="text-blue-400">Services</span>
          </motion.h1>

          <motion.p variants={item} className="text-gray-400 mt-4">
            Everything Scholiqen offers to transform learning into a smart,
            interactive and engaging experience.
          </motion.p>
        </motion.div>

        {/* GRID */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto"
        >

          <motion.div variants={item}>
            <GlowCard>
              <Brain className="text-blue-400 mb-3" />
              <h3 className="font-bold text-lg">AI Learning Assistant</h3>
              <p className="text-gray-400 text-sm mt-2">
                Smart AI helps students understand topics faster and better.
              </p>
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <BookOpen className="text-green-400 mb-3" />
              <h3 className="font-bold text-lg">LMS Platform</h3>
              <p className="text-gray-400 text-sm mt-2">
                Structured courses and learning materials for all subjects.
              </p>
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <Video className="text-purple-400 mb-3" />
              <h3 className="font-bold text-lg">Live Classes</h3>
              <p className="text-gray-400 text-sm mt-2">
                Real-time interactive sessions with qualified tutors.
              </p>
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <FileText className="text-yellow-400 mb-3" />
              <h3 className="font-bold text-lg">CBT Practice</h3>
              <p className="text-gray-400 text-sm mt-2">
                Practice exams and past questions for better preparation.
              </p>
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <Users className="text-red-400 mb-3" />
              <h3 className="font-bold text-lg">Tutor Connection</h3>
              <p className="text-gray-400 text-sm mt-2">
                Connect with verified tutors for personal guidance.
              </p>
            </GlowCard>
          </motion.div>

          <motion.div variants={item}>
            <GlowCard>
              <Sparkles className="text-cyan-400 mb-3" />
              <h3 className="font-bold text-lg">Smart Tools</h3>
              <p className="text-gray-400 text-sm mt-2">
                Generate notes, summaries, and learning materials instantly.
              </p>
            </GlowCard>
          </motion.div>

        </motion.div>

        {/* FOOTER CTA */}
        <div className="text-center mt-20">
          <h2 className="text-2xl font-bold">
            Everything you need in one platform
          </h2>
          <p className="text-gray-400 mt-2">
            Scholiqen — Learn. Practice. Excel.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Services;