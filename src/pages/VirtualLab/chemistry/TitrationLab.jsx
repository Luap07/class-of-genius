// src/pages/TitrationLab.jsx
import React, { useEffect, useState } from "react";

// ================= UI =================
import LabNavigation from "../../../components/ui/LabNavigation";
import Toolbar from "../../../components/ui/Toolbar";
import StatusPanel from "../../../components/ui/StatusPanel";
import Notebook from "../../../components/ui/Notebook";
import TutorPanel from "../../../components/ui/TutorPanel";

// ================= Equipment =================
import Stand from "../../../components/equipment/Stand";
import Burette from "../../../components/equipment/Burette";
import Stopcock from "../../../components/equipment/Stopcock";
import Flask from "../../../components/equipment/Flask";
import Beaker from "../../../components/equipment/Beaker";
import Pipette from "../../../components/equipment/Pipette";

// ================= Simulation =================
import runTitration from "../../../components/simulation/TitrationEngine";
import DropAnimation from "../../../components/simulation/DropAnimation";
import PHDisplay from "../../../components/simulation/PHDisplay";
import TitrationCurve from "../../../components/simulation/TitrationCurve";

// ================= Tabs =================
import SetupTab from "../../../components/tabs/SetupTab";
import EquipmentTab from "../../../components/tabs/EquipmentTab";
import MonitorTab from "../../../components/tabs/MonitorTab";
import ResultsTab from "../../../components/tabs/ResultsTab";

// ================= Controls =================
import ChemicalSelector from "../../../components/controls/ChemicalSelector";
import IndicatorSelector from "../../../components/controls/IndicatorSelector";
import VolumeSlider from "../../../components/controls/VolumeSlider";
import ConcentrationInput from "../../../components/controls/ConcentrationInput";
import ExperimentControls from "../../../components/controls/ExperimentControls";

