// src/components/admin/documents/UploadDocumentCard.jsx

import React from "react";

import { motion } from "framer-motion";

import {
  Upload,
  FileText,
  FolderOpen,
  Tag,
  AlignLeft,
  Loader2,
  ImageIcon,
} from "lucide-react";

export default function UploadDocumentCard({
  title,
  setTitle,
  description,
  setDescription,
  selectedCategory,
  setSelectedCategory,
  categories,
  loadingCategories,
  file,
  setFile,
  thumbnail,
  setThumbnail,
  thumbnailPreview,
  uploading,
  handleUpload,
}) {
  return (
    <motion.form
      onSubmit={handleUpload}
      initial={{
        opacity: 0,
        x: -25,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      className="rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-2xl"
    >
      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">
            Upload Document
          </h2>

          <p className="mt-1 text-slate-400">
            Add PDFs, Word, Excel,
            PowerPoint and more.
          </p>
        </div>

        <div className="rounded-2xl bg-cyan-500/10 p-4">
          <Upload
            size={28}
            className="text-cyan-400"
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* TITLE */}

        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <FileText size={18} />
            Document Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Physics Chapter 1..."
            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none transition focus:border-cyan-500"
          />
        </div>

        {/* DESCRIPTION */}

        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <AlignLeft size={18} />
            Description
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Short description..."
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none transition focus:border-cyan-500"
          />
        </div>

        {/* CATEGORY */}

        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold">
            <Tag size={18} />
            Category
          </label>

          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value
              )
            }
            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none"
          >
            {loadingCategories ? (
              <option>
                Loading...
              </option>
            ) : (
              categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* DOCUMENT */}

        <div>
          <label className="mb-3 flex items-center gap-2 font-semibold">
            <FolderOpen size={18} />
            Document
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/60 p-10 transition hover:border-cyan-500">
            <Upload
              size={40}
              className="mb-4 text-cyan-400"
            />

            <p className="font-semibold">
              Click to choose file
            </p>

            <span className="mt-2 text-sm text-slate-500">
              PDF, DOCX, XLSX,
              PPTX...
            </span>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              className="hidden"
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] ||
                    null
                )
              }
            />
          </label>

          {file && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4"
            >
              <p className="font-semibold">
                {file.name}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {(
                  file.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>
            </motion.div>
          )}
        </div>

        {/* THUMBNAIL */}

        <div>
          <label className="mb-3 flex items-center gap-2 font-semibold">
            <ImageIcon size={18} />
            Thumbnail
            (Optional)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setThumbnail(
                e.target.files?.[0] ||
                  null
              )
            }
            className="block w-full text-sm text-slate-400
            file:mr-4
            file:rounded-xl
            file:border-0
            file:bg-slate-800
            file:px-5
            file:py-3
            file:font-semibold
            file:text-cyan-400
            hover:file:bg-slate-700"
          />

          {thumbnailPreview && (
            <motion.img
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              src={thumbnailPreview}
              alt="Preview"
              className="mt-5 h-56 w-full rounded-2xl border border-slate-700 object-cover"
            />
          )}
        </div>

        {/* BUTTON */}

        <motion.button
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
          type="submit"
          disabled={uploading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2
                size={20}
                className="animate-spin"
              />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload Document
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}