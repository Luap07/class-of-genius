import React, { useEffect, useState } from "react";
import { Search, Bell, Settings, UserCircle2, Sun, Moon } from "lucide-react";

const AdminHeader = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 60000); // Update once per minute
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
      <div className="flex h-20 items-center justify-between px-6">
        
        {/* Left Section: Title & Time */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-slate-400 font-medium">
            {dateTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Center Section: Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search data..."
              className="w-full rounded-full border border-slate-700 bg-slate-950/50 py-2.5 pl-11 pr-4 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          {[
            { icon: darkMode ? Sun : Moon, onClick: () => setDarkMode(!darkMode) },
            { icon: Bell, badge: true },
            { icon: Settings }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick}
              className="relative p-2.5 rounded-full bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            >
              <item.icon size={20} />
              {item.badge && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#0f172a]"></span>}
            </button>
          ))}

          {/* Profile Section */}
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-700">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-white">Scholiqen Admin</p>
              <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Super Admin</p>
            </div>
            <UserCircle2 size={36} className="text-slate-600 hover:text-blue-400 transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;