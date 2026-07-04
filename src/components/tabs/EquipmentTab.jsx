// src/components/tabs/EquipmentTab.jsx

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  TestTube2,
} from "lucide-react";

// Equipment
import Stand from "../equipment/Stand";
import Burette from "../equipment/Burette";
import Stopcock from "../equipment/Stopcock";
import Flask from "../equipment/Flask";
import Beaker from "../equipment/Beaker";
import Pipette from "../equipment/Pipette";
import IndicatorBottle from "../equipment/IndicatorBottle";

const EquipmentTab = ({
  running = false,

  stopcockOpen = false,
  flowRate = 50,

  simulation = {},

  onToggleStopcock = () => {},
  onFlowRateChange = () => {},
}) => {
  const equipment = [
    {
      name: "Retort Stand",
      ready: true,
      description:
        "Supports the burette during titration.",
    },
    {
      name: "Burette",
      ready: true,
      description:
        "Dispenses titrant accurately.",
    },
    {
      name: "Stopcock",
      ready: true,
      description:
        "Controls the flow of titrant.",
    },
    {
      name: "Conical Flask",
      ready: true,
      description:
        "Contains the analyte solution.",
    },
    {
      name: "Pipette",
      ready: true,
      description:
        "Transfers a measured volume of solution.",
    },
    {
      name: "Indicator Bottle",
      ready: true,
      description:
        "Provides the indicator solution.",
    },
    {
      name: "Waste Beaker",
      ready: true,
      description:
        "Collects excess solution.",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

        <div className="flex items-center gap-3">

          <TestTube2
            size={30}
            className="text-cyan-400"
          />

          <div>

            <h2 className="text-2xl font-bold">
              Laboratory Equipment
            </h2>

            <p className="text-slate-400">
              All apparatus currently available for the experiment.
            </p>

          </div>

        </div>

      </div>

      {/* Equipment Preview */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

        <div className="grid grid-cols-4 gap-10">

          <div className="flex flex-col items-center">
            <Stand />
            <p className="mt-3 font-semibold">
              Stand
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Burette
              volume={simulation.buretteVolume}
              isRunning={running}
            />
            <p className="mt-3 font-semibold">
              Burette
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Stopcock
              isOpen={stopcockOpen}
              flowRate={flowRate}
              onToggle={onToggleStopcock}
              onFlowRateChange={onFlowRateChange}
            />
            <p className="mt-3 font-semibold">
              Stopcock
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Flask
              color={simulation.flaskColor}
              volume={simulation.flaskVolume}
              endpointReached={
                simulation.endpointReached
              }
            />
            <p className="mt-3 font-semibold">
              Flask
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Beaker
              liquidLevel={70}
              liquidColor={simulation.flaskColor}
              label="Waste"
            />
            <p className="mt-3 font-semibold">
              Beaker
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Pipette />
            <p className="mt-3 font-semibold">
              Pipette
            </p>
          </div>

          <div className="flex flex-col items-center">
            <IndicatorBottle />
            <p className="mt-3 font-semibold">
              Indicator
            </p>
          </div>

        </div>

      </div>

      {/* Equipment Status */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

        <h3 className="text-xl font-bold mb-5">
          Equipment Status
        </h3>

        <div className="space-y-4">

          {equipment.map((item) => (

            <div
              key={item.name}
              className="flex justify-between items-start rounded-xl bg-slate-800 p-4"
            >

              <div>

                <h4 className="font-semibold">

                  {item.name}

                </h4>

                <p className="text-sm text-slate-400 mt-1">

                  {item.description}

                </p>

              </div>

              {item.ready ? (

                <div className="flex items-center gap-2 text-green-400">

                  <CheckCircle2 size={18} />

                  Ready

                </div>

              ) : (

                <div className="flex items-center gap-2 text-yellow-400">

                  <AlertCircle size={18} />

                  Waiting

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

      {/* Flow Information */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

        <h3 className="text-lg font-bold mb-4">

          Stopcock Information

        </h3>

        <div className="space-y-3">

          <div className="flex justify-between">

            <span className="text-slate-400">
              Status
            </span>

            <span
              className={
                stopcockOpen
                  ? "text-green-400 font-bold"
                  : "text-red-400 font-bold"
              }
            >
              {stopcockOpen
                ? "Open"
                : "Closed"}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-slate-400">
              Flow Rate
            </span>

            <span className="text-cyan-400 font-bold">

              {flowRate}%

            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default EquipmentTab;