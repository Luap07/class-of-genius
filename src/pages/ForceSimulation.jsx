import React, { useState } from "react";

const ForceSimulation = () => {
  const [force, setForce] = useState(10);
  const [mass, setMass] = useState(2);

  const acceleration = (force / mass).toFixed(2);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Force Simulation
      </h1>

      <div className="bg-slate-900 p-6 rounded-xl">
        <div className="mb-4">
          <label className="block mb-2">
            Force (N): {force}
          </label>

          <input
            type="range"
            min="1"
            max="100"
            value={force}
            onChange={(e) => setForce(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">
            Mass (kg): {mass}
          </label>

          <input
            type="range"
            min="1"
            max="20"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="bg-slate-800 p-4 rounded-lg mt-6">
          <p className="text-lg">
            Acceleration:
          </p>

          <p className="text-4xl font-bold text-blue-400">
            {acceleration} m/s²
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForceSimulation;