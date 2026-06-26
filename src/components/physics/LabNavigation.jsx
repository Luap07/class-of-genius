import React, { useState } from "react";

const LABS = [
  { id: "force", label: "Force Lab", icon: "🧪" },
  { id: "motion", label: "Motion Lab", icon: "🧭" },
  { id: "gravity", label: "Gravity Lab", icon: "⚛️" },
  { id: "projectile", label: "Projectile Lab", icon: "🎯" },
  { id: "energy", label: "Work & Energy Lab", icon: "⚡" },
  { id: "circuit", label: "Circuit Lab", icon: "🔌" },
  { id: "ohms", label: "Ohm's Law Lab", icon: "⚡" },
  { id: "sound", label: "Sound Lab", icon: "🔊" },
  { id: "light", label: "Light Lab", icon: "💡" },
  { id: "atom", label: "Atomic Lab", icon: "🧬" },
];

export default function LabNavigation({ activeTab, setActiveTab }) {
  const [open, setOpen] = useState(false);

  const mainTabs = LABS.slice(0, 4);
  const moreTabs = LABS.slice(4);

  return (
    <div className="px-6 py-4 flex">
      <div className="flex items-center bg-[#05102e] p-1 rounded-xl border border-gray-800 shadow-lg relative">

        {mainTabs.map((tab, index) => (
          <React.Fragment key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>

            {index < mainTabs.length - 1 && (
              <div className="w-px h-6 mx-1 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
            )}
          </React.Fragment>
        ))}

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="px-6 py-2.5 text-gray-300 text-sm font-medium hover:text-white transition-colors"
          >
            More ▾
          </button>

          {open && (
            <div className="absolute top-12 right-0 bg-[#05102e] border border-gray-800 rounded-xl shadow-xl w-56 z-50">
              {moreTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-gray-800/50 ${
                    activeTab === tab.id
                      ? "text-white bg-blue-600/20"
                      : "text-gray-400"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}