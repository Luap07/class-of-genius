// src/components/tabs/SetupTab.jsx

import React from "react";
import {
  FlaskConical,
  Beaker,
  Droplets,
  Shield,
  Thermometer,
  CheckCircle2,
} from "lucide-react";

const SetupTab = ({
  experiment = "Solution Preparation",

  solute = "Sodium Chloride (NaCl)",
  solvent = "Water (H₂O)",

  soluteMass = 5,
  solventVolume = 100,

  temperature = 25,
}) => {
  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <h1 className="text-3xl font-bold text-cyan-400">
          ⚙️ Experiment Setup
        </h1>

        <p className="mt-3 text-slate-400">
          Configure the solution before beginning the experiment.
        </p>

      </div>

      {/* Grid */}

      <div className="grid grid-cols-2 gap-6">

        {/* Experiment */}

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

          <div className="flex items-center gap-2 mb-5">

            <FlaskConical className="text-cyan-400" />

            <h2 className="text-xl font-bold">
              Experiment
            </h2>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between">
              <span className="text-slate-400">
                Name
              </span>

              <span className="font-semibold">
                {experiment}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                Solute
              </span>

              <span>{solute}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                Solvent
              </span>

              <span>{solvent}</span>
            </div>

          </div>

        </div>

        {/* Current Settings */}

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

          <div className="flex items-center gap-2 mb-5">

            <Thermometer className="text-orange-400" />

            <h2 className="text-xl font-bold">
              Current Settings
            </h2>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between">
              <span>Solute Mass</span>

              <span className="text-cyan-400 font-bold">
                {soluteMass} g
              </span>
            </div>

            <div className="flex justify-between">
              <span>Solvent Volume</span>

              <span className="text-blue-400 font-bold">
                {solventVolume} mL
              </span>
            </div>

            <div className="flex justify-between">
              <span>Temperature</span>

              <span className="text-orange-400 font-bold">
                {temperature}°C
              </span>
            </div>

          </div>

        </div>

        {/* Equipment */}

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

          <div className="flex items-center gap-2 mb-5">

            <Beaker className="text-green-400" />

            <h2 className="text-xl font-bold">
              Equipment Required
            </h2>

          </div>

          <ul className="space-y-3">

            <li>✔ Laboratory Beaker</li>

            <li>✔ Measuring Cylinder</li>

            <li>✔ Stirring Rod / Magnetic Stirrer</li>

            <li>✔ Digital Balance</li>

            <li>✔ Hot Plate</li>

            <li>✔ Thermometer</li>

          </ul>

        </div>

        {/* Chemicals */}

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

          <div className="flex items-center gap-2 mb-5">

            <Droplets className="text-blue-400" />

            <h2 className="text-xl font-bold">
              Chemicals
            </h2>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between">
              <span>Solute</span>

              <span>{solute}</span>
            </div>

            <div className="flex justify-between">
              <span>Solvent</span>

              <span>{solvent}</span>
            </div>

            <div className="flex justify-between">
              <span>Purity</span>

              <span>Analytical Grade</span>
            </div>

          </div>

        </div>

      </div>

      {/* Objectives */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

        <div className="flex items-center gap-2 mb-5">

          <CheckCircle2 className="text-green-400" />

          <h2 className="text-xl font-bold">
            Objectives
          </h2>

        </div>

        <ul className="space-y-3 text-slate-300">

          <li>• Prepare a standard solution accurately.</li>

          <li>• Observe dissolution of the solute.</li>

          <li>• Investigate temperature effects.</li>

          <li>• Calculate concentration and molarity.</li>

          <li>• Observe saturation changes.</li>

        </ul>

      </div>

      {/* Safety */}

      <div className="bg-slate-900 rounded-2xl border border-red-800 p-6">

        <div className="flex items-center gap-2 mb-5">

          <Shield className="text-red-400" />

          <h2 className="text-xl font-bold text-red-400">
            Laboratory Safety
          </h2>

        </div>

        <ul className="space-y-3 text-slate-300">

          <li>• Wear safety goggles.</li>

          <li>• Handle chemicals carefully.</li>

          <li>• Avoid contamination.</li>

          <li>• Wash glassware before use.</li>

          <li>• Turn off the hot plate after use.</li>

          <li>• Dispose of chemicals properly.</li>

        </ul>

      </div>

    </div>
  );
};

export default SetupTab;