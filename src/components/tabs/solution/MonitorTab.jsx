// src/components/tabs/MonitorTab.jsx

import React from "react";
import {
  Activity,
  Thermometer,
  Droplets,
  FlaskConical,
  Beaker,
  Zap,
  CheckCircle2,
} from "lucide-react";

const MonitorTab = ({
  simulation = {},
  running = false,
  temperature = 25,
}) => {
  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <h1 className="text-3xl font-bold text-cyan-400">
          📡 Live Solution Monitor
        </h1>

        <p className="text-slate-400 mt-2">
          Monitor the preparation of your solution in real time.
        </p>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-2 gap-6">

        {/* Experiment Status */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-2 mb-5">

            <Activity className="text-green-400" />

            <h2 className="text-xl font-bold">
              Experiment Status
            </h2>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span>Status</span>

              <span
                className={
                  running
                    ? "text-green-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                {running ? "Running" : "Stopped"}
              </span>

            </div>

            <div className="flex justify-between">

              <span>Dissolved</span>

              <span className="text-cyan-400 font-bold">
                {(simulation.dissolvedPercent ?? 0).toFixed(1)}%
              </span>

            </div>

            <div className="flex justify-between">

              <span>Temperature</span>

              <span className="text-orange-400 font-bold">
                {temperature}°C
              </span>

            </div>

          </div>

        </div>

        {/* Concentration */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-2 mb-5">

            <FlaskConical className="text-cyan-400" />

            <h2 className="text-xl font-bold">
              Concentration
            </h2>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span>Concentration</span>

              <span className="text-cyan-400 font-bold">
                {(simulation.concentration ?? 0).toFixed(2)}
              </span>

            </div>

            <div className="flex justify-between">

              <span>Molarity</span>

              <span className="text-green-400 font-bold">
                {(simulation.molarity ?? 0).toFixed(2)} M
              </span>

            </div>

            <div className="flex justify-between">

              <span>Moles</span>

              <span>
                {(simulation.moles ?? 0).toFixed(3)}
              </span>

            </div>

          </div>

        </div>

        {/* Solution */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-2 mb-5">

            <Beaker className="text-blue-400" />

            <h2 className="text-xl font-bold">
              Solution Information
            </h2>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between">
              <span>Solvent</span>
              <span>{simulation.solvent ?? "--"}</span>
            </div>

            <div className="flex justify-between">
              <span>Solute</span>
              <span>{simulation.solute ?? "--"}</span>
            </div>

            <div className="flex justify-between">
              <span>Mass</span>
              <span>{simulation.mass ?? 0} g</span>
            </div>

            <div className="flex justify-between">
              <span>Volume</span>
              <span>{simulation.volume ?? 0} mL</span>
            </div>

          </div>

        </div>

        {/* Physical Properties */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-2 mb-5">

            <Zap className="text-yellow-400" />

            <h2 className="text-xl font-bold">
              Physical Properties
            </h2>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span>Conductivity</span>

              <span className="text-yellow-400 font-bold">
                {(simulation.conductivity ?? 0).toFixed(2)}
              </span>

            </div>

            <div className="flex justify-between">

              <span>Saturation</span>

              <span className="text-pink-400 font-bold">
                {(simulation.saturation ?? 0).toFixed(1)}%
              </span>

            </div>

            <div className="flex justify-between">

              <span>Colour</span>

              <span>{simulation.color ?? "Clear"}</span>

            </div>

          </div>

        </div>

      </div>

      {/* Progress */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <div className="flex items-center gap-2 mb-5">

          <Droplets className="text-cyan-400" />

          <h2 className="text-xl font-bold">
            Dissolution Progress
          </h2>

        </div>

        <div className="w-full h-5 rounded-full bg-slate-800 overflow-hidden">

          <div
            className="h-full bg-cyan-500 transition-all duration-500"
            style={{
              width: `${simulation.dissolvedPercent ?? 0}%`,
            }}
          />

        </div>

        <div className="mt-3 text-center text-cyan-400 font-bold">

          {(simulation.dissolvedPercent ?? 0).toFixed(1)}%

        </div>

      </div>

      {/* Conclusion */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <div className="flex items-center gap-2 mb-5">

          <CheckCircle2 className="text-green-400" />

          <h2 className="text-xl font-bold">
            Live Analysis
          </h2>

        </div>

        <p className="text-slate-300 leading-7">

          {running
            ? "The solution preparation is currently in progress. The monitor updates automatically as the solute dissolves, concentration changes, and temperature affects the solution."
            : "The experiment is currently stopped. Start the experiment to observe live concentration, conductivity, saturation, and dissolution progress."}

        </p>

      </div>

    </div>
  );
};

export default MonitorTab;