import React, { useState } from "react";
import LabRouter from "../pages/VirtualLab/LabRouter";
import LabSidebar from "../components/physics/LabSidebar";
import LabHeader from "../components/physics/LabHeader";
import LabNavigation from "../components/physics/LabNavigation";

export default function PhysicsLab() {
  const [experiment, setExperiment] = useState("Force Lab");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex h-screen overflow-hidden">

      <LabSidebar
        experiment={experiment}
        setExperiment={setExperiment}
      />

      <main className="flex-1 flex flex-col">

        <LabHeader />

        <LabNavigation
          activeTab={experiment}
          setActiveTab={setExperiment}
        />

        <div className="flex-1 overflow-auto p-6">
          <LabRouter experiment={experiment} />
        </div>

      </main>
    </div>
  );
}