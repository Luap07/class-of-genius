import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock3,
  Users,
  Star,
  PlayCircle,
  Award,
  ChevronRight,
} from "lucide-react";

export default function SubjectCourseCard({
  course,
  navigate,
}) {
  return (
    <motion.div
      whileHover={{
        y: -10,
        scale: 1.02,
      }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900/70 backdrop-blur-xl"
    >
      {/* Thumbnail */}
      <div className="relative h-60 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-950">
            <BookOpen
              size={70}
              className="text-white/70"
            />
          </div>
        )}

        <div className="absolute left-5 top-5 rounded-full bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950">
          {course.level || "Beginner"}
        </div>

        {course.certificate && (
          <div className="absolute right-5 top-5 rounded-full bg-yellow-500/90 p-2 text-slate-950">
            <Award size={18} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6 p-7">
        <div>
          <h2 className="line-clamp-2 text-2xl font-bold">
            {course.title}
          </h2>

          <p className="mt-4 line-clamp-3 text-slate-400">
            {course.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
          <div className="text-center">
            <Clock3
              size={20}
              className="mx-auto text-cyan-400"
            />
            <p className="mt-2 text-xs text-slate-400">
              Duration
            </p>
            <p className="mt-1 font-semibold">
              {course.duration || "N/A"}
            </p>
          </div>

          <div className="text-center">
            <Users
              size={20}
              className="mx-auto text-blue-400"
            />
            <p className="mt-2 text-xs text-slate-400">
              Students
            </p>
            <p className="mt-1 font-semibold">
              {course.students || 0}
            </p>
          </div>

          <div className="text-center">
            <Star
              size={20}
              className="mx-auto text-yellow-400"
            />
            <p className="mt-2 text-xs text-slate-400">
              Rating
            </p>
            <p className="mt-1 font-semibold">
              {course.rating || "0.0"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Instructor
            </p>

            <p className="font-semibold">
              {course.instructor}
            </p>
          </div>

          <button
            onClick={() =>
              navigate(`/courses/${course.id}`)
            }
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-bold text-slate-950 transition hover:scale-105"
          >
            <PlayCircle size={18} />
            Start
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}