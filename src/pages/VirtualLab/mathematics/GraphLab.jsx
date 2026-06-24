import React, { useState } from "react";

export default function GraphLab() {
  const [a, setA] = useState(1);

  return (
    <div className="p-4 bg-slate-900 rounded-xl">
      <h2>📈 Graph Lab</h2>

      <label>y = {a}x</label>
      <input
        type="range"
        min="1"
        max="10"
        value={a}
        onChange={(e) => setA(Number(e.target.value))}
      />

      <div className="mt-4 p-3 bg-black rounded">
        Graph preview coming next 🚀
      </div>
    </div>
  );
}