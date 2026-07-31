import React from "react";

import { motion } from "framer-motion";

import {
  BookOpen,
  Clock,
  Globe,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";

export default function LessonCard({
  lesson,
  onEdit,
  onDelete,
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
      }}
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        transition
      "
    >
      {/* Thumbnail */}

      <div className="relative h-52 w-full overflow-hidden">
        {lesson.thumbnail_url ? (
          <img
            src={lesson.thumbnail_url}
            alt={lesson.title}
            className="
              h-full
              w-full
              object-cover
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              items-center
              justify-center
              bg-slate-800
            "
          >
            <BookOpen
              size={56}
              className="text-cyan-500"
            />
          </div>
        )}

        <div className="absolute right-4 top-4">
          {lesson.published ? (
            <span
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-emerald-600
                px-3
                py-1
                text-xs
                font-bold
                text-white
              "
            >
              <CheckCircle2 size={14} />
              Published
            </span>
          ) : (
            <span
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-amber-500
                px-3
                py-1
                text-xs
                font-bold
                text-black
              "
            >
              <Circle size={12} />
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Body */}

      <div className="space-y-5 p-6">
        <div>
          <h3
            className="
              text-2xl
              font-black
              text-white
            "
          >
            {lesson.title}
          </h3>

          <p
            className="
              mt-3
              line-clamp-3
              text-sm
              leading-7
              text-slate-400
            "
          >
            {lesson.description}
          </p>
        </div>

        {/* Info */}

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-slate-300">
            <Globe
              size={18}
              className="text-cyan-400"
            />

            <span>
              {lesson.languages?.name || "No Language"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <Clock
              size={18}
              className="text-blue-400"
            />

            <span>
              {lesson.duration || "0 min"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <BookOpen
              size={18}
              className="text-violet-400"
            />

            <span>
              Lesson {lesson.lesson_order}
            </span>
          </div>
        </div>

        {/* Footer */}

        <div
          className="
            flex
            gap-3
            pt-4
          "
        >
          <button
            onClick={() => onEdit(lesson)}
            className="
              flex-1
              rounded-2xl
              bg-cyan-600
              px-4
              py-3
              font-bold
              text-white
              transition
              hover:bg-cyan-500
            "
          >
            <span className="flex items-center justify-center gap-2">
              <Pencil size={18} />
              Edit
            </span>
          </button>

          <button
            onClick={() => onDelete(lesson)}
            className="
              flex-1
              rounded-2xl
              bg-red-600
              px-4
              py-3
              font-bold
              text-white
              transition
              hover:bg-red-500
            "
          >
            <span className="flex items-center justify-center gap-2">
              <Trash2 size={18} />
              Delete
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}