import React from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  ArrowRight,
} from "lucide-react";

export default function SubjectBottomCTA({
  navigate,
}) {
  return (
    <motion.div
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
        duration: 0.6,
      }}
      className="mt-24 overflow-hidden rounded-[34px] border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 p-10 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
        <div className="max-w-3xl">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400">
            <Rocket size={32} />
          </div>

          <h2 className="text-4xl font-black">
            Ready to Start Learning?
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            Learn with professionally structured courses,
            HD video lessons, quizzes, downloadable resources,
            practical projects, AI Tutor assistance,
            certificates, and real-time progress tracking.
          </p>
        </div>

        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-bold text-slate-950 transition hover:scale-105"
        >
          Explore More Courses
          <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}