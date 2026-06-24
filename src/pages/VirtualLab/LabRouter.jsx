import React from "react";
import { useParams } from "react-router-dom";

/* PHYSICS */
import ForceSimulator from "./physics/ForceSimulator";
import MotionLab from "./physics/MotionLab";

/* CHEMISTRY */
import ReactionLab from "./chemistry/ReactionLab";

/* BIOLOGY */
import CellLab from "./biology/CellLab";

/* MATH */
import GraphLab from "./mathematics/GraphLab";

export default function LabRouter() {
  const { subject, experiment } = useParams();

  // DEBUG (keep this for now)
  console.log("LAB:", subject, experiment);

  /* ================= PHYSICS ================= */
  if (subject === "physics" && experiment === "force") {
    return <ForceSimulator />;
  }

  if (subject === "physics" && experiment === "motion") {
    return <MotionLab />;
  }

  /* ================= CHEMISTRY ================= */
  if (subject === "chemistry" && experiment === "reaction") {
    return <ReactionLab />;
  }

  /* ================= BIOLOGY ================= */
  if (subject === "biology" && experiment === "cell") {
    return <CellLab />;
  }

  /* ================= MATHEMATICS ================= */
  if (subject === "mathematics" && experiment === "graph") {
    return <GraphLab />;
  }

  /* ================= DEFAULT ================= */
  return (
    <div className="text-white p-4">
      <h2>🧪 Virtual Lab</h2>

      <p>Unknown experiment:</p>

      <ul>
        <li>Subject: {subject}</li>
        <li>Experiment: {experiment}</li>
      </ul>
    </div>
  );
}