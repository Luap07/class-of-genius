import React from "react";

import ForceSimulation from "../ForceSimulation";
import MotionSimulation from "../MotionSimulation";
import GravitySimulation from "../GravitySimulation";
import ProjectileSimulation from "../ProjectileSimulation";
import WorkEnergySimulation from "../WorkEnergySimulation";
import CircuitSimulation from "../CircuitSimulation";
import OhmsLawLab from "../OhmsLawLab";
import SoundLab from "../SoundLab"
import LightLab from "../LightLab";
import AtomicLab from "../AtomicLab";

const ComingSoon = ({ title }) => (
  <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
    <h2 className="text-3xl font-bold mb-4">{title}</h2>
    <p className="text-slate-400">Coming Soon...</p>
  </div>
);

const NoLabFound = ({ experiment }) => (
  <div className="bg-slate-900 rounded-2xl p-8 border border-red-500">
    <h2 className="text-2xl font-bold text-red-400">
      No lab found
    </h2>

    <p className="text-slate-400 mt-2">
      Experiment value:
    </p>

    <div className="mt-2 bg-slate-800 rounded-lg p-3 text-yellow-400 font-mono">
      {String(experiment)}
    </div>

    <div className="mt-4 text-slate-500">
      Available labs:
      <ul className="list-disc pl-6 mt-2">
        <li>force</li>
        <li>motion</li>
        <li>gravity</li>
        <li>projectile</li>
        <li>energy</li>
        <li>circuit</li>
        <li>ohms</li>
        <li>sound</li>
        <li>light</li>
        <li>atom</li>
      </ul>
    </div>
  </div>
);

const LABS = {
  force: ForceSimulation,
  motion: MotionSimulation,
  gravity: GravitySimulation,
  projectile: ProjectileSimulation,
  energy: WorkEnergySimulation,

  circuit: CircuitSimulation,

  // OHM'S LAW LAB
  ohms: OhmsLawLab,
  sound:SoundLab,
  light:LightLab,
  atom:AtomicLab,
};

export default function LabRouter({ experiment }) {
  console.log("Current Experiment:", experiment);

  const labKey =
    typeof experiment === "string"
      ? experiment.trim().toLowerCase()
      : "";

  const SelectedLab = LABS[labKey];

  if (!SelectedLab) {
    return <NoLabFound experiment={experiment} />;
  }

  return (
    <div className="w-full">
      <SelectedLab />
    </div>
  );
}