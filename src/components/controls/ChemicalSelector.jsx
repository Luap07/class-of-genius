import React from "react";
import { Beaker, FlaskConical, ArrowRightLeft } from "lucide-react";

const acids = [
  {
    name: "HCl",
    full: "Hydrochloric Acid",
    strength: "Strong Acid",
  },
  {
    name: "HNO₃",
    full: "Nitric Acid",
    strength: "Strong Acid",
  },
  {
    name: "H₂SO₄",
    full: "Sulfuric Acid",
    strength: "Strong Acid",
  },
  {
    name: "CH₃COOH",
    full: "Acetic Acid",
    strength: "Weak Acid",
  },
];

const bases = [
  {
    name: "NaOH",
    full: "Sodium Hydroxide",
    strength: "Strong Base",
  },
  {
    name: "KOH",
    full: "Potassium Hydroxide",
    strength: "Strong Base",
  },
  {
    name: "NH₄OH",
    full: "Ammonium Hydroxide",
    strength: "Weak Base",
  },
  {
    name: "Ba(OH)₂",
    full: "Barium Hydroxide",
    strength: "Strong Base",
  },
];

const SelectCard = ({
  title,
  icon,
  value,
  options,
  onChange,
  accent,
}) => (
  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">

    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="font-semibold text-white">{title}</h3>
    </div>

    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        w-full
        rounded-lg
        border
        border-slate-600
        bg-slate-900
        px-3
        py-3
        text-white
        outline-none
        transition
        focus:ring-2
        ${accent}
      `}
    >
      {options.map((item) => (
        <option key={item.name} value={item.name}>
          {item.name} — {item.full}
        </option>
      ))}
    </select>

    <div className="mt-3 rounded-lg bg-slate-900 p-3">
      <p className="text-sm text-slate-300">
        {
          options.find((o) => o.name === value)?.full
        }
      </p>

      <span
        className={`
          inline-block
          mt-2
          rounded-full
          px-2
          py-1
          text-xs
          font-semibold
          ${
            options.find((o) => o.name === value)?.strength.includes("Weak")
              ? "bg-yellow-500/20 text-yellow-300"
              : "bg-emerald-500/20 text-emerald-300"
          }
        `}
      >
        {options.find((o) => o.name === value)?.strength}
      </span>
    </div>

  </div>
);

const ChemicalSelector = ({
  acid,
  base,
  setAcid,
  setBase,
}) => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">

      <div className="flex items-center gap-3 mb-5">
        <ArrowRightLeft className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">
          Chemical Selection
        </h2>
      </div>

      <div className="space-y-5">

        <SelectCard
          title="Acid"
          value={acid}
          options={acids}
          onChange={setAcid}
          accent="focus:ring-red-500"
          icon={
            <FlaskConical className="w-5 h-5 text-red-400" />
          }
        />

        <SelectCard
          title="Base"
          value={base}
          options={bases}
          onChange={setBase}
          accent="focus:ring-blue-500"
          icon={
            <Beaker className="w-5 h-5 text-blue-400" />
          }
        />

      </div>

      <div className="mt-5 rounded-xl bg-slate-800 p-4 border border-slate-700">

        <h4 className="font-semibold text-white mb-2">
          Current Reaction
        </h4>

        <div className="text-center">

          <span className="text-red-400 font-bold text-lg">
            {acid}
          </span>

          <span className="mx-3 text-slate-400">
            +
          </span>

          <span className="text-blue-400 font-bold text-lg">
            {base}
          </span>

          <div className="text-green-400 text-xl mt-2">
            ↓
          </div>

          <p className="text-sm text-slate-300 mt-2">
            Neutralization Reaction
          </p>

        </div>

      </div>

    </div>
  );
};

export default ChemicalSelector;