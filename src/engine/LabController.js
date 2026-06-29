import React, { useState } from "react";
import ReactantShelf from "./ReactantShelf";
import ReactionCanvas from "./ReactionCanvas";
import ObservationPanel from "./ObservationPanel";
import ProductShelf from "./ProductShelf";
import engine from "./engine/chemicalReaction/ReactionEngine";

export default function LabController() {
  const [reactants, setReactants] = useState([]);
  const [simulation, setSimulation] = useState({
    products: [],
    observation: "",
    result: null
  });

  const handleRunReaction = () => {
    // 1. Use the engine to process the current reactants
    const result = engine.runReaction(reactants);
    
    // 2. Update the state to reflect in UI components
    setSimulation({
      products: result.success ? result.products.map((p, i) => ({ id: i, name: p })) : [],
      observation: result.observation,
      result: result
    });
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-6 bg-slate-950 min-h-screen">
      <div className="col-span-1">
        <ReactantShelf reactants={reactants} setReactants={setReactants} />
      </div>
      
      <div className="col-span-2 flex flex-col gap-4">
        <ReactionCanvas reactants={reactants} />
        <button 
          onClick={handleRunReaction}
          className="bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500"
        >
          Run Reaction
        </button>
      </div>

      <div className="col-span-1 flex flex-col gap-4">
        <ObservationPanel observation={simulation.observation} />
        <ProductShelf products={simulation.products} />
      </div>
    </div>
  );
}