import React from "react";
import { Menu, Bell, Search, UserCircle } from "lucide-react";

const Topbar = ({ onMenuClick }) => {
  return (
    // 'w-full' ensures it takes the full width of its parent
    // Ensure the parent in your Layout/App.js does not restrict this component
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
      
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="rounded-xl border border-slate-800 bg-slate-900 p-3 lg:hidden"
      >
        <Menu size={22} className="text-white" />
      </button>

      {/* Search Bar - Hidden on mobile */}
      <div className="hidden w-96 items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 md:flex">
        <Search size={20} className="text-slate-400" />
        <input
          placeholder="Search anything..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <button className="relative rounded-xl border border-slate-800 bg-slate-900 p-3">
          <Bell size={22} className="text-slate-300" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        <div className="flex items-center gap-3">
          <UserCircle size={40} className="text-blue-400" />
          <div className="hidden md:block">
            <p className="font-semibold text-white">Student</p>
            <p className="text-sm text-slate-400">Welcome back</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;