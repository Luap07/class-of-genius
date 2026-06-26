import React, { useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import useMotionEngine from "../hooks/useMotionEngine";
import MotionGraphs from "../pages/VirtualLab/physics/MotionGraphs";
import car from "../assets/car.png";

const Panel = ({ title, children, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-4 shadow-xl ${className}`}
  >
    <h3 className="text-slate-300 text-sm font-semibold mb-3">
      {title}
    </h3>
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
  } = useMotionEngine(
    force,
    mass,
    friction,
    playing,
    resetKey
  );

  const reset = () => {
    setPlaying(false);
    setResetKey((prev) => prev + 1);
  };

  const currentPosition =
    positionData?.at(-1)?.value || 0;

  const currentVelocity =
    velocityData?.at(-1)?.value || 0;

  const currentAcceleration =
    accelData?.at(-1)?.value || 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Motion Lab
          </h1>

          <p className="text-slate-400 text-sm">
            Velocity, Acceleration & Displacement
          </p>
        </div>

        <div className="text-purple-400 text-2xl font-serif">
          v = u + at
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* CONTROLS */}
        <Panel
          title="Controls"
          className="lg:col-span-3"
        >
          <div className="space-y-5">
            <div>
              <label className="text-xs text-slate-400">
                Force
              </label>

              <input
                type="range"
                min="1"
                max="100"
                value={force}
                onChange={(e) =>
                  setForce(Number(e.target.value))
                }
                className="w-full"
              />

              <p className="text-xs text-purple-400">
                {force} N
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400">
                Mass
              </label>

              <input
                type="range"
                min="1"
                max="20"
                value={mass}
                onChange={(e) =>
                  setMass(Number(e.target.value))
                }
                className="w-full"
              />

              <p className="text-xs text-blue-400">
                {mass} kg
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400">
                Friction
              </label>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={friction}
                onChange={(e) =>
                  setFriction(Number(e.target.value))
                }
                className="w-full"
              />

              <p className="text-xs text-yellow-400">
                {friction.toFixed(2)}
              </p>
            </div>
          </div>
        </Panel>

        {/* SIMULATION */}
        <Panel
          title="Motion Simulation"
          className="lg:col-span-6 min-h-[350px] relative overflow-hidden"
        >
          {/* TRACK */}
          <div className="absolute bottom-24 left-8 right-8 h-2 bg-slate-700 rounded-full" />

          {/* DISTANCE MARKERS */}
          <div className="absolute bottom-20 left-8 right-8 flex justify-between text-xs text-slate-500">
            <span>0m</span>
            <span>25m</span>
            <span>50m</span>
            <span>75m</span>
            <span>100m</span>
          </div>

          {/* MOVING CAR */}
          <div
            className="absolute bottom-8 transition-transform duration-75 ease-linear"
            style={{
              transform: `translateX(${Math.max(
                0,
                Math.min(currentPosition * 5, 520)
              )}px)`
            }}
          >
            <img
              src={car}
              alt="Car"
              className="w-32 h-auto mb-15 object-contain select-none"
              draggable={false}
            />
          </div>
        </Panel>

        {/* LIVE DATA */}
        <Panel
          title="Live Data"
          className="lg:col-span-3"
        >
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">
                Position
              </span>

              <span className="text-white font-semibold">
                {currentPosition.toFixed(2)} m
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                Velocity
              </span>

              <span className="text-purple-400 font-semibold">
                {currentVelocity.toFixed(2)} m/s
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                Acceleration
              </span>

              <span className="text-green-400 font-semibold">
                {currentAcceleration.toFixed(2)} m/s²
              </span>
            </div>
          </div>
        </Panel>
      </div>

      {/* CONTROL BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={() => setPlaying(true)}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white flex items-center gap-2"
        >
          <Play size={16} />
          Play
        </button>

        <button
          onClick={() => setPlaying(false)}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white flex items-center gap-2"
        >
          <Pause size={16} />
          Pause
        </button>

        <button
          onClick={reset}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* GRAPHS */}
      <div className="rounded-2xl border border-purple-800/40 bg-slate-950/40 p-4">
        <MotionGraphs
          positionData={positionData}
          velocityData={velocityData}
          accelData={accelData}
        />
      </div>
    </div>
  );
}