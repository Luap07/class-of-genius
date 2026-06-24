import React, { useState } from "react";

export default function ForceSimulator() {
  const [mass, setMass] = useState(5);
  const [acceleration, setAcceleration] = useState(2);

  const force = mass * acceleration;

  return (
    <div className="p-4 bg-slate-900 rounded-xl">
      <h2>⚡ Force Simulator</h2>

      <label>Mass: {mass}kg</label>
      <input
        type="range"
        min="1"
        max="20"
        value={mass}
        onChange={(e) => setMass(Number(e.target.value))}
      />

      <label>Acceleration: {acceleration}</label>
      <input
        type="range"
        min="1"
        max="10"
        value={acceleration}
        onChange={(e) => setAcceleration(Number(e.target.value))}
      />

      <div className="mt-4 p-3 bg-black rounded">
        Force = {force} N
      </div>
    </div>
  );
}