import React from "react";
import { BookOpen, Award } from "lucide-react";
import { motion } from "framer-motion";

const ViewerHeader = ({ course, progress = 0 }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        border-b
        border-slate-800
        bg-slate-900
        px-8
        py-6
      "
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        {/* Left */}

        <div>

          <div className="flex items-center gap-3">

            <BookOpen className="text-blue-400" size={28} />

            <h1 className="text-3xl font-bold">
              {course?.title || "Course"}
            </h1>

          </div>

          <p className="mt-3 text-slate-400 max-w-3xl">
            {course?.description ||
              "Study course materials, complete modules, and track your learning progress."}
          </p>

        </div>

        {/* Right */}

        <div className="min-w-[280px]">

          <div className="flex items-center justify-between mb-2">

            <span className="text-slate-400">
              Course Progress
            </span>

            <span className="font-bold text-blue-400">
              {progress}%
            </span>

          </div>

          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7 }}
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-blue-500
                to-cyan-400
              "
            />

          </div>

          <div className="mt-4 flex items-center gap-2 text-amber-400">

            <Award size={18} />

            <span className="text-sm">
              Complete every module to earn a certificate.
            </span>

          </div>

        </div>

      </div>
    </motion.header>
  );
};

export default ViewerHeader;