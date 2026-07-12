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
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Bot,
    title: "24/7 AI Tutor",
    description: "Ask questions anytime and receive intelligent explanations instantly.",
    details: "Your AI Tutor understands every subject, explains concepts step-by-step, generates quizzes, summarizes notes, recommends study plans, and helps prepare for WAEC, JAMB, university exams and professional certifications.",
    color: "text-cyan-400",
    bg: "from-cyan-500/20 via-cyan-500/5 to-transparent",
  },
  {
    icon: FlaskConical,
    title: "Interactive Virtual Labs",
    description: "Perform realistic science and engineering experiments online.",
    details: "Practice Physics, Chemistry, Biology and Mathematics using modern virtual laboratories with animations, simulations and interactive experiments.",
    color: "text-emerald-400",
    bg: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
  {
    icon: BookOpen,
    title: "Professional Courses",
    description: "Access premium learning content for every career path.",
    details: "Study programming, AI, business, medicine, engineering, finance, law, architecture, economics, languages and many more professional disciplines.",
    color: "text-blue-400",
    bg: "from-blue-500/20 via-blue-500/5 to-transparent",
  },
  {
    icon: Brain,
    title: "Adaptive Learning",
    description: "Learning that adapts to your strengths and weaknesses.",
    details: "Scholiqen intelligently tracks your progress and recommends lessons, quizzes and study plans based on your performance.",
    color: "text-violet-400",
    bg: "from-violet-500/20 via-violet-500/5 to-transparent",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description: "Earn professional certificates after completing courses.",
    details: "Certificates can be shared with employers and used to showcase your achievements after successfully completing learning paths.",
    color: "text-yellow-400",
    bg: "from-yellow-500/20 via-yellow-500/5 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Learning Analytics",
    description: "Track every step of your learning journey.",
    details: "View detailed reports showing study time, completed lessons, quiz scores, certificates earned, learning streaks and overall academic progress.",
    color: "text-pink-400",
    bg: "from-pink-500/20 via-pink-500/5 to-transparent",
  },
  {
    icon: Laptop,
    title: "Learn Anywhere",
    description: "Continue learning on any device.",
    details: "Whether you're using a desktop, tablet or smartphone, your lessons, quizzes, notes and progress automatically stay synchronized.",
    color: "text-orange-400",
    bg: "from-orange-500/20 via-orange-500/5 to-transparent",
  },
  {
    icon: ShieldCheck,
    title: "Secure Learning",
    description: "Your account and learning data are protected.",
    details: "Industry-standard security safeguards your courses, certificates, progress history and personal information.",
    color: "text-green-400",
    bg: "from-green-500/20 via-green-500/5 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Future-Ready Platform",
    description: "Powered by modern AI technology.",
    details: "Scholiqen continues to evolve with intelligent recommendations, smarter study assistants, new virtual labs and cutting-edge educational tools.",
    color: "text-indigo-400",
    bg: "from-indigo-500/20 via-indigo-500/5 to-transparent",
  },
];

const WhyWonder = () => {
  const navigate = useNavigate();
  const [openCard, setOpenCard] = useState(null);

  return (
    <section className="space-y-16">
      {/* Heading */}
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-400">
          Why Choose Scholiqen?
        </span>
        <h2 className="mt-6 text-4xl font-black leading-tight text-white md:text-5xl">
          Everything You Need <br /> To Learn Smarter
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
          Scholiqen combines Artificial Intelligence, professional courses, virtual laboratories, smart assessments, certificates and adaptive learning into one powerful educational ecosystem.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const expanded = openCard === index;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="group relative overflow-hidden rounded-[32px] border border-slate-800 bg-[#09131f] p-8"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} opacity-40 group-hover:opacity-100 transition-opacity`} />
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
    </section>
  );
};

export default WhyWonder;