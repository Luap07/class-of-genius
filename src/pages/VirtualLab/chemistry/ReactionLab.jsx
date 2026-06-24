import React, { useState } from "react";

export default function ReactionLab() {
  const [temperature, setTemperature] = useState(30);

  const result =
    temperature < 50
      ? "Slow reaction ❄️"
      : temperature < 100
      ? "Medium reaction ⚡"
      : "Fast reaction 🔥";

  return (
    <div className="p-4 bg-slate-900 rounded-xl">
      <h2>🧪 Reaction Lab</h2>

      <label>Temperature: {temperature}°C</label>
      <input
        type="range"
        min="0"
        max="150"
        value={temperature}
        onChange={(e) => setTemperature(Number(e.target.value))}
      />

      <div className="mt-4 p-3 bg-black rounded">
        {result}
      </div>
    </div>
  );
}