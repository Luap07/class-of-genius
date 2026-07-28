import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  FolderOpen,
} from "lucide-react";

const EmptyDocuments = ({ onUpload }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        flex
        min-h-[420px]
        flex-col
        items-center
        justify-center
        rounded-3xl
        border
        border-white/10
        bg-[#0b1220]
        p-10
        text-center
      "
    >
      <div
        className="
          mb-6
          flex
          h-24
          w-24
          items-center
          justify-center
          rounded-full
          bg-blue-500/10
          text-blue-400
        "
      >
        <FolderOpen size={48} />
      </div>

      <h2
        className="
          mb-3
          text-2xl
          font-bold
          text-white
        "
      >
        No Documents Found
      </h2>

      <p
        className="
          mb-8
          max-w-md
          text-sm
          leading-6
          text-gray-400
        "
      >
        You have not uploaded any learning documents yet.
        Upload PDFs, notes, assignments, or study materials
        to make them available for students.
      </p>

      <button
        onClick={onUpload}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          bg-blue-600
          px-6
          py-3
          font-semibold
          text-white
          transition
          hover:bg-blue-500
        "
      >
        <Upload size={20} />
        Upload Document
      </button>

      <div
        className="
          mt-10
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-white/10
          bg-white/5
          px-5
          py-3
          text-sm
          text-gray-400
        "
      >
        <FileText size={18} className="text-blue-400" />

        Supported files:
        <span className="text-white">
          PDF, DOCX, PPTX
        </span>
      </div>
    </motion.div>
  );
};

export default EmptyDocuments;