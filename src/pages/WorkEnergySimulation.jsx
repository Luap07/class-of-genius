import React, { useState, useEffect, useRef } from "react";
import useEnergyEngine from "../hooks/useEnergyEngine";
import EnergyObject from "./VirtualLab/physics/EnergyObject";
import EnergyGraph from "./VirtualLab/physics/EnergyGraph";

export default function WorkEnergySimulation() {
  const [mass, setMass] = useState(10);
  const [velocity, setVelocity] = useState(5);
  const [height, setHeight] = useState(10);
  const [running, setRunning] = useState(false);

  const { time, kinetic, potential, total, work, reset } =
    useEnergyEngine(mass, velocity, height, running);

  // ✅ FIX: reactive history for graph
  const [history, setHistory] = useState([]);
  const historyRef = useRef([]);

  useEffect(() => {
    if (running) {
      const point = {
        time,
        kinetic,
        potential,
        total,
      };

      historyRef.current.push(point);

      setHistory([...historyRef.current]); // trigger re-render

      if (historyRef.current.length > 200) {
        historyRef.current.shift();
      }
    }
  }, [time]);

  const resetSim = () => {
    setRunning(false);
    reset();
    historyRef.current = [];
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}
      <h1 className="text-4xl font-bold text-center mb-6">
        ⚡ Work & Energy Lab
      </h1>

      {/* ================= MAIN ================= */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* CONTROLS */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h2 className="text-lg mb-4 font-semibold">Controls</h2>

          <p>Mass: {mass} kg</p>
          <input type="range" min="1" max="50"
            value={mass}
            onChange={(e) => setMass(+e.target.value)}
            className="w-full mb-4"
          />

          <p>Velocity: {velocity} m/s</p>
          <input type="range" min="1" max="20"
            value={velocity}
            onChange={(e) => setVelocity(+e.target.value)}
            className="w-full mb-4"
          />

          <p>Height: {height} m</p>
          <input type="range" min="1" max="30"
            value={height}
            onChange={(e) => setHeight(+e.target.value)}
            className="w-full mb-4"
          />

          <div className="flex gap-2 mt-4">
            <button onClick={() => setRunning(true)}
              className="bg-green-600 px-3 py-2 rounded"
            >
              Start
            </button>

            <button onClick={() => setRunning(false)}
              className="bg-yellow-600 px-3 py-2 rounded"
            >
              Pause
            </button>

            <button onClick={resetSim}
              className="bg-red-600 px-3 py-2 rounded"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ================= SIMULATION (WITH RULER) ================= */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative h-[400px] overflow-hidden">

          <h2 className="text-lg mb-2">Simulation</h2>

          {/* 📏 RULER */}
          <div className="absolute left-2 top-10 bottom-0 w-10 flex flex-col justify-between text-[10px] text-slate-400">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-3 h-px bg-slate-500" />
                <span>{100 - i * 10}</span>
              </div>
            ))}
          </div>

          {/* OBJECT */}
          <EnergyObject
            x={time * 30}
            y={300 - (kinetic + potential) / 20}
          />
        </div>

        {/* LIVE DATA */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h2 className="text-lg mb-4">Live Data</h2>

          <p>Kinetic: {kinetic.toFixed(2)} J</p>
          <p>Potential: {potential.toFixed(2)} J</p>
          <p>Total: {total.toFixed(2)} J</p>
          <p>Work: {work.toFixed(2)} J</p>
        </div>
      </div>

      {/* ================= GRAPH SECTION ================= */}
      <div className="mt-10 p-6 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">

        <h2 className="text-2xl font-bold mb-6">
          📊 Energy Analysis Panel
        </h2>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <EnergyGraph data={history} />
        </div>

      </div>
    </div>
  );
}