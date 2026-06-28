import React, { useState } from "react";

export default function ReactionCanvas() {
  const [reactants, setReactants] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [temperature, setTemperature] = useState(25);
  const [isRunning, setIsRunning] = useState(false);

  const handleReset = () => {
    setReactants([]);
    setProducts([]);
    setSelectedReaction(null);
    setTemperature(25);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Main Lab Area - Added a wrapper to ensure layout works */}
        <div className="w-full">
          <div className="relative h-[500px] w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            {/* Lab Background Grid */}
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }}
            />
            
            {/* Laboratory Bench */}
            <div className="absolute bottom-0 w-full h-20 bg-slate-800 border-t border-slate-700" />
            
            {/* Empty State / Placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <div className="text-6xl mb-4">🧪</div>
              <p className="text-lg font-medium">Laboratory Ready</p>
              <p className="text-sm">Drop reagents here to start...</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}