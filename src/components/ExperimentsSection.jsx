import React from "react";
import { motion } from "framer-motion";
import {
  Atom,
  FlaskConical,
  Dna,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const experiments = [
  {
    title: "Force & Motion",
    subject: "Physics",
    icon: Atom,
    color: "from-cyan-500 to-blue-600",
    description:
      "Investigate velocity, acceleration and Newton's laws through live simulations.",
    path: "/lab/physics/motion",
  },
  {
    title: "Chemical Reactions",
    subject: "Chemistry",
    icon: FlaskConical,
    color: "from-green-500 to-emerald-600",
    description:
      "Mix compounds and observe reactions in a safe virtual environment.",
    path: "/lab/chemistry/reaction",
  },
  {
    title: "Cell Structure",
    subject: "Biology",
    icon: Dna,
    color: "from-pink-500 to-purple-600",
    description:
      "Explore organelles and understand how living cells function.",
    path: "/lab/biology/cell",
  },
  {
    title: "Graph Explorer",
    subject: "Mathematics",
    icon: TrendingUp,
    color: "from-orange-500 to-red-600",
    description:
      "Visualize equations, curves and coordinate systems interactively.",
    path: "/lab/mathematics/graph",
  },
];

const ExperimentsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-28 px-6 bg-[#020617] overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 uppercase tracking-widest text-sm">
            Popular Simulations
          </span>

          <h2 className="text-white text-4xl md:text-6xl font-black mt-4">
            Featured
            <span className="text-cyan-400"> Experiments</span>
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto mt-6">
            Launch immersive simulations and discover scientific
            concepts through hands-on virtual experimentation.
          </p>
        </motion.div>

        {/* Experiment Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

          {experiments.map((experiment, index) => {
            const Icon = experiment.icon;

            return (
              <motion.div
                key={experiment.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                className="group cursor-pointer"
                onClick={() => navigate(experiment.path)}
              >
                <div className="relative h-full rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl overflow-hidden">

                  {/* Top Gradient */}
                  <div
                    className={`h-2 bg-gradient-to-r ${experiment.color}`}
                  />

                  {/* Card Content */}
                  <div className="p-8">

                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${experiment.color} flex items-center justify-center`}
                    >
                      <Icon size={30} className="text-white" />
                    </div>

                    <p className="text-cyan-400 text-sm mt-6">
                      {experiment.subject}
                    </p>

                    <h3 className="text-white text-2xl font-bold mt-2">
                      {experiment.title}
                    </h3>

                    <p className="text-slate-400 mt-4 leading-relaxed">
                      {experiment.description}
                    </p>

                    <button
                      className="mt-8 flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all"
                    >
                      Launch
                      <ArrowRight size={18} />
                    </button>

                  </div>

                  {/* Hover Glow */}
                  <div
                    className={`absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${experiment.color} opacity-10 blur-3xl group-hover:opacity-25 transition duration-500`}
                  />
                </div>
              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default ExperimentsSection;