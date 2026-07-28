// src/components/admin/documents/DocumentCard.jsx

import React from "react";

import { motion } from "framer-motion";

import {
  Eye,
  Pencil,
  Trash2,
  Download,
  Copy,
  Calendar,
  ImageIcon,
} from "lucide-react";

import FileTypeBadge from "./FileTypeBadge";

export default function DocumentCard({
  document,
  openDocument,
  downloadDocument,
  copyLink,
  setEditingDocument,
  setDeleteDocument,
}) {
  const createdDate = document.created_at
    ? new Date(document.created_at).toLocaleDateString()
    : "Unknown";

  return (
    <motion.div
      layout
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl transition hover:border-cyan-500/40"
    >
      {/* =======================================
          THUMBNAIL
      ======================================= */}

      <div className="relative h-52 overflow-hidden bg-slate-950">

        {document.thumbnail_url ? (
          <img
            src={document.thumbnail_url}
            alt={document.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon
              size={60}
              className="text-slate-700"
            />
          </div>
        )}

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

        {/* File Badge */}

        <div className="absolute left-4 top-4">
          <FileTypeBadge
            type={document.file_type}
          />
        </div>
      </div>

      {/* =======================================
          CONTENT
      ======================================= */}

      <div className="space-y-5 p-6">

        <div>

          <h2 className="line-clamp-2 text-xl font-black text-white">
            {document.title}
          </h2>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
            {document.description ||
              "No description available."}
          </p>

        </div>

        {/* CATEGORY */}

        <div className="flex flex-wrap gap-2">

          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            {document.category ||
              "General"}
          </span>

        </div>

        {/* INFO */}

        <div className="flex items-center justify-between border-t border-slate-800 pt-4">

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar size={15} />
            {createdDate}
          </div>

          {document.file_size && (
            <span className="text-xs text-slate-500">
              {(document.file_size /
                1024 /
                1024).toFixed(2)}
              {" MB"}
            </span>
          )}

        </div>

        {/* =======================================
            ACTIONS
        ======================================= */}

        <div className="grid grid-cols-3 gap-3">

          <button
            onClick={() =>
              openDocument(document.file_url)
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Eye size={17} />
            Open
          </button>

          <button
            onClick={() =>
              setEditingDocument(document)
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-amber-300 transition hover:bg-amber-500/20"
          >
            <Pencil size={17} />
            Edit
          </button>

          <button
            onClick={() =>
              setDeleteDocument(document)
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-red-400 transition hover:bg-red-500/20"
          >
            <Trash2 size={17} />
            Delete
          </button>

        </div>

        {/* SECOND ROW */}

        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={() =>
              downloadDocument(
                document.file_url,
                document.title
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 transition hover:bg-slate-700"
          >
            <Download size={16} />
            Download
          </button>

          <button
            onClick={() =>
              copyLink(document.file_url)
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 transition hover:bg-slate-700"
          >
            <Copy size={16} />
            Copy Link
          </button>

        </div>

      </div>
    </motion.div>
  );
}