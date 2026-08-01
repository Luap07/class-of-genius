import React from "react";

export default function LanguageSectionTabs({
  tabs = [],
  currentSection,
  onChange,
}) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex
                items-center
                gap-2
                rounded-2xl
                px-5
                py-3
                font-semibold
                transition-all
                duration-200
                whitespace-nowrap
                border

                ${
                  currentSection === tab.id
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-[#111827] border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500"
                }
              `}
            >
              <Icon size={18} />

              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}