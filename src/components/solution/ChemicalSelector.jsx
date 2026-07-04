// src/components/controls/ChemicalSelector.jsx

import React from "react";
import { FlaskConical } from "lucide-react";

const solutes = [
  "Sodium Chloride (NaCl)",
  "Sugar (C₁₂H₂₂O₁₁)",
  "Copper Sulfate (CuSO₄)",
  "Potassium Nitrate (KNO₃)",
  "Silver Nitrate (AgNO₃)",
  "Calcium Chloride (CaCl₂)",
  "Ammonium Chloride (NH₄Cl)",
  "Magnesium Sulfate (MgSO₄)",
  "Sodium Hydroxide (NaOH)",
  "Hydrochloric Acid (HCl)",
];

const solvents = [
  "Water (H₂O)",
  "Ethanol (C₂H₅OH)",
  "Methanol (CH₃OH)",
  "Acetone (CH₃COCH₃)",
  "Benzene (C₆H₆)",
];

const ChemicalSelector = ({
  solute,
  setSolute,
  solvent,
  setSolvent,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

      <div className="flex items-center gap-2 mb-5">
        <FlaskConical className="text-cyan-400" size={22} />
        <h2 className="text-lg font-bold text-white">
          Chemical Selection
        </h2>
      </div>

      {/* Solute */}
      <div className="mb-5">
        <label className="block text-sm text-slate-400 mb-2">
          Select Solute
        </label>

        <select
          value={solute}
          onChange={(e) => setSolute(e.target.value)}
          className="
            w-full
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-3
            text-white
            focus:outline-none
            focus:ring-2
            focus:ring-cyan-500
          "
        >
          {solutes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      {/* Solvent */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Select Solvent
        </label>

        <select
          value={solvent}
          onChange={(e) => setSolvent(e.target.value)}
          className="
            w-full
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-3
            text-white
            focus:outline-none
            focus:ring-2
            focus:ring-cyan-500
          "
        >
          {solvents.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-xl bg-slate-800 p-4 border border-slate-700">

        <p className="text-sm text-slate-400 mb-1">
          Current Solution
        </p>

        <p className="text-cyan-400 font-semibold">
          {solute}
        </p>

        <p className="text-white text-sm mt-1">
          dissolved in
        </p>

        <p className="text-green-400 font-semibold">
          {solvent}
        </p>

      </div>

    </div>
  );
};

export default ChemicalSelector;