import React from "react";

import { motion } from "framer-motion";

import {
  FileText,
  File,
  Video,
  PlayCircle,
  Download,
  Eye,
  CalendarDays,
  FolderOpen,
} from "lucide-react";

const ResourceCard = ({
  resource,
  onOpen,
  onDownload,
}) => {

  const {

    title,

    description,

    resource_type,

    file_url,

    youtube_url,

    created_at,

    course_topics,

  } = resource;

  /* ==========================================
      ICON
  ========================================== */

  const getIcon = () => {

    switch (resource_type) {

      case "pdf":

        return (
          <FileText
            size={28}
            className="text-red-400"
          />
        );

      case "doc":

      case "docx":

        return (
          <File
            size={28}
            className="text-blue-400"
          />
        );

      case "video":

        return (
          <Video
            size={28}
            className="text-purple-400"
          />
        );

      case "youtube":

        return (
          <PlayCircle
            size={28}
            className="text-red-400"
          />
        );

      default:

        return (
          <FolderOpen
            size={28}
            className="text-slate-400"
          />
        );

    }

  };

  /* ==========================================
      COLOR
  ========================================== */

  const getColor = () => {

    switch (resource_type) {

      case "pdf":

        return "bg-red-500/10";

      case "doc":

      case "docx":

        return "bg-blue-500/10";

      case "video":

        return "bg-purple-500/10";

      case "youtube":

        return "bg-red-500/10";

      default:

        return "bg-slate-800";

    }

  };

  const formatDate = (date) => {

    if (!date) return "-";

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
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
      "

    >

      {/* HEADER */}

      <div className="p-6">

        <div className="flex gap-4">

          <div
            className={`
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              ${getColor()}
            `}
          >

            {getIcon()}

          </div>

          <div className="flex-1">

            <h2 className="line-clamp-2 text-xl font-bold text-white">

              {title}

            </h2>

            <p className="mt-2 line-clamp-3 text-sm text-slate-400">

              {description || "No description provided."}

            </p>

          </div>

        </div>

        {/* TOPIC */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-xs uppercase tracking-wider text-slate-500">

            Topic

          </p>

          <p className="mt-2 font-semibold text-white">

            {course_topics?.title || "General Resource"}

          </p>

        </div>

        {/* INFO */}

        <div className="mt-5 grid grid-cols-2 gap-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

            <p className="text-xs uppercase text-slate-500">

              Type

            </p>

            <p className="mt-2 font-semibold uppercase text-white">

              {resource_type}

            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

            <p className="text-xs uppercase text-slate-500">

              Added

            </p>

            <div className="mt-2 flex items-center gap-2 text-white">

              <CalendarDays size={15} />

              {formatDate(created_at)}

            </div>

          </div>

        </div>
                {/* ACTIONS */}

        <div className="mt-6 flex gap-3">

          <button

            onClick={() => onOpen?.(resource)}

            className="
              flex
              flex-1
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-blue-600
              py-3
              font-semibold
              text-white
              transition
              hover:bg-blue-500
            "

          >

            <Eye size={18} />

            {resource_type === "youtube"
              ? "Watch"
              : resource_type === "video"
              ? "Play"
              : "Open"}

          </button>

          {

            resource_type !== "youtube" && (

              <button

                onClick={() => onDownload?.(resource)}

                disabled={!file_url}

                className={`
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-slate-700
                  py-3
                  font-semibold
                  transition

                  ${
                    file_url
                      ? "hover:bg-slate-800"
                      : "cursor-not-allowed opacity-50"
                  }
                `}

              >

                <Download size={18} />

                Download

              </button>

            )

          }

        </div>

        {/* FILE / LINK */}

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-xs uppercase tracking-wider text-slate-500">

            Source

          </p>

          <p className="mt-2 truncate text-sm text-blue-400">

            {resource_type === "youtube"
              ? youtube_url || "No YouTube URL"
              : file_url || "No file available"}

          </p>

        </div>

      </div>

    </motion.div>

  );

};

export default ResourceCard;