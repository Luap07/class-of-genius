import React from "react";

import {
  Search,
  Globe,
  RotateCcw,
} from "lucide-react";

export default function LessonFilters({
  search,
  setSearch,
  selectedLanguage,
  setSelectedLanguage,
  languages,
}) {
  return (
    <div className="mb-10 rounded-3xl border border-white/10 bg-[#111827] p-6">

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Search */}

        <div className="relative">

          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
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
              outline-none
              transition
              focus:border-indigo-500
            "
          />

        </div>

        {/* Language */}

        <div className="relative">

          <Globe
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <select
            value={selectedLanguage}
            onChange={(e) =>
              setSelectedLanguage(e.target.value)
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
              focus:border-indigo-500
            "
          >
            <option value="all">
              All Languages
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

        {/* Reset */}

        <button
          onClick={() => {
            setSearch("");
            setSelectedLanguage("all");
          }}
          className="
            flex
            items-center
            justify-center
            gap-3
            rounded-2xl
            bg-indigo-600
            px-6
            py-3
            font-bold
            transition
            hover:bg-indigo-500
          "
        >
          <RotateCcw size={18} />

          Reset Filters

        </button>

      </div>

    </div>
  );
}