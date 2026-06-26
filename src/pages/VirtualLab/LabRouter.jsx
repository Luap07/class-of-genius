import React from "react";

import ForceSimulation from "../ForceSimulation";
import MotionSimulation from "../MotionSimulation";
import GravitySimulation from "../GravitySimulation";
import ProjectileSimulation from "../ProjectileSimulation";
import WorkEnergySimulation from "../WorkEnergySimulation";


const ComingSoon = ({ title }) => (
  <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
    <h2 className="text-3xl font-bold mb-4">{title}</h2>
    <p className="text-slate-400">Coming Soon...</p>
  </div>
);

/* ================= LAB REGISTRY ================= */
const LABS = {
  "Force Lab": ForceSimulation,
  "Motion Lab": MotionSimulation,
  "Gravity Lab": GravitySimulation,
  "Projectile Lab": ProjectileSimulation,
  "Work & Energy Lab": WorkEnergySimulation,

  // keep this ready for next phase
  
  "Energy Lab": () => <ComingSoon title="Energy Lab" />,
};

/* ================= ROUTER ================= */
const LabRouter = ({ experiment }) => {
  const SelectedLab = LABS[experiment];

  // fallback should NOT force ForceLab anymore
  if (!SelectedLab) {
    return (
      <ComingSoon title="Select a Lab from the Navigation" />
    );
  }

  return <SelectedLab />;
};

export default LabRouter;