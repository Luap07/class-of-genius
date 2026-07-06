// src/components/curriculum/CurriculumSidebar.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Globe2,
  BookOpen,
  GraduationCap,
  Layers3,
  Library,
  FolderTree,
  FileText,
  FlaskConical,
  ClipboardCheck,
  BarChart3,
  Search,
  Settings,
  ChevronRight,
} from "lucide-react";

const menu = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Search, label: "Explore Curriculum", path: "/curriculum/explorecurriculum" },
    ],
  },
  {
    title: "Curriculum",
    items: [
      { icon: Globe2, label: "Countries" },
      { icon: Library, label: "Curriculum Frameworks" },
      { icon: GraduationCap, label: "Educational Levels" },
      { icon: Layers3, label: "Grades / Classes" },
      { icon: BookOpen, label: "Subjects" },
      { icon: FolderTree, label: "Topics" },
      { icon: FileText, label: "Lesson Library" },
    ],
  },
  {
    title: "Learning",
    items: [
      { icon: FlaskConical, label: "Activities" },
      { icon: ClipboardCheck, label: "Assessments" },
      { icon: BarChart3, label: "Progress" },
    ],
  },
  {
    title: "System",
    items: [{ icon: Settings, label: "Settings" }],
  },
];

const CurriculumSidebar = ({ active = "Dashboard", setActive = () => {}, onClose }) => {
  const navigate = useNavigate();

  return (
    <aside className="w-72 h-screen bg-slate-950 border-r border-slate-800 flex flex-col">

      {/* LOGO */}
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
          Curriculum
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Global Learning Framework
        </p>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-8">

        {menu.map((section) => (
          <div key={section.title}>

            <p className="px-3 mb-3 text-xs uppercase tracking-widest text-slate-500">
              {section.title}
            </p>

            <div className="space-y-1">

              {section.items.map((item) => {
                const Icon = item.icon;
                const selected = active === item.label;

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActive(item.label);

                      if (item.path) {
                        navigate(item.path);
                        if (onClose) onClose();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                      selected
                        ? "bg-cyan-500/15 border border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>

                    <ChevronRight
                      size={16}
                      className={selected ? "text-cyan-400" : "text-slate-600"}
                    />
                  </button>
                );
              })}

            </div>

          </div>
        ))}

      </div>
    </aside>
  );
};

export default CurriculumSidebar;