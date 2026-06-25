import React from "react";
import { motion } from "framer-motion";
import { FlaskConical, Atom, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#020617] text-white flex items-center">

      {/* Background Glow */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500/20 blur-[120px] rounded-full" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm">
                Interactive Science Platform
              </span>

              <h1 className="text-5xl md:text-7xl font-black mt-8 leading-tight">
                Virtual
                <span className="block text-cyan-400">
                  Laboratory
                </span>
              </h1>

              <p className="mt-6 text-slate-300 text-lg max-w-xl leading-relaxed">
                Learn Physics, Chemistry, Biology and Mathematics
                through real-time simulations, AI-powered guidance
                and interactive experiments.
              </p>

              <div className="flex flex-wrap gap-4 mt-10">

                <button
                  onClick={() => navigate("/lab")}
                  className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-2 transition"
                >
                  Launch Lab
                  <ArrowRight size={18} />
                </button>

                <button
                  className="px-8 py-4 rounded-xl border border-slate-700 hover:border-cyan-500 transition"
                >
                  Explore Experiments
                </button>

              </div>
            </motion.div>

          </div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >

            {/* Main Glass Orb */}
            <div className="relative w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 flex items-center justify-center">

              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 18,
                  ease: "linear",
                }}
                className="absolute w-full h-full rounded-full border border-cyan-500/20"
              />

              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  repeat: Infinity,
                  duration: 25,
                  ease: "linear",
                }}
                className="absolute w-[320px] h-[320px] rounded-full border border-purple-500/20"
              />

              <Atom
                size={120}
                className="text-cyan-400"
              />

            </div>

            {/* Floating Cards */}

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4,
              }}
              className="absolute top-8 left-0 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-4"
            >
              <FlaskConical className="text-green-400 mb-2" />
              <p className="text-sm">Chemistry Lab</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{
                repeat: Infinity,
                duration: 5,
              }}
              className="absolute bottom-10 left-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-4"
            >
              <Brain className="text-purple-400 mb-2" />
              <p className="text-sm">AI Assistant</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4.5,
              }}
              className="absolute top-24 right-0 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-4"
            >
              <Atom className="text-cyan-400 mb-2" />
              <p className="text-sm">Physics Sim</p>
            </motion.div>

          </motion.div>

        </div>

      </div>

    </section>
  );
};

export default Hero;