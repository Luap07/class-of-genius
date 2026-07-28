// src/components/admin/documents/DeleteDocumentModal.jsx

import React from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  Trash2,
  X,
  Loader2,
} from "lucide-react";

export default function DeleteDocumentModal({
  deleteDocument,
  setDeleteDocument,
  handleDelete,
  deleting,
}) {
  return (
    <AnimatePresence>
      {deleteDocument && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-800 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-red-500/10 p-3">
                  <Trash2
                    size={26}
                    className="text-red-400"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Delete Document
                  </h2>

                  <p className="text-slate-400">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setDeleteDocument(null)
                }
                className="rounded-xl bg-slate-800 p-2 hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}

            <div className="px-8 py-7">

              <p className="text-slate-300">
                Are you sure you want to permanently
                delete
              </p>

              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">

                <p className="text-lg font-bold text-red-300">
                  {deleteDocument.title}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {deleteDocument.category ||
                    "General"}
                </p>

              </div>

            </div>

            {/* Footer */}

            <div className="flex justify-end gap-4 border-t border-slate-800 px-8 py-6">

              <button
                onClick={() =>
                  setDeleteDocument(null)
                }
                className="rounded-xl border border-slate-700 px-6 py-3 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  handleDelete(deleteDocument)
                }
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition hover:bg-red-400 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}