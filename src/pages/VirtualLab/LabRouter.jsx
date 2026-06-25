import React from "react";
import ForceSimulation from "../ForceSimulation";
import MotionSimulation from "../MotionSimulation";

const LabRouter = ({ experiment }) => {
  switch (experiment) {
    case "Force Lab":
      return <ForceSimulation />;

    case "Motion Lab":
      return <MotionSimulation />;

    case "Gravity Lab":
      return (
        <div className="bg-slate-900 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-4">
            Gravity Lab
          </h2>
          <p className="text-slate-400">
            Coming Soon...
          </p>
        </div>
      );

    case "Projectile Lab":
      return (
        <div className="bg-slate-900 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-4">
            Projectile Lab
          </h2>
          <p className="text-slate-400">
            Coming Soon...
          </p>
        </div>
      );

    case "Energy Lab":
      return (
        <div className="bg-slate-900 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-4">
            Energy Lab
          </h2>
          <p className="text-slate-400">
            Coming Soon...
          </p>
        </div>
      );

    default:
      return <ForceSimulation />;
  }
};

export default LabRouter;