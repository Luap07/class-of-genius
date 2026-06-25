import React from "react";
import LabRouter from "../pages/VirtualLab/LabRouter";

export default function PhysicsLab() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-5xl font-black mb-8">
        Physics Laboratory
      </h1>

      <LabRouter />
    </div>
  );
}