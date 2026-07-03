// src/components/controls/ConcentrationInput.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  FlaskConical,
  Beaker,
  Calculator,
  Info,
} from "lucide-react";

const ConcentrationInput = ({
  acidConcentration = 0.1,
  baseConcentration = 0.1,
  setAcidConcentration,
  setBaseConcentration,
}) => {
  const presets = [0.05, 0.1, 0.2, 0.5, 1.0];

  const format = (value) => `${Number(value).toFixed(2)} M`;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-cyan-400" size={20} />

        <h2 className="text-lg font-bold">
          Concentration
        </h2>
      </div>

      {/* ================= Acid ================= */}

      <div className="mb-8">

        <div className="flex items-center gap-2 mb-3">
          <FlaskConical
            size={18}
            className="text-red-400"
          />

          <span className="font-semibold text-red-300">
            Acid Concentration
          </span>
        </div>

        <div className="flex gap-3">

          <input
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={acidConcentration}
            onChange={(e) =>
              setAcidConcentration(
                Number(e.target.value)
              )
            }
            className="
              flex-1
              rounded-xl
              border
              border-slate-700
              bg-slate-800
              px-4
              py-3
              text-white
              outline-none
              focus:border-cyan-500
            "
          />

          <div className="flex items-center justify-center w-20 rounded-xl bg-slate-800 border border-slate-700 font-semibold">
            M
          </div>

        </div>

        {/* Presets */}

        <div className="grid grid-cols-5 gap-2 mt-4">

          {presets.map((value) => (

            <button
              key={value}
              onClick={() =>
                setAcidConcentration(value)
              }
              className={`
                rounded-lg
                py-2
                text-sm
                transition
                ${
                  acidConcentration === value
                    ? "bg-red-500 text-white"
                    : "bg-slate-800 hover:bg-slate-700"
                }
              `}
            >
              {format(value)}
            </button>

          ))}

        </div>

      </div>

      {/* ================= Base ================= */}

      <div>

        <div className="flex items-center gap-2 mb-3">
          <Beaker
            size={18}
            className="text-blue-400"
          />

          <span className="font-semibold text-blue-300">
            Base Concentration
          </span>
        </div>

        <div className="flex gap-3">

          <input
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={baseConcentration}
            onChange={(e) =>
              setBaseConcentration(
                Number(e.target.value)
              )
            }
            className="
              flex-1
              rounded-xl
              border
              border-slate-700
              bg-slate-800
              px-4
              py-3
              text-white
              outline-none
              focus:border-cyan-500
            "
          />

          <div className="flex items-center justify-center w-20 rounded-xl bg-slate-800 border border-slate-700 font-semibold">
            M
          </div>

        </div>

        {/* Presets */}

        <div className="grid grid-cols-5 gap-2 mt-4">

          {presets.map((value) => (

            <button
              key={value}
              onClick={() =>
                setBaseConcentration(value)
              }
              className={`
                rounded-lg
                py-2
                text-sm
                transition
                ${
                  baseConcentration === value
                    ? "bg-blue-500 text-white"
                    : "bg-slate-800 hover:bg-slate-700"
                }
              `}
            >
              {format(value)}
            </button>

          ))}

        </div>

      </div>

      {/* Summary */}

      <motion.div
        layout
        className="mt-8 rounded-xl border border-slate-700 bg-slate-800 p-4"
      >

        <h3 className="font-semibold text-cyan-400 mb-4">
          Current Solution
        </h3>

        <div className="space-y-3">

          <div className="flex justify-between">

            <span className="text-slate-400">
              Acid
            </span>

            <span className="font-semibold text-red-300">
              {format(acidConcentration)}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-slate-400">
              Base
            </span>

            <span className="font-semibold text-blue-300">
              {format(baseConcentration)}
            </span>

          </div>

        </div>

      </motion.div>

      {/* Information */}

      <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">

        <div className="flex gap-3">

          <Info
            className="text-cyan-400 mt-1"
            size={18}
          />

          <div>

            <h4 className="font-semibold text-cyan-300">
              Laboratory Note
            </h4>

            <p className="mt-1 text-sm text-slate-300 leading-6">
              Concentration is measured in mol/dm³
              (Molarity, M). The chemistry engine
              will later use these values together
              with the burette volume to calculate
              the number of moles and determine
              the titration endpoint.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ConcentrationInput;