// src/components/tabs/SetupTab.jsx

import React from "react";
import {
  FlaskConical,
  TestTube2,
  Droplets,
  Gauge,
  Info,
  CheckCircle,
} from "lucide-react";

const SetupTab = ({
  acid = "HCl",
  base = "NaOH",
  indicator = "Phenolphthalein",

  acidConcentration = 0.1,
  baseConcentration = 0.1,

  acidVolume = 25,

  running = false,
}) => {
  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

        <div className="flex items-center gap-3 mb-3">

          <FlaskConical
            size={30}
            className="text-cyan-400"
          />

          <div>

            <h2 className="text-2xl font-bold">
              Experiment Setup
            </h2>

            <p className="text-slate-400">
              Review all experiment parameters before starting.
            </p>

          </div>

        </div>

      </div>

      {/* Configuration */}

      <div className="grid grid-cols-2 gap-6">

        {/* Chemicals */}

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">

          <h3 className="text-lg font-bold mb-5 flex items-center gap-2">

            <TestTube2
              className="text-cyan-400"
              size={20}
            />

            Chemicals

          </h3>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span className="text-slate-400">
                Acid
              </span>

              <span className="font-semibold text-red-400">
                {acid}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-400">
                Base
              </span>

              <span className="font-semibold text-blue-400">
                {base}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-400">
                Indicator
              </span>

              <span className="font-semibold text-pink-400">
                {indicator}
              </span>

            </div>

          </div>

        </div>

        {/* Concentrations */}

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">

          <h3 className="text-lg font-bold mb-5 flex items-center gap-2">

            <Gauge
              className="text-green-400"
              size={20}
            />

            Concentrations

          </h3>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span className="text-slate-400">
                Acid
              </span>

              <span className="text-green-400 font-semibold">
                {acidConcentration.toFixed(2)} M
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-400">
                Base
              </span>

              <span className="text-green-400 font-semibold">
                {baseConcentration.toFixed(2)} M
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-400">
                Initial Volume
              </span>

              <span className="text-cyan-400 font-semibold">
                {acidVolume} mL
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Procedure */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

        <h3 className="text-xl font-bold mb-5 flex items-center gap-2">

          <Info
            className="text-yellow-400"
            size={22}
          />

          Experimental Procedure

        </h3>

        <div className="space-y-3">

          {[
            "Fill the burette with the titrant solution.",
            "Measure exactly 25 mL of analyte into the conical flask.",
            "Add 2–3 drops of the selected indicator.",
            "Place the flask beneath the burette.",
            "Open the stopcock carefully.",
            "Swirl continuously while adding titrant.",
            "Stop immediately when the endpoint is reached.",
          ].map((step, index) => (

            <div
              key={index}
              className="flex items-start gap-3"
            >

              <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center font-bold">

                {index + 1}

              </div>

              <p className="text-slate-300">

                {step}

              </p>

            </div>

          ))}

        </div>

      </div>

      {/* Readiness */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

        <div className="flex items-center gap-3">

          <CheckCircle
            size={30}
            className={
              running
                ? "text-green-400"
                : "text-cyan-400"
            }
          />

          <div>

            <h3 className="font-bold text-lg">

              {running
                ? "Experiment Running"
                : "Ready to Start"}

            </h3>

            <p className="text-slate-400">

              {running
                ? "The titration is currently in progress."
                : "All settings have been configured successfully."}

            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default SetupTab;