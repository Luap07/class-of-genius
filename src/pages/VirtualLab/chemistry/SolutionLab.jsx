// src/pages/labs/chemistry/SolutionLab.jsx
import React, { useState } from "react";

// UI
import LabNavigation from "../../../components/ui/LabNavigation";
import StatusPanel from "../../../components/solution/StatusPanel";
import Notebook from "../../../components/ui/Notebook";
import TutorPanel from "../../../components/ui/TutorPanel";

// Equipment
import Beaker from "../../../components/solution/Beaker";
import SoluteBottle from "../../../components/solution/SoluteBottle";
import SolventBottle from "../../../components/solution/SolventBottle";
import Stirrer from "../../../components/solution/Stirrer";
import HotPlate from "../../../components/solution/HotPlate";

// Tabs
import SetupTab from "../../../components/tabs/SetupTab";
import EquipmentTab from "../../../components/tabs/EquipmentTab";
import MonitorTab from "../../../components/tabs/MonitorTab";
import ResultsTab from "../../../components/tabs/ResultsTab";

// Controls
import ChemicalSelector from "../../../components/solution/ChemicalSelector";
import VolumeSlider from "../../../components/solution/VolumeSlider";
import ConcentrationInput from "../../../components/solution/ConcentrationInput";
import SolutionControls from "../../../components/solution/SolutionControls";

// Simulation
import SolutionEngine from "../../../components/solution/SolutionEngine";
import SolutionMonitor from "../../../components/solution/SolutionMonitor";
import SolutionGraph from "../../../components/solution/SolutionGraph";
import DissolveAnimation from "../../../components/solution/DissolveAnimation";

const SolutionLab = () => {
  const [activeTab, setActiveTab] = useState("experiment");
  const [running, setRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  
  const [solute, setSolute] = useState("Sodium Chloride (NaCl)");
  const [solvent, setSolvent] = useState("Water (H₂O)");
  const [soluteMass, setSoluteMass] = useState(5);
  const [solventVolume, setSolventVolume] = useState(100);
  const [temperature, setTemperature] = useState(25);
  const [heating, setHeating] = useState(false);

  const simulation = SolutionEngine({
    running,
    autoMode,
    solute,
    solvent,
    soluteMass,
    solventVolume,
    temperature,
  });

  const handleReset = () => {
    setRunning(false);
    setAutoMode(false);
    setHeating(false);
    setTemperature(25);
    setSolute("Sodium Chloride (NaCl)");
    setSolvent("Water (H₂O)");
    setSoluteMass(5);
    setSolventVolume(100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <LabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "experiment" && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Simulation & Status */}
            <div className="col-span-8 space-y-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
                <h1 className="text-3xl font-bold mb-3">🧪 Solution Preparation Laboratory</h1>
                <div className="relative h-[400px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <DissolveAnimation running={running} dissolvedPercent={simulation.dissolvedPercent} />
                  <div className="absolute left-16 top-20"><Beaker liquidLevel={simulation.dissolvedPercent} liquidColor={simulation.color} /></div>
                  <div className="absolute right-20 top-16"><SoluteBottle solute={solute} running={running} color={simulation.color} dissolvedPercent={simulation.dissolvedPercent} /></div>
                  <div className="absolute right-20 top-[240px]"><SolventBottle /></div>
                  <div className="absolute left-64 bottom-12"><Stirrer running={running} /></div>
                  <div className="absolute left-8 bottom-8"><HotPlate power={running} heating={running && temperature > 25} temperature={temperature} /></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <StatusPanel isRunning={running} {...simulation} temperature={temperature} />
                <Notebook experiment="Solution Preparation" concentration={simulation.concentration} molarity={simulation.molarity} solvent={simulation.solvent} solute={simulation.solute} />
              </div>
            </div>

            {/* Right Column: Controls & Monitor */}
            <div className="col-span-4 space-y-5">
              <ChemicalSelector solute={solute} solvent={solvent} setSolute={setSolute} setSolvent={setSolvent} />
              <ConcentrationInput soluteMass={soluteMass} setSoluteMass={setSoluteMass} />
              <VolumeSlider volume={solventVolume} setVolume={setSolventVolume} />
              <SolutionControls 
                running={running} heating={heating} soluteMass={soluteMass} solutionVolume={solventVolume}
                onMassChange={setSoluteMass} onVolumeChange={setSolventVolume}
                onStart={() => setRunning(true)} onPause={() => setRunning(false)} onReset={handleReset}
                onToggleHeating={() => { setHeating(!heating); setTemperature(heating ? 25 : 45); }}
              />
              <SolutionMonitor {...simulation} temperature={temperature} />
              <TutorPanel experiment="solution" {...simulation} temperature={temperature} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs with Full Prop Injection */}
      {activeTab === "setup" && (
        <div className="p-6">
            <SetupTab solute={solute} solvent={solvent} setSolute={setSolute} setSolvent={setSolvent} />
        </div>
      )}
      {activeTab === "equipment" && (
        <div className="p-6">
            <EquipmentTab simulation={simulation} running={running} />
        </div>
      )}
      {activeTab === "monitor" && (
        <div className="p-6">
            <MonitorTab {...simulation} temperature={temperature} />
        </div>
      )}
      {activeTab === "curve" && (
        <div className="p-6">
            <SolutionGraph molarity={simulation.molarity} concentration={simulation.concentration} dissolvedPercent={simulation.dissolvedPercent} />
        </div>
      )}
      {activeTab === "results" && (
        <div className="p-6">
            <ResultsTab running={running} simulation={simulation} solute={solute} solvent={solvent} soluteMass={soluteMass} solventVolume={solventVolume} />
        </div>
      )}
    </div>
  );
};

export default SolutionLab;