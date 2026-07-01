// src/components/chemistry/acidBase/Toolbar.jsx

import React from "react";
import {
  Beaker,
  FlaskConical,
  Droplets,
  TestTube2,
  RefreshCcw,
  Trash2,
} from "lucide-react";

export default function Toolbar({
  onReset,
  onClear,
  experiment = "Acid vs Base",
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl px-6 py-4 shadow-xl">

      <div className="flex items-center justify-between flex-wrap gap-4">

        {/* Left */}
        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
            <Beaker
              size={30}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Acid vs Base Laboratory
            </h1>

            <p className="text-sm text-slate-400">
              Neutralization • Indicators • pH Measurement
            </p>
          </div>

        </div>

        {/* Center */}
        <div className="hidden xl:flex items-center gap-6">

          <div className="flex items-center gap-2 text-slate-300">
            <Droplets
              className="text-red-400"
              size={18}
            />
            <span className="text-sm">
              Acid
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <FlaskConical
              className="text-blue-400"
              size={18}
            />
            <span className="text-sm">
              Base
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <TestTube2
              className="text-green-400"
              size={18}
            />
            <span className="text-sm">
              Neutralization
            </span>
          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition"
          >
            <RefreshCcw size={18} />
            <span>Reset</span>
          </button>

          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 transition"
          >
            <Trash2 size={18} />
            <span>Clear</span>
          </button>

        </div>

      </div>

      {/* Bottom Info */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-sm">

        <span className="text-slate-500">
          Experiment
        </span>

        <span className="text-cyan-400 font-semibold">
          {experiment}
        </span>

      </div>

    </div>
  );
}