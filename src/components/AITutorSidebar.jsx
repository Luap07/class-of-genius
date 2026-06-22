import React from "react";
import {
  Home,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
} from "lucide-react";

const AITutorSidebar = ({ setActivePanel }) => {
  return (
    <aside className="w-24 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-6 gap-6">

      {/* LOGO = HOME RESET */}
      <div
        onClick={() => {
          setActivePanel("home");
        }}
        className="text-blue-500 font-bold text-xl mb-4 cursor-pointer"
      >
        S
      </div>

      {/* HOME */}
      <button
        onClick={() => setActivePanel("home")}
        className="flex flex-col items-center gap-1 p-3 rounded-xl w-full text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
      >
        <Home size={22} />
        <span className="text-[10px]">Home</span>
      </button>

      {/* SUBJECTS */}
      <button
        onClick={() => setActivePanel("subjects")}
        className="flex flex-col items-center gap-1 p-3 rounded-xl w-full text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
      >
        <BookOpen size={22} />
        <span className="text-[10px]">Subjects</span>
      </button>

      {/* EXAM PREP (merged idea) */}
      <button
        onClick={() => setActivePanel("subjects")} 
        className="flex flex-col items-center gap-1 p-3 rounded-xl w-full text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
      >
        <GraduationCap size={22} />
        <span className="text-[10px]">Exam</span>
      </button>

      {/* PROGRESS */}
      <button
        onClick={() => setActivePanel("progress")}
        className="flex flex-col items-center gap-1 p-3 rounded-xl w-full text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
      >
        <BarChart3 size={22} />
        <span className="text-[10px]">Progress</span>
      </button>

      {/* SETTINGS */}
      <button
        onClick={() => setActivePanel("settings")}
        className="flex flex-col items-center gap-1 p-3 rounded-xl w-full text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
      >
        <Settings size={22} />
        <span className="text-[10px]">Settings</span>
      </button>

    </aside>
  );
};

export default AITutorSidebar;