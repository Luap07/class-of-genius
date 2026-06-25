import React, { useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import usePhysicsEngine from "../hooks/usePhysicsEngine";
import RealTimeGraphs from "../pages/VirtualLab/physics/RealTimeGraphs";

const Panel = ({ title, children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl ${className}`}>
    {title && (
      <div className="px-4 py-3 border-b border-slate-800">
        <h3 className="text-sm text-slate-300 font-semibold tracking-wide">
          {title}
        </h3>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

const ForceSimulation = () => {
  const [force, setForce] = useState(20);
  const [mass, setMass] = useState(5);
  const [friction, setFriction] = useState(0.1);
  const [playing, setPlaying] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const { forceData, accelData, velocityData, position } =
    usePhysicsEngine(force, mass, friction, playing, resetKey);

  const acceleration = Math.max(0, force / mass - friction).toFixed(2);

  return (
    <div className="space-y-8 p-4 md:p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Force Simulation Lab
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time physics engine with live data visualization
          </p>
        </div>

        <div className="text-cyan-400 text-2xl md:text-3xl font-serif">
          F = ma
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* CONTROLS */}
        <Panel title="Controls" className="lg:col-span-3">

          <div className="space-y-6">

            {/* MASS */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Mass</span>
                <span className="text-white">{mass} kg</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* FORCE */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Force</span>
                <span className="text-white">{force} N</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={force}
                onChange={(e) => setForce(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* FRICTION */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Friction</span>
                <span className="text-white">{friction}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={friction}
                onChange={(e) => setFriction(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

          </div>
        </Panel>

        {/* SIMULATION */}
        <Panel title="Simulation" className="lg:col-span-6 relative overflow-hidden min-h-[380px]">

          {/* GRID BACKGROUND */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* OBJECT */}
          <div
            className="absolute bottom-24 left-10 transition-transform duration-75"
            style={{ transform: `translateX(${position * 10}px)` }}
          >
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 shadow-2xl flex items-center justify-center text-3xl border border-amber-900">
              📦
            </div>
          </div>

          {/* TRACK */}
          <div className="absolute bottom-16 left-6 right-6 h-6 rounded-full bg-slate-800/60 border border-slate-700" />
        </Panel>

        {/* RESULTS */}
        <Panel title="Live Results" className="lg:col-span-3">

          <div className="space-y-4 text-sm">

            <div className="flex justify-between">
              <span className="text-slate-400">Force</span>
              <span className="text-green-400 font-semibold">{force} N</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Mass</span>
              <span className="text-cyan-400 font-semibold">{mass} kg</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Acceleration</span>
              <span className="text-yellow-400 font-semibold">
                {acceleration} m/s²
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className={playing ? "text-green-400" : "text-red-400"}>
                {playing ? "Running" : "Paused"}
              </span>
            </div>

          </div>
        </Panel>
      </div>

      {/* CONTROLS BAR */}
      <div className="flex gap-3">

        <button
          onClick={() => setPlaying(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 transition"
        >
          <Play size={16} />
          Play
        </button>

        <button
          onClick={() => setPlaying(false)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
        >
          <Pause size={16} />
          Pause
        </button>

        <button
          onClick={() => {
            setPlaying(false);
            setResetKey((p) => p + 1);
          }}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* GRAPH SECTION */}
      <Panel title="Real-Time Physics Analytics" className="border-purple-900/40">

        <RealTimeGraphs
          forceData={forceData}
          accelData={accelData}
          velocityData={velocityData}
        />

      </Panel>

    </div>
  );
};

export default ForceSimulation;