import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  BarChart3,
  CheckCircle2,
  PlayCircle,
  Volume2,
  FileText,
  Sparkles,
  Lightbulb,
  Award,
} from "lucide-react";

const LessonContent = ({
  lesson = {},
  onStart,
  onComplete,
  onPlayAudio,
}) => {
  if (!lesson?.id) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900">
        <div className="text-center">

          <BookOpen
            size={60}
            className="mx-auto text-slate-600"
          />

          <h2 className="mt-6 text-2xl font-black text-white">
            Select a Lesson
          </h2>

          <p className="mt-3 text-slate-400">
            Choose a lesson from the list to begin learning.
          </p>

        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{
        opacity: 0,
        x: 20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Hero */}

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-100">
              {lesson.level || "Beginner"}
            </span>

            <h1 className="mt-5 text-4xl font-black text-white">
              {lesson.title}
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-cyan-100">
              {lesson.description}
            </p>

          </div>

          <button
            onClick={() => onStart?.(lesson)}
            className="flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 font-bold text-slate-900 transition hover:scale-105"
          >
            <PlayCircle size={22} />
            Start Lesson
          </button>

        </div>

      </div>

      {/* Stats */}

      <div className="grid gap-5 border-b border-white/10 p-6 md:grid-cols-4">

        <div className="rounded-2xl bg-black/20 p-5">

          <Clock className="text-cyan-400" />

          <h4 className="mt-4 font-bold text-white">
            Duration
          </h4>

          <p className="mt-2 text-slate-400">
            {lesson.duration || "20 min"}
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <BarChart3 className="text-green-400" />

          <h4 className="mt-4 font-bold text-white">
            Difficulty
          </h4>

          <p className="mt-2 text-slate-400">
            {lesson.level || "Beginner"}
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Award className="text-yellow-400" />

          <h4 className="mt-4 font-bold text-white">
            XP Reward
          </h4>

          <p className="mt-2 text-slate-400">
            {lesson.xp || 100} XP
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <CheckCircle2 className="text-purple-400" />

          <h4 className="mt-4 font-bold text-white">
            Completion
          </h4>

          <p className="mt-2 text-slate-400">
            {lesson.progress || 0}%
          </p>

        </div>

      </div>

      {/* Lesson Content */}

      <div className="space-y-8 p-8">

        <section>

          <div className="mb-5 flex items-center gap-3">

            <FileText className="text-cyan-400" />

            <h2 className="text-2xl font-black text-white">
              Lesson Overview
            </h2>

          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">

            <p className="whitespace-pre-wrap leading-9 text-slate-300">
              {lesson.content ||
                "No lesson content available yet."}
            </p>

          </div>

        </section>

        {/* Key Points */}

        {lesson.points?.length > 0 && (

          <section>

            <div className="mb-5 flex items-center gap-3">

              <Sparkles className="text-cyan-400" />

              <h2 className="text-2xl font-black text-white">
                Key Takeaways
              </h2>

            </div>

            <div className="grid gap-4">

              {lesson.points.map((point, index) => (

                <div
                  key={index}
                  className="flex gap-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5"
                >
                  <CheckCircle2
                    className="mt-1 text-cyan-400"
                    size={20}
                  />

                  <p className="leading-8 text-slate-300">
                    {point}
                  </p>

                </div>

              ))}

            </div>

          </section>

        )}

        {/* Tips */}

        {lesson.tips?.length > 0 && (

          <section>

            <div className="mb-5 flex items-center gap-3">

              <Lightbulb className="text-yellow-400" />

              <h2 className="text-2xl font-black text-white">
                Learning Tips
              </h2>

            </div>

            <div className="space-y-4">

              {lesson.tips.map((tip, index) => (

                <div
                  key={index}
                  className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5"
                >
                  <p className="leading-8 text-slate-300">
                    {tip}
                  </p>
                </div>

              ))}

            </div>

          </section>

        )}

      </div>

      {/* Footer */}

      <div className="flex flex-col gap-4 border-t border-white/10 bg-black/20 p-6 md:flex-row">

        <button
          onClick={() => onPlayAudio?.(lesson)}
          className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 transition hover:bg-white/10"
        >
          <Volume2 size={20} />
          Listen to Lesson
        </button>

        <button
          onClick={() => onComplete?.(lesson)}
          className="flex items-center justify-center gap-3 rounded-2xl bg-cyan-600 px-8 py-4 font-bold transition hover:bg-cyan-500"
        >
          <CheckCircle2 size={20} />
          Mark as Complete
        </button>

      </div>

    </motion.section>
  );
};

export default LessonContent;