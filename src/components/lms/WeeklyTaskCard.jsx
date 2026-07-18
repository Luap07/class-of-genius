import React from "react";

import { motion } from "framer-motion";

import {
  CalendarDays,
  BookOpen,
  FolderOpen,
  Clock3,
  ClipboardCheck,
  Circle,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const TaskCard = ({
  task,
  onOpen,
}) => {

  const {

    title,

    description,

    status,

    due_date,

    week,

    month,

    task_type,

    course_topics,

    courses,

  } = task;

  const completed =
    status === "completed" ||
    status === "submitted" ||
    status === "graded";

  const badgeColor = () => {

    switch (status) {

      case "completed":

      case "graded":

        return "bg-green-500/10 text-green-400";

      case "submitted":

        return "bg-blue-500/10 text-blue-400";

      case "overdue":

        return "bg-red-500/10 text-red-400";

      default:

        return "bg-yellow-500/10 text-yellow-400";

    }

  };

  const formatDate = (date) => {

    if (!date) return "No due date";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  };

  return (

    <motion.div

      whileHover={{
        y: -6,
      }}

      transition={{
        duration: 0.25,
      }}

      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        overflow-hidden
      "

    >

      {/* HEADER */}

      <div className="border-b border-slate-800 p-6">

        <div className="flex items-start justify-between gap-5">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <span
                className="
                  rounded-xl
                  bg-blue-500/10
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-blue-400
                "
              >
                {task_type === "monthly"
                  ? "Monthly Task"
                  : "Weekly Task"}
              </span>

              <span
                className={`
                  rounded-xl
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  ${badgeColor()}
                `}
              >
                {status || "Pending"}
              </span>

            </div>

            <h2 className="mt-4 text-2xl font-bold text-white">

              {title}

            </h2>

            <p className="mt-3 text-slate-400 leading-relaxed">

              {description || "No description available."}

            </p>

          </div>

          <div>

            {

              completed

              ?

              <CheckCircle2
                size={34}
                className="text-green-400"
              />

              :

              <Circle
                size={34}
                className="text-slate-500"
              />

            }

          </div>

        </div>

      </div>

      {/* DETAILS */}

      <div className="grid gap-4 p-6 md:grid-cols-2">

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">

          <div className="flex items-center gap-2 text-slate-500">

            <BookOpen size={16} />

            Course

          </div>

          <p className="mt-2 font-semibold text-white">

            {courses?.title || "General"}

          </p>

        </div>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">

          <div className="flex items-center gap-2 text-slate-500">

            <FolderOpen size={16} />

            Topic

          </div>

          <p className="mt-2 font-semibold text-white">

            {course_topics?.title || "No Topic"}

          </p>

        </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

          <div className="flex items-center gap-2 text-slate-500">

            <CalendarDays size={16} />

            Due Date

          </div>

          <p className="mt-2 font-semibold text-white">

            {formatDate(due_date)}

          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

          <div className="flex items-center gap-2 text-slate-500">

            <Clock3 size={16} />

            Schedule

          </div>

          <p className="mt-2 font-semibold text-white">

            {task_type === "monthly"
              ? `Month ${month || "-"}`
              : `Week ${week || "-"}`}

          </p>

        </div>

      </div>

      {/* FOOTER */}

      <div className="border-t border-slate-800 p-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">

            <AlertCircle
              size={18}
              className="text-amber-400"
            />

            <p className="text-sm text-slate-400">

              Complete this task before the due date to keep your learning streak active.

            </p>

          </div>

          <button

            onClick={() => onOpen?.(task)}

            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:scale-[1.02]
            "

          >

            <ClipboardCheck size={18} />

            Open Task

            <ArrowRight size={18} />

          </button>

        </div>

      </div>

    </motion.div>

  );

};

export default TaskCard;