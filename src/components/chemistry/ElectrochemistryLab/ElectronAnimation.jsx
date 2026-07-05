// src/pages/labs/chemistry/components/ElectronAnimation.jsx

import React from "react";
import { Zap } from "lucide-react";
import useElectronFlow from "../../../hooks/ElectrochemistryLab/useElectronFlow";

const ElectronAnimation = ({
  running = false,
  voltage = 0,
  direction = "left-to-right",
  anode = "Zn",
  cathode = "Cu",
}) => {
  const {
    electrons,
    speed,
  } = useElectronFlow({
    running,
    voltage,
    direction,
  });

  return (
    <div className="bg-slate-900  rounded-2xl border border-slate-700 p-6">

      {/* Header */}

      <div className="flex items-center   gap-3 mb-46">

        <Zap className="w-7 h-7 text-yellow-400" />

        <div>

          <h2 className="text-xl font-bold text-white">
            Electron Flow
          </h2>

          <p className="text-slate-400 text-sm">
            Electrons move through the external wire.
          </p>

        </div>

      </div>

      {/* Labels */}

      <div className="flex justify-between items-center mb-4">

        <div className="text-center">

          <h3 className="text-red-400 text-lg font-bold">
            {anode}
          </h3>

          <p className="text-slate-400 text-sm">
            Anode
          </p>

        </div>

        <div className="text-center">

          <h3 className="text-green-400 text-lg font-bold">
            {cathode}
          </h3>

          <p className="text-slate-400 text-sm">
            Cathode
          </p>

        </div>

      </div>

      {/* Wire */}

      <div className="relative h-20 rounded-full bg-slate-800 border border-slate-600 overflow-hidden">

        {/* Wire */}

        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-slate-500" />

        {/* Electrons */}

        {running &&
          electrons.map((electron) => (
            <div
              key={electron.id}
              className="absolute transition-transform duration-75"
              style={{
                left: `${electron.x}%`,
                top: `${electron.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80 animate-pulse" />

              <div className="text-[10px] text-cyan-300 text-center mt-1">
                e⁻
              </div>

            </div>
          ))}

      </div>

      {/* Direction */}

      <div className="mt-6 flex justify-center">

        <div className="px-5 py-2 rounded-full bg-slate-800 border border-slate-700">

          <span className="text-cyan-400 font-semibold">

            {direction === "left-to-right"
              ? `${anode}  →  ${cathode}`
              : `${cathode}  →  ${anode}`}

          </span>

        </div>

      </div>

      {/* Speed */}

      <div className="mt-8">

        <div className="flex justify-between text-sm mb-2">

          <span className="text-slate-400">
            Electron Speed
          </span>

          <span className="text-cyan-400 font-semibold">
            {speed.toFixed(1)}×
          </span>

        </div>

        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300"
            style={{
              width: `${Math.min(speed * 12.5, 100)}%`,
            }}
          />

        </div>

      </div>

      {/* Information */}

      <div className="mt-8 grid grid-cols-2 gap-4">

        <div className="bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Source
          </p>

          <h3 className="text-red-400 text-xl font-bold mt-1">
            {anode}
          </h3>

        </div>

        <div className="bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Destination
          </p>

          <h3 className="text-green-400 text-xl font-bold mt-1">
            {cathode}
          </h3>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-8 border-t border-slate-700 pt-5">

        <p className="text-slate-400 text-sm leading-6">

          Electrons always travel through the external wire from the
          <span className="text-red-400 font-semibold"> anode </span>

          to the

          <span className="text-green-400 font-semibold"> cathode </span>

          in a spontaneous galvanic cell.

        </p>

      </div>

    </div>
  );
};

export default ElectronAnimation;