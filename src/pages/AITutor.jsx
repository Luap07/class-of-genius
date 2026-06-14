import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Globe,
  BookOpen,
  Target,
  FileText,
  ArrowRight,
} from "lucide-react";

const AITutorLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#02040a] via-[#050b18] to-[#03050c] text-white flex flex-col overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="flex-1 flex items-center justify-center px-6 py-24 relative">

        {/* subtle glow background */}
        <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-[140px] rounded-full top-[-100px] left-1/2 -translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl relative z-10"
        >

          {/* ICON */}
          <div className="flex justify-center mb-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <Brain size={52} className="text-blue-400" />
            </div>
          </div>

          {/* TITLE */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Scholiqen <span className="text-blue-400">AI Tutor</span>
          </h1>

          <p className="mt-5 text-lg md:text-xl text-gray-300">
            A world-class AI learning system that teaches any subject, at any level worldwide.
          </p>

          <p className="mt-3 text-sm text-gray-500 max-w-2xl mx-auto">
            Built for students, professionals, and lifelong learners — designed to explain concepts deeply, not just give answers.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">

           <button
              onClick={() => navigate("/ai-tutor/session")}
              className="group px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              🚀 Start Learning Session
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </button>

            <button className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition">
              Explore Features
            </button>

          </div>
        </motion.div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          <FeatureCard
            icon={<Globe className="text-blue-400" />}
            title="Global Curriculum"
            desc="Learn Physics, Math, Literature, Chemistry, Economics and more — worldwide academic coverage."
          />

          <FeatureCard
            icon={<BookOpen className="text-blue-400" />}
            title="Deep Concept Teaching"
            desc="Explains WHY and HOW — not just answers. Step-by-step mastery learning system."
          />

          <FeatureCard
            icon={<Target className="text-blue-400" />}
            title="Exam Preparation"
            desc="Structured revision paths and practice support for all exam styles globally."
          />

          <FeatureCard
            icon={<FileText className="text-blue-400" />}
            title="Smart Notes System"
            desc="Converts complex topics into clean, structured, revision-ready notes."
          />

          <FeatureCard
            icon={<Sparkles className="text-blue-400" />}
            title="Adaptive Intelligence"
            desc="Automatically adjusts teaching style based on your understanding level."
          />

          <FeatureCard
            icon={<Brain className="text-blue-400" />}
            title="AI Conversation Engine"
            desc="Natural tutoring conversations like a real human teacher."
          />

        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-2xl md:text-3xl font-bold mb-10">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-left">

            <Step
              number="01"
              title="Ask Anything"
              desc="Type any academic question across any subject."
            />

            <Step
              number="02"
              title="AI Breaks It Down"
              desc="The tutor explains step-by-step in simple logic."
            />

            <Step
              number="03"
              title="You Master It"
              desc="You understand deeply and can apply knowledge anywhere."
            />

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 py-10 text-center text-gray-500 text-sm">
        © 2026 Scholiqen AI • Built for global learning excellence
      </footer>

    </div>
  );
};

/* ================= FEATURE CARD ================= */
const FeatureCard = ({ icon, title, desc }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="font-semibold text-white">{title}</h3>
      </div>

      <p className="text-sm text-gray-400 leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
};

/* ================= STEP CARD ================= */
const Step = ({ number, title, desc }) => {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
      <p className="text-blue-400 font-bold">{number}</p>
      <h3 className="font-semibold mt-2 mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
};

export default AITutorLanding;