// src/components/ui/LabNavigation.jsx

import React from "react";
import {
  FlaskConical,
  TestTube,
  Beaker,
  Activity,
  LineChart,
  ClipboardList,
  Brain,
} from "lucide-react";

const tabs = [
  {
    id: "setup",
    label: "Setup",
    icon: FlaskConical,
  },
  {
    id: "equipment",
    label: "Equipment",
    icon: TestTube,
  },
  {
    id: "experiment",
    label: "Experiment",
    icon: Beaker,
  },
  {
    id: "monitor",
    label: "Live Monitor",
    icon: Activity,
  },
  {
    id: "curve",
    label: "Titration Curve",
    icon: LineChart,
  },
  {
    id: "results",
    label: "Results",
    icon: ClipboardList,
  },
  {
    id: "tutor",
    label: "AI Tutor",
    icon: Brain,
  },
];

const LabNavigation = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-2 mb-6">

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">

        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 transition-all duration-200 font-medium ${
                activeTab === tab.id
                  ? "bg-cyan-500 text-black shadow-lg"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}

      </div>

    </div>
  );
};

export default LabNavigation;