import React from "react";
import { motion } from "framer-motion";

import {
  Search,
  Filter,
  RotateCcw,
  Globe,
  CheckCircle2,
} from "lucide-react";

export default function LanguageFilters({
  search,
  setSearch,

  statusFilter,
  setStatusFilter,

  regionFilter,
  setRegionFilter,

  regions = [],

  onReset,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        mb-8
        rounded-3xl
        border
        border-white/10
        bg-[#111827]
        p-6
        shadow-2xl
      "
    >
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-6 h-6 text-indigo-400" />

        <h2
          className="
          text-xl
          font-bold
          text-white
        "
        >
          Filters
        </h2>
      </div>

      <div
        className="
        grid
        gap-5
        lg:grid-cols-4
      "
      >
        {/* Search */}

        <div className="relative">
          <Search
            className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-400
            w-5
            h-5
          "
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search language..."
            className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-[#1f2937]
              py-3
              pl-12
              pr-4
              text-white
              placeholder:text-gray-500
              outline-none
              transition
              focus:border-indigo-500
              focus:ring-2
              focus:ring-indigo-500/30
            "
          />
        </div>

        {/* Region */}

        <div className="relative">
          <Globe
            className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-400
            w-5
            h-5
          "
          />

          <select
            value={regionFilter}
            onChange={(e) =>
              setRegionFilter(e.target.value)
            }
            className="
              w-full
              appearance-none
              rounded-2xl
              border
              border-white/10
              bg-[#1f2937]
              py-3
              pl-12
              pr-4
              text-white
              outline-none
              transition
              focus:border-cyan-500
              focus:ring-2
              focus:ring-cyan-500/30
            "
          >
            {regions.map((region) => (
              <option
                key={region}
                value={region}
              >
                {region === "all"
                  ? "All Regions"
                  : region}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}

        <div className="relative">
          <CheckCircle2
            className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-400
            w-5
            h-5
          "
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="
              w-full
              appearance-none
              rounded-2xl
              border
              border-white/10
              bg-[#1f2937]
              py-3
              pl-12
              pr-4
              text-white
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-500/30
            "
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>

        {/* Reset */}

        <button
          onClick={onReset}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-indigo-600
            px-5
            py-3
            font-semibold
            text-white
            transition
            hover:bg-indigo-500
          "
        >
          <RotateCcw className="w-5 h-5" />

          Reset Filters
        </button>
      </div>
    </motion.div>
  );
}