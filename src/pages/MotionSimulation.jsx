import React, { useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import useMotionEngine from "../hooks/useMotionEngine";
import RealTimeGraphs from "../pages/VirtualLab/physics/RealTimeGraphs";

const Panel = ({ title, children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-4 shadow-xl ${className}`}>
    <h3 className="text-slate-300 text-sm font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

export default function MotionSimulation() {
  const [force, setForce] = useState(30);
  const [mass, setMass] = useState(5);
  const [friction, setFriction] = useState(0.2);
  const [playing, setPlaying] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const {
    velocityData,
    positionData,
    accelData,
  } = useMotionEngine(force, mass, friction, playing, resetKey);

  const reset = () => {
    setPlaying(false);
    setResetKey((p) => p + 1);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Motion Lab</h1>
          <p className="text-slate-400 text-sm">Velocity, acceleration & displacement engine</p>
        </div>
        <div className="text-purple-400 text-2xl font-serif">v = u + at</div>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* CONTROLS */}
        <Panel title="Controls" className="lg:col-span-3">
          <div className="space-y-4">
            <input
              type="range"
              min="1"
              max="100"
              value={force}
              onChange={(e) => setForce(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-slate-400">Force: {force}</p>

            <input
              type="range"
              min="1"
              max="20"
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-slate-400">Mass: {mass}</p>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={friction}
              onChange={(e) => setFriction(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-slate-400">Friction: {friction}</p>
          </div>
        </Panel>

        {/* SIMULATION */}
        <Panel title="Motion Simulation" className="lg:col-span-6 min-h-[350px] relative overflow-hidden flex items-center">
          <div
            className="absolute transition-transform duration-75 ease-linear"
            style={{
              transform: `translateX(${positionData.at(-1)?.value * 5 || 0}px)`
            }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-xl flex items-center justify-center text-3xl">
              🚗
            </div>
          </div>
        </Panel>

        {/* RESULTS */}
        <Panel title="Live Data" className="lg:col-span-3">
          <p className="text-slate-400 text-sm">Real-time motion values</p>
        </Panel>
      </div>

      {/* CONTROLS */}
      <div className="flex gap-3">
        <button onClick={() => setPlaying(true)} className="bg-green-500 px-4 py-2 rounded text-white flex items-center gap-2">
          <Play size={16} /> Play
        </button>
        <button onClick={() => setPlaying(false)} className="bg-gray-700 px-4 py-2 rounded text-white flex items-center gap-2">
          <Pause size={16} /> Pause
        </button>
        <button onClick={reset} className="bg-gray-700 px-4 py-2 rounded text-white flex items-center gap-2">
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* GRAPHS */}
      <div className="rounded-2xl border border-purple-800/40 bg-slate-950/40 p-4">
        <RealTimeGraphs
          forceData={velocityData}
          accelData={accelData}
          velocityData={positionData}
        />
      </div>
    </div>
  );
}