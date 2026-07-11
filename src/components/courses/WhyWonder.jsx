// src/components/courses/WhyWonder.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  BookOpen,
  FlaskConical,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Brain,
  Laptop,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "24/7 AI Tutor",
    description: "Ask questions anytime and receive intelligent explanations instantly.",
    details: "Your AI Tutor understands every subject, explains concepts step-by-step, generates quizzes, summarizes notes, recommends study plans, and helps prepare for WAEC, JAMB, university exams, and professional certifications.",
    color: "text-cyan-400",
    bg: "from-cyan-500/20 via-cyan-500/5 to-transparent",
  },
  {
    icon: FlaskConical,
    title: "Interactive Virtual Labs",
    description: "Perform realistic experiments without a physical laboratory.",
    details: "Physics, Chemistry, Biology and Mathematics laboratories come alive through interactive simulations, animated experiments, graphs and real-time calculations.",
    color: "text-emerald-400",
    bg: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
  {
    icon: BookOpen,
    title: "Premium Course Library",
    description: "Professional courses, school curriculum and career skills in one place.",
    details: "Browse structured learning paths, downloadable resources, HD video lessons, assessments, coding tutorials, business training, AI courses and university-level content.",
    color: "text-blue-400",
    bg: "from-blue-500/20 via-blue-500/5 to-transparent",
  },
  {
    icon: Brain,
    title: "Adaptive Learning",
    description: "Every learner gets a personalized experience.",
    details: "Scholiqen analyzes your strengths, weaknesses, learning speed and quiz performance to recommend what you should study next.",
    color: "text-violet-400",
    bg: "from-violet-500/20 via-violet-500/5 to-transparent",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description: "Earn certificates employers can trust.",
    details: "Complete courses and assessments to unlock professional certificates that can be shared online and verified securely.",
    color: "text-yellow-400",
    bg: "from-yellow-500/20 via-yellow-500/5 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Learning Analytics",
    description: "Monitor your growth with detailed statistics.",
    details: "Track lessons completed, study streaks, quiz performance, assignments, certificates earned, learning time and overall progress from one dashboard.",
    color: "text-pink-400",
    bg: "from-pink-500/20 via-pink-500/5 to-transparent",
  },
  {
    icon: Laptop,
    title: "Learn Anywhere",
    description: "Switch between devices without losing progress.",
    details: "Everything is synchronized across desktop, tablet and mobile, allowing you to continue learning from where you stopped.",
    color: "text-orange-400",
    bg: "from-orange-500/20 via-orange-500/5 to-transparent",
  },
  {
    icon: ShieldCheck,
    title: "Secure Learning",
    description: "Your learning data is always protected.",
    details: "Industry-standard security protects your account, certificates, learning history and personal information.",
    color: "text-green-400",
    bg: "from-green-500/20 via-green-500/5 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Future Ready",
    description: "Built with modern AI-powered education technology.",
    details: "Scholiqen continuously evolves with new AI capabilities, smarter recommendations and interactive educational tools.",
    color: "text-indigo-400",
    bg: "from-indigo-500/20 via-indigo-500/5 to-transparent",
  },
];

const WhyWonder = () => {
  const [openCard, setOpenCard] = useState(null);

  return (
    <section className="space-y-16">
      {/* Heading */}
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-400">
          Why Choose Scholiqen?
        </span>
        <h2 className="mt-6 text-4xl font-black leading-tight text-white md:text-5xl">
          Everything You Need
          <br />
          To Learn Smarter
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
          Scholiqen combines artificial intelligence, professional courses, virtual laboratories, assessments, certificates and personalized learning into one powerful educational platform.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const expanded = openCard === index;

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative overflow-hidden rounded-[32px] border border-slate-800 bg-[#09131f] p-8 transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_25px_60px_rgba(0,0,0,.45)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} opacity-40 transition-all duration-500 group-hover:opacity-100`} />
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-500 group-hover:scale-125" />

              <div className="relative z-10">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 ${feature.color}`}>
                  <Icon size={30} />
                </div>
                <h3 className="mt-7 text-2xl font-bold text-white">{feature.title}</h3>
                <p className="mt-4 leading-7 text-slate-400">{feature.description}</p>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                        <p className="leading-7 text-slate-300">{feature.details}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setOpenCard(expanded ? null : index)}
                  className="mt-7 flex items-center gap-2 font-semibold text-cyan-400 transition hover:text-cyan-300"
                >
                  {expanded ? "Show Less" : "Learn More"}
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Premium CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[40px] border border-cyan-500/20 bg-gradient-to-br from-[#08111d] via-[#0d1726] to-[#101f36] p-10 lg:p-16"
      >
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="relative z-10 grid gap-14 lg:grid-cols-2">
          {/* Left */}
          <div>
            <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">
              🚀 The Future of Learning
            </span>
            <h2 className="mt-7 text-5xl font-black leading-tight text-white">
              Learn Smarter.
              <br />
              Build Faster.
              <br />
              Become Limitless.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Scholiqen combines AI tutoring, professional courses, virtual laboratories, smart assessments, certificates and adaptive learning into one beautiful platform.
            </p>
            <div className="mt-10 flex flex-wrap gap-5">
              <button className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-slate-950 transition-all duration-300 hover:scale-105 hover:bg-cyan-400">
                Start Learning Free
              </button>
              <button className="rounded-2xl border border-slate-700 bg-slate-900/50 px-8 py-4 font-bold text-white transition-all duration-300 hover:border-cyan-400 hover:bg-slate-800">
                Explore Courses
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-80 w-80 rounded-full bg-cyan-500/15 blur-[100px]" />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative w-full max-w-md rounded-[32px] border border-cyan-500/20 bg-slate-900/90 p-8 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15">
                  <Bot size={30} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Scholiqen AI</h3>
                  <p className="text-sm text-slate-400">Personal Learning Assistant</p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-slate-800/80 p-5">
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Status</span>
                  <span className="font-bold text-emerald-400">● Online</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "92%" }}
                    transition={{ duration: 2 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {["AI Tutor", "Virtual Labs", "Quiz Generator", "Certificates"].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4 text-center"
                  >
                    <p className="font-semibold text-cyan-300">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default WhyWonder;