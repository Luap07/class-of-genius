import React from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
} from "lucide-react";

const statusStyles = {
  Pending: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    icon: Clock3,
  },
  Submitted: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    icon: CheckCircle2,
  },
  Overdue: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    icon: AlertTriangle,
  },
};

const AssignmentCard = ({
  assignment = {},
  onOpen,
}) => {
  const {
    title = "Untitled Assignment",
    subject = "General",
    description = "No description available.",
    dueDate = "No due date",
    duration = "N/A",
    marks = 0,
    status = "Pending",
  } = assignment;

  const current =
    statusStyles[status] || statusStyles.Pending;

  const StatusIcon = current.icon;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        overflow-hidden
      "
    >
      {/* Header */}

      <div className="p-6 border-b border-slate-800 flex justify-between gap-5">

        <div>

          <p className="text-blue-400 text-sm font-semibold">
            {subject}
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {title}
          </h2>

          <p className="mt-3 text-slate-400">
            {description}
          </p>

        </div>

        <div
          className={`
            h-fit
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            ${current.bg}
            ${current.text}
          `}
        >
          <StatusIcon size={18} />
          <span>{status}</span>
        </div>

      </div>

      {/* Details */}

      <div className="p-6 grid md:grid-cols-3 gap-5">

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">

          <div className="flex items-center gap-2 text-blue-400">
            <CalendarDays size={18} />
            <span className="text-sm">
              Due Date
            </span>
          </div>

          <p className="mt-2 font-semibold">
            {dueDate}
          </p>

        </div>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">

          <div className="flex items-center gap-2 text-cyan-400">
            <Clock3 size={18} />
            <span className="text-sm">
              Duration
            </span>
          </div>

          <p className="mt-2 font-semibold">
            {duration}
          </p>

        </div>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">

          <div className="flex items-center gap-2 text-purple-400">
            <FileText size={18} />
            <span className="text-sm">
              Marks
            </span>
          </div>

          <p className="mt-2 font-semibold">
            {marks}
          </p>

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-slate-800 p-6 flex justify-end">

        <button
          onClick={() => onOpen?.(assignment)}
          className="
            flex
            items-center
            gap-2
            rounded-2xl
            bg-blue-600
            hover:bg-blue-700
            transition
            px-6
            py-3
            font-semibold
          "
        >
          Open Assignment

          <ArrowRight size={18} />
        </button>

      </div>

    </motion.div>
  );
};

export default AssignmentCard;