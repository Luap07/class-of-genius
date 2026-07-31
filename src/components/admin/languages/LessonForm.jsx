import React from "react";

import {
  X,
  Upload,
  Loader2,
} from "lucide-react";

export default function LessonForm({
  open,
  editing,

  languages,

  languageId,
  setLanguageId,

  lessonTitle,
  setLessonTitle,

  lessonDescription,
  setLessonDescription,

  lessonOrder,
  setLessonOrder,

  lessonDuration,
  setLessonDuration,

  lessonVideo,
  setLessonVideo,

  lessonThumbnail,
  setLessonThumbnail,

  loading,

  onClose,
  onSave,
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
          max-h-[95vh]
          w-full
          max-w-3xl
          overflow-y-auto
          rounded-3xl
          border
          border-white/10
          bg-[#111827]
          p-8
        "
      >
        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-black">
              {editing
                ? "Edit Lesson"
                : "Create Lesson"}
            </h2>

            <p className="mt-2 text-gray-400">
              Fill in the lesson details below.
            </p>

          </div>

          <button
            onClick={onClose}
            className="
              rounded-xl
              bg-[#1f2937]
              p-3
              transition
              hover:bg-[#374151]
            "
          >
            <X size={20} />
          </button>

        </div>

        <div className="space-y-6">

          {/* Language */}

          <div>

            <label className="mb-2 block font-semibold">
              Language
            </label>

            <select
              value={languageId}
              onChange={(e) =>
                setLanguageId(e.target.value)
              }
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-[#1f2937]
                px-4
                py-3
                text-white
                outline-none
              "
            >
              <option value="">
                Select Language
              </option>

              {languages.map((language) => (
                <option
                  key={language.id}
                  value={language.id}
                >
                  {language.name}
                </option>
              ))}
            </select>

          </div>

          {/* Lesson Title */}

          <div>

            <label className="mb-2 block font-semibold">
              Lesson Title
            </label>

            <input
              type="text"
              value={lessonTitle}
              onChange={(e) =>
                setLessonTitle(e.target.value)
              }
              placeholder="Introduction"
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-[#1f2937]
                px-4
                py-3
                text-white
                outline-none
              "
            />

          </div>
                    {/* Description */}

          <div>

            <label className="mb-2 block font-semibold">
              Description
            </label>

            <textarea
              rows={5}
              value={lessonDescription}
              onChange={(e) =>
                setLessonDescription(e.target.value)
              }
              placeholder="Describe this lesson..."
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-[#1f2937]
                px-4
                py-3
                text-white
                outline-none
                resize-none
              "
            />

          </div>

          {/* Lesson Order */}

          <div>

            <label className="mb-2 block font-semibold">
              Lesson Order
            </label>

            <input
              type="number"
              value={lessonOrder}
              onChange={(e) =>
                setLessonOrder(e.target.value)
              }
              placeholder="1"
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-[#1f2937]
                px-4
                py-3
                text-white
                outline-none
              "
            />

          </div>

          {/* Duration */}

          <div>

            <label className="mb-2 block font-semibold">
              Duration (minutes)
            </label>

            <input
              type="number"
              value={lessonDuration}
              onChange={(e) =>
                setLessonDuration(e.target.value)
              }
              placeholder="30"
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-[#1f2937]
                px-4
                py-3
                text-white
                outline-none
              "
            />

          </div>

          {/* Video */}

          <div>

            <label className="mb-2 block font-semibold">
              Video URL
            </label>

            <input
              type="text"
              value={lessonVideo}
              onChange={(e) =>
                setLessonVideo(e.target.value)
              }
              placeholder="https://..."
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-[#1f2937]
                px-4
                py-3
                text-white
                outline-none
              "
            />

          </div>

          {/* Thumbnail */}

          <div>

            <label className="mb-2 block font-semibold">
              Lesson Thumbnail
            </label>

            <label
              className="
                flex
                cursor-pointer
                items-center
                justify-center
                gap-3
                rounded-2xl
                border-2
                border-dashed
                border-white/10
                bg-[#1f2937]
                px-6
                py-8
                transition
                hover:border-indigo-500
              "
            >

              <Upload size={24} />

              <span>
                {lessonThumbnail
                  ? lessonThumbnail.name
                  : "Choose Thumbnail"}
              </span>

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setLessonThumbnail(
                    e.target.files[0]
                  )
                }
              />

            </label>

          </div>
                    {/* Footer */}

          <div className="flex justify-end gap-4 pt-6">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
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
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={loading}
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                bg-indigo-600
                px-6
                py-3
                font-bold
                transition
                hover:bg-indigo-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  {editing ? "Save Changes" : "Create Lesson"}
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}