import React, { useRef } from "react";

import {
  Upload,
  Image,
  FileText,
  Type,
  AlignLeft,
  Hash,
} from "lucide-react";

export default function LanguageSectionForm({
  sectionName,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  description,
  setDescription,
  content,
  setContent,
  thumbnail,
  setThumbnail,
  sortOrder,
  setSortOrder,
}) {
  const fileInputRef = useRef(null);

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setThumbnail(file);
  };

  return (
    <div className="space-y-6">

      {/* Thumbnail */}

      <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6">

        <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-white">
          <Image size={20} />
          Section Thumbnail
        </h3>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="
            flex
            cursor-pointer
            flex-col
            items-center
            justify-center
            rounded-2xl
            border-2
            border-dashed
            border-slate-700
            py-12
            transition
            hover:border-indigo-500
            hover:bg-indigo-500/5
          "
        >
          <Upload className="mb-4 text-indigo-400" size={38} />

          <p className="font-semibold text-white">
            Click to upload thumbnail
          </p>

          <p className="mt-2 text-sm text-slate-400">
            PNG • JPG • WEBP
          </p>

          {thumbnail && (
            <div className="mt-4 rounded-xl bg-indigo-500/20 px-4 py-2 text-sm text-indigo-300">
              {thumbnail.name}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={handleThumbnail}
        />

      </div>

      {/* Basic Info */}

      <div className="grid gap-6 lg:grid-cols-2">
              {/* Title */}

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Type size={16} />
          Section Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Enter ${sectionName} title`}
          className="
            w-full
            rounded-2xl
            border
            border-slate-700
            bg-[#020617]
            px-4
            py-3
            text-white
            outline-none
            transition
            focus:border-indigo-500
          "
        />
      </div>

      {/* Subtitle */}

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <FileText size={16} />
          Subtitle
        </label>

        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Enter subtitle"
          className="
            w-full
            rounded-2xl
            border
            border-slate-700
            bg-[#020617]
            px-4
            py-3
            text-white
            outline-none
            transition
            focus:border-indigo-500
          "
        />
      </div>

      </div>

      {/* Description */}

      <div className="space-y-2">

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <AlignLeft size={16} />
          Description
        </label>

        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description..."
          className="
            w-full
            rounded-2xl
            border
            border-slate-700
            bg-[#020617]
            px-4
            py-3
            text-white
            outline-none
            transition
            resize-none
            focus:border-indigo-500
          "
        />
      </div>

      {/* Content */}

      <div className="space-y-2">

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <FileText size={16} />
          Full Content
        </label>

        <textarea
          rows={14}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write the complete content for this section..."
          className="
            w-full
            rounded-2xl
            border
            border-slate-700
            bg-[#020617]
            px-4
            py-4
            text-white
            outline-none
            resize-y
            transition
            focus:border-indigo-500
          "
        />
      </div>

      {/* Sort Order */}

      <div className="space-y-2">

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Hash size={16} />
          Sort Order
        </label>

        <input
          type="number"
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(Number(e.target.value))
          }
          className="
            w-40
            rounded-2xl
            border
            border-slate-700
            bg-[#020617]
            px-4
            py-3
            text-white
            outline-none
            transition
            focus:border-indigo-500
          "
        />

      </div>
            {/* Footer */}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800">

        <div>
          <h4 className="text-lg font-bold text-white">
            {sectionName}
          </h4>

          <p className="text-sm text-slate-400">
            Everything entered here will be displayed in the selected section
            on the frontend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="
              rounded-2xl
              bg-indigo-600
              px-8
              py-3
              font-bold
              text-white
              transition
              hover:bg-indigo-500
            "
          >
            Save Section
          </button>
        </div>

      </div>

    </div>
  );
}