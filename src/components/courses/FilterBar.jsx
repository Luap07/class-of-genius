import React from "react";
import { Filter, RotateCcw } from "lucide-react";

const FilterBar = ({
  filters = {},
  categories = [],
  levels = [],
  languages = [],
  onChange = () => {},
  onReset = () => {},
}) => {
  const handleChange = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <Filter className="text-blue-400" />

          <h2 className="text-xl font-bold">
            Filters
          </h2>

        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 hover:border-blue-500 transition"
        >
          <RotateCcw size={18} />
          Reset
        </button>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {/* Category */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Category
          </label>

          <select
            value={filters.category || ""}
            onChange={(e) =>
              handleChange("category", e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}

          </select>

        </div>

        {/* Level */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Level
          </label>

          <select
            value={filters.level || ""}
            onChange={(e) =>
              handleChange("level", e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 outline-none focus:border-blue-500"
          >
            <option value="">All Levels</option>

            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}

          </select>

        </div>

        {/* Language */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Language
          </label>

          <select
            value={filters.language || ""}
            onChange={(e) =>
              handleChange("language", e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 outline-none focus:border-blue-500"
          >
            <option value="">All Languages</option>

            {languages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}

          </select>

        </div>

        {/* Certificate */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Certificate
          </label>

          <select
            value={filters.certificate || ""}
            onChange={(e) =>
              handleChange("certificate", e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 outline-none focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="true">Certificate Included</option>
            <option value="false">No Certificate</option>
          </select>

        </div>

        {/* Duration */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Duration
          </label>

          <select
            value={filters.duration || ""}
            onChange={(e) =>
              handleChange("duration", e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 outline-none focus:border-blue-500"
          >
            <option value="">Any Duration</option>
            <option value="short">Under 5 Hours</option>
            <option value="medium">5 - 20 Hours</option>
            <option value="long">20+ Hours</option>
          </select>

        </div>

        {/* Sort */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Sort By
          </label>

          <select
            value={filters.sort || ""}
            onChange={(e) =>
              handleChange("sort", e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 outline-none focus:border-blue-500"
          >
            <option value="">Default</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="latest">Newest</option>
            <option value="title">A - Z</option>
          </select>

        </div>

      </div>

    </div>
  );
};

export default FilterBar;