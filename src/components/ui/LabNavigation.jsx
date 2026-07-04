// src/components/ui/LabNavigation.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
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
    id: "results",
    label: "Results",
    icon: ClipboardList,
  },
  {
    id: "curve",
    label: "Graph",
    icon: LineChart,
  },
  {
    id: "tutor",
    label: "AI Tutor",
    icon: Brain,
    route: "/ai-tutor/session",
  },
];

const LabNavigation = ({
  activeTab = "experiment",
  setActiveTab = () => {},
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg">

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">

        {tabs.map((tab) => {
          const Icon = tab.icon;

          const active =
            !tab.route && activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.route) {
                  navigate(tab.route);
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 font-medium transition-all duration-200 ${
                active
                  ? "bg-cyan-500 text-black shadow-lg"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
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