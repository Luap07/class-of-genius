// src/pages/VirtualLab/chemistry/AcidBaseLab.jsx

import { useState } from "react";

import Toolbar from "../../../components/chemistry/acidBase/Toolbar";
import ChemicalShelf from "../../../components/chemistry/acidBase/ChemicalShelf";
import Beaker from "../../../components/chemistry/acidBase/Beaker";
import PHMeter from "../../../components/chemistry/acidBase/PHMeter";
import IndicatorPanel from "../../../components/chemistry/acidBase/IndicatorPanel";
import ObservationPanel from "../../../components/chemistry/acidBase/ObservationPanel";
import AcidBaseControls from "../../../components/chemistry/acidBase/AcidBaseControls";
import ResultCard from "../../../components/chemistry/acidBase/ResultCard";
import MoleculeAnimation from "../../../components/chemistry/acidBase/MoleculeAnimation";
import BubbleEffect from "../../../components/chemistry/acidBase/BubbleEffect";
import HeatEffect from "../../../components/chemistry/acidBase/HeatEffect";
import NeutralizationEffect from "../../../components/chemistry/acidBase/NeutralizationEffect";
import Dropper from "../../../components/chemistry/acidBase/Dropper";
import TestTube from "../../../components/chemistry/acidBase/TestTube";
import Flask from "../../../components/chemistry/acidBase/Flask";
import SolutionRenderer from "../../../components/chemistry/acidBase/SolutionRenderer";

import acidBaseEngine from "../../../engine/acidBase/AcidBaseEngine";

export default function AcidBaseLab() {
  const [selectedAcid, setSelectedAcid] = useState(null);
  const [selectedBase, setSelectedBase] = useState(null);

  const [products, setProducts] = useState([]);

  const [ph, setPh] = useState(7);

  const [indicator, setIndicator] = useState("Litmus");

  const [temperature, setTemperature] = useState(25);

  const [playing, setPlaying] = useState(false);

  const [speed, setSpeed] = useState(1);

  const [solutionColor, setSolutionColor] =
    useState("#64748b");

  const [observation, setObservation] = useState(
    "Select an acid and a base to begin."
  );

  const [reactionResult, setReactionResult] =
    useState(null);

  /* ==========================================
      START EXPERIMENT
  ========================================== */

  const handleStartExperiment = () => {
    if (!selectedAcid || !selectedBase) {
      setObservation(
        "Please select one acid and one base."
      );
      return;
    }

    const result = acidBaseEngine.simulate({
      acid: selectedAcid,
      base: selectedBase,
      indicator,
      temperature,
    });

    setReactionResult(result);

    setProducts(result.products);

    setObservation(result.observation);

    setPh(result.ph);

    setSolutionColor(result.color);

    setPlaying(true);
  };

  /* ==========================================
      RESET
  ========================================== */

  const handleResetExperiment = () => {
    setPlaying(false);

    setProducts([]);

    setReactionResult(null);

    setSolutionColor("#64748b");

    setPh(7);

    setObservation(
      "Select an acid and a base to begin."
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col gap-4">

      {/* Toolbar */}

      <Toolbar />

      <div className="grid grid-cols-12 gap-4 flex-1">

        {/* LEFT PANEL */}

        <div className="col-span-2">

          <ChemicalShelf
            selectedAcid={selectedAcid}
            setSelectedAcid={setSelectedAcid}
            selectedBase={selectedBase}
            setSelectedBase={setSelectedBase}
          />

        </div>

        {/* CENTER PANEL */}

        <div className="col-span-7 flex flex-col gap-4">

          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center">

            <SolutionRenderer
              acid={selectedAcid}
              base={selectedBase}
              ph={ph}
              color={solutionColor}
              playing={playing}
            />

            <Beaker
                acid={selectedAcid}
                base={selectedBase}
                reaction={reactionResult}
                 playing={playing}
                />

            <Flask
             acid={selectedAcid}
             playing={playing}
            />

            <TestTube
             base={selectedBase}
             playing={playing}
            />

            <Dropper
                 acid={selectedAcid}
                 base={selectedBase}
                 playing={playing}
            />

            {playing && (
              <>
                <MoleculeAnimation
                    acid={selectedAcid}
                    base={selectedBase}
                    reaction={reactionResult}
                    playing={playing}
                    speed={speed}
                    />

                {reactionResult?.bubbles && (
                  <BubbleEffect />
                )}

                {reactionResult?.heat && (
                  <HeatEffect />
                )}

                {reactionResult?.success && (
                  <NeutralizationEffect />
                )}
              </>
            )}

          </div>

          <AcidBaseControls
            playing={playing}
            setPlaying={setPlaying}

            speed={speed}
            setSpeed={setSpeed}

            temperature={temperature}
            setTemperature={setTemperature}

            onStart={handleStartExperiment}

            onReset={handleResetExperiment}
          />

        </div>

        {/* RIGHT PANEL */}

        <div className="col-span-3 flex flex-col gap-4">

          <PHMeter
            ph={ph}
          />

          <IndicatorPanel
            indicator={indicator}
            setIndicator={setIndicator}
          />

          <ObservationPanel
            observation={observation}
            reaction={reactionResult}
            temperature={temperature}
          />

          <ResultCard
  acid={selectedAcid}
  base={selectedBase}
  products={products}
  equation={reactionResult?.equation}
  ph={ph}
  temperature={temperature}
  observation={observation}
  reactionComplete={reactionResult?.success}
  energy={reactionResult?.energy}
/>

        </div>

      </div>

    </div>
  );
}