import React from "react";

import { motion } from "framer-motion";

import {
  Languages,
  Globe,
  BookOpen,
  Pencil,
  Trash2,
  Upload,
  CheckCircle2,
  XCircle,
  ImageOff,
} from "lucide-react";

export default function LanguageCard({
  language,

  onEdit,

  onDelete,

  onUpload,
}) {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-[#111827]
        shadow-2xl
      "
    >
      {/* Cover */}

      <div className="relative h-44 overflow-hidden bg-slate-900">
        {language.cover_url ? (
          <img
            src={language.cover_url}
            alt={language.name}
            className="
              h-full
              w-full
              object-cover
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
            "
          >
            <ImageOff className="h-12 w-12 text-gray-600" />
          </div>
        )}

        <div className="absolute left-5 bottom-5">
          {language.flag_url ? (
            <img
              src={language.flag_url}
              alt={language.name}
              className="
                h-16
                w-16
                rounded-full
                border-4
                border-[#111827]
                object-cover
                shadow-xl
              "
            />
          ) : (
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                border-4
                border-[#111827]
                bg-slate-800
              "
            >
              <Languages className="h-8 w-8 text-indigo-400" />
            </div>
          )}
        </div>

        <div className="absolute right-5 top-5">
          {language.active ? (
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-emerald-500/20
                px-3
                py-1
                text-xs
                font-semibold
                text-emerald-300
              "
            >
              <CheckCircle2 className="h-4 w-4" />
              Active
            </span>
          ) : (
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-red-500/20
                px-3
                py-1
                text-xs
                font-semibold
                text-red-300
              "
            >
              <XCircle className="h-4 w-4" />
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Body */}

      <div className="p-6">
        <h2 className="text-2xl font-black text-white">
          {language.name}
        </h2>

        <p className="mt-1 text-indigo-300">
          {language.native_name || "Native name unavailable"}
        </p>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 text-gray-300">
            <Languages className="h-5 w-5 text-indigo-400" />

            <span>
              Code:{" "}
              <strong>
                {language.code || "--"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-gray-300">
            <Globe className="h-5 w-5 text-cyan-400" />

            <span>
              {language.region || "Unknown Region"}
            </span>
          </div>

          <div className="flex items-start gap-3 text-gray-300">
            <BookOpen className="mt-1 h-5 w-5 text-yellow-400" />

            <p className="line-clamp-3">
              {language.description ||
                "No description available."}
            </p>
          </div>
        </div>

        {/* Actions */}

        <div className="mt-8 grid grid-cols-3 gap-3">
          <button
            onClick={() => onEdit(language)}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-indigo-600
              px-4
              py-3
              font-semibold
              text-white
              transition
              hover:bg-indigo-500
            "
          >
            <Pencil className="h-5 w-5" />

            Edit
          </button>

          <button
            onClick={() => onUpload(language)}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-cyan-600
              px-4
              py-3
              font-semibold
              text-white
              transition
              hover:bg-cyan-500
            "
          >
            <Upload className="h-5 w-5" />

            Upload
          </button>

          <button
            onClick={() => onDelete(language)}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-red-600
              px-4
              py-3
              font-semibold
              text-white
              transition
              hover:bg-red-500
            "
          >
            <Trash2 className="h-5 w-5" />

            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}