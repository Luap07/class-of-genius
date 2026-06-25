import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Rocket, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LabCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 px-6 bg-[#020617] overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[150px] rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[40px] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-10 md:p-16 text-center"
        >

          {/* Decorative Circles */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="flex justify-center mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center">
                <Rocket
                  size={48}
                  className="text-cyan-400"
                />
              </div>
            </motion.div>

            <h2 className="text-white text-4xl md:text-6xl font-black">
              Ready to Enter the
              <span className="block text-cyan-400">
                Virtual Laboratory?
              </span>
            </h2>

            <p className="text-slate-400 max-w-2xl mx-auto mt-6 text-lg">
              Perform interactive experiments, explore scientific
              concepts, receive AI guidance and build practical
              understanding through immersive simulations.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-10">

              <button
                onClick={() => navigate("/lab")}
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold flex items-center gap-2 transition"
              >
                Launch Virtual Lab
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => navigate("/ai-tutor")}
                className="px-8 py-4 border border-slate-700 hover:border-cyan-500 text-white rounded-xl transition flex items-center gap-2"
              >
                AI Assistant
                <FlaskConical size={18} />
              </button>

            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">

              <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-6">
                <h3 className="text-3xl font-bold text-cyan-400">
                  50+
                </h3>
                <p className="text-slate-400 mt-2">
                  Interactive Experiments
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-6">
                <h3 className="text-3xl font-bold text-purple-400">
                  4
                </h3>
                <p className="text-slate-400 mt-2">
                  Science Subjects
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-6">
                <h3 className="text-3xl font-bold text-green-400">
                  AI
                </h3>
                <p className="text-slate-400 mt-2">
                  Learning Assistant
                </p>
              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default LabCTASection;