const TitrationLab = () => {
  const [activeTab, setActiveTab] = useState("experiment");
  const [acid, setAcid] = useState("HCl");
  const [base, setBase] = useState("NaOH");
  const [indicator, setIndicator] = useState("Phenolphthalein");
  const [acidConcentration, setAcidConcentration] = useState(0.10);
  const [baseConcentration, setBaseConcentration] = useState(0.10);
  const [volumeAdded, setVolumeAdded] = useState(0);
  const [running, setRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [stopcockOpen, setStopcockOpen] = useState(false);
  const [flowRate, setFlowRate] = useState(50);
  const [notes, setNotes] = useState("");

  const handleStart = () => {
    if (!autoMode) {
      setRunning(true);
      return;
    }
    if (!stopcockOpen) {
      alert("Open the stopcock first.");
      return;
    }
    setRunning(true);
  };

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setAutoMode(false);
    setStopcockOpen(false);
    setFlowRate(50);
    setVolumeAdded(0);
    setNotes("");
  };

  const simulation = runTitration({
    acid,
    base,
    indicator,
    acidConcentration,
    baseConcentration,
    acidVolume: 25,
    titrantAdded: volumeAdded,
  });

  useEffect(() => {
    if (!running || !autoMode || !stopcockOpen) return;
    const interval = setInterval(() => {
      setVolumeAdded((prev) => {
        const increment = flowRate / 1000;
        const next = Math.min(prev + increment, 50);
        if (next >= 50) {
          setRunning(false);
          setAutoMode(false);
          setStopcockOpen(false);
          return 50;
        }
        return Number(next.toFixed(2));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [running, autoMode, stopcockOpen, flowRate]);

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <LabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "experiment" && (
        <div className="p-6 space-y-6">
          <Toolbar isRunning={running} autoMode={autoMode} onStart={handleStart} onPause={handlePause} onReset={handleReset} onToggleAuto={() => setAutoMode((prev) => !prev)} />
          
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Simulation, Controls, Status, Notebook */}
            <div className="col-span-8 space-y-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
                <h1 className="text-3xl font-bold mb-8">🧪 Virtual Titration Laboratory</h1>
                <div className="relative h-[283vh] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <DropAnimation isDropping={running && autoMode && stopcockOpen} color="#38bdf8" x="185px" startY={180} endY={420} />
                  <div className="absolute left-10 top-20"><Stand /></div>
                  <div className="absolute left-28 top-20"><Burette volume={simulation.buretteVolume} isRunning={running} /></div>
                  <div className="absolute left-40 top-[800px]"><Stopcock isOpen={stopcockOpen} flowRate={flowRate} onToggle={setStopcockOpen} onFlowRateChange={setFlowRate} /></div>
                  <div className="absolute left-[30px] bottom-20"><Flask color={simulation.flaskColor} volume={simulation.flaskVolume} endpointReached={simulation.endpointReached} /></div>
                  <div className="absolute right-6 bottom-20"><Beaker liquidLevel={Math.min(100, (simulation.flaskVolume / 75) * 100)} liquidColor={simulation.flaskColor} label="Waste Beaker" /></div>
                  <div className="absolute right-12 top-20"><Pipette /></div>
                </div>
              </div>

              {/* Controls and Monitor */}
              <div className="grid grid-cols-2 gap-6">
                <ExperimentControls isRunning={running} autoMode={autoMode} onStart={handleStart} onPause={handlePause} onReset={handleReset} onToggleAuto={() => setAutoMode((prev) => !prev)} />
                <PHDisplay pH={simulation.ph} endpointReached={simulation.endpointReached} />
              </div>

              {/* Status and Notebook */}
              <div className="grid grid-cols-2 gap-6">
                <StatusPanel isRunning={running} acid={acid} base={base} indicator={indicator} acidConcentration={acidConcentration} baseConcentration={baseConcentration} ph={simulation.ph} flaskVolume={simulation.flaskVolume} buretteVolume={simulation.buretteVolume} volumeAdded={simulation.titrantAdded} endpointVolume={simulation.endpointVolume} endpointReached={simulation.endpointReached} flaskColor={simulation.flaskColor} />
                <Notebook experiment="Acid-Base Titration" acid={acid} base={base} indicator={indicator} acidConcentration={acidConcentration} baseConcentration={baseConcentration} acidVolume={25} endpointVolume={simulation.endpointVolume} ph={simulation.ph} observations={notes} />
              </div>
            </div>

            {/* Right Column: Settings and Stats */}
            <div className="col-span-4 space-y-5">
              <ChemicalSelector acid={acid} base={base} setAcid={setAcid} setBase={setBase} />
              <IndicatorSelector indicator={indicator} setIndicator={setIndicator} />
              <ConcentrationInput acidConcentration={acidConcentration} baseConcentration={baseConcentration} setAcidConcentration={setAcidConcentration} setBaseConcentration={setBaseConcentration} />
              <VolumeSlider volume={volumeAdded} setVolume={setVolumeAdded} />
              
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                <h2 className="text-lg font-bold mb-4">📊 Live Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-slate-400">Volume Added</span><span className="font-semibold text-cyan-400">{simulation.titrantAdded.toFixed(2)} mL</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Current pH</span><span className="font-semibold text-green-400">{simulation.ph.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Endpoint</span><span className={simulation.endpointReached ? "text-pink-400 font-bold" : "text-yellow-400 font-bold"}>{simulation.endpointReached ? "Reached" : "Waiting"}</span></div>
                </div>
              </div>

              <TutorPanel acid={acid} base={base} indicator={indicator} ph={simulation.ph} volumeAdded={simulation.titrantAdded} endpointReached={simulation.endpointReached} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {activeTab === "curve" && <div className="p-6"><TitrationCurve endpointVolume={simulation.endpointVolume} currentVolume={simulation.titrantAdded} /></div>}
      {activeTab === "monitor" && <div className="p-6"><MonitorTab running={running} simulation={simulation} acid={acid} base={base} indicator={indicator} acidConcentration={acidConcentration} baseConcentration={baseConcentration} /></div>}
      {activeTab === "results" && <div className="p-6"><ResultsTab running={running} acid={acid} base={base} indicator={indicator} acidConcentration={acidConcentration} baseConcentration={baseConcentration} notes={notes} simulation={simulation} /></div>}
      {activeTab === "setup" && <div className="p-6"><SetupTab acid={acid} base={base} indicator={indicator} acidConcentration={acidConcentration} baseConcentration={baseConcentration} volumeAdded={volumeAdded} setAcid={setAcid} setBase={setBase} setIndicator={setIndicator} setAcidConcentration={setAcidConcentration} setBaseConcentration={setBaseConcentration} setVolumeAdded={setVolumeAdded} /></div>}
      {activeTab === "equipment" && <div className="p-6"><EquipmentTab simulation={simulation} running={running} stopcockOpen={stopcockOpen} flowRate={flowRate} setStopcockOpen={setStopcockOpen} setFlowRate={setFlowRate} /></div>}
    </div>
  );
};

export default TitrationLab;