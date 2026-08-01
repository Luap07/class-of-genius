import React, { useState, useEffect } from "react";
import { Save, Loader2, X } from "lucide-react";

export default function LanguageSectionEditor({
  section,
  open,
  onClose,
  onSave,
  saving = false,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (section) {
      setTitle(section.title || "");
      setContent(section.content || "");
    }
  }, [section]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">

          <div>

            <h2 className="text-2xl font-black text-white">
              Edit Section
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Update this language section.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 p-3 hover:bg-red-500"
          >
            <X className="h-5 w-5 text-white" />
          </button>

        </div>

        {/* Body */}

        <div className="space-y-6 p-8">

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Section Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-[#1f2937]
                px-4
                py-3
                text-white
              "
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Content
            </label>

            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="
                w-full
                resize-none
                rounded-2xl
                border
                border-white/10
                bg-[#1f2937]
                px-4
                py-4
                text-white
              "
            />

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-white/10 px-8 py-6">

          <button
            onClick={onClose}
            className="
              rounded-2xl
              border
              border-white/10
              px-6
              py-3
              text-gray-300
            "
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={() =>
              onSave({
                ...section,
                title,
                content,
              })
            }
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              bg-indigo-600
              px-6
              py-3
              font-bold
              text-white
            "
          >
            {saving ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Save className="h-5 w-5" />
            )}

            {saving ? "Saving..." : "Save Changes"}

          </button>

        </div>

      </div>
    </div>
  );
}