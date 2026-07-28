// src/components/admin/documents/DocumentsGrid.jsx

import React from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  Loader2,
  FileText,
} from "lucide-react";

import DocumentCard from "./DocumentCard";

export default function DocumentsGrid({
  loading,
  documents,
  openDocument,
  downloadDocument,
  copyLink,
  setEditingDocument,
  setDeleteDocument,
}) {
  /* ==========================================
      LOADING
  ========================================== */

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900">
        <div className="text-center">
          <Loader2
            size={50}
            className="mx-auto animate-spin text-cyan-400"
          />

          <p className="mt-5 text-slate-400">
            Loading documents...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================
      EMPTY STATE
  ========================================== */

  if (documents.length === 0) {
    return (
      <div className="flex h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900">
        <FileText
          size={70}
          className="mb-6 text-slate-700"
        />

        <h2 className="text-2xl font-black">
          No Documents Found
        </h2>

        <p className="mt-3 max-w-md text-center text-slate-400">
          Upload your first document or change
          your search and filter options.
        </p>
      </div>
    );
  }

  /* ==========================================
      GRID
  ========================================== */

  return (
    <motion.div
      layout
      className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      <AnimatePresence mode="popLayout">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            openDocument={openDocument}
            downloadDocument={downloadDocument}
            copyLink={copyLink}
            setEditingDocument={
              setEditingDocument
            }
            setDeleteDocument={
              setDeleteDocument
            }
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}