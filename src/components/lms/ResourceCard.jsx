import React from "react";
import {
  FileText,
  FileSpreadsheet,
  Image,
  Download,
  Eye,
  Calendar,
  HardDrive,
} from "lucide-react";
import { motion } from "framer-motion";

const icons = {
  pdf: <FileText size={34} />,
  doc: <FileText size={34} />,
  ppt: <FileText size={34} />,
  xls: <FileSpreadsheet size={34} />,
  image: <Image size={34} />,
};

const colors = {
  pdf: "from-red-500 to-red-700",
  doc: "from-blue-500 to-blue-700",
  ppt: "from-orange-500 to-orange-700",
  xls: "from-green-500 to-green-700",
  image: "from-purple-500 to-pink-600",
};

const ResourceCard = ({
  title,
  subject,
  type = "pdf",
  size,
  uploaded,
  description,
  onView,
  onDownload,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 hover:border-blue-500 transition"
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${
          colors[type] || colors.pdf
        } p-6 flex justify-between items-center`}
      >
        <div className="text-white">
          {icons[type] || icons.pdf}
        </div>

        <span className="uppercase bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
          {type}
        </span>
      </div>

      {/* Body */}
      <div className="p-6">

        <p className="text-blue-400 text-sm font-semibold">
          {subject}
        </p>

        <h2 className="text-2xl font-bold mt-2">
          {title}
        </h2>

        <p className="text-slate-400 mt-4">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-5 mt-6">

          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={18} />
            {uploaded}
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <HardDrive size={18} />
            {size}
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-5 flex gap-4">

        <button
          onClick={onView}
          className="flex-1 rounded-2xl bg-slate-800 hover:bg-slate-700 py-3 flex justify-center items-center gap-2 transition"
        >
          <Eye size={18} />
          Preview
        </button>

        <button
          onClick={onDownload}
          className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 py-3 flex justify-center items-center gap-2 transition"
        >
          <Download size={18} />
          Download
        </button>

      </div>
    </motion.div>
  );
};

export default ResourceCard;