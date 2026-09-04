import React from "react";
import { motion } from "framer-motion";
import {
  Atom,
  FlaskConical,
  Dna,
  TrendingUp,
} from "lucide-react";

const experiments = [
  {
    title: "Force & Motion",
    subject: "Physics",
    icon: Atom,
    color: "from-cyan-500 to-blue-600",
    description:
      "Investigate velocity, acceleration and Newton's laws through live simulations.",
  },
  {
    title: "Chemical Reactions",
    subject: "Chemistry",
    icon: FlaskConical,
    color: "from-green-500 to-emerald-600",
    description:
      "Mix compounds and observe reactions in a safe virtual environment.",
  },
  {
    title: "Cell Structure",
    subject: "Biology",
    icon: Dna,
    color: "from-pink-500 to-purple-600",
    description:
      "Explore organelles and understand how living cells function.",
  },
  {
    title: "Graph Explorer",
    subject: "Mathematics",
    icon: TrendingUp,
    color: "from-orange-500 to-red-600",
    description:
      "Visualize equations, curves and coordinate systems interactively.",
  },
];

const ExperimentsSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#020617] px-6 py-28 text-white">
      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="mb-16 text-center"
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/[0.07]
              px-4
              py-2
              text-xs
              font-black
              uppercase
              tracking-widest
              text-cyan-300
            "
          >
            <Atom size={14} />

            Virtual Laboratory
          </div>

          <h2 className="mt-5 text-4xl font-black md:text-6xl">
            Featured
            <span className="text-cyan-400">
              {" "}Experiments
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-slate-400">
            Experience interactive simulations designed to make
            complex scientific concepts easier to understand,
            visualize and explore.
          </p>
        </motion.div>

        {/* =====================================================
            EXPERIMENT CARDS
        ===================================================== */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {experiments.map((experiment, index) => {
            const Icon = experiment.icon;

            return (
              <motion.div
                key={experiment.title}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                className="group relative"
              >
                {/* =================================================
                    OUTER GLOW
                ================================================= */}

                <div
                  className={`
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-3xl
                    bg-gradient-to-br
                    ${experiment.color}
                    opacity-10
                    blur-2xl
                    transition-all
                    duration-500
                    group-hover:opacity-30
                  `}
                />

                {/* =================================================
                    CARD
                ================================================= */}

                <div
                  className="
                    relative
                    h-full
                    overflow-hidden
                    rounded-3xl
                    border
                    border-white/10
                    bg-slate-900/80
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    group-hover:border-white/20
                  "
                >
                  {/* Top Gradient */}

                  <div
                    className={`
                      h-1.5
                      w-full
                      bg-gradient-to-r
                      ${experiment.color}
                    `}
                  />

                  <div className="p-8">
                    {/* =================================================
                        ICON
                    ================================================= */}

                    <div
                      className={`
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        ${experiment.color}
                        shadow-lg
                        transition-transform
                        duration-300
                        group-hover:scale-110
                      `}
                    >
                      <Icon
                        size={30}
                        className="text-white"
                      />
                    </div>

                    {/* =================================================
                        SUBJECT
                    ================================================= */}

                    <p className="mt-6 text-sm font-bold uppercase tracking-wider text-cyan-400">
                      {experiment.subject}
                    </p>

                    {/* =================================================
                        TITLE
                    ================================================= */}

                    <h3 className="mt-2 text-2xl font-black text-white">
                      {experiment.title}
                    </h3>

                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <p className="mt-4 min-h-[96px] leading-relaxed text-slate-400">
                      {experiment.description}
                    </p>

                    {/* =================================================
                        ACCESS
                    ================================================= */}

                    <div className="mt-8 border-t border-white/[0.08] pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Available in
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-300">
                            Virtual Laboratory
                          </p>
                        </div>

                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-white/10
                            bg-white/[0.04]
                            text-cyan-400
                            transition-all
                            duration-300
                            group-hover:scale-110
                          `}
                        >
                          <Icon size={17} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      BOTTOM GLOW
                  ================================================= */}

                  <div
                    className={`
                      pointer-events-none
                      absolute
                      -bottom-16
                      -right-16
                      h-40
                      w-40
                      rounded-full
                      bg-gradient-to-br
                      ${experiment.color}
                      opacity-10
                      blur-3xl
                      transition
                      duration-500
                      group-hover:opacity-25
                    `}
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