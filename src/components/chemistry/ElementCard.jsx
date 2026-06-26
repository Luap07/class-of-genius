import React from "react";

const categoryColors = {
  alkali:
    "bg-red-500/20 border-red-500/50 hover:bg-red-500/30",

  alkaline:
    "bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/30",

  transition:
    "bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30",

  posttransition:
    "bg-indigo-500/20 border-indigo-500/50 hover:bg-indigo-500/30",

  metalloid:
    "bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30",

  nonmetal:
    "bg-cyan-500/20 border-cyan-500/50 hover:bg-cyan-500/30",

  halogen:
    "bg-green-500/20 border-green-500/50 hover:bg-green-500/30",

  noble:
    "bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30",

  lanthanide:
    "bg-pink-500/20 border-pink-500/50 hover:bg-pink-500/30",

  actinide:
    "bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30",
};

export default function ElementCard({
  element,
  onClick,
  active = false,
}) {
  const color =
    categoryColors[element.category] ||
    "bg-slate-800 border-slate-700";

  return (
    <button
      onClick={onClick}
      className={`
        relative
        w-full
        h-[72px]
        rounded-xl
        border
        transition-all
        duration-200
        overflow-hidden
        cursor-pointer

        ${color}

        ${
          active
            ? "ring-2 ring-cyan-400 scale-105 shadow-lg shadow-cyan-500/20"
            : "hover:scale-105"
        }
      `}
    >
      {/* Atomic Number */}
      <div
        className="
          absolute
          top-1
          left-2
          text-[10px]
          text-slate-300
          font-medium
        "
      >
        {element.number}
      </div>

      {/* Symbol */}
      <div
        className="
          flex
          items-center
          justify-center
          h-full
        "
      >
        <span
          className="
            text-lg
            font-extrabold
            text-white
          "
        >
          {element.symbol}
        </span>
      </div>

      {/* Name */}
      <div
        className="
          absolute
          bottom-1
          left-0
          right-0
          text-center
          text-[9px]
          text-slate-300
          truncate
          px-1
        "
      >
        {element.name}
      </div>

      {/* Atomic Mass */}
      <div
        className="
          absolute
          top-1
          right-2
          text-[9px]
          text-slate-400
        "
      >
        {element.mass}
      </div>
    </button>
  );
}