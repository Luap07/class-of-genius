import React from "react";

import {
  LayoutDashboard,
  Languages,
  BookOpen,
  SpellCheck,
  PenTool,
  GraduationCap,
} from "lucide-react";

const tabs = [
  {
    id: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "Alphabet",
    icon: Languages,
  },
  {
    id: "Grammar",
    icon: SpellCheck,
  },
  {
    id: "Vocabulary",
    icon: BookOpen,
  },
  {
    id: "Writing",
    icon: PenTool,
  },
  {
    id: "Lessons",
    icon: GraduationCap,
  },
];

export default function LanguageTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <div
      className="
        sticky
        top-0
        z-40
        border-y
        border-white/10
        bg-[#020617]/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          py-5
        "
      >
        <div
          className="
            flex
            justify-center
            items-center
            gap-3
            overflow-x-auto
            scrollbar-hide
            w-full
          "
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex
                  shrink-0
                  items-center
                  gap-3
                  rounded-2xl
                  px-6
                  py-3
                  font-bold
                  whitespace-nowrap
                  transition-all
                  duration-300

                  ${
                    activeTab === tab.id
                      ? `
                        bg-gradient-to-r
                        from-cyan-500
                        to-blue-600
                        text-white
                        shadow-lg
                        shadow-cyan-500/30
                        scale-105
                      `
                      : `
                        bg-slate-900
                        text-slate-300
                        hover:bg-slate-800
                        hover:text-white
                        hover:-translate-y-1
                      `
                  }
                `}
              >
                <Icon size={18} />

                {tab.id}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}