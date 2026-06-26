import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical,
  ArrowLeft,
  Zap,
  Waves,
  Atom,
  Wrench,
  Move,
  Target,
  Database,
  Lightbulb,
  CircuitBoard,
  Gauge,
} from "lucide-react";

const sections = [
  {
    title: "Mechanics",
    items: [
      { id: "force", label: "Force Lab", icon: Wrench, color: "text-cyan-400" },
      { id: "motion", label: "Motion Lab", icon: Move, color: "text-cyan-400" },
      { id: "gravity", label: "Gravity Lab", icon: Target, color: "text-cyan-400" },
      { id: "projectile", label: "Projectile Lab", icon: Gauge, color: "text-cyan-400" },
      { id: "energy", label: "Work & Energy", icon: Database, color: "text-cyan-400" },
    ],
  },
  {
    title: "Electricity",
    items: [
      { id: "circuit", label: "Circuit Lab", icon: CircuitBoard, color: "text-yellow-400" },
      { id: "ohms", label: "Ohm's Law Lab", icon: Zap, color: "text-yellow-400" },
    ],
  },
  {
    title: "Waves",
    items: [
      { id: "sound", label: "Sound Lab", icon: Waves, color: "text-blue-400" },
      { id: "light", label: "Light Lab", icon: Lightbulb, color: "text-amber-400" },
    ],
  },
  {
    title: "Modern Physics",
    items: [
      { id: "atom", label: "Atom Lab", icon: Atom, color: "text-purple-400" },
    ],
  },
];

export default function LabSidebar({
  experiment,
  setExperiment,
}) {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-[#0a0f1e] text-slate-300 p-6 flex flex-col h-screen overflow-y-auto">
      <div className="flex items-center gap-3 mb-8 text-white">
        <FlaskConical className="w-8 h-8 text-purple-500" />
        <h1 className="text-xl font-bold">Study AI</h1>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-sm hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Physics Lab
      </button>

      <div className="flex-1 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ml-2">
              {section.title}
            </h2>

            <div className="bg-[#0f172a] p-2 rounded-2xl border border-slate-800/50 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = experiment === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setExperiment(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${
                      isActive
                        ? "bg-[#1e40af] text-white border border-blue-500"
                        : "hover:bg-[#1a1f35] hover:text-white text-slate-400"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-white" : item.color
                      }`}
                    />

                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </aside>
  );
}