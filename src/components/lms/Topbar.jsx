import React from "react";
import { Menu, Bell, Search, UserCircle, LogOut } from "lucide-react";
import Cog from "../../assets/cog.png";

const Topbar = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 flex h-20 w-screen max-w-none items-center justify-between border-b border-slate-800 bg-slate-950 px-6 backdrop-blur-md bg-opacity-95">
      
      {/* Left: Branding & Menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl border border-slate-800 bg-slate-900 p-3 lg:hidden hover:border-cyan-500 transition-colors"
        >
          <Menu size={22} className="text-white" />
        </button>
        
        <div className="flex items-center gap-2">
          <img src={Cog} alt="Scholiqen" className="w-8 h-8 hidden md:block" />
          <span className="text-xl font-bold text-white tracking-tight hidden md:block">
            Scholiqen<span className="text-cyan-500">.</span>
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden w-96 items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 md:flex focus-within:border-cyan-500 transition-colors">
        <Search size={20} className="text-slate-400" />
        <input
          placeholder="Search Scholiqen..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Right: Notifications, Profile & Logout */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-xl border border-slate-800 bg-slate-900 p-3 hover:bg-slate-800 transition-colors">
          <Bell size={22} className="text-slate-300" />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-cyan-500" />
        </button>

        {/* Profile Info */}
        <div className="hidden md:flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="text-right">
            <p className="font-semibold text-white text-sm">Administrator</p>
            <p className="text-[10px] text-cyan-500 uppercase tracking-wider">Scholiqen Portal</p>
          </div>
          <UserCircle size={40} className="text-cyan-400" />
        </div>

        {/* Logout Button */}
        <button className="rounded-xl border border-slate-800 bg-slate-900 p-3 hover:bg-red-900/20 hover:border-red-900 transition-colors">
          <LogOut size={20} className="text-slate-400 hover:text-red-400" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;