import React from "react";

import {
  Trash2,
  X,
  Loader2,
} from "lucide-react";

export default function DeleteLessonModal({
  open,
  lesson,
  deleting,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        p-6
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-red-500/20
          bg-[#111827]
          p-8
        "
      >
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-red-500/20
              "
            >
              <Trash2
                size={24}
                className="text-red-500"
              />
            </div>

            <div>

              <h2 className="text-2xl font-black">
                Delete Lesson
              </h2>

              <p className="text-gray-400">
                This action cannot be undone.
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            disabled={deleting}
            className="
              rounded-xl
              bg-[#1f2937]
              p-2
              transition
              hover:bg-[#374151]
            "
          >
            <X size={18} />
          </button>

        </div>

        <div className="mt-8 rounded-2xl bg-[#1f2937] p-5">

          <p className="text-gray-300">
            Are you sure you want to delete:
          </p>

          <h3 className="mt-3 text-xl font-bold">
            {lesson?.title}
          </h3>

        </div>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onClose}
            disabled={deleting}
            className="
              rounded-2xl
              border
              border-white/10
              bg-[#1f2937]
              px-6
              py-3
              font-semibold
              transition
              hover:bg-[#374151]
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
              transition
              hover:bg-red-500
              disabled:opacity-50
            "
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

      </div>
    </div>
  );
}