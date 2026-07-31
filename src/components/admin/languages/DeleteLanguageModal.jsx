import React from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  Languages,
} from "lucide-react";

export default function DeleteLanguageModal({
  open = false,
  language = null,
  deleting = false,
  onClose,
  onConfirm,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            fixed
            inset-0
            z-[120]
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
              opacity: 0,
              scale: 0.9,
              y: 25,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 25,
            }}
            className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-3xl
              border
              border-red-500/20
              bg-[#111827]
              shadow-2xl
            "
          >
            {/* Header */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-white/10
                px-8
                py-6
              "
            >
              <div className="flex items-center gap-4">
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
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">
                    Delete Language
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={deleting}
                className="
                  rounded-xl
                  bg-white/10
                  p-3
                  transition
                  hover:bg-red-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Body */}

            <div className="px-8 py-8">
              <div
                className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#1f2937]
                  p-5
                "
              >
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-indigo-500/20
                  "
                >
                  <Languages className="h-6 w-6 text-indigo-400" />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    {language?.name || "Unknown Language"}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {language?.native_name || "No native name"}
                  </p>
                </div>
              </div>

              <p className="mt-6 leading-7 text-gray-300">
                Deleting this language may also affect related lessons,
                vocabulary, grammar, listening exercises, flashcards,
                phrasebooks, and uploaded learning materials associated with it.
              </p>
            </div>

            {/* Footer */}

            <div
              className="
                flex
                justify-end
                gap-4
                border-t
                border-white/10
                px-8
                py-6
              "
            >
              <button
                onClick={onClose}
                disabled={deleting}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  px-6
                  py-3
                  font-semibold
                  text-gray-300
                  transition
                  hover:bg-white/10
                  disabled:cursor-not-allowed
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
                  px-7
                  py-3
                  font-bold
                  text-white
                  transition
                  hover:bg-red-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" />
                    Delete Language
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