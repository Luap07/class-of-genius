// src/pages/TitrationLab.jsx

import React, { useState } from "react";

// UI
import LabNavigation from "../../../components/ui/LabNavigation";
import Toolbar from "../../../components/ui/Toolbar";
import StatusPanel from "../../../components/ui/StatusPanel";
import Notebook from "../../../components/ui/Notebook";
import TutorPanel from "../../../components/ui/TutorPanel";

// Equipment
import Stand from "../../../components/equipment/Stand";
import Burette from "../../../components/equipment/Burette";
import Stopcock from "../../../components/equipment/Stopcock";
import Flask from "../../../components/equipment/Flask";
import Beaker from "../../../components/equipment/Beaker";
import Pipette from "../../../components/equipment/Pipette";
import IndicatorBottle from "../../../components/equipment/IndicatorBottle";

// Controls
import ChemicalSelector from "../../../components/controls/ChemicalSelector";
import IndicatorSelector from "../../../components/controls/IndicatorSelector";
import VolumeSlider from "../../../components/controls/VolumeSlider";
import ConcentrationInput from "../../../components/controls/ConcentrationInput";
import ExperimentControls from "../../../components/controls/ExperimentControls";

// Simulation UI Components ONLY
import PHDisplay from "../../../components/simulation/PHDisplay";
import TitrationCurve from "../../../components/simulation/TitrationCurve";

const TitrationLab = () => {
  // ==========================
  // State
  // ==========================

  const [activeTab, setActiveTab] = useState("experiment");

  const [acid, setAcid] = useState("HCl");
  const [base, setBase] = useState("NaOH");
  const [indicator, setIndicator] = useState("Phenolphthalein");

  const [acidConcentration, setAcidConcentration] = useState(0.1);
  const [baseConcentration, setBaseConcentration] = useState(0.1);

  const [volumeAdded, setVolumeAdded] = useState(0);

  const [running, setRunning] = useState(false);

  const [endpointReached, setEndpointReached] = useState(false);

  const [ph, setPH] = useState(7);

  const [notes, setNotes] = useState("");

  // ==========================
  // Toolbar
  // ==========================

  const handleStart = () => setRunning(true);

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setVolumeAdded(0);
    setEndpointReached(false);
    setPH(7);
    setNotes("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navigation */}

      <LabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Toolbar */}

      <div className="px-6 mt-4">

        <Toolbar
          isRunning={running}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />

      </div>

      {/* Main */}

      <div className="grid grid-cols-12 gap-6 p-6">

        {/* ================= LEFT ================= */}

        <div className="col-span-8">

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

            <h1 className="text-3xl font-bold mb-8">
              🧪 Virtual Titration Laboratory
            </h1>

            <div className="relative h-1075 rounded-2xl bg-slate-950 border border-slate-800">

              <div className="absolute left-10 top-20">
                <Stand />
              </div>

              <div className="absolute left-28 top-20">
                <Burette volume={volumeAdded} />
              </div>

              <div className="absolute left-40 top-324">
                <Stopcock />
              </div>

              <div className="absolute left-[30px] bottom-70">
                <Flask
                  color={
                    endpointReached
                      ? "#ec4899"
                      : "#38bdf8"
                  }
                />
              </div>

              <div className="absolute right-6 bottom-70">
                <Beaker />
              </div>
              <div className="absolute right-12 top-20">
                <Pipette />
              </div>

              <div className="absolute right-43 top-540">
                <IndicatorBottle />
              </div>

            </div>

          </div>

        </div>

        {/* ================= RIGHT ================= */}

        <div className="col-span-4 space-y-5">

          <ChemicalSelector
            acid={acid}
            base={base}
            setAcid={setAcid}
            setBase={setBase}
          />
    

          <IndicatorSelector
            indicator={indicator}
            setIndicator={setIndicator}
          />

          <ConcentrationInput
            acidConcentration={acidConcentration}
            baseConcentration={baseConcentration}
            setAcidConcentration={setAcidConcentration}
            setBaseConcentration={setBaseConcentration}
          />

          <VolumeSlider
            volume={volumeAdded}
            setVolume={setVolumeAdded}
          />
    <div>
        <div>
        
          </div>
    </div>
          <PHDisplay
            pH={ph}
            endpointReached={endpointReached}
          />

               <TitrationCurve
            endpointVolume={25}
            currentVolume={volumeAdded}
          />


        </div>

      </div>

      {/* Bottom Panels */}

      <div className="grid grid-cols-3 gap-6 px-6 pb-16">
        <div className="col-span-1 h-[-200px] bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <StatusPanel
          isRunning={running}
          ph={ph}
          volumeAdded={volumeAdded}
          endpointVolume={25}
          endpointReached={endpointReached}
        />

            <ExperimentControls
            isRunning={running}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
          />
            </div>
        <div className="h-385 w-80 left-3 bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <Notebook
          experiment="Acid-Base Titration"
          acid={acid}
          base={base}
          indicator={indicator}
          acidConcentration={acidConcentration}
          baseConcentration={baseConcentration}
          acidVolume={25}
          endpointVolume={25}
          ph={ph}
          observations={notes}
        />
        </div>
        <TutorPanel
          acid={acid}
          base={base}
          indicator={indicator}
          ph={ph}
          volumeAdded={volumeAdded}
          endpointVolume={25}
          endpointReached={endpointReached}
        />
        
      </div>

    </div>
  );
};

export default TitrationLab;