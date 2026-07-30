import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  Target,
} from "lucide-react";

const LanguageProgress = ({
  language = "English",
  level = "Beginner",
  completedLessons = 0,
  totalLessons = 0,
  completedExercises = 0,
  totalExercises = 0,
  studyHours = 0,
  currentXP = 0,
  nextLevelXP = 1000,
}) => {
  const lessonProgress = useMemo(() => {
    if (!totalLessons) return 0;
    return Math.round(
      (completedLessons / totalLessons) * 100
    );
  }, [completedLessons, totalLessons]);

  const exerciseProgress = useMemo(() => {
    if (!totalExercises) return 0;
    return Math.round(
      (completedExercises / totalExercises) * 100
    );
  }, [completedExercises, totalExercises]);

  const xpProgress = useMemo(() => {
    if (!nextLevelXP) return 0;
    return Math.min(
      100,
      Math.round((currentXP / nextLevelXP) * 100)
    );
  }, [currentXP, nextLevelXP]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2 className="text-3xl font-black text-white">
              {language} Progress
            </h2>

            <p className="mt-2 text-cyan-100">
              Current Level: {level}
            </p>

          </div>

          <div className="rounded-2xl bg-white/10 px-6 py-5">

            <p className="text-sm text-cyan-100">
              Current XP
            </p>

            <h3 className="text-3xl font-black text-white">
              {currentXP}
            </h3>

          </div>

        </div>

      </div>

      {/* Overview */}

      <div className="grid gap-5 border-b border-white/10 p-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl bg-black/20 p-5">

          <BookOpen
            size={26}
            className="text-cyan-400"
          />

          <h3 className="mt-4 text-2xl font-black text-white">
            {completedLessons}/{totalLessons}
          </h3>

          <p className="text-slate-400">
            Lessons
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <CheckCircle2
            size={26}
            className="text-green-400"
          />

          <h3 className="mt-4 text-2xl font-black text-white">
            {completedExercises}/{totalExercises}
          </h3>

          <p className="text-slate-400">
            Exercises
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Clock
            size={26}
            className="text-yellow-400"
          />

          <h3 className="mt-4 text-2xl font-black text-white">
            {studyHours}
          </h3>

          <p className="text-slate-400">
            Study Hours
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Award
            size={26}
            className="text-purple-400"
          />

          <h3 className="mt-4 text-2xl font-black text-white">
            {level}
          </h3>

          <p className="text-slate-400">
            Rank
          </p>

        </div>

      </div>

      {/* Progress Bars */}

      <div className="space-y-8 p-8">

        <div>

          <div className="mb-3 flex justify-between">

            <span className="font-semibold text-white">
              Lesson Progress
            </span>

            <span className="text-cyan-300">
              {lessonProgress}%
            </span>

          </div>

          <div className="h-4 overflow-hidden rounded-full bg-white/10">

            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${lessonProgress}%`,
              }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
            />

          </div>

        </div>

        <div>

          <div className="mb-3 flex justify-between">

            <span className="font-semibold text-white">
              Exercise Progress
            </span>

            <span className="text-green-300">
              {exerciseProgress}%
            </span>

          </div>

          <div className="h-4 overflow-hidden rounded-full bg-white/10">

            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${exerciseProgress}%`,
              }}
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
            />

          </div>

        </div>

        <div>

          <div className="mb-3 flex justify-between">

            <span className="font-semibold text-white">
              XP Progress
            </span>

            <span className="text-purple-300">
              {xpProgress}%
            </span>

          </div>

          <div className="h-4 overflow-hidden rounded-full bg-white/10">

            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${xpProgress}%`,
              }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            />

          </div>

          <p className="mt-3 text-sm text-slate-400">
            {currentXP} / {nextLevelXP} XP to next level
          </p>

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-white/10 bg-black/20 p-6">

        <div className="flex items-center gap-3">

          <TrendingUp
            size={22}
            className="text-cyan-400"
          />

          <p className="text-slate-300">
            Keep practicing daily to maintain your learning streak
            and reach your next level faster.
          </p>

        </div>

      </div>

    </motion.section>
  );
};

export default LanguageProgress;