import React from "react";
import { motion } from "framer-motion";

import {
  FileText,
  PlayCircle,
  Lock,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  BookOpen,
} from "lucide-react";

const ModuleCard = ({
  module = {},
  index = 0,
  onOpen = () => {},
  onDownload = () => {},
}) => {
  const {
    title = "Untitled Module",
    description = "No description available.",
    duration = "Self Paced",
    pages = 0,
    completed = false,
    locked = false,
    downloadable = false,
    pdfUrl = "",
    file_type = "PDF",
    file_size = "",
    progress = 0,
  } = module;

  const handleOpen = () => {
    if (locked) return;
    onOpen(module);
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.35,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-[32px]
        border
        border-slate-800
        bg-slate-900/80
        p-7
        backdrop-blur-xl
        hover:border-cyan-500/40
      "
    >
      {/* BACKGROUND EFFECT */}

      <div
        className="
          absolute
          -right-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-cyan-500/10
          blur-[120px]
          transition
          duration-500
          group-hover:bg-cyan-500/20
        "
      />

      <div className="relative z-10">

        {/* TOP */}

        <div className="
          flex
          items-start
          justify-between
          gap-5
        ">

          <div className="flex gap-5">

            {/* MODULE NUMBER */}

            <div
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-cyan-500
                to-blue-600
                text-xl
                font-black
                text-white
              "
            >
              {String(index + 1).padStart(2, "0")}
            </div>

            <div>

              <div className="
                flex
                items-center
                gap-2
              ">
                <BookOpen
                  size={18}
                  className="text-cyan-400"
                />

                <span className="
                  text-sm
                  text-cyan-400
                ">
                  Module
                </span>
              </div>

              <h2 className="
                mt-2
                text-2xl
                font-black
              ">
                {title}
              </h2>

              <p className="
                mt-3
                max-w-xl
                text-sm
                leading-7
                text-slate-400
              ">
                {description}
              </p>

            </div>

          </div>

          {/* STATUS */}

          {
            completed ? (
              <CheckCircle2
                size={32}
                className="text-emerald-400"
              />
            ) : locked ? (
              <Lock
                size={32}
                className="text-red-400"
              />
            ) : (
              <PlayCircle
                size={32}
                className="text-cyan-400"
              />
            )
          }

        </div>

        {/* INFORMATION CARDS */}

        <div
          className="
            mt-8
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <InfoItem
            icon={<Clock3 size={18} />}
            label="Duration"
            value={duration}
          />

          <InfoItem
            icon={<FileText size={18} />}
            label="Pages"
            value={`${pages} Pages`}
          />

          <InfoItem
            icon={<FileText size={18} />}
            label="Format"
            value={file_type.toUpperCase()}
          />

          {
            file_size && (
              <InfoItem
                icon={<Download size={18} />}
                label="Size"
                value={file_size}
              />
            )
          }
        </div>

        {/* PROGRESS */}

        <div
          className="
            mt-8
            rounded-3xl
            border
            border-slate-800
            bg-slate-950/50
            p-5
          "
        >
          <div
            className="
              mb-3
              flex
              justify-between
              text-sm
            "
          >
            <span className="text-slate-400">
              Learning Progress
            </span>

            <span className="font-bold text-cyan-400">
              {progress}%
            </span>
          </div>

          <div
            className="
              h-3
              overflow-hidden
              rounded-full
              bg-slate-800
            "
          >
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.8,
              }}
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-cyan-500
                to-blue-600
              "
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}

        <div
          className="
            mt-8
            flex
            flex-wrap
            gap-3
          "
        >
          <button
            onClick={handleOpen}
            disabled={locked}
            className={`
              flex
              items-center
              gap-2
              rounded-2xl
              px-7
              py-3
              font-bold
              transition
              ${
                locked
                  ? "cursor-not-allowed bg-slate-800 text-slate-500"
                  : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              }
            `}
          >
            {
              locked ? (
                <>
                  <Lock size={18} />
                  Locked
                </>
              ) : (
                <>
                  <PlayCircle size={18} />
                  Continue Learning
                </>
              )
            }
          </button>

          {
            pdfUrl && (
              <button
                onClick={() =>
                  window.open(
                    pdfUrl,
                    "_blank"
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  border-slate-700
                  px-7
                  py-3
                  font-semibold
                  transition
                  hover:border-cyan-500
                  hover:text-cyan-400
                "
              >
                <ExternalLink size={18} />
                Preview PDF
              </button>
            )
          }

          {
            downloadable && pdfUrl && (
              <button
                onClick={() =>
                  onDownload(module)
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  bg-slate-800
                  px-7
                  py-3
                  font-semibold
                  transition
                  hover:bg-slate-700
                "
              >
                <Download size={18} />
                Download
              </button>
            )
          }
        </div>

      </div>
    </motion.div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
}) => (
  <div
    className="
      flex
      items-center
      gap-3
      rounded-2xl
      border
      border-slate-800
      bg-slate-900
      p-4
    "
  >
    <div className="text-cyan-400">
      {icon}
    </div>

    <div>
      <p className="
        text-xs
        text-slate-500
      ">
        {label}
      </p>

      <p className="
        mt-1
        font-bold
      ">
        {value}
      </p>
    </div>
  </div>
);

export default ModuleCard;