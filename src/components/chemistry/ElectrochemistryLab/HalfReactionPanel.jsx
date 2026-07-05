// src/pages/labs/chemistry/components/HalfReactionPanel.jsx

import React from "react";
import { ArrowRightLeft, Flame, Snowflake } from "lucide-react";

const HalfReactionPanel = ({
  oxidation,
  reduction,
  anodeSymbol = "Anode",
  cathodeSymbol = "Cathode",
}) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">

        <ArrowRightLeft className="w-7 h-7 text-cyan-400" />

        <div>
          <h2 className="text-2xl font-bold text-white">
            Half Reactions
          </h2>

          <p className="text-slate-400 text-sm">
            Electron transfer at each electrode
          </p>
        </div>

      </div>

      {/* Reactions Grid */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Oxidation (Anode) */}
        <div className="bg-slate-800 rounded-xl p-5 border border-red-500/30">

          <div className="flex items-center gap-2 mb-3">

            <Flame className="w-5 h-5 text-red-400" />

            <h3 className="text-red-400 font-semibold">
              Oxidation (Anode)
            </h3>

          </div>

          <p className="text-white text-sm break-words">
            {oxidation || `${anodeSymbol} → ions + e⁻`}
          </p>

        </div>

        {/* Reduction (Cathode) */}
        <div className="bg-slate-800 rounded-xl p-5 border border-green-500/30">

          <div className="flex items-center gap-2 mb-3">

            <Snowflake className="w-5 h-5 text-green-400" />

            <h3 className="text-green-400 font-semibold">
              Reduction (Cathode)
            </h3>

          </div>

          <p className="text-white text-sm break-words">
            {reduction || `ions + e⁻ → ${cathodeSymbol}`}
          </p>

        </div>

      </div>

    </div>
  );
};

export default HalfReactionPanel;