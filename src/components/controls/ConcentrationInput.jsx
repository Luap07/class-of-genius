import React from "react";
import { FlaskConical, Beaker, Percent, RotateCcw } from "lucide-react";

const ConcentrationInput = ({
  acidConcentration,
  baseConcentration,
  setAcidConcentration,
  setBaseConcentration,
}) => {
  const handleAcidChange = (e) => {
    const value = Number(e.target.value);

    if (!isNaN(value)) {
      setAcidConcentration(value);
    }
  };

  const handleBaseChange = (e) => {
    const value = Number(e.target.value);

    if (!isNaN(value)) {
      setBaseConcentration(value);
    }
  };

  const presets = [0.05, 0.10, 0.25, 0.50, 1.00];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Percent className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">
          Solution Concentration
        </h2>
      </div>

      {/* Acid */}
      <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 mb-5">

        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-5 h-5 text-red-400" />
          <span className="font-semibold text-white">
            Acid
          </span>
        </div>

        <div className="flex gap-3">

          <input
            type="number"
            min="0"
            max="5"
            step="0.01"
            value={acidConcentration}
            onChange={handleAcidChange}
            className="flex-1 rounded-lg bg-slate-900 border border-slate-600 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="flex items-center px-4 rounded-lg bg-slate-900 border border-slate-600 text-slate-300">
            mol/L
          </div>

        </div>

      </div>

      {/* Base */}
      <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">

        <div className="flex items-center gap-2 mb-3">
          <Beaker className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-white">
            Base
          </span>
        </div>

        <div className="flex gap-3">

          <input
            type="number"
            min="0"
            max="5"
            step="0.01"
            value={baseConcentration}
            onChange={handleBaseChange}
            className="flex-1 rounded-lg bg-slate-900 border border-slate-600 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center px-4 rounded-lg bg-slate-900 border border-slate-600 text-slate-300">
            mol/L
          </div>

        </div>

      </div>

      {/* Presets */}
      <div className="mt-6">

        <h3 className="text-sm text-slate-300 mb-3">
          Quick Presets
        </h3>

        <div className="grid grid-cols-5 gap-2">

          {presets.map((value) => (
            <button
              key={value}
              onClick={() => {
                setAcidConcentration(value);
                setBaseConcentration(value);
              }}
              className="rounded-lg bg-slate-800 border border-slate-700 py-2 text-sm text-white transition hover:bg-slate-700"
            >
              {value}
            </button>
          ))}

        </div>

      </div>

      {/* Summary */}
      <div className="mt-6 rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-3">

        <div className="flex justify-between">
          <span className="text-slate-400">
            Acid Concentration
          </span>

          <span className="font-semibold text-red-400">
            {acidConcentration.toFixed(2)} M
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Base Concentration
          </span>

          <span className="font-semibold text-blue-400">
            {baseConcentration.toFixed(2)} M
          </span>
        </div>

        <div className="border-t border-slate-700 pt-3 flex justify-between">
          <span className="text-slate-400">
            Difference
          </span>

          <span className="font-semibold text-emerald-400">
            {Math.abs(
              acidConcentration - baseConcentration
            ).toFixed(2)}{" "}
            M
          </span>
        </div>

      </div>

      {/* Reset */}
      <button
        onClick={() => {
          setAcidConcentration(0.1);
          setBaseConcentration(0.1);
        }}
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition py-3 font-semibold"
      >
        <RotateCcw className="w-4 h-4" />
        Reset to 0.10 M
      </button>

    </div>
  );
};

export default ConcentrationInput;