import React, { useState } from "react";
import ForceSimulation from "../ForceSimulation";
import MotionLab from "../MotionLab";

const LabRouter = () => {
  const [lab, setLab] = useState("force");

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setLab("force")}
          className="px-4 py-2 rounded-lg bg-blue-600"
        >
          Force Lab
        </button>

        <button
          onClick={() => setLab("motion")}
          className="px-4 py-2 rounded-lg bg-indigo-600"
        >
          Motion Lab
        </button>
      </div>

      {lab === "force" ? (
        <ForceSimulation />
      ) : (
        <MotionLab />
      )}
    </div>
  );
};

export default LabRouter;