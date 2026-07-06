import React from "react";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const AssignmentCard = ({
  title,
  subject,
  description,
  dueDate,
  duration,
  marks,
  status = "Pending", // Pending | Submitted | Overdue
  onOpen,
}) => {
  const statusStyles = {
    Pending: {
      bg: "bg-amber-500/20",
      text: "text-amber-400",
      icon: <Clock3 size={18} />,
    },
    Submitted: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      icon: <CheckCircle2 size={18} />,
    },
    Overdue: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      icon: <AlertTriangle size={18} />,
    },
  };

  const current = statusStyles[status];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-blue-500 transition"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-start justify-between">

        <div>

          <p className="text-blue-400 text-sm font-semibold">
            {subject}
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {title}
          </h2>

          <p className="text-slate-400 mt-3">
            {description}
          </p>

        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${current.bg} ${current.text}`}
        >
          {current.icon}
          {status}
        </div>

      </div>

      {/* Details */}
      <div className="p-6 grid md:grid-cols-3 gap-6">

        <div className="flex items-center gap-3">
          <CalendarDays className="text-blue-400" />
          <div>
            <p className="text-slate-500 text-sm">
              Due Date
            </p>
            <p>{dueDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock3 className="text-cyan-400" />
          <div>
            <p className="text-slate-500 text-sm">
              Duration
            </p>
            <p>{duration}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FileText className="text-purple-400" />
          <div>
            <p className="text-slate-500 text-sm">
              Marks
            </p>
            <p>{marks}</p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-6 flex justify-end">

        <button
          onClick={onOpen}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-2xl font-semibold"
        >
          Open Assignment

          <ArrowRight size={18} />
        </button>

      </div>
    </motion.div>
  );
};

export default AssignmentCard;