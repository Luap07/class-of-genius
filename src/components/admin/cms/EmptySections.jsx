import React from "react";

import {
  FolderOpen,
  PlusCircle,
} from "lucide-react";

export default function EmptySections({
  language,
  section,
  onCreate,
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-dashed
        border-slate-700
        bg-[#0f172a]
        px-10
        py-20
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex
          h-24
          w-24
          items-center
          justify-center
          rounded-full
          bg-indigo-500/10
        "
      >
        <FolderOpen
          size={44}
          className="text-indigo-400"
        />
      </div>

      <h2
        className="
          mt-8
          text-3xl
          font-black
          text-white
        "
      >
        No Content Yet
      </h2>

      <p
        className="
          mx-auto
          mt-4
          max-w-2xl
          text-slate-400
          leading-8
        "
      >
        There is currently no content for the{" "}
        <span className="font-bold text-white">
          {section}
        </span>{" "}
        section
        {language?.name && (
          <>
            {" "}of{" "}
            <span className="font-bold text-indigo-400">
              {language.name}
            </span>
          </>
        )}.
      </p>

      <button
        onClick={onCreate}
        className="
          mt-10
          inline-flex
          items-center
          gap-3
          rounded-2xl
          bg-indigo-600
          px-8
          py-4
          text-lg
          font-bold
          text-white
          transition
          hover:bg-indigo-500
        "
      >
        <PlusCircle size={22} />
        Create Section
      </button>
    </div>
  );
}