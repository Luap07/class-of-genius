import React from "react";
import LabRouter from "./LabRouter";

const VirtualLab = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">🧪 Virtual Lab</h1>
      <LabRouter />
    </div>
  );
};

export default VirtualLab;