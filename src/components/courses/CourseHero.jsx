import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
} from "lucide-react";

const CourseHero = ({
  onBrowseCourses,
  onExploreCategories,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-gradient-to-r
        from-blue-950
        via-slate-900
        to-indigo-950
        p-10
      "
    >
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">

        {/* Left */}

        <div>

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-2 text-blue-300">
            <GraduationCap size={18} />
            Learn Without Limits
          </div>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight">
            Discover Courses
            <br />
            Build Your Future
          </h1>

          <p className="mt-6 max-w-xl text-slate-300 text-lg leading-8">
            Explore thousands of learning materials from secondary
            school subjects, university courses, professional
            certifications and skill-based programs from around the
            world.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <button
              onClick={onBrowseCourses}
              className="
                rounded-2xl
                bg-blue-600
                px-7
                py-4
                font-semibold
                hover:bg-blue-700
                transition
              "
            >
              Browse Courses
            </button>

            <button
              onClick={onExploreCategories}
              className="
                rounded-2xl
                border
                border-slate-700
                px-7
                py-4
                hover:bg-slate-800
                transition
              "
            >
              Explore Categories
            </button>

          </div>

        </div>

        {/* Right */}

        <div className="grid grid-cols-2 gap-5">

          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6">

            <BookOpen
              className="text-blue-400"
              size={34}
            />

            <h2 className="mt-5 text-4xl font-bold">
              5,000+
            </h2>

            <p className="mt-2 text-slate-400">
              Courses
            </p>

          </div>

          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6">

            <Users
              className="text-cyan-400"
              size={34}
            />

            <h2 className="mt-5 text-4xl font-bold">
              100K+
            </h2>

            <p className="mt-2 text-slate-400">
              Learners
            </p>

          </div>

          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6">

            <Award
              className="text-amber-400"
              size={34}
            />

            <h2 className="mt-5 text-4xl font-bold">
              1,500+
            </h2>

            <p className="mt-2 text-slate-400">
              Certificates
            </p>

          </div>

          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6">

            <GraduationCap
              className="text-emerald-400"
              size={34}
            />

            <h2 className="mt-5 text-4xl font-bold">
              Global
            </h2>

            <p className="mt-2 text-slate-400">
              Learning
            </p>

          </div>

        </div>

      </div>

    </motion.section>
  );
};

export default CourseHero;