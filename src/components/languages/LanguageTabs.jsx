import React from "react";
import {
  LayoutDashboard,
  CaseUpper,
  BookOpen,
  SpellCheck,
  Headphones,
  Mic,
  PenTool,
  Globe2,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const tabs = [
  {
    id: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "Alphabet",
    icon: CaseUpper,
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
    id: "Listening",
    icon: Headphones,
  },
  {
    id: "Speaking",
    icon: Mic,
  },
  {
    id: "Writing",
    icon: PenTool,
  },
  {
    id: "Culture",
    icon: Globe2,
  },
  {
    id: "Lessons",
    icon: GraduationCap,
  },
  {
    id: "AI Tutor",
    icon: Sparkles,
  },
];

export default function LanguageTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <div className="sticky top-0 z-40 border-y border-white/10 bg-[#020617]/90 backdrop-blur-xl">

      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-6 py-5 scrollbar-none">

        {tabs.map((tab) => {

          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-2xl px-6 py-3 font-bold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon size={18} />

              {tab.id}
            </button>
          );
        })}

      </div>

    </div>
  );
}