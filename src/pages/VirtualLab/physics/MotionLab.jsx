import React, { useState } from "react";

export default function MotionLab() {
  const [speed, setSpeed] = useState(10);

  const distance = speed * 5;

  return (
    <div className="p-4 bg-slate-900 rounded-xl">
      <h2>🚗 Motion Lab</h2>

      <label>Speed: {speed} m/s</label>
      <input
        type="range"
        min="1"
        max="50"
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
      />

      <div className="mt-4 p-3 bg-black rounded">
        Distance after 5s = {distance} m
      </div>
    </div>
  );
}