// src/components/tabs/MonitorTab.jsx

import React from "react";
import StatusPanel from "../ui/StatusPanel";
import PHDisplay from "../simulation/PHDisplay";

const MonitorTab = ({
  experiment = "titration",

  running = false,

  simulation = {},

  acid,
  base,
  indicator,

  acidConcentration,
  baseConcentration,

  temperature,
}) => {
  return (
    <div className="grid grid-cols-2 gap-6">

      {/* ================= LEFT ================= */}

      <div className="space-y-6">

        {/* pH only for titration */}

        {experiment === "titration" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

            <h2 className="text-xl font-bold mb-5">
              🧪 Live pH
            </h2>

            <PHDisplay
              pH={simulation.ph ?? 7}
              endpointReached={simulation.endpointReached ?? false}
            />

          </div>
        )}

        {/* Solution Monitor */}

        {experiment === "solution" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

            <h2 className="text-xl font-bold mb-5">
              🧪 Solution Monitor
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Temperature
                </span>

                <span className="text-orange-400 font-bold">
                  {temperature ?? 25}°C
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Concentration
                </span>

                <span className="text-cyan-400 font-bold">
                  {(simulation.concentration ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Molarity
                </span>

                <span className="text-green-400 font-bold">
                  {(simulation.molarity ?? 0).toFixed(2)} M
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Saturation
                </span>

                <span className="text-pink-400 font-bold">
                  {(simulation.saturation ?? 0).toFixed(1)}%
                </span>
              </div>

            </div>

          </div>
        )}

        {/* Status */}

        <StatusPanel
          experiment={experiment}
          isRunning={running}

          acid={acid}
          base={base}
          indicator={indicator}

          acidConcentration={acidConcentration}
          baseConcentration={baseConcentration}

          ph={simulation.ph}

          flaskVolume={simulation.flaskVolume}
          buretteVolume={simulation.buretteVolume}

          volumeAdded={simulation.titrantAdded}
          endpointVolume={simulation.endpointVolume}
          endpointReached={simulation.endpointReached}
          flaskColor={simulation.flaskColor}

          temperature={temperature}
          concentration={simulation.concentration}
          molarity={simulation.molarity}
          saturation={simulation.saturation}
          conductivity={simulation.conductivity}
        />

      </div>

      {/* ================= RIGHT ================= */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

        <h2 className="text-xl font-bold mb-6">
          📊 Live Data
        </h2>

        {experiment === "titration" && (

          <div className="space-y-4">

            <div className="flex justify-between">
              <span>Acid</span>
              <span>{acid}</span>
            </div>

            <div className="flex justify-between">
              <span>Base</span>
              <span>{base}</span>
            </div>

            <div className="flex justify-between">
              <span>Indicator</span>
              <span>{indicator}</span>
            </div>

            <div className="flex justify-between">
              <span>Current pH</span>
              <span className="text-cyan-400 font-bold">
                {(simulation.ph ?? 7).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Titrant Added</span>
              <span className="text-green-400 font-bold">
                {(simulation.titrantAdded ?? 0).toFixed(2)} mL
              </span>
            </div>

            <div className="flex justify-between">
              <span>Endpoint</span>

              <span
                className={
                  simulation.endpointReached
                    ? "text-pink-400 font-bold"
                    : "text-yellow-400 font-bold"
                }
              >
                {simulation.endpointReached
                  ? "Reached"
                  : "Waiting"}
              </span>
            </div>

          </div>

        )}

        {experiment === "solution" && (

          <div className="space-y-4">

            <div className="flex justify-between">
              <span>Solvent</span>
              <span>{simulation.solvent}</span>
            </div>

            <div className="flex justify-between">
              <span>Solute</span>
              <span>{simulation.solute}</span>
            </div>

            <div className="flex justify-between">
              <span>Mass</span>
              <span>{simulation.mass} g</span>
            </div>

            <div className="flex justify-between">
              <span>Volume</span>
              <span>{simulation.volume} mL</span>
            </div>

            <div className="flex justify-between">
              <span>Moles</span>
              <span>
                {(simulation.moles ?? 0).toFixed(3)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Conductivity</span>
              <span className="text-cyan-400">
                {(simulation.conductivity ?? 0).toFixed(2)}
              </span>
            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default MonitorTab;