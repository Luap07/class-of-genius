// src/components/admin/documents/DocumentFilters.jsx

import React from "react";

import { motion } from "framer-motion";

import {
  Search,
  RefreshCw,
  Filter,
  FolderOpen,
  FileType2,
} from "lucide-react";

export default function DocumentFilters({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  categories,
  refreshing,
  refreshDocuments,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        {/* SEARCH */}

        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search documents..."
            className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-800 pl-12 pr-5 outline-none transition focus:border-cyan-500"
          />
        </div>

        {/* CATEGORY */}

        <div className="relative min-w-[230px]">
          <FolderOpen
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
            className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-800 pl-12 pr-5 outline-none transition focus:border-cyan-500"
          >
            <option value="all">
              All Categories
            </option>

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

        {/* TYPE */}

        <div className="relative min-w-[220px]">
          <FileType2
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(
                e.target.value
              )
            }
            className="h-14 w-full appearance-none rounded-2xl border border-slate-700 bg-slate-800 pl-12 pr-5 outline-none transition focus:border-cyan-500"
          >
            <option value="all">
              All Types
            </option>

            <option value="pdf">
              PDF
            </option>

            <option value="doc">
              DOC
            </option>

            <option value="docx">
              DOCX
            </option>

            <option value="ppt">
              PPT
            </option>

            <option value="pptx">
              PPTX
            </option>

            <option value="xls">
              XLS
            </option>

            <option value="xlsx">
              XLSX
            </option>

            <option value="jpg">
              JPG
            </option>

            <option value="jpeg">
              JPEG
            </option>

            <option value="png">
              PNG
            </option>
          </select>
        </div>

        {/* REFRESH */}

        <motion.button
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={refreshDocuments}
          className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-7 font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          <RefreshCw
            size={19}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </motion.button>
      </div>

      {/* ACTIVE FILTERS */}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm">
          <Filter
            size={15}
            className="text-cyan-400"
          />
          Active Filters
        </div>

        {categoryFilter !== "all" && (
          <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
            Category Selected
          </span>
        )}

        {typeFilter !== "all" && (
          <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            {typeFilter.toUpperCase()}
          </span>
        )}
      </div>
    </motion.div>
  );
}