import React from "react";

const tabs = [
  { name: "Force Lab", icon: "🧪" },
  { name: "Motion Lab", icon: "🧭" },
  { name: "Gravity Lab", icon: "⚛️" },
  { name: "Projectile Lab", icon: "🎯" },
];

export default function LabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="px-6 py-4 flex ">
      <div className="flex items-center bg-[#05102e] p-1 rounded-xl border border-gray-800 shadow-lg">
        {tabs.map((tab, index) => (
          <React.Fragment key={tab.name}>
            <button
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.name
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>

            {index < tabs.length - 1 && (
              <div className="w-px h-6 mx-1 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
            )}
          </React.Fragment>
        ))}

        <div className="w-px h-6 mx-1 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />

        <button className="px-6 py-2.5 text-gray-400 text-sm font-medium hover:text-white transition-colors">
          More ▾
        </button>
      </div>
    </div>
  );
}