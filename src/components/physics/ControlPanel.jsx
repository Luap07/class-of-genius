import React from "react";

export default function ControlPanel() {
  return (
    <aside className="w-80 border-l border-slate-800 bg-slate-900 p-6">
      <h2 className="font-bold text-xl mb-6">
        Controls
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block mb-2">
            Mass
          </label>
          <input
            type="range"
            min="1"
            max="20"
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-2">
            Force
          </label>
          <input
            type="range"
            min="1"
            max="100"
            className="w-full"
          />
        </div>

        <button className="w-full bg-green-600 py-3 rounded-xl">
          Start Simulation
        </button>

        <button className="w-full bg-red-600 py-3 rounded-xl">
          Reset
        </button>
      </div>
    </aside>
  );
}