import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";

export default function SubjectHero({
  navigate,
  categoryName,
  subjectName,
  totalCourses,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-[34px] border border-slate-800 bg-slate-900/70 p-10 backdrop-blur-xl"
    >
      {/* Background Glow */}
      <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-blue-600/10 blur-[120px]" />

      <button
        onClick={() => navigate(-1)}
        className="relative z-10 inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="relative z-10 mt-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
            <BookOpen size={16} />
            {categoryName}
          </div>

          <h1 className="text-5xl font-black text-white lg:text-6xl">
            {subjectName}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Learn through structured video lessons, projects, quizzes,
            downloadable resources, AI tutoring, and certificates.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-center">
            <GraduationCap
              size={30}
              className="mx-auto text-cyan-400"
            />

            <h3 className="mt-4 text-3xl font-black">
              {totalCourses}
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Courses
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-center">
            <BookOpen
              size={30}
              className="mx-auto text-blue-400"
            />

            <h3 className="mt-4 text-3xl font-black">
              100%
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Self Paced
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}