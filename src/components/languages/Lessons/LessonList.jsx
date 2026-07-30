import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Star,
  PlayCircle,
  CheckCircle2,
  Lock,
  ChevronRight,
} from "lucide-react";

const LessonList = ({
  lessons = [],
  selectedLessonId = null,
  onSelect,
}) => {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch =
        lesson.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        lesson.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesDifficulty =
        difficulty === "All" ||
        lesson.level === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [lessons, search, difficulty]);

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/10 p-4">
            <BookOpen
              size={30}
              className="text-white"
            />
          </div>

          <div>

            <h2 className="text-3xl font-black text-white">
              Language Lessons
            </h2>

            <p className="text-cyan-100">
              Browse and continue learning.
            </p>

          </div>

        </div>

      </div>

      {/* Filters */}

      <div className="grid gap-4 border-b border-white/10 p-6 lg:grid-cols-[1fr_220px]">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            placeholder="Search lessons..."
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white outline-none focus:border-cyan-500"
          />

        </div>

        <div className="relative">

          <Filter
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white outline-none"
          >
            <option>All</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

        </div>

      </div>

      {/* Lessons */}

      <div className="space-y-4 p-6">

        {filteredLessons.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">

            <BookOpen
              size={50}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-xl font-bold text-white">
              No lessons found
            </h3>

            <p className="mt-2 text-slate-400">
              Try another search term.
            </p>

          </div>
        )}

        {filteredLessons.map((lesson) => {
          const active =
            lesson.id === selectedLessonId;

          return (
            <motion.button
              whileHover={{
                scale: 1.01,
              }}
              key={lesson.id}
              onClick={() => onSelect?.(lesson)}
              className={`w-full rounded-3xl border text-left transition ${
                active
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-white/10 bg-black/20 hover:border-cyan-500"
              }`}
            >
              <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex gap-5">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-600">

                    {lesson.completed ? (
                      <CheckCircle2
                        size={30}
                        className="text-white"
                      />
                    ) : lesson.locked ? (
                      <Lock
                        size={28}
                        className="text-white"
                      />
                    ) : (
                      <PlayCircle
                        size={30}
                        className="text-white"
                      />
                    )}

                  </div>

                  <div>

                    <h3 className="text-xl font-black text-white">
                      {lesson.title}
                    </h3>

                    <p className="mt-2 max-w-2xl text-slate-400">
                      {lesson.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">

                      <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-300">
                        {lesson.level}
                      </span>

                      <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                        <Clock size={14} />
                        {lesson.duration || "15 min"}
                      </span>

                      <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-300">
                        <Star size={14} />
                        {lesson.rating || "4.9"}
                      </span>

                    </div>

                  </div>

                </div>

                <ChevronRight
                  className="text-cyan-400"
                  size={26}
                />

              </div>
            </motion.button>
          );
        })}

      </div>

    </motion.section>
  );
};

export default LessonList;