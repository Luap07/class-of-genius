import React from "react";

import {
  Edit2,
  Trash2,
  Globe,
  Languages,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Brain,
  BookMarked,
} from "lucide-react";

const iconMap = {
  overview: Globe,
  alphabet: Languages,
  grammar: BookMarked,
  vocabulary: BookOpen,
  listening: Headphones,
  speaking: Mic,
  writing: PenTool,
  culture: Globe,
  lessons: BookOpen,
  ai_tutor: Brain,
};

export default function SectionsList({
  sections = [],
  onEdit,
  onDelete,
}) {
  if (!sections.length) return null;

  return (
    <div className="space-y-5">

      {sections.map((section) => {
        const Icon =
          iconMap[section.section_type] || BookOpen;

        return (
          <div
            key={section.id}
            className="
              rounded-3xl
              border
              border-slate-800
              bg-[#0f172a]
              p-6
              transition
              hover:border-indigo-500/50
            "
          >
            <div className="flex items-start justify-between gap-6">

              <div className="flex gap-4">

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-600/20
                    text-indigo-400
                  "
                >
                  <Icon size={26} />
                </div>

                <div>

                  <div className="flex items-center gap-3 flex-wrap">

                    <h3 className="text-xl font-black text-white">
                      {section.title}
                    </h3>

                    <span
                      className="
                        rounded-full
                        bg-indigo-500/20
                        px-3
                        py-1
                        text-xs
                        font-bold
                        uppercase
                        text-indigo-300
                      "
                    >
                      {section.section_type}
                    </span>

                  </div>
                                    {section.subtitle && (
                    <p className="mt-2 text-sm font-semibold text-indigo-300">
                      {section.subtitle}
                    </p>
                  )}

                  {section.description && (
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                      {section.description}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-4">

                    <span className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300">
                      🌍 {section.languages?.name || "Unknown Language"}
                    </span>

                    <span className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300">
                      Sort: {section.sort_order ?? 0}
                    </span>

                    {section.updated_at && (
                      <span className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300">
                        Updated{" "}
                        {new Date(section.updated_at).toLocaleDateString()}
                      </span>
                    )}

                  </div>

                </div>
              </div>

              {section.thumbnail_url && (
                <img
                  src={section.thumbnail_url}
                  alt={section.title}
                  className="
                    h-28
                    w-44
                    rounded-2xl
                    border
                    border-slate-700
                    object-cover
                  "
                />
              )}
                            <div className="ml-auto flex items-center gap-3">

                <button
                  onClick={() => onEdit(section)}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    bg-blue-600
                    px-5
                    py-3
                    font-bold
                    text-white
                    transition
                    hover:bg-blue-500
                  "
                >
                  <Edit2 size={18} />
                  Edit
                </button>

                <button
                  onClick={() => onDelete(section)}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    bg-red-600
                    px-5
                    py-3
                    font-bold
                    text-white
                    transition
                    hover:bg-red-500
                  "
                >
                  <Trash2 size={18} />
                  Delete
                </button>

              </div>

            </div>
          </div>
        );
      })}

    </div>
  );
}