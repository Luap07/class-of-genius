import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

const PDFViewer = ({ pdf }) => {
  if (!pdf) {
    return (
      <div
        className="
          rounded-3xl
          border
          border-dashed
          border-slate-700
          bg-slate-900
          p-12
          text-center
        "
      >
        <AlertCircle
          size={60}
          className="mx-auto text-slate-500"
        />

        <h2 className="mt-6 text-2xl font-bold">
          PDF Not Available
        </h2>

        <p className="mt-3 text-slate-400">
          The course material has not been uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="
        rounded-3xl
        overflow-hidden
        border
        border-slate-800
        bg-slate-900
      "
    >
      {/* Toolbar */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-slate-800
          px-6
          py-4
        "
      >
        <div className="flex items-center gap-3">

          <FileText
            size={24}
            className="text-red-400"
          />

          <div>

            <h3 className="font-semibold">
              Course Material
            </h3>

            <p className="text-sm text-slate-400">
              PDF Document
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <a
            href={pdf}
            download
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-slate-800
              px-4
              py-2
              hover:bg-slate-700
              transition
            "
          >
            <Download size={18} />
            Download
          </a>

          <a
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-4
              py-2
              hover:bg-blue-700
              transition
            "
          >
            <ExternalLink size={18} />
            Open
          </a>

        </div>
      </div>

      {/* PDF */}

      <iframe
        src={pdf}
        title="Course PDF"
        className="w-full h-[850px] bg-white"
      />
    </motion.div>
  );
};

export default PDFViewer;