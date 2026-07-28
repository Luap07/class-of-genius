// src/components/admin/documents/FileTypeBadge.jsx

import React from "react";

import {
  FileText,
  FileSpreadsheet,
  Presentation,
  ImageIcon,
  FileArchive,
  FileCode,
  File,
} from "lucide-react";

export default function FileTypeBadge({ type }) {
  const fileType = (type || "").toLowerCase();

  let config = {
    label: "FILE",
    icon: File,
    className:
      "bg-slate-700/30 text-slate-300 border-slate-600/40",
  };

  switch (fileType) {
    case "pdf":
      config = {
        label: "PDF",
        icon: FileText,
        className:
          "bg-red-500/10 text-red-400 border-red-500/30",
      };
      break;

    case "doc":
    case "docx":
      config = {
        label: "WORD",
        icon: FileText,
        className:
          "bg-blue-500/10 text-blue-400 border-blue-500/30",
      };
      break;

    case "ppt":
    case "pptx":
      config = {
        label: "POWERPOINT",
        icon: Presentation,
        className:
          "bg-orange-500/10 text-orange-400 border-orange-500/30",
      };
      break;

    case "xls":
    case "xlsx":
      config = {
        label: "EXCEL",
        icon: FileSpreadsheet,
        className:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      };
      break;

    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
      config = {
        label: "IMAGE",
        icon: ImageIcon,
        className:
          "bg-pink-500/10 text-pink-400 border-pink-500/30",
      };
      break;

    case "zip":
    case "rar":
    case "7z":
      config = {
        label: "ARCHIVE",
        icon: FileArchive,
        className:
          "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      };
      break;

    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "html":
    case "css":
    case "json":
      config = {
        label: "CODE",
        icon: FileCode,
        className:
          "bg-violet-500/10 text-violet-400 border-violet-500/30",
      };
      break;

    default:
      break;
  }

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}