import React from "react";
import { motion } from "framer-motion";
import {
  Star,
  Users,
  Clock3,
  Globe,
  BookOpen,
  Award,
  PlayCircle,
  Heart,
  Share2,
  Brain,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const CourseHero = ({ course }) => {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="
        relative
        overflow-hidden
        rounded-[36px]
        border
        border-slate-800
        bg-gradient-to-br
        from-blue-950
        via-slate-900
        to-indigo-950
        p-10
        lg:p-14
      "
    >
      {/* Background */}

      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT */}

        <div>

          <div className="flex flex-wrap gap-3">

            <span className="rounded-full bg-blue-500/20 text-blue-300 px-4 py-2 text-sm font-semibold">
              {course.category}
            </span>

            <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-4 py-2 text-sm font-semibold flex items-center gap-2">
              <BarChart3 size={16} />

              {course.level || "Beginner"}
            </span>

            <span className="rounded-full bg-amber-500/20 text-amber-300 px-4 py-2 text-sm font-semibold flex items-center gap-2">
              <Award size={16} />

              Certificate
            </span>

          </div>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight">

            {course.title}

          </h1>

          <p className="mt-6 text-slate-300 text-lg leading-8 max-w-2xl">

            {course.description}

          </p>

          <div className="mt-8 flex flex-wrap gap-8">

            <div className="flex items-center gap-2">

              <Star
                className="text-yellow-400 fill-yellow-400"
                size={18}
              />

              <span className="font-semibold">

                {course.rating || "4.9"}

              </span>

            </div>

            <div className="flex items-center gap-2">

              <Users
                className="text-cyan-400"
                size={18}
              />

              <span>

                {course.students || "12,500"} Students

              </span>

            </div>

            <div className="flex items-center gap-2">

              <Clock3
                className="text-blue-400"
                size={18}
              />

              <span>

                {course.duration || "18 Hours"}

              </span>

            </div>

            <div className="flex items-center gap-2">

              <Globe
                className="text-green-400"
                size={18}
              />

              <span>

                {course.language || "English"}

              </span>

            </div>

          </div>
                    {/* =========================
              Action Buttons
          ========================= */}

          <div className="mt-10 flex flex-wrap gap-4">

            <button
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                bg-blue-600
                hover:bg-blue-700
                transition
                px-8
                py-4
                font-bold
              "
            >
              <BookOpen size={20} />

              Enroll Now

            </button>

            <button
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-700
                hover:bg-slate-800
                transition
                px-8
                py-4
                font-semibold
              "
            >
              <PlayCircle size={20} />

              Preview Course

            </button>

            <button
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-violet-600
                bg-violet-600/10
                hover:bg-violet-600/20
                transition
                px-8
                py-4
                font-semibold
              "
            >
              <Brain size={20} />

              Learn with AI

            </button>

          </div>

          <div className="mt-8 flex gap-5">

            <button
              className="
                h-14
                w-14
                rounded-2xl
                border
                border-slate-700
                hover:bg-slate-800
                transition
                flex
                items-center
                justify-center
              "
            >
              <Heart size={22} />
            </button>

            <button
              className="
                h-14
                w-14
                rounded-2xl
                border
                border-slate-700
                hover:bg-slate-800
                transition
                flex
                items-center
                justify-center
              "
            >
              <Share2 size={22} />
            </button>

          </div>

        </div>

        {/* =========================
            RIGHT PANEL
        ========================= */}

        <div>

          <motion.div
            whileHover={{
              y: -6,
            }}
            className="
              rounded-[32px]
              border
              border-slate-800
              bg-slate-900/80
              backdrop-blur-xl
              p-8
            "
          >

            <h2 className="text-2xl font-bold">

              Course Snapshot

            </h2>

            <div className="mt-8 space-y-5">

              <div className="flex items-center justify-between">

                <span className="text-slate-400">

                  Modules

                </span>

                <strong>

                  {course.modules?.length || 12}

                </strong>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-slate-400">

                  Lessons

                </span>

                <strong>

                  {course.lessons || 86}

                </strong>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-slate-400">

                  Quizzes

                </span>

                <strong>

                  {course.quizzes || 18}

                </strong>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-slate-400">

                  WeeklyTasks

                </span>

                <strong>

                  {course.weeklytasks || 12}

                </strong>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-slate-400">

                  Resources

                </span>

                <strong>

                  {course.resources || 42}

                </strong>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-slate-400">

                  Certificate

                </span>

                <strong className="text-emerald-400">

                  Included

                </strong>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-slate-400">

                  Lifetime Access

                </span>

                <CheckCircle2
                  className="text-emerald-400"
                  size={20}
                />

              </div>

            </div>
                        {/* Progress */}

            <div className="mt-10">

              <div className="flex items-center justify-between mb-3">

                <span className="text-slate-400">
                  Estimated Completion
                </span>

                <span className="font-semibold">
                  0%
                </span>

              </div>

              <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

                <div
                  className="
                    h-full
                    w-0
                    rounded-full
                    bg-gradient-to-r
                    from-blue-500
                    to-cyan-500
                  "
                />

              </div>

            </div>

            {/* CTA */}

            <div className="mt-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6">

              <h3 className="text-xl font-bold">

                Ready to start learning?

              </h3>

              <p className="mt-3 text-blue-100 leading-7">

                Join thousands of learners studying this course on
                Wonder. Learn at your own pace with lifetime access,
                quizzes, projects and an AI tutor.

              </p>

              <button
                className="
                  mt-6
                  w-full
                  rounded-2xl
                  bg-white
                  text-slate-900
                  py-4
                  font-bold
                  hover:scale-[1.02]
                  transition
                "
              >
                Start Learning Today
              </button>

            </div>

          </motion.div>

        </div>

      </div>

    </motion.section>
  );
};

export default CourseHero;