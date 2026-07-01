import React, { useState } from "react";
import ReactantShelf from "../components/chemistry/ReactantShelf";
import ReactionCanvas from "../components/chemistry/ReactionCanvas";
import ObservationPanel from "../components/chemistry/ObservationPanel";
import ProductShelf from "../components/chemistry/ProductShelf";
import engine from "./ReactionEngine";

export default function LabController() {
  const [reactants, setReactants] = useState([]);
  const [simulation, setSimulation] = useState({
    products: [],
    observation: "Select reactants to begin.",
    status: "Ready",
  });

  const handleRunReaction = () => {
    console.log("Running simulation with:", reactants);
    
    // 1. Run the engine
    const result = engine.simulate({ reactants, temperature: 25 });
    
    // 2. Update state to trigger UI re-render
    setSimulation({
      products: result.success ? result.products.map((p, i) => ({ id: i, name: p })) : [],
      observation: result.observation || "No reaction occurred.",
      status: result.success ? "Success" : "No Reaction",
    });

    console.log("Simulation Result:", result);
  };

  return (
    <div className="flex h-screen bg-slate-950 p-6 gap-6">
      <div className="w-80">
        <ReactantShelf reactants={reactants} setReactants={setReactants} />
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* Pass products to the canvas so it can display them */}
        <ReactionCanvas reactants={reactants} products={simulation.products} />
        
        <button 
          onClick={handleRunReaction}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all"
        >
          Run Experiment
        </button>
      </div>

      <div className="w-80 flex flex-col gap-6">
        <ObservationPanel observation={simulation.observation} />
        <ProductShelf products={simulation.products} />
      </div>
    </div>
  );
}