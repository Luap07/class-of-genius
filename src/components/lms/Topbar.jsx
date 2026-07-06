import React from "react";
import cog from "../../assets/cog.png"; // Ensure this path matches your folder structure
import {
  Search,
  Bell,
  Settings,
  CalendarDays,
  Moon,
  UserCircle2,
} from "lucide-react";

const Topbar = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const ActionButton = ({ icon: Icon }) => (
    <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all">
      <Icon size={20} />
    </button>
  );

  return (
    <header className="h-full w-full flex items-center justify-between px-6">
      
      {/* Branding with Logo */}
      <div className="flex items-center gap-3">
        <img src={cog} alt="Scholiqen Logo" className="w-8 h-8 object-contain" />
        <h1 className="text-lg font-bold tracking-tight">Scholiqen</h1>
      </div>

      {/* Center: Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-sm px-4">
        <div className="flex items-center gap-3 w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 focus-within:border-slate-600 transition-colors">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none w-full text-sm placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <div className="hidden xl:flex items-center gap-2 text-slate-500 text-xs font-medium mr-3">
          <CalendarDays size={14} />
          {today}
        </div>

        <ActionButton icon={Bell} />
        <ActionButton icon={Moon} />
        <ActionButton icon={Settings} />

        {/* User Profile */}
        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-slate-800">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none">Student</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Online</p>
          </div>
          <UserCircle2 size={36} className="text-slate-600" />
        </div>
      </div>

    </header>
  );
};

export default Topbar;