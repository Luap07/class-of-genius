// src/pages/labs/chemistry/components/SaltBridge.jsx

import React from "react";
import { Link2, ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { SALT_BRIDGES } from "../../../data/ElectrochemistryLab/electrodes";

const SaltBridge = ({
  value = "KNO₃",
  onChange,
  connected = true,
  running = false,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <Link2 className="w-7 h-7 text-cyan-400" />

        <div>
          <h2 className="text-xl font-bold text-white">
            Salt Bridge
          </h2>

          <p className="text-slate-400 text-sm">
            Maintains electrical neutrality between the half-cells.
          </p>
        </div>

      </div>

      {/* Selection */}

      <div className="mb-8">

        <label className="block text-sm text-slate-400 mb-2">
          Salt Bridge Solution
        </label>

        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
        >
          {SALT_BRIDGES.map((bridge) => (
            <option
              key={bridge}
              value={bridge}
            >
              {bridge}
            </option>
          ))}
        </select>

      </div>

      {/* Visual */}

      <div className="flex justify-center mb-8">

        <div className="flex items-center w-full max-w-md">

          <div className="w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
            <span className="text-blue-300 font-bold">
              A
            </span>
          </div>

          <div className="flex-1 relative mx-3">

            <div className="h-6 rounded-full bg-slate-700 overflow-hidden border border-cyan-500">

              <div
                className={`h-full transition-all duration-500 ${
                  connected
                    ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-400"
                    : "bg-slate-700"
                }`}
              />

            </div>

            {running && connected && (
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <ArrowLeftRight className="w-5 h-5 text-white" />
              </div>
            )}

          </div>

          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
            <span className="text-emerald-300 font-bold">
              C
            </span>
          </div>

        </div>

      </div>

      {/* Status */}

      <div className="grid md:grid-cols-2 gap-4">

        <div className="bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Selected Bridge
          </p>

          <h3 className="text-cyan-400 text-xl font-bold mt-2">
            {value}
          </h3>

        </div>

        <div className="bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Connection Status
          </p>

          <div className="flex items-center gap-2 mt-2">

            <CheckCircle2
              className={`w-5 h-5 ${
                connected
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            />

            <span
              className={`font-semibold ${
                connected
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {connected
                ? "Connected"
                : "Disconnected"}
            </span>

          </div>

        </div>

      </div>

      {/* Ion Flow */}

      <div className="mt-8 bg-slate-800 rounded-xl p-4">

        <h3 className="text-white font-semibold mb-3">
          Ion Movement
        </h3>

        <div className="space-y-2 text-sm">

          <div className="flex justify-between">
            <span className="text-slate-400">
              Anions
            </span>

            <span className="text-yellow-300">
              → Anode
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">
              Cations
            </span>

            <span className="text-cyan-300">
              → Cathode
            </span>
          </div>

        </div>

      </div>

      {/* Explanation */}

      <div className="mt-8 border-t border-slate-700 pt-5">

        <p className="text-sm text-slate-400 leading-6">
          The salt bridge allows ions to move between the two half-cells,
          preventing charge build-up while completing the electrical circuit.
          Without a salt bridge, the reaction quickly stops because electrical
          neutrality cannot be maintained.
        </p>

      </div>

    </div>
  );
};

export default SaltBridge;