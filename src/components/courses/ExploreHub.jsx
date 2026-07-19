import React from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Brain,
  FlaskConical,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ExploreHub = ({ courses = [], search = "" }) => {
  const navigate = useNavigate();

  // If courses exist, don't show the hub
  if (courses.length > 0) return null;

  const cards = [
    {
  title: "Browse Subjects",
  description:
    "Explore every learning category available on Scholiqen.",
  icon: BookOpen,
  color: "from-cyan-500 to-blue-600",
  action: () => navigate("/subjects"),
},
{
      title: "AI Tutor",
      description:
        "Learn with your personal AI tutor whenever you're stuck.",
      icon: Brain,
      color: "from-violet-500 to-fuchsia-600",
      action: () => navigate("/ai-tutor"),
    },
    {
      title: "Virtual Labs",
      description:
        "Perform interactive experiments in Physics, Chemistry and Biology.",
      icon: FlaskConical,
      color: "from-emerald-500 to-green-600",
      action: () => navigate("/lab"),
    },
    {
      title: "Learning Paths",
      description:
        "Follow structured roadmaps curated by expert instructors.",
      icon: GraduationCap,
      color: "from-orange-500 to-amber-600",
      action: () => navigate("/lms"),
    },
  ];

  return (
    <section className="mt-12">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-slate-800 bg-[#07111f] overflow-hidden"
      >
        {/* Header */}

        <div className="relative p-10 border-b border-slate-800">

          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10" />

          <div className="relative">

            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2">

              <Compass className="text-cyan-400" size={18} />

              <span className="text-cyan-300 font-semibold">
                Keep Exploring
              </span>

            </div>

            <h2 className="mt-6 text-4xl font-black text-white">
              Couldn't find what you're looking for?
            </h2>

            <p className="mt-4 max-w-3xl text-slate-400 leading-8">
              We couldn't find any courses matching
              {search ? (
                <>
                  {" "}
                  <span className="text-white font-semibold">
                    "{search}"
                  </span>
                </>
              ) : (
                " your search"
              )}.
              Explore another part of Scholiqen below.
            </p>

          </div>

        </div>

        {/* Cards */}

        <div className="grid gap-6 p-10 md:grid-cols-2">

          {cards.map((card) => {

            const Icon = card.icon;

            return (
              <motion.button
                key={card.title}
                whileHover={{ y: -8 }}
                onClick={card.action}
                className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-left transition hover:border-cyan-500/40"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center`}
                >
                  <Icon className="text-white" size={28} />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white">
                  {card.title}
                </h3>

                <p className="mt-3 text-slate-400 leading-7">
                  {card.description}
                </p>

                <div className="mt-8 flex items-center gap-2 text-cyan-400 font-semibold">
                  Open
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default ExploreHub;