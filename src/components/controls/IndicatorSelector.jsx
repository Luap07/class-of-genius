// src/components/controls/IndicatorSelector.jsx

import React from "react";
import {
  Droplets,
  Circle,
  Info,
  CheckCircle2,
} from "lucide-react";

const indicators = [
  {
    id: "Phenolphthalein",
    color: "#ec4899",
    acid: "Colourless",
    base: "Pink",
    endpoint: "Pale Pink",
    range: "8.2 - 10.0",
  },
  {
    id: "Methyl Orange",
    color: "#f97316",
    acid: "Red",
    base: "Yellow",
    endpoint: "Orange",
    range: "3.1 - 4.4",
  },
  {
    id: "Methyl Red",
    color: "#ef4444",
    acid: "Red",
    base: "Yellow",
    endpoint: "Orange",
    range: "4.4 - 6.2",
  },
  {
    id: "Bromothymol Blue",
    color: "#3b82f6",
    acid: "Yellow",
    base: "Blue",
    endpoint: "Green",
    range: "6.0 - 7.6",
  },
  {
    id: "Litmus",
    color: "#8b5cf6",
    acid: "Red",
    base: "Blue",
    endpoint: "Purple",
    range: "4.5 - 8.3",
  },
];

const IndicatorSelector = ({
  indicator,
  setIndicator,
}) => {
  const selected =
    indicators.find((i) => i.id === indicator) ||
    indicators[0];

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Droplets
          className="text-cyan-400"
          size={20}
        />

        <h2 className="text-lg font-bold">
          Indicator Selection
        </h2>
      </div>

      {/* Dropdown */}
      <select
        value={indicator}
        onChange={(e) =>
          setIndicator(e.target.value)
        }
        className="
          w-full
          rounded-xl
          border
          border-slate-700
          bg-slate-800
          px-4
          py-3
          text-white
          outline-none
          transition
          focus:border-cyan-500
        "
      >
        {indicators.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.id}
          </option>
        ))}
      </select>

      {/* Preview */}
      <div className="mt-5 rounded-xl border border-slate-700 bg-slate-800 p-4">

        <div className="flex items-center gap-3">

          <Circle
            fill={selected.color}
            color={selected.color}
            size={18}
          />

          <div>

            <div className="font-semibold text-white">
              {selected.id}
            </div>

            <div className="text-sm text-slate-400">
              Indicator
            </div>

          </div>

        </div>

      </div>

      {/* Properties */}
      <div className="mt-5 space-y-3">

        <div className="flex justify-between rounded-lg bg-slate-800 px-4 py-3">

          <span className="text-slate-400">
            Acid
          </span>

          <span className="font-medium text-red-300">
            {selected.acid}
          </span>

        </div>

        <div className="flex justify-between rounded-lg bg-slate-800 px-4 py-3">

          <span className="text-slate-400">
            Base
          </span>

          <span className="font-medium text-blue-300">
            {selected.base}
          </span>

        </div>

        <div className="flex justify-between rounded-lg bg-slate-800 px-4 py-3">

          <span className="text-slate-400">
            Endpoint
          </span>

          <span
            className="font-semibold"
            style={{
              color: selected.color,
            }}
          >
            {selected.endpoint}
          </span>

        </div>

        <div className="flex justify-between rounded-lg bg-slate-800 px-4 py-3">

          <span className="text-slate-400">
            pH Range
          </span>

          <span className="text-cyan-400 font-semibold">
            {selected.range}
          </span>

        </div>

      </div>

      {/* Tip */}
      <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">

        <div className="flex items-start gap-3">

          <Info
            className="text-cyan-400 mt-0.5"
            size={18}
          />

          <div>

            <h3 className="font-semibold text-cyan-300">
              Laboratory Tip
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-300">
              Add only 2–3 drops of indicator.
              Excess indicator can slightly affect
              the endpoint.
            </p>

          </div>

        </div>

      </div>

      {/* Selected */}
      <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 py-3">

        <CheckCircle2
          size={18}
          className="text-green-400"
        />

        <span className="text-green-300 font-medium">
          {selected.id} Selected
        </span>

      </div>

    </div>
  );
};

export default IndicatorSelector;