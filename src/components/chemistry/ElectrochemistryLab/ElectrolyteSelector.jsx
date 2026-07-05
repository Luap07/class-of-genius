// src/pages/labs/chemistry/components/ElectrolyteSelector.jsx

import React from "react";
import { Beaker, Droplets } from "lucide-react";
import { ELECTROLYTE_OPTIONS } from "../../../data/ElectrochemistryLab/electrodes";

const ElectrolyteSelector = ({
  anodeElectrolyte,
  cathodeElectrolyte,
  onAnodeChange,
  onCathodeChange,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">

        <Beaker className="w-7 h-7 text-cyan-400" />

        <div>
          <h2 className="text-xl font-bold text-white">
            Electrolyte Selector
          </h2>

          <p className="text-slate-400 text-sm">
            Select the electrolyte solution for each half-cell.
          </p>
        </div>

      </div>

      {/* Selectors */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Anode */}
        <div className="bg-slate-800 rounded-xl p-5">

          <div className="flex items-center gap-2 mb-4">

            <Droplets className="w-5 h-5 text-red-400" />

            <h3 className="text-lg font-semibold text-red-400">
              Anode Solution
            </h3>

          </div>

          <select
            value={anodeElectrolyte}
            onChange={(e) => onAnodeChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
          >
            {ELECTROLYTE_OPTIONS.map((electrolyte) => (
              <option key={electrolyte} value={electrolyte}>
                {electrolyte}
              </option>
            ))}
          </select>

        </div>

        {/* Cathode */}
        <div className="bg-slate-800 rounded-xl p-5">

          <div className="flex items-center gap-2 mb-4">

            <Droplets className="w-5 h-5 text-green-400" />

            <h3 className="text-lg font-semibold text-green-400">
              Cathode Solution
            </h3>

          </div>

          <select
            value={cathodeElectrolyte}
            onChange={(e) => onCathodeChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
          >
            {ELECTROLYTE_OPTIONS.map((electrolyte) => (
              <option key={electrolyte} value={electrolyte}>
                {electrolyte}
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* Information */}
      <div className="mt-8 grid md:grid-cols-2 gap-4">

        <div className="bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Selected Anode Electrolyte
          </p>

          <h3 className="text-red-400 text-xl font-bold mt-2">
            {anodeElectrolyte}
          </h3>

        </div>

        <div className="bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Selected Cathode Electrolyte
          </p>

          <h3 className="text-green-400 text-xl font-bold mt-2">
            {cathodeElectrolyte}
          </h3>

        </div>

      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-slate-700 pt-5">

        <p className="text-sm text-slate-400 leading-6">
          The electrolyte provides ions that conduct electricity inside
          each half-cell. Choosing the correct electrolyte helps maintain
          charge balance during the electrochemical reaction.
        </p>

      </div>

    </div>
  );
};

export default ElectrolyteSelector;