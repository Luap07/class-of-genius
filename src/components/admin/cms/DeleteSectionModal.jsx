import React from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

export default function DeleteSectionModal({
  open,
  section,
  deleting,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="
          fixed
          inset-0
          z-[999]
          flex
          items-center
          justify-center
          bg-black/70
          backdrop-blur-md
          p-6
        "
      >
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
          }}
          className="
            w-full
            max-w-lg
            rounded-3xl
            border
            border-red-500/20
            bg-[#0f172a]
            shadow-2xl
          "
        >
          <div className="flex items-center justify-between border-b border-slate-800 p-6">

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-500/20
                "
              >
                <AlertTriangle
                  size={30}
                  className="text-red-400"
                />
              </div>

              <div>

                <h2 className="text-2xl font-black text-white">
                  Delete Section
                </h2>

                <p className="text-sm text-slate-400">
                  This action cannot be undone.
                </p>

              </div>

            </div>

            <button
              onClick={onClose}
              className="
                rounded-xl
                bg-slate-800
                p-2
                transition
                hover:bg-red-500
              "
            >
              <X
                size={18}
                className="text-white"
              />
            </button>

          </div>

          <div className="space-y-6 p-6">
                        <div
              className="
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10
                p-5
              "
            >
              <p className="text-base text-slate-300">
                You are about to permanently delete this section:
              </p>

              <h3 className="mt-3 text-xl font-black text-white">
                {section?.title || "Untitled Section"}
              </h3>

              <p className="mt-2 text-sm uppercase tracking-wide text-red-300">
                {section?.section_type || section?.section}
              </p>
            </div>

            <div className="flex justify-end gap-4">

              <button
                onClick={onClose}
                disabled={deleting}
                className="
                  rounded-2xl
                  bg-slate-800
                  px-6
                  py-3
                  font-bold
                  text-white
                  transition
                  hover:bg-slate-700
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={deleting}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  bg-red-600
                  px-6
                  py-3
                  font-bold
                  text-white
                  transition
                  hover:bg-red-500
                  disabled:opacity-50
                "
              >
                {deleting ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={18} />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete Section"}
              </button>

            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}