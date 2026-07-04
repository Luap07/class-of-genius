
import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Droplets,
  Beaker,
  Flame,
} from "lucide-react";

const SolutionControls = ({
  running = false,
  heating = false,

  soluteMass = 10,
  solutionVolume = 100,

  onMassChange,
  onVolumeChange,

  onStart,
  onPause,
  onReset,

  onToggleHeating,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">

      <h2 className="text-2xl font-bold text-cyan-400">
        ⚙️ Solution Controls
      </h2>

      {/* Solute Mass */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="flex items-center gap-2">
            <Beaker size={18} />
            Solute Mass
          </span>

          <span className="font-bold">
            {soluteMass} g
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={soluteMass}
          onChange={(e) =>
            onMassChange(Number(e.target.value))
          }
          className="w-full accent-cyan-500"
        />
      </div>

      {/* Solution Volume */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="flex items-center gap-2">
            <Droplets size={18} />
            Solution Volume
          </span>

          <span className="font-bold">
            {solutionVolume} mL
          </span>
        </div>

        <input
          type="range"
          min="50"
          max="1000"
          step="10"
          value={solutionVolume}
          onChange={(e) =>
            onVolumeChange(Number(e.target.value))
          }
          className="w-full accent-blue-500"
        />
      </div>

      {/* Heating */}
      <button
        onClick={onToggleHeating}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${
          heating
            ? "bg-orange-600 hover:bg-orange-700"
            : "bg-slate-800 hover:bg-slate-700"
        }`}
      >
        <Flame size={20} />

        {heating ? "Stop Heating" : "Start Heating"}
      </button>

      {/* Experiment Controls */}
      <div className="grid grid-cols-3 gap-3">

        <button
          onClick={running ? onPause : onStart}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold ${
            running
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {running ? <Pause size={18} /> : <Play size={18} />}

          {running ? "Pause" : "Start"}
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-semibold"
        >
          <RotateCcw size={18} />
          Reset
        </button>

        <button
          onClick={() => {
            onMassChange(10);
            onVolumeChange(100);
          }}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 font-semibold"
        >
          Default
        </button>

      </div>

      {/* Live Values */}
      <div className="bg-slate-800 rounded-xl p-4 space-y-2">

        <div className="flex justify-between">
          <span>Experiment</span>
          <span className="font-bold text-cyan-400">
            {running ? "Running" : "Stopped"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Heating</span>
          <span className="font-bold text-orange-400">
            {heating ? "ON" : "OFF"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Mass</span>
          <span>{soluteMass} g</span>
        </div>

        <div className="flex justify-between">
          <span>Volume</span>
          <span>{solutionVolume} mL</span>
        </div>

      </div>

    </div>
  );
};

export default SolutionControls;