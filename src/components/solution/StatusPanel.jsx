// src/components/solution/SolutionStatusPanel.jsx

import React from "react";
import {
  Activity,
  Thermometer,
  Beaker,
  FlaskConical,
  Droplets,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";

const Row = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-800 last:border-b-0">
    <span className="text-slate-400">{label}</span>
    <span className={`font-semibold ${color}`}>
      {value}
    </span>
  </div>
);

const StatusPanel = ({
  isRunning = false,

  solute = "None",
  solvent = "None",

  temperature = 25,

  mass = 0,
  volume = 0,

  concentration = 0,
  molarity = 0,

  conductivity = "Low",
  saturation = "Unsaturated",

  dissolvedPercent = 0,

  color = "#3b82f6",
}) => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 h-full">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-7 h-7 text-cyan-400" />
        <div>
          <h2 className="text-xl font-bold text-white">
            Solution Status
          </h2>
          <p className="text-slate-400 text-sm">
            Live preparation monitor
          </p>
        </div>
      </div>

      {/* Status */}

      <div
        className={`rounded-xl p-4 mb-6 border ${
          isRunning
            ? "bg-green-500/10 border-green-500"
            : "bg-yellow-500/10 border-yellow-500"
        }`}
      >
        <div className="flex items-center gap-3">

          {isRunning ? (
            <CheckCircle2 className="text-green-400 w-6 h-6 animate-pulse" />
          ) : (
            <AlertCircle className="text-yellow-400 w-6 h-6" />
          )}

          <div>
            <h3 className="font-bold text-lg">
              {isRunning
                ? "Preparing Solution"
                : "Ready"}
            </h3>

            <p className="text-slate-300 text-sm">
              {isRunning
                ? "Solution preparation is running."
                : "Configure the experiment and press Start."}
            </p>
          </div>

        </div>
      </div>

      {/* Chemicals */}

      <div className="mb-6">

        <h3 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <FlaskConical size={18} />
          Chemicals
        </h3>

        <Row
          label="Solvent"
          value={solvent}
          color="text-blue-400"
        />

        <Row
          label="Solute"
          value={solute}
          color="text-green-400"
        />

      </div>

      {/* Measurements */}

      <div className="mb-6">

        <h3 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <Beaker size={18} />
          Measurements
        </h3>

        <Row
          label="Mass"
          value={`${Number(mass).toFixed(2)} g`}
          color="text-orange-400"
        />

        <Row
          label="Volume"
          value={`${Number(volume).toFixed(2)} mL`}
          color="text-cyan-400"
        />

        <Row
          label="Temperature"
          value={`${Number(temperature).toFixed(1)} °C`}
          color="text-red-400"
        />

        <Row
          label="Concentration"
          value={`${Number(concentration).toFixed(2)} g/L`}
          color="text-purple-400"
        />

        <Row
          label="Molarity"
          value={`${Number(molarity).toFixed(3)} M`}
          color="text-pink-400"
        />

      </div>

      {/* Solution Properties */}

      <div className="mb-6">

        <h3 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <Zap size={18} />
          Solution Properties
        </h3>

        <Row
          label="Conductivity"
          value={conductivity}
          color="text-yellow-400"
        />

        <Row
          label="Saturation"
          value={saturation}
          color={
            saturation === "Saturated"
              ? "text-red-400"
              : "text-green-400"
          }
        />

        <Row
          label="Dissolved"
          value={`${Number(dissolvedPercent).toFixed(0)} %`}
          color="text-cyan-400"
        />

      </div>

      {/* Progress */}

      <div className="mb-6">

        <div className="flex justify-between mb-2">
          <span className="text-slate-400">
            Dissolution Progress
          </span>

          <span className="font-semibold text-cyan-400">
            {Number(dissolvedPercent).toFixed(0)}%
          </span>
        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">

          <div
            className="h-full bg-cyan-400 transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, dissolvedPercent)
              )}%`,
            }}
          />

        </div>

      </div>

      {/* Solution Colour */}

      <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">
            <Droplets className="text-cyan-400" size={18} />
            <span className="text-slate-300">
              Solution Colour
            </span>
          </div>

          <div className="flex items-center gap-3">

            <div
              className="w-6 h-6 rounded-full border border-white"
              style={{
                backgroundColor: color,
              }}
            />

            <span className="text-white font-semibold">
              Active
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StatusPanel;