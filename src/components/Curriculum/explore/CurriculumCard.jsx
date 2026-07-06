import React from "react";
import { BookOpen, GraduationCap } from "lucide-react";

const CurriculumCard = ({ data, onView }) => {
  if (!data) return null;

  const country = data.country ?? "Unknown Country";
  const curriculum = data.curriculum ?? "No curriculum";
  const level = data.level ?? "N/A";
  const subjects = data.subjects ?? 0;

  const slugify = (str = "") =>
    str.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500 transition hover:-translate-y-1 duration-300">

      {/* TOP ROW */}
      <div className="flex items-center justify-between">
        <span className="text-cyan-400 font-semibold">
          {country}
        </span>

        <GraduationCap className="text-slate-400" />
      </div>

      {/* TITLE */}
      <h2 className="text-xl font-bold mt-3">
        {curriculum}
      </h2>

      {/* LEVEL */}
      <p className="text-slate-400 mt-2">
        Level: {level}
      </p>

      {/* FOOTER */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-400 flex items-center gap-1">
          <BookOpen size={16} />
          {subjects} Subjects
        </span>

        <button
          onClick={() => onView?.(data)}
          className="text-cyan-400 text-sm font-semibold hover:underline"
        >
          View →
        </button>
      </div>

    </div>
  );
};

export default CurriculumCard;