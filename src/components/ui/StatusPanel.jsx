// src/components/ui/StatusPanel.jsx

import React from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  TestTube2,
  Droplets,
  FlaskConical,
  Beaker,
} from "lucide-react";

const StatusRow = ({ label, value, color = "text-white" }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-b-0">
    <span className="text-slate-400">{label}</span>
    <span className={`font-semibold ${color}`}>
      {value}
    </span>
  </div>
);

const StatusPanel = ({
  isRunning,
  acid,
  base,
  indicator,
  acidConcentration,
  baseConcentration,
  ph,
  flaskVolume,
  buretteVolume,
  volumeAdded,
  endpointVolume,
  endpointReached,
  flaskColor,
}) => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 h-full">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-7 h-7 text-cyan-400" />
        <div>
          <h2 className="text-xl font-bold text-white">
            Experiment Status
          </h2>
          <p className="text-sm text-slate-400">
            Live monitoring of the titration
          </p>
        </div>
      </div>

      {/* Overall Status */}

      <div
        className={`rounded-xl p-4 mb-6 border ${
          endpointReached
            ? "bg-pink-500/10 border-pink-500"
            : isRunning
            ? "bg-green-500/10 border-green-500"
            : "bg-yellow-500/10 border-yellow-500"
        }`}
      >
        <div className="flex items-center gap-3">

          {endpointReached ? (
            <CheckCircle2 className="text-pink-400 w-6 h-6" />
          ) : isRunning ? (
            <Activity className="text-green-400 w-6 h-6 animate-pulse" />
          ) : (
            <AlertCircle className="text-yellow-400 w-6 h-6" />
          )}

          <div>
            <h3 className="font-bold text-lg">
              {endpointReached
                ? "Endpoint Reached"
                : isRunning
                ? "Experiment Running"
                : "Experiment Stopped"}
            </h3>

            <p className="text-slate-300 text-sm">
              {endpointReached
                ? "Neutralization complete."
                : isRunning
                ? "Titration is currently in progress."
                : "Ready to begin experiment."}
            </p>
          </div>

        </div>
      </div>

      {/* Chemical Information */}

      <div className="mb-6">

        <h3 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <TestTube2 size={18} />
          Chemicals
        </h3>

        <StatusRow
          label="Acid"
          value={acid}
          color="text-red-400"
        />

        <StatusRow
          label="Base"
          value={base}
          color="text-blue-400"
        />

        <StatusRow
          label="Indicator"
          value={indicator}
          color="text-purple-400"
        />

      </div>

      {/* Concentrations */}

      <div className="mb-6">

        <h3 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <Droplets size={18} />
          Concentrations
        </h3>

        <StatusRow
          label="Acid"
          value={`${acidConcentration.toFixed(2)} M`}
          color="text-red-400"
        />

        <StatusRow
          label="Base"
          value={`${baseConcentration.toFixed(2)} M`}
          color="text-blue-400"
        />

      </div>

      {/* Measurements */}

      <div className="mb-6">

        <h3 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <Beaker size={18} />
          Measurements
        </h3>

        <StatusRow
          label="Current pH"
          value={ph.toFixed(2)}
          color="text-green-400"
        />

        <StatusRow
          label="Volume Added"
          value={`${volumeAdded.toFixed(2)} mL`}
          color="text-cyan-400"
        />

        <StatusRow
          label="Flask Volume"
          value={`${flaskVolume.toFixed(2)} mL`}
          color="text-orange-400"
        />

        <StatusRow
          label="Burette Remaining"
          value={`${buretteVolume.toFixed(2)} mL`}
          color="text-indigo-400"
        />

        <StatusRow
          label="Endpoint Volume"
          value={`${endpointVolume.toFixed(2)} mL`}
          color="text-pink-400"
        />

      </div>

      {/* Flask */}

      <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">

        <h3 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <FlaskConical size={18} />
          Flask State
        </h3>

        <div className="flex items-center justify-between">

          <span className="text-slate-400">
            Solution Colour
          </span>

          <div className="flex items-center gap-3">

            <div
              className="w-5 h-5 rounded-full border border-white"
              style={{
                background: flaskColor,
              }}
            />

            <span className="font-semibold text-white">
              {flaskColor}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StatusPanel;