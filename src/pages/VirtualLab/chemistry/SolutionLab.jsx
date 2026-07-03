// src/pages/labs/chemistry/SolutionLab.jsx

import React, { useState } from "react";

// UI
import LabNavigation from "../../../components/ui/LabNavigation";
import Toolbar from "../../../components/ui/Toolbar";
import StatusPanel from "../../../components/ui/StatusPanel";
import Notebook from "../../../components/ui/Notebook";
import TutorPanel from "../../../components/ui/TutorPanel";

// Equipment
import Beaker from "../../../components/equipment/Beaker";
import SoluteBottle from "../../../components/equipment/SoluteBottle";
import SolventBottle from "../../../components/equipment/SolventBottle";
import Stirrer from "../../../components/equipment/Stirrer";
import HotPlate from "../../../components/equipment/HotPlate";

// Controls
import ChemicalSelector from "../../../components/controls/ChemicalSelector";
import VolumeSlider from "../../../components/controls/VolumeSlider";
import ConcentrationInput from "../../../components/controls/ConcentrationInput";
import SolutionControls from "../../../components/controls/SolutionControls";

// Simulation
import SolutionEngine from "../../../components/simulation/SolutionEngine";
import SolutionMonitor from "../../../components/simulation/SolutionMonitor";
import SolutionGraph from "../../../components/simulation/SolutionGraph";
import DissolveAnimation from "../../../components/simulation/DissolveAnimation";

const SolutionLab = () => {
  const [activeTab, setActiveTab] = useState("experiment");

  const [running, setRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  const [solute, setSolute] = useState("NaCl");
  const [solvent, setSolvent] = useState("Water");

  const [soluteMass, setSoluteMass] = useState(5);
  const [solventVolume, setSolventVolume] = useState(100);

  const [temperature, setTemperature] = useState(25);

  const simulation = SolutionEngine({
    solute,
    solvent,
    soluteMass,
    solventVolume,
    temperature,
  });

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setTemperature(25);
    setSoluteMass(5);
    setSolventVolume(100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <LabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="px-6 mt-4">
        <Toolbar
          isRunning={running}
          autoMode={autoMode}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onToggleAuto={() => setAutoMode(!autoMode)}
        />
      </div>

      {activeTab === "experiment" && (
        <>
          <div className="grid grid-cols-12 gap-6 p-6">

            <div className="col-span-8">

              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

                <h1 className="text-3xl font-bold mb-3">
                  🧪 Solution Preparation Laboratory
                </h1>

                <p className="text-slate-400 mb-8">
                  Prepare solutions, calculate concentration, observe dissolution,
                  and investigate how temperature affects solubility.
                </p>

                <div className="relative h-[700px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">

                  <DissolveAnimation
                    running={running}
                  />

                  <div className="absolute left-16 top-20">
                    <Beaker
                      liquidLevel={simulation.liquidLevel}
                      liquidColor={simulation.solutionColor}
                    />
                  </div>

                  <div className="absolute right-20 top-16">
                    <SoluteBottle />
                  </div>

                  <div className="absolute right-20 top-240">
                    <SolventBottle />
                  </div>

                  <div className="absolute left-64 bottom-12">
                    <Stirrer
                      running={running}
                    />
                  </div>

                  <div className="absolute left-8 bottom-8">
                    <HotPlate
                      temperature={temperature}
                    />
                  </div>

                </div>

              </div>

            </div>

            <div className="col-span-4 space-y-5">

              <ChemicalSelector
                solute={solute}
                solvent={solvent}
                setSolute={setSolute}
                setSolvent={setSolvent}
              />

              <ConcentrationInput
                soluteMass={soluteMass}
                setSoluteMass={setSoluteMass}
              />

              <VolumeSlider
                volume={solventVolume}
                setVolume={setSolventVolume}
              />

              <SolutionControls
                temperature={temperature}
                setTemperature={setTemperature}
              />

              <SolutionMonitor
                simulation={simulation}
              />

            </div>

          </div>

          <div className="grid grid-cols-3 gap-6 px-6 pb-10">

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

              <StatusPanel
                isRunning={running}
                temperature={temperature}
                concentration={simulation.concentration}
                dissolved={simulation.dissolved}
              />

            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

              <Notebook
                experiment="Solution Preparation"
                observations=""
                concentration={simulation.concentration}
                solvent={solvent}
                solute={solute}
              />

            </div>

            <TutorPanel
              experiment="solution"
              concentration={simulation.concentration}
              temperature={temperature}
              dissolved={simulation.dissolved}
            />

          </div>
        </>
      )}

      {activeTab === "monitor" && (
        <div className="p-6">
          <SolutionMonitor simulation={simulation} />
        </div>
      )}

      {activeTab === "curve" && (
        <div className="p-6">
          <SolutionGraph simulation={simulation} />
        </div>
      )}
    </div>
  );
};

export default SolutionLab;