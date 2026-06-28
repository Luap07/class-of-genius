import { useState } from "react";

import ReactionCanvas from "../../../components/chemistry/ReactionCanvas";
import ReactantShelf from "../../../components/chemistry/ReactantShelf";
import ProductShelf from "../../../components/chemistry/ProductShelf";
import ReactionToolbar from "../../../components/chemistry/ReactionToolbar";
import ReactionControls from "../../../components/chemistry/ReactionControls";
import ReactionEquation from "../../../components/chemistry/ReactionEquation";
import ObservationPanel from "../../../components/chemistry/ObservationPanel";

export default function ChemicalReaction() {
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [reactants, setReactants] = useState([]);
  const [products, setProducts] = useState([]);
  const [temperature, setTemperature] = useState(25);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [observations, setObservations] = useState([
    "Select reactants to begin experiment...",
  ]);

  const safeReactants = reactants ?? [];
  const safeProducts = products ?? [];
  const safeObservations = observations ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 gap-4">
      {/* ================= TOOLBAR ================= */}
      <ReactionToolbar
        selectedReaction={selectedReaction}
        setSelectedReaction={setSelectedReaction}
      />

      {/* ================= MAIN 12-COLUMN GRID ================= */}
      <div className="flex-1 grid grid-cols-12 gap-4">
        
        {/* 1. LEFT: REACTANT SHELF (Col 1-2) */}
        <div className="col-span-2 h-354 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 ">
          <ReactantShelf
            reactants={safeReactants}
            setReactants={setReactants}
          />
        </div>

        {/* 2. CENTER: LAB CANVAS, EQUATION & CONTROLS (Col 3-8) */}
        <div className="col-span-6 h-355 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <ReactionEquation selectedReaction={selectedReaction} />
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[500px]">
            <ReactionCanvas
              reactants={safeReactants}
              products={safeProducts}
              temperature={temperature}
              playing={playing}
              speed={speed}
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <ReactionControls
              playing={playing}
              setPlaying={setPlaying}
              temperature={temperature}
              setTemperature={setTemperature}
              speed={speed}
              setSpeed={setSpeed}
            />
          </div>
        </div>

        {/* 3. RIGHT: OBSERVATIONS & PRODUCTS (Col 9-12) */}
        <div className="col-span-4 flex flex-col h-356 gap-4">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-3 overflow-hidden">
            <ObservationPanel observations={safeObservations} />
          </div>
          <div className=" bg-slate-900 border border-slate-800 rounded-2xl p-3 overflow-hidden">
            <ProductShelf products={safeProducts} />
          </div>
        </div>

        {/* <ReactionControls
    playing={playing}
    setPlaying={setPlaying}
    temperature={temperature}
    setTemperature={setTemperature}
    speed={speed}
    setSpeed={setSpeed}
    onRun={runReaction}
    onStop={stopReaction}
    onReset={resetReaction}
/> */}

      </div>
    </div>
  );
}