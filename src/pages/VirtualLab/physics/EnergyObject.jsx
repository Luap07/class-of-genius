import React from "react";

export default function EnergyObject({ x, y }) {
  return (
    <div
      className="absolute w-10 h-10 bg-blue-400 rounded-lg shadow-lg transition-transform duration-75"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    />
  );
}