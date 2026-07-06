import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";

const CourseCard = ({
  title,
  instructor,
  level = "Beginner",
  students = 0,
  duration = "0h",
  progress = 0,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="cursor-pointer rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-blue-500"
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700">
        <BookOpen size={38} className="text-white" />

        <h2 className="text-2xl font-bold mt-4 text-white">
          {title}
        </h2>

        <p className="text-white/80 mt-1">
          {instructor}
        </p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">

          <div className="flex items-center gap-2">
            <Users size={16} />
            {students} Students
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} />
            {duration}
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-800 text-xs">
            {level}
          </div>

        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mt-3">
          Continue
          <ArrowRight size={16} />
        </button>

      </div>
    </motion.div>
  );
};

export default CourseCard;