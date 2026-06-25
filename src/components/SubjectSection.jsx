import React from "react";
import { motion } from "framer-motion";
import { Atom, FlaskConical, Dna, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

const subjects = [
  {
    title: "Physics",
    icon: Atom,
    color: "from-cyan-500 to-blue-600",
    description:
      "Explore motion, force, electricity, waves and energy through simulations.",
    experiments: 24,
    path: "/lab/physics",
  },
  {
    title: "Chemistry",
    icon: FlaskConical,
    color: "from-green-500 to-emerald-600",
    description:
      "Perform reactions, study molecules and investigate chemical properties.",
    experiments: 18,
    path: "/lab/chemistry",
  },
  {
    title: "Biology",
    icon: Dna,
    color: "from-pink-500 to-purple-600",
    description:
      "Discover cells, genetics, ecosystems and human body systems.",
    experiments: 20,
    path: "/lab/biology",
  },
  {
    title: "Mathematics",
    icon: Calculator,
    color: "from-orange-500 to-red-600",
    description:
      "Visualize graphs, geometry, statistics and mathematical models.",
    experiments: 16,
    path: "/lab/mathematics",
  },
];

const SubjectSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-28 px-6 bg-[#020617] text-white overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 text-sm uppercase tracking-widest">
            Subjects
          </span>

          <h2 className="text-4xl md:text-6xl font-black mt-4">
            Choose Your
            <span className="text-cyan-400"> Laboratory</span>
          </h2>

          <p className="mt-6 text-slate-400 max-w-2xl mx-auto">
            Dive into interactive experiments designed to make
            learning engaging, practical and memorable.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

          {subjects.map((subject, index) => {
            const Icon = subject.icon;

            return (
              <motion.div
                key={subject.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                className="group relative cursor-pointer"
                onClick={() => navigate(subject.path)}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-3xl blur-xl group-hover:opacity-40 transition duration-500" />

                <div className="relative h-full rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-8 overflow-hidden">

                  {/* Gradient Accent */}
                  <div
                    className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${subject.color}`}
                  />

                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center`}
                  >
                    <Icon size={30} />
                  </div>

                  <h3 className="text-2xl font-bold mt-6">
                    {subject.title}
                  </h3>

                  <p className="text-slate-400 mt-4 leading-relaxed">
                    {subject.description}
                  </p>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-cyan-400 font-semibold">
                      {subject.experiments} Experiments
                    </span>

                    <span className="text-white group-hover:translate-x-1 transition">
                      →
                    </span>
                  </div>

                  {/* Hover Glow */}
                  <div
                    className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${subject.color} opacity-10 group-hover:opacity-20 blur-3xl transition duration-500`}
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

export default SubjectSection;