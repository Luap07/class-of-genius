// src/components/curriculum/Recommended.jsx

import React from "react";
import { Sparkles } from "lucide-react";

const Recommended = ({ data = [], onView }) => {
  return (
    <div className="mt-14">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-cyan-400" />
        <h2 className="text-2xl font-bold">
          Recommended for You
        </h2>
      </div>

      <p className="text-slate-400 mb-6">
        AI-curated curriculum suggestions based on global trends and popular learning paths.
      </p>

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {data.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500 transition hover:-translate-y-1"
          >

            {/* TAG */}
            <span className="text-xs text-cyan-400 font-semibold">
              AI PICK
            </span>

            {/* TITLE */}
            <h3 className="text-xl font-bold mt-2">
              {item.curriculum}
            </h3>

            {/* META */}
            <p className="text-slate-400 mt-2">
              {item.country} • {item.level}
            </p>

            {/* SUBJECTS */}
            <p className="text-slate-500 text-sm mt-2">
              {item.subjects} Subjects included
            </p>

            {/* BUTTON */}
            <button
              onClick={() => onView?.(item)}
              className="mt-4 text-cyan-400 font-semibold hover:underline"
            >
              Explore →
            </button>

          </div>
        ))}

      </div>
    </div>
  );
};

export default Recommended;