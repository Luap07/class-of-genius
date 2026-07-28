// src/components/admin/documents/EditDocumentModal.jsx

import React from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  X,
  Save,
  Loader2,
  FileText,
  AlignLeft,
  Tag,
} from "lucide-react";

export default function EditDocumentModal({
  editingDocument,
  setEditingDocument,
  categories,
  handleSaveEdit,
  saving,
}) {
  return (
    <AnimatePresence>
      {editingDocument && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-md"
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
            transition={{
              duration: 0.25,
            }}
            className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-800 px-8 py-6">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Edit Document
                </h2>

                <p className="mt-1 text-slate-400">
                  Update your document details.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingDocument(null)
                }
                className="rounded-xl bg-slate-800 p-3 transition hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}

            <div className="space-y-6 p-8">
              {/* Title */}

              <div>
                <label className="mb-2 flex items-center gap-2 font-semibold">
                  <FileText size={18} />
                  Title
                </label>

                <input
                  type="text"
                  value={
                    editingDocument.title || ""
                  }
                  onChange={(e) =>
                    setEditingDocument({
                      ...editingDocument,
                      title: e.target.value,
                    })
                  }
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none transition focus:border-cyan-500"
                />
              </div>

              {/* Description */}

              <div>
                <label className="mb-2 flex items-center gap-2 font-semibold">
                  <AlignLeft size={18} />
                  Description
                </label>

                <textarea
                  rows={5}
                  value={
                    editingDocument.description ||
                    ""
                  }
                  onChange={(e) =>
                    setEditingDocument({
                      ...editingDocument,
                      description:
                        e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none transition focus:border-cyan-500"
                />
              </div>

              {/* Category */}

              <div>
                <label className="mb-2 flex items-center gap-2 font-semibold">
                  <Tag size={18} />
                  Category
                </label>

                <select
                  value={
                    editingDocument.category_id
                  }
                  onChange={(e) =>
                    setEditingDocument({
                      ...editingDocument,
                      category_id:
                        e.target.value,
                      category:
                        categories.find(
                          (cat) =>
                            String(cat.id) ===
                            e.target.value
                        )?.name || "",
                    })
                  }
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none transition focus:border-cyan-500"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}

            <div className="flex justify-end gap-4 border-t border-slate-800 px-8 py-6">
              <button
                onClick={() =>
                  setEditingDocument(null)
                }
                className="rounded-xl border border-slate-700 px-6 py-3 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
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