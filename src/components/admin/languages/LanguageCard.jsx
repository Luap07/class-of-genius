// src/components/admin/languages/LanguageCard.jsx

import React from "react";
import {
  Edit,
  Trash2,
  Languages,
  BookOpen,
  Users,
  Upload,
} from "lucide-react";
import LanguageBadge from "./LanguageBadge";

export default function LanguageCard({
  language,
  onEdit,
  onDelete,
  onManageContent,
}) {
  return (
    <div
      className="
      rounded-3xl
      border
      border-slate-800
      bg-slate-900/80
      p-6
      transition
      hover:border-cyan-500/40
      "
    >
      {/* HEADER */}
      <div
        className="
        flex
        items-start
        justify-between
        "
      >
        <div
          className="
          flex
          items-center
          gap-4
          "
        >
          <div
            className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-cyan-500/10
            text-cyan-400
            "
          >
            <Languages size={28} />
          </div>

          <div>
            <h3
              className="
              text-xl
              font-black
              text-white
              "
            >
              {language?.name || "Unnamed Language"}
            </h3>

            <p
              className="
              text-sm
              text-slate-500
              "
            >
              {language?.code || "N/A"}
            </p>
          </div>
        </div>

        <LanguageBadge type={language?.status}>
          {language?.status || "Draft"}
        </LanguageBadge>
      </div>

      {/* DESCRIPTION */}
      <p
        className="
        mt-5
        text-sm
        text-slate-400
        line-clamp-3
        "
      >
        {language?.description || "No description available."}
      </p>

      {/* STATS */}
      <div
        className="
        mt-6
        grid
        grid-cols-2
        gap-4
        "
      >
        <div
          className="
          rounded-2xl
          bg-slate-950
          p-4
          "
        >
          <div
            className="
            flex
            items-center
            gap-2
            text-slate-400
            "
          >
            <BookOpen size={16} />
            <span className="text-xs">Lessons</span>
          </div>

          <p
            className="
            mt-2
            text-xl
            font-black
            text-white
            "
          >
            {language?.lessons_count || 0}
          </p>
        </div>

        <div
          className="
          rounded-2xl
          bg-slate-950
          p-4
          "
        >
          <div
            className="
            flex
            items-center
            gap-2
            text-slate-400
            "
          >
            <Users size={16} />
            <span className="text-xs">Speakers</span>
          </div>

          <p
            className="
            mt-2
            text-xl
            font-black
            text-white
            "
          >
            {language?.speakers || "N/A"}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div
        className="
        mt-6
        grid
        grid-cols-3
        gap-3
        "
      >
        <button
          onClick={() => onEdit?.(language)}
          className="
          flex
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-blue-500/10
          py-3
          text-blue-400
          font-bold
          hover:bg-blue-500/20
          transition
          "
        >
          <Edit size={16} />
          Edit
        </button>

        <button
          onClick={() => onManageContent?.(language)}
          className="
          flex
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-cyan-500/10
          py-3
          text-cyan-400
          font-bold
          hover:bg-cyan-500/20
          transition
          "
        >
          <Upload size={16} />
          Content
        </button>

        <button
          onClick={() => onDelete?.(language)}
          className="
          flex
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-red-500/10
          py-3
          text-red-400
          font-bold
          hover:bg-red-500/20
          transition
          "
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}