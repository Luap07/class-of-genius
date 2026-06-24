import React, { useState } from "react";

export default function CellLab() {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="p-4 bg-slate-900 rounded-xl">
      <h2>🧬 Cell Lab</h2>

      <label>Zoom: {zoom}x</label>
      <input
        type="range"
        min="1"
        max="10"
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
      />

      <div
        className="mt-4 bg-green-600 rounded-full flex items-center justify-center"
        style={{
          width: 80 * zoom,
          height: 80 * zoom,
          transition: "0.3s",
        }}
      >
        Cell
      </div>
    </div>
  );
}