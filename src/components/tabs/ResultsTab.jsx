// src/components/tabs/ResultsTab.jsx

import React from "react";
import {
  CheckCircle,
  XCircle,
  FlaskConical,
  Beaker,
  Droplets,
  Activity,
} from "lucide-react";

import Notebook from "../ui/Notebook";
import StatusPanel from "../ui/StatusPanel";

const ResultsTab = ({
  running = false,

  acid = "",
  base = "",
  indicator = "",

  acidConcentration = 0,
  baseConcentration = 0,

  notes = "",

  simulation = {},
}) => {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <h2 className="text-3xl font-bold mb-2">
          📋 Experiment Results
        </h2>

        <p className="text-slate-400">
          Final analysis of the completed titration experiment.
        </p>

      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-5">

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">

          <FlaskConical className="text-cyan-400 mb-3" />

          <p className="text-slate-400 text-sm">
            Acid
          </p>

          <p className="text-xl font-bold">
            {acid}
          </p>

        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">

          <Beaker className="text-green-400 mb-3" />

          <p className="text-slate-400 text-sm">
            Base
          </p>

          <p className="text-xl font-bold">
            {base}
          </p>

        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">

          <Droplets className="text-pink-400 mb-3" />

          <p className="text-slate-400 text-sm">
            Indicator
          </p>

          <p className="text-xl font-bold">
            {indicator}
          </p>

        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">

          <Activity className="text-yellow-400 mb-3" />

          <p className="text-slate-400 text-sm">
            Final pH
          </p>

          <p className="text-xl font-bold text-cyan-400">
            {simulation.ph?.toFixed(2)}
          </p>

        </div>

      </div>

      {/* Main Panels */}
      <div className="grid grid-cols-2 gap-6">

        <StatusPanel
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
        />

        <Notebook
          experiment="Acid-Base Titration"
          acid={acid}
          base={base}
          indicator={indicator}
          acidConcentration={acidConcentration}
          baseConcentration={baseConcentration}
          acidVolume={25}
          endpointVolume={simulation.endpointVolume}
          ph={simulation.ph}
          observations={notes}
        />

      </div>

      {/* Final Report */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

        <h3 className="text-2xl font-bold mb-6">
          📝 Final Report
        </h3>

        <div className="space-y-4">

          <div className="flex justify-between border-b border-slate-800 pb-3">

            <span className="text-slate-400">
              Acid Concentration
            </span>

            <span className="font-semibold">
              {acidConcentration.toFixed(2)} M
            </span>

          </div>

          <div className="flex justify-between border-b border-slate-800 pb-3">

            <span className="text-slate-400">
              Base Concentration
            </span>

            <span className="font-semibold">
              {baseConcentration.toFixed(2)} M
            </span>

          </div>

          <div className="flex justify-between border-b border-slate-800 pb-3">

            <span className="text-slate-400">
              Endpoint Volume
            </span>

            <span className="font-semibold">
              {simulation.endpointVolume?.toFixed(2)} mL
            </span>

          </div>

          <div className="flex justify-between border-b border-slate-800 pb-3">

            <span className="text-slate-400">
              Volume Added
            </span>

            <span className="font-semibold">
              {simulation.titrantAdded?.toFixed(2)} mL
            </span>

          </div>

          <div className="flex justify-between border-b border-slate-800 pb-3">

            <span className="text-slate-400">
              Final pH
            </span>

            <span className="font-semibold text-cyan-400">
              {simulation.ph?.toFixed(2)}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-slate-400">
              Endpoint Status
            </span>

            {simulation.endpointReached ? (
              <span className="flex items-center gap-2 text-green-400 font-bold">
                <CheckCircle size={18} />
                Reached
              </span>
            ) : (
              <span className="flex items-center gap-2 text-red-400 font-bold">
                <XCircle size={18} />
                Not Reached
              </span>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ResultsTab;