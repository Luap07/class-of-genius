// src/components/tabs/solution/EquipmentTab.jsx

import React from "react";
import {
  Beaker,
  TestTube,
  Droplets,
  Thermometer,
  FlaskConical,
  CheckCircle,
} from "lucide-react";

const EquipmentTab = ({
  solute = "",
  solvent = "",
  soluteMass = 0,
  solventVolume = 0,
  temperature = 25,
  running = false,
  simulation = {},
}) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Laboratory Equipment</h1>
        <p className="text-slate-400">
          Equipment currently being used for the preparation of the solution.
        </p>
      </div>

      {/* Equipment Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Beaker */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Beaker className="text-cyan-400" size={28} />
            <h2 className="text-xl font-bold">Beaker</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Capacity</span>
              <span>250 mL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Volume</span>
              <span className="text-cyan-400 font-bold">{Number(solventVolume ?? 0).toFixed(0)} mL</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-green-400">Ready</span>
            </div>
          </div>
        </div>

        {/* Solute */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <FlaskConical className="text-green-400" size={28} />
            <h2 className="text-xl font-bold">Solute Bottle</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Chemical</span>
              <span className="text-right">{solute}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mass</span>
              <span className="text-cyan-400 font-bold">{Number(soluteMass ?? 0).toFixed(2)} g</span>
            </div>
          </div>
        </div>

        {/* Solvent */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Droplets className="text-blue-400" size={28} />
            <h2 className="text-xl font-bold">Solvent Bottle</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Solvent</span>
              <span>{solvent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Volume</span>
              <span className="text-cyan-400 font-bold">{Number(solventVolume ?? 0).toFixed(0)} mL</span>
            </div>
          </div>
        </div>

        {/* Thermometer */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Thermometer className="text-red-400" size={28} />
            <h2 className="text-xl font-bold">Temperature</h2>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-red-400">{Number(temperature ?? 0).toFixed(0)}°</div>
            <div className="text-slate-400 mt-2">Celsius</div>
          </div>
        </div>

        {/* Stirrer */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <TestTube className="text-purple-400" size={28} />
            <h2 className="text-xl font-bold">Magnetic Stirrer</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Status</span>
              <span className={running ? "text-green-400 font-bold" : "text-slate-400"}>
                {running ? "Running" : "Stopped"}
              </span>
            </div>
          </div>
        </div>

        {/* Experiment Status */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <CheckCircle className="text-cyan-400" size={28} />
            <h2 className="text-xl font-bold">Experiment Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>State</span>
              <span className={running ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
                {running ? "Running" : "Ready"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dissolved</span>
              <span className="text-cyan-400 font-bold">
                {Number(simulation?.dissolvedPercent ?? 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Conductivity</span>
              <span className="text-green-400 font-bold">
                {Number(simulation?.conductivity ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Saturation</span>
              <span className="text-blue-400 font-bold">
                {Number(simulation?.saturation ?? 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EquipmentTab;