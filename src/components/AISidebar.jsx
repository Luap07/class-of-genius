import React, { useState } from "react";
import {
  Home,
  BookOpen,
  Bot,
  FileText,
  BarChart,
  Library,
  Settings,
  ChevronRight,
} from "lucide-react";

const AISidebar = () => {
  const [active, setActive] = useState("Home");

  const menu = [
    {
      section: "Main",
      items: [
        { name: "Home", icon: Home },
      ],
    },

    {
      section: "📚 Subjects",
      items: [
        { name: "Mathematics", icon: BookOpen },
        { name: "English", icon: BookOpen },
        { name: "Physics", icon: BookOpen },
        { name: "Chemistry", icon: BookOpen },
        { name: "Biology", icon: BookOpen },
        { name: "Computer Science", icon: BookOpen },
      ],
    },

    {
      section: "🤖 AI Tutor",
      items: [
        { name: "Ask Anything", icon: Bot },
        { name: "Explain Topic", icon: Bot },
        { name: "Solve Question", icon: Bot },
        { name: "Quiz Generator", icon: FileText },
        { name: "Study Planner", icon: FileText },
      ],
    },

    {
      section: "📈 Progress",
      items: [
        { name: "Dashboard", icon: BarChart },
        { name: "Study Time", icon: BarChart },
        { name: "Performance", icon: BarChart },
        { name: "Streaks", icon: BarChart },
      ],
    },

    {
      section: "📖 Library",
      items: [
        { name: "Notes", icon: Library },
        { name: "Past Questions", icon: Library },
        { name: "Books", icon: Library },
        { name: "Resources", icon: Library },
      ],
    },

    {
      section: "⚙️ Settings",
      items: [
        { name: "Profile", icon: Settings },
        { name: "Learning Goals", icon: Settings },
        { name: "AI Preferences", icon: Settings },
        { name: "Notifications", icon: Settings },
      ],
    },
  ];

  return (
    <div className="w-64 bg-slate-950 text-white h-full border-r border-slate-800 p-4 overflow-y-auto">

      {/* LOGO */}
      <div className="text-blue-500 font-bold text-xl mb-6 px-2">
        Scholiqen
      </div>

      {/* MENU */}
      <div className="space-y-6">

        {menu.map((group, i) => (
          <div key={i}>
            
            {/* SECTION TITLE */}
            <h2 className="text-xs text-slate-500 mb-2 px-2 uppercase tracking-wider">
              {group.section}
            </h2>

            {/* ITEMS */}
            <div className="space-y-1">

              {group.items.map((item, j) => {
                const Icon = item.icon;
                const isActive = active === item.name;

                return (
                  <div
                    key={j}
                    onClick={() => setActive(item.name)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                      transition-all
                      ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.name}</span>

                    {isActive && (
                      <ChevronRight size={14} className="ml-auto text-blue-400" />
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default AISidebar;