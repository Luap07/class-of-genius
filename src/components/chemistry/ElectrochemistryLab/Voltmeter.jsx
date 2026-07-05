// src/pages/labs/chemistry/components/Voltmeter.jsx

import React from "react";
import {
  Battery,
  Zap,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";

const Voltmeter = ({
  voltage = 0,
  running = false,
  spontaneous = true,
  powerLevel = "Low",
}) => {
  const formattedVoltage = Number(voltage).toFixed(2);

  const getStatus = () => {
    if (voltage > 0)
      return {
        text: "Spontaneous",
        icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
        color: "text-green-400",
      };

    if (voltage < 0)
      return {
        text: "Non-Spontaneous",
        icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
        color: "text-red-400",
      };

    return {
      text: "Equilibrium",
      icon: <MinusCircle className="w-5 h-5 text-yellow-400" />,
      color: "text-yellow-400",
    };
  };

  const status = getStatus();

  const meterWidth = Math.min(
    Math.max(((voltage + 3) / 6) * 100, 0),
    100
  );

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-6">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">
          <Battery className="w-8 h-8 text-cyan-400" />

          <div>
            <h2 className="text-xl font-bold text-white">
              Digital Voltmeter
            </h2>

            <p className="text-sm text-slate-400">
              Standard Cell Potential
            </p>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            running
              ? "bg-green-600/20 text-green-400"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {running ? "RUNNING" : "STOPPED"}
        </div>

      </div>

      {/* Voltage Display */}

      <div className="bg-black rounded-xl border-2 border-green-500 p-8 mb-6">

        <div className="text-center">

          <p className="text-green-500 text-sm tracking-widest uppercase">
            Voltage
          </p>

          <h1 className="text-6xl font-mono font-bold text-green-400 mt-2">
            {formattedVoltage}
          </h1>

          <p className="text-green-500 text-lg font-semibold">
            Volts
          </p>

        </div>

      </div>

      {/* Meter */}

      <div className="mb-6">

        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>-3 V</span>
          <span>0 V</span>
          <span>+3 V</span>
        </div>

        <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden">

          <div
            className={`h-full transition-all duration-500 ${
              voltage > 0
                ? "bg-gradient-to-r from-green-500 to-emerald-400"
                : voltage < 0
                ? "bg-gradient-to-r from-red-500 to-red-400"
                : "bg-yellow-400"
            }`}
            style={{
              width: `${meterWidth}%`,
            }}
          />

        </div>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-2 gap-4">

        <div className="bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Reaction Type
          </p>

          <div
            className={`flex items-center gap-2 mt-2 ${status.color}`}
          >
            {status.icon}

            <span className="font-semibold">
              {status.text}
            </span>
          </div>

        </div>

        <div className="bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Power Output
          </p>

          <div className="flex items-center gap-2 mt-2 text-cyan-400">

            <Zap className="w-5 h-5" />

            <span className="font-semibold">
              {powerLevel}
            </span>

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-6 pt-4 border-t border-slate-700 text-sm text-slate-400">

        {spontaneous
          ? "Electrons flow naturally from the anode to the cathode."
          : "An external power source is required for this reaction."}

      </div>

    </div>
  );
};

export default Voltmeter;