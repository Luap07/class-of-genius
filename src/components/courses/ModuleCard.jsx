// src/components/lms/courses/ModuleCard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  PlayCircle,
  Lock,
  CheckCircle2,
  Clock3,
  Download,
} from "lucide-react";

const ModuleCard = ({
  module = {},
  onOpen = () => {},
  onDownload = () => {},
}) => {
  const {
    title = "Untitled Module",
    description = "",
    duration = "0 min",
    pages = 0,
    completed = false,
    locked = false,
    downloadable = false,
    pdfUrl = "",
  } = module;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-blue-500"
    >
      {/* Header */}

      <div className="flex items-start justify-between">

        <div className="flex gap-4">

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-blue-600/20
              flex
              items-center
              justify-center
            "
          >
            <FileText
              size={28}
              className="text-blue-400"
            />
          </div>

          <div>

            <h2 className="text-xl font-bold">
              {title}
            </h2>

            <p className="text-slate-400 mt-2">
              {description}
            </p>

          </div>

        </div>

        {completed ? (
          <CheckCircle2
            size={28}
            className="text-emerald-400"
          />
        ) : locked ? (
          <Lock
            size={26}
            className="text-red-400"
          />
        ) : (
          <PlayCircle
            size={28}
            className="text-cyan-400"
          />
        )}

      </div>

      {/* Info */}

      <div className="grid md:grid-cols-2 gap-5 mt-8">

        <div className="flex items-center gap-3">

          <Clock3
            className="text-cyan-400"
            size={18}
          />

          <span className="text-slate-300">
            {duration}
          </span>

        </div>

        <div className="flex items-center gap-3">

          <FileText
            className="text-purple-400"
            size={18}
          />

          <span className="text-slate-300">
            {pages} Pages
          </span>

        </div>

      </div>

      {/* Buttons */}

      <div className="flex flex-wrap gap-3 mt-8">

        <button
          disabled={locked}
          onClick={() => onOpen(module)}
          className={`
            flex
            items-center
            gap-2
            px-5
            py-3
            rounded-2xl
            font-semibold
            transition

            ${
              locked
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
        >
          {locked ? (
            <>
              <Lock size={18} />
              Locked
            </>
          ) : (
            <>
              <PlayCircle size={18} />
              Open PDF
            </>
          )}
        </button>

        {downloadable && pdfUrl && (
          <button
            onClick={() => onDownload(module)}
            className="
              flex
              items-center
              gap-2
              px-5
              py-3
              rounded-2xl
              bg-slate-800
              hover:bg-slate-700
              transition
            "
          >
            <Download size={18} />
            Download
          </button>
        )}

      </div>
    </motion.div>
  );
};

export default ModuleCard;