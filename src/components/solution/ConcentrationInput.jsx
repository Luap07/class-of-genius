// src/components/solution/ConcentrationInput.jsx

import React from "react";
import { Scale } from "lucide-react";

const ConcentrationInput = ({
  soluteMass = 5,
  setSoluteMass = () => {},
  min = 1,
  max = 100,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Scale className="text-cyan-400" size={22} />
        <h2 className="text-lg font-bold text-white">
          Solute Mass
        </h2>
      </div>

      {/* Number Input */}
      <label className="block text-sm text-slate-400 mb-2">
        Solute Mass (g)
      </label>

      <input
        type="number"
        min={min}
        max={max}
        step="0.5"
        value={soluteMass}
        onChange={(e) => setSoluteMass(Number(e.target.value))}
        className="
          w-full
          rounded-xl
          bg-slate-800
          border
          border-slate-700
          px-4
          py-3
          text-white
          focus:outline-none
          focus:ring-2
          focus:ring-cyan-500
        "
      />

      {/* Slider */}
      <div className="mt-5">
        <input
          type="range"
          min={min}
          max={max}
          step="0.5"
          value={soluteMass}
          onChange={(e) => setSoluteMass(Number(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer"
        />
      </div>

      {/* Display */}
      <div className="mt-6 text-center">

        <div className="text-4xl font-bold text-cyan-400">
          {soluteMass.toFixed(1)}
        </div>

        <div className="text-slate-400">
          grams (g)
        </div>

      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-4 gap-2 mt-6">

        {[5, 10, 25, 50].map((mass) => (
          <button
            key={mass}
            onClick={() => setSoluteMass(mass)}
            className={`rounded-lg py-2 transition ${
              soluteMass === mass
                ? "bg-cyan-600 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-white"
            }`}
          >
            {mass} g
          </button>
        ))}

      </div>

    </div>
  );
};

export default ConcentrationInput;