// src/components/controls/ChemicalSelector.jsx

import React from "react";
import { FlaskConical, Beaker, ArrowRightLeft } from "lucide-react";

const acids = [
  {
    name: "HCl",
    label: "Hydrochloric Acid (HCl)",
    color: "bg-red-500",
  },
  {
    name: "H₂SO₄",
    label: "Sulfuric Acid (H₂SO₄)",
    color: "bg-orange-500",
  },
  {
    name: "HNO₃",
    label: "Nitric Acid (HNO₃)",
    color: "bg-yellow-500",
  },
  {
    name: "CH₃COOH",
    label: "Acetic Acid (CH₃COOH)",
    color: "bg-pink-500",
  },
];

const bases = [
  {
    name: "NaOH",
    label: "Sodium Hydroxide (NaOH)",
    color: "bg-blue-500",
  },
  {
    name: "KOH",
    label: "Potassium Hydroxide (KOH)",
    color: "bg-cyan-500",
  },
  {
    name: "NH₄OH",
    label: "Ammonium Hydroxide (NH₄OH)",
    color: "bg-green-500",
  },
  {
    name: "Ca(OH)₂",
    label: "Calcium Hydroxide",
    color: "bg-emerald-500",
  },
];

const ChemicalSelector = ({
  acid,
  base,
  setAcid,
  setBase,
}) => {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <ArrowRightLeft className="text-cyan-400" size={20} />

        <h2 className="text-lg font-bold">
          Chemical Selection
        </h2>
      </div>

      {/* Acid */}
      <div className="mb-6">

        <div className="flex items-center gap-2 mb-2">
          <FlaskConical
            size={18}
            className="text-red-400"
          />

          <span className="font-semibold text-red-300">
            Acid
          </span>
        </div>

        <select
          value={acid}
          onChange={(e) => setAcid(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
        >
          {acids.map((item) => (
            <option
              key={item.name}
              value={item.name}
            >
              {item.label}
            </option>
          ))}
        </select>

        <div className="mt-3 flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full ${
              acids.find((a) => a.name === acid)?.color
            }`}
          />

          <span className="text-sm text-slate-400">
            {acid}
          </span>
        </div>

      </div>

      {/* Base */}
      <div>

        <div className="flex items-center gap-2 mb-2">
          <Beaker
            size={18}
            className="text-blue-400"
          />

          <span className="font-semibold text-blue-300">
            Base
          </span>
        </div>

        <select
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
        >
          {bases.map((item) => (
            <option
              key={item.name}
              value={item.name}
            >
              {item.label}
            </option>
          ))}
        </select>

        <div className="mt-3 flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full ${
              bases.find((b) => b.name === base)?.color
            }`}
          />

          <span className="text-sm text-slate-400">
            {base}
          </span>
        </div>

      </div>

      {/* Preview */}
      <div className="mt-6 rounded-xl bg-slate-800 border border-slate-700 p-4">

        <h3 className="font-semibold text-cyan-400 mb-2">
          Selected Reaction
        </h3>

        <div className="text-center text-lg font-bold text-white">
          {acid}{" "}
          <span className="text-slate-500">
            +
          </span>{" "}
          {base}
        </div>

        <p className="mt-2 text-center text-sm text-slate-400">
          Ready for titration.
        </p>

      </div>

    </div>
  );
};

export default ChemicalSelector;