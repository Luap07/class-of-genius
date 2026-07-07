import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  File,
  Video,
  Headphones,
  Image,
  Link as LinkIcon,
  Download,
  ExternalLink,
  Eye,
  CalendarDays,
} from "lucide-react";

const iconMap = {
  pdf: FileText,
  doc: File,
  docx: File,
  ppt: File,
  pptx: File,
  video: Video,
  audio: Headphones,
  image: Image,
  link: LinkIcon,
};

const colorMap = {
  pdf: "text-red-400 bg-red-500/10",
  doc: "text-blue-400 bg-blue-500/10",
  docx: "text-blue-400 bg-blue-500/10",
  ppt: "text-orange-400 bg-orange-500/10",
  pptx: "text-orange-400 bg-orange-500/10",
  video: "text-purple-400 bg-purple-500/10",
  audio: "text-cyan-400 bg-cyan-500/10",
  image: "text-pink-400 bg-pink-500/10",
  link: "text-emerald-400 bg-emerald-500/10",
};

const ResourceCard = ({
  resource = {},
  onOpen,
  onDownload,
}) => {
  const {
    title = "Untitled Resource",
    description = "No description available.",
    type = "pdf",
    size = "--",
    uploadDate = "Recently",
    downloads = 0,
  } = resource;

  const Icon = iconMap[type] || FileText;
  const colors = colorMap[type] || colorMap.pdf;

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

      <div className="p-6 flex items-start justify-between">

        <div className="flex gap-4">

          <div
            className={`
              w-14
              h-14
              rounded-2xl
              flex
              items-center
              justify-center
              ${colors}
            `}
          >
            <Icon size={28} />
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

      </div>

      {/* Details */}

      <div className="px-6 pb-6">

        <div className="grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">

            <p className="text-slate-500 text-sm">
              File Type
            </p>

            <p className="font-semibold uppercase mt-1">
              {type}
            </p>

          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">

            <p className="text-slate-500 text-sm">
              File Size
            </p>

            <p className="font-semibold mt-1">
              {size}
            </p>

          </div>

        </div>

        <div className="mt-5 flex justify-between text-sm text-slate-400">

          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            {uploadDate}
          </div>

          <div>
            {downloads} Downloads
          </div>

        </div>

        <div className="mt-6 flex gap-3">

          <button
            onClick={() => onOpen?.(resource)}
            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-blue-600
              hover:bg-blue-700
              transition
              py-3
              font-semibold
            "
          >
            <Eye size={18} />
            Open
          </button>

          <button
            onClick={() => onDownload?.(resource)}
            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-slate-700
              hover:bg-slate-800
              transition
              py-3
              font-semibold
            "
          >
            <Download size={18} />
            Download
          </button>

          <button
            className="
              w-14
              flex
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-700
              hover:bg-slate-800
              transition
            "
          >
            <ExternalLink size={18} />
          </button>

        </div>

      </div>

    </motion.div>
  );
};

export default ResourceCard;