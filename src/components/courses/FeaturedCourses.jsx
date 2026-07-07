import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

const FeaturedCourses = ({
  courses = [],
  onOpen = () => {},
}) => {
  if (!courses.length) return null;

  return (
    <section className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2 text-yellow-400">

            <Sparkles size={20} />

            <span className="font-semibold">
              Featured Courses
            </span>

          </div>

          <h2 className="mt-2 text-3xl font-bold">
            Discover something amazing
          </h2>

          <p className="mt-2 text-slate-400">
            Hand-picked courses recommended by Scholiqen.
          </p>

        </div>

      </div>

      {/* Cards */}

      <div className="grid gap-6 lg:grid-cols-2">

        {courses.map((course) => (

          <motion.div
            key={course.id}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
          >

            {/* Banner */}

            <div className="relative h-60 overflow-hidden">

              {course.thumbnail ? (

                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />

              ) : (

                <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950">

                  <BookOpen
                    size={70}
                    className="text-white/70"
                  />

                </div>

              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5">

                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold">

                  {course.category || "General"}

                </span>

              </div>

            </div>

            {/* Body */}

            <div className="p-7">

              <p className="text-blue-400 font-medium">

                {course.provider || "Scholiqen"}

              </p>

              <h2 className="mt-2 text-2xl font-bold">

                {course.title}

              </h2>

              <p className="mt-3 line-clamp-3 text-slate-400">

                {course.description ||
                  "Start learning today with this premium course."}

              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <span className="rounded-full bg-slate-800 px-4 py-2 text-sm">

                  {course.level || "Beginner"}

                </span>

                <span className="rounded-full bg-slate-800 px-4 py-2 text-sm">

                  {course.duration || "0 Hours"}

                </span>

                <span className="rounded-full bg-slate-800 px-4 py-2 text-sm">

                  {course.lessons || 0} Lessons

                </span>

              </div>

              <button
                onClick={() => onOpen(course.id)}
                className="mt-8 flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
              >

                Explore Course

                <ArrowRight size={18} />

              </button>

            </div>

          </motion.div>

        ))}

      </div>

    </section>
  );
};

export default FeaturedCourses;