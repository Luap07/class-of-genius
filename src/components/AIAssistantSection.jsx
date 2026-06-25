import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  MessageSquare,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: MessageSquare,
    title: "Ask Questions",
    description:
      "Get instant explanations for concepts, formulas and experiments.",
  },
  {
    icon: BookOpen,
    title: "Study Guidance",
    description:
      "Receive personalized learning paths and experiment recommendations.",
  },
  {
    icon: Sparkles,
    title: "Smart Assistance",
    description:
      "Understand difficult topics through AI-powered explanations.",
  },
];

const AIAssistantSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 px-6 bg-[#020617] overflow-hidden">

      {/* Background Glow */}
      <div className="absolute left-20 top-20 w-80 h-80 bg-cyan-500/10 blur-[140px] rounded-full" />
      <div className="absolute right-20 bottom-20 w-80 h-80 bg-purple-500/10 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-cyan-400 uppercase tracking-widest text-sm">
              AI Powered Learning
            </span>

            <h2 className="text-white text-4xl md:text-6xl font-black mt-4 leading-tight">
              Meet Your
              <span className="block text-cyan-400">
                AI Lab Assistant
              </span>
            </h2>

            <p className="text-slate-400 text-lg mt-6 max-w-xl">
              Learn faster with an intelligent assistant that helps
              explain experiments, answer questions and guide you
              through complex scientific concepts.
            </p>

            <div className="mt-10 space-y-6">

              {features.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.15,
                    }}
                    className="flex gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Icon className="text-cyan-400" size={22} />
                    </div>

                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {item.title}
                      </h3>

                      <p className="text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

            </div>

            <button
              onClick={() => navigate("/ai-tutor")}
              className="mt-10 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold flex items-center gap-2 transition"
            >
              Launch AI Tutor
              <ArrowRight size={18} />
            </button>
          </motion.div>

          {/* RIGHT VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >

            {/* Main Orb */}
            <div className="relative w-[380px] h-[380px] rounded-full border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-xl flex items-center justify-center">

              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 rounded-full border border-cyan-500/10"
              />

              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-[280px] h-[280px] rounded-full border border-purple-500/10"
              />

              <Brain
                size={120}
                className="text-cyan-400"
              />
            </div>

            {/* Floating Cards */}

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute top-10 left-0 bg-slate-900/80 border border-slate-700 rounded-2xl p-4 backdrop-blur-xl"
            >
              <Sparkles
                size={22}
                className="text-purple-400 mb-2"
              />
              <p className="text-white text-sm">
                Smart Explanations
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="absolute bottom-10 left-10 bg-slate-900/80 border border-slate-700 rounded-2xl p-4 backdrop-blur-xl"
            >
              <BookOpen
                size={22}
                className="text-cyan-400 mb-2"
              />
              <p className="text-white text-sm">
                Study Guidance
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
              }}
              className="absolute right-0 top-24 bg-slate-900/80 border border-slate-700 rounded-2xl p-4 backdrop-blur-xl"
            >
              <MessageSquare
                size={22}
                className="text-green-400 mb-2"
              />
              <p className="text-white text-sm">
                Ask Anything
              </p>
            </motion.div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default AIAssistantSection;