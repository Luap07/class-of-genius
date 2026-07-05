// src/pages/labs/chemistry/components/SimulationControls.jsx

import React from "react";
import {
  Play,
  Square,
  RotateCcw,
  Pause,
  Activity,
} from "lucide-react";

const SimulationControls = ({
  running = false,
  ready = false,
  onStart,
  onStop,
  onReset,
  onPause,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <Activity className="w-7 h-7 text-cyan-400" />

        <div>

          <h2 className="text-2xl font-bold text-white">
            Simulation Controls
          </h2>

          <p className="text-slate-400 text-sm">
            Control the electrochemical cell simulation.
          </p>

        </div>

      </div>

      {/* Buttons */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Start */}

        <button
          onClick={onStart}
          disabled={!ready || running}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-4 font-semibold text-white transition"
        >
          <Play size={20} />
          Start
        </button>

        {/* Pause */}

        <button
          onClick={onPause}
          disabled={!running}
          className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-4 font-semibold text-black transition"
        >
          <Pause size={20} />
          Pause
        </button>

        {/* Stop */}

        <button
          onClick={onStop}
          disabled={!running}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-4 font-semibold text-white transition"
        >
          <Square size={20} />
          Stop
        </button>

        {/* Reset */}

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-4 font-semibold text-white transition"
        >
          <RotateCcw size={20} />
          Reset
        </button>

      </div>

      {/* Status */}

      <div className="mt-6 flex items-center justify-between bg-slate-800 rounded-xl px-5 py-4">

        <div>

          <p className="text-slate-400 text-sm">
            Simulation Status
          </p>

          <h3
            className={`font-bold text-lg ${
              running
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {running ? "Running" : "Stopped"}
          </h3>

        </div>

        <div
          className={`w-4 h-4 rounded-full ${
            running
              ? "bg-green-400 animate-pulse"
              : "bg-red-400"
          }`}
        />

      </div>

      {/* Instructions */}

      <div className="mt-6 rounded-xl bg-slate-800 p-4">

        <h3 className="text-white font-semibold mb-2">
          Instructions
        </h3>

        <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">

          <li>Select an anode and a cathode.</li>

          <li>Choose electrolytes for both half-cells.</li>

          <li>Ensure the salt bridge is connected.</li>

          <li>Press <strong>Start</strong> to begin the simulation.</li>

          <li>Use <strong>Reset</strong> to restore the default state.</li>

        </ul>

      </div>

    </div>
  );
};

export default SimulationControls;