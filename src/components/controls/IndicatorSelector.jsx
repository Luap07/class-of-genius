import React from "react";
import { Droplets, Info } from "lucide-react";

const indicators = [
  {
    name: "Phenolphthalein",
    color: "#ec4899",
    range: "pH 8.2 – 10.0",
    acid: "Colorless",
    base: "Pink",
    description:
      "Most commonly used for strong acid–strong base titrations.",
  },
  {
    name: "Methyl Orange",
    color: "#f97316",
    range: "pH 3.1 – 4.4",
    acid: "Red",
    base: "Yellow",
    description:
      "Suitable for strong acid–weak base titrations.",
  },
  {
    name: "Bromothymol Blue",
    color: "#3b82f6",
    range: "pH 6.0 – 7.6",
    acid: "Yellow",
    base: "Blue",
    description:
      "Excellent for neutral solutions near pH 7.",
  },
  {
    name: "Litmus",
    color: "#8b5cf6",
    range: "Around pH 7",
    acid: "Red",
    base: "Blue",
    description:
      "General-purpose acid/base indicator.",
  },
];

const IndicatorSelector = ({
  indicator,
  setIndicator,
}) => {
  const current =
    indicators.find((i) => i.name === indicator) || indicators[0];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Droplets className="w-6 h-6 text-pink-400" />
        <h2 className="text-xl font-bold text-white">
          Indicator
        </h2>
      </div>

      {/* Dropdown */}
      <select
        value={indicator}
        onChange={(e) => setIndicator(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:ring-2 focus:ring-pink-500"
      >
        {indicators.map((item) => (
          <option key={item.name} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>

      {/* Indicator Preview */}
      <div className="mt-5 rounded-xl border border-slate-700 bg-slate-800 p-4">

        <div className="flex items-center gap-3">

          <div
            className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
            style={{
              background: current.color,
            }}
          />

          <div>
            <h3 className="text-lg font-semibold text-white">
              {current.name}
            </h3>

            <p className="text-sm text-slate-400">
              Transition Range: {current.range}
            </p>
          </div>

        </div>

        {/* Color Change Table */}
        <div className="grid grid-cols-2 gap-4 mt-5">

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-700">
            <p className="text-xs uppercase text-red-400 font-semibold">
              Acidic Solution
            </p>

            <p className="mt-2 text-white font-medium">
              {current.acid}
            </p>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-700">
            <p className="text-xs uppercase text-blue-400 font-semibold">
              Basic Solution
            </p>

            <p className="mt-2 text-white font-medium">
              {current.base}
            </p>
          </div>

        </div>

        {/* Description */}
        <div className="mt-5 flex gap-3 rounded-lg bg-slate-900 border border-slate-700 p-3">

          <Info className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />

          <p className="text-sm text-slate-300">
            {current.description}
          </p>

        </div>

      </div>

    </div>
  );
};

export default IndicatorSelector;