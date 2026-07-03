// src/components/simulation/PHDisplay.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const PHDisplay = ({
  pH = 7.0,
  temperature = 25,
  endpointReached = false,
}) => {
  // Determine pH status
  const getPHStatus = (value) => {
    if (value < 7)
      return {
        label: "Acidic",
        color: "text-red-400",
        bg: "bg-red-500",
      };

    if (value === 7)
      return {
        label: "Neutral",
        color: "text-green-400",
        bg: "bg-green-500",
      };

    return {
      label: "Basic",
      color: "text-blue-400",
      bg: "bg-blue-500",
    };
  };

  const status = getPHStatus(Number(pH));

  // Percentage for gauge (0–14)
  const percentage = Math.min(
    Math.max((Number(pH) / 14) * 100, 0),
    100
  );

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-lg">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Activity className="text-cyan-400" size={20} />

        <h2 className="text-lg font-bold">
          pH Monitor
        </h2>
      </div>

      {/* Digital Display */}
      <motion.div
        key={pH}
        initial={{
          scale: 0.9,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        className="text-center mb-6"
      >
        <div className="text-6xl font-bold text-cyan-400">
          {Number(pH).toFixed(2)}
        </div>

        <div className="text-slate-400 mt-1">
          Current pH
        </div>
      </motion.div>

      {/* Gauge */}
      <div className="mb-6">

        <div className="flex justify-between text-sm mb-2">

          <span className="text-red-400">
            0
          </span>

          <span className="text-green-400">
            7
          </span>

          <span className="text-blue-400">
            14
          </span>

        </div>

        <div className="h-4 rounded-full bg-slate-800 overflow-hidden">

          <motion.div
            animate={{
              width: `${percentage}%`,
            }}
            transition={{
              duration: 0.4,
            }}
            className={`h-full ${status.bg}`}
          />

        </div>

      </div>

      {/* Status */}
      <div className="grid gap-3">

        <div className="flex justify-between bg-slate-800 rounded-xl px-4 py-3">

          <span className="text-slate-400">
            Solution
          </span>

          <span className={`font-semibold ${status.color}`}>
            {status.label}
          </span>

        </div>

        <div className="flex justify-between bg-slate-800 rounded-xl px-4 py-3">

          <div className="flex items-center gap-2">
            <Thermometer
              className="text-cyan-400"
              size={18}
            />

            <span className="text-slate-400">
              Temperature
            </span>
          </div>

          <span className="font-semibold">
            {temperature}°C
          </span>

        </div>

      </div>

      {/* Endpoint */}
      <div
        className={`mt-5 rounded-xl p-4 border ${
          endpointReached
            ? "border-green-500/30 bg-green-500/10"
            : "border-yellow-500/30 bg-yellow-500/10"
        }`}
      >
        <div className="flex items-center gap-3">

          {endpointReached ? (
            <CheckCircle2
              className="text-green-400"
              size={20}
            />
          ) : (
            <AlertTriangle
              className="text-yellow-400"
              size={20}
            />
          )}

          <div>

            <div
              className={`font-semibold ${
                endpointReached
                  ? "text-green-300"
                  : "text-yellow-300"
              }`}
            >
              {endpointReached
                ? "Endpoint Reached"
                : "Endpoint Not Reached"}
            </div>

            <div className="text-sm text-slate-400 mt-1">
              {endpointReached
                ? "The titration has reached its equivalence point."
                : "Continue adding titrant carefully."}
            </div>

          </div>

        </div>

      </div>

      {/* pH Classification */}
      <div className="mt-5 rounded-xl bg-slate-800 p-4">

        <h3 className="font-semibold text-cyan-400 mb-3">
          pH Scale
        </h3>

        <div className="space-y-2 text-sm">

          <div className="flex justify-between">
            <span className="text-red-400">
              Strong Acid
            </span>

            <span>0 - 3</span>
          </div>

          <div className="flex justify-between">
            <span className="text-orange-400">
              Weak Acid
            </span>

            <span>4 - 6</span>
          </div>

          <div className="flex justify-between">
            <span className="text-green-400">
              Neutral
            </span>

            <span>7</span>
          </div>

          <div className="flex justify-between">
            <span className="text-cyan-400">
              Weak Base
            </span>

            <span>8 - 10</span>
          </div>

          <div className="flex justify-between">
            <span className="text-blue-400">
              Strong Base
            </span>

            <span>11 - 14</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PHDisplay;