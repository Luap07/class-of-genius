// src/components/tabs/ResultsTab.jsx

import React from "react";
import {
  CheckCircle2,
  FlaskConical,
  Droplets,
  Activity,
  BarChart3,
  Thermometer,
} from "lucide-react";

const ResultsTab = ({
  simulation = {},
  temperature = 25,
}) => {
  // Helper to ensure values are numbers before formatting
  const val = (v) => Number(v ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h1 className="text-3xl font-bold text-cyan-400">📋 Experiment Results</h1>
        <p className="text-slate-400 mt-2">Final calculated values after solution preparation.</p>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Concentration */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <FlaskConical className="text-cyan-400" />
            <h2 className="text-xl font-bold">Concentration</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Concentration</span>
              <span className="text-cyan-400 font-bold">{val(simulation.concentration).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Molarity</span>
              <span className="text-green-400 font-bold">{val(simulation.molarity).toFixed(2)} M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Moles</span>
              <span>{val(simulation.moles).toFixed(3)} mol</span>
            </div>
          </div>
        </div>

        {/* Physical Properties */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="text-green-400" />
            <h2 className="text-xl font-bold">Physical Properties</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Saturation</span>
              <span className="text-pink-400 font-bold">{val(simulation.saturation).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Conductivity</span>
              <span className="text-blue-400 font-bold">{val(simulation.conductivity).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dissolved</span>
              <span className="text-yellow-400 font-bold">{val(simulation.dissolvedPercent).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Solution Information */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Droplets className="text-blue-400" />
            <h2 className="text-xl font-bold">Solution Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between"><span>Solvent</span><span>{simulation.solvent || "N/A"}</span></div>
            <div className="flex justify-between"><span>Solute</span><span>{simulation.solute || "N/A"}</span></div>
            <div className="flex justify-between"><span>Mass</span><span>{val(simulation.mass).toFixed(2)} g</span></div>
            <div className="flex justify-between"><span>Volume</span><span>{val(simulation.volume).toFixed(0)} mL</span></div>
          </div>
        </div>

        {/* Environment */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Thermometer className="text-orange-400" />
            <h2 className="text-xl font-bold">Environment</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Temperature</span>
              <span className="text-orange-400 font-bold">{val(temperature).toFixed(0)}°C</span>
            </div>
            <div className="flex justify-between"><span>Colour</span><span>{simulation.color || "Clear"}</span></div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className={val(simulation.dissolvedPercent) >= 100 ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
                {val(simulation.dissolvedPercent) >= 100 ? "Complete" : "In Progress"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="text-cyan-400" />
          <h2 className="text-xl font-bold">Experiment Summary</h2>
        </div>
        <div className="space-y-3 text-slate-300">
          <p><strong>Solution:</strong> {simulation.solute} dissolved in {simulation.solvent}.</p>
          <p><strong>Concentration:</strong> {val(simulation.concentration).toFixed(2)}</p>
          <p><strong>Molarity:</strong> {val(simulation.molarity).toFixed(2)} M</p>
          <p><strong>Saturation:</strong> {val(simulation.saturation).toFixed(1)}%</p>
          <p><strong>Temperature:</strong> {val(temperature).toFixed(0)}°C</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsTab;