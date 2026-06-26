import React from "react";

const categories = [
  {
    label: "Alkali Metal",
    color: "bg-red-500/20 border-red-500/40 text-red-300",
  },
  {
    label: "Alkaline Earth",
    color: "bg-orange-500/20 border-orange-500/40 text-orange-300",
  },
  {
    label: "Transition Metal",
    color: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  },
  {
    label: "Post-Transition",
    color: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
  },
  {
    label: "Metalloid",
    color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
  },
  {
    label: "Nonmetal",
    color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
  },
  {
    label: "Halogen",
    color: "bg-green-500/20 border-green-500/40 text-green-300",
  },
  {
    label: "Noble Gas",
    color: "bg-purple-500/20 border-purple-500/40 text-purple-300",
  },
  {
    label: "Lanthanide",
    color: "bg-pink-500/20 border-pink-500/40 text-pink-300",
  },
  {
    label: "Actinide",
    color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  },
];

export default function PeriodicLegend() {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <div
            key={item.label}
            className={`
              px-3
              py-1.5
              rounded-lg
              border
              text-xs
              font-medium
              whitespace-nowrap
              ${item.color}
            `}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}