import React, { useEffect, useState } from "react";
import {
  Search,
  Bell,
  Settings,
  UserCircle2,
  Sun,
  Moon,
} from "lucide-react";

const AdminHeader = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur">

      <div className="flex h-20 items-center justify-between px-6">

        {/* Left */}

        <div>

          <h1 className="text-2xl font-bold">
            Admin Dashboard
          </h1>

          <p className="text-sm text-slate-400">
            {dateTime.toLocaleDateString()} •{" "}
            {dateTime.toLocaleTimeString()}
          </p>

        </div>

        {/* Center */}

        <div className="hidden lg:flex w-full max-w-xl mx-10">

          <div className="relative w-full">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search courses, students, CBT, novels..."
              className="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-800
                py-3
                pl-11
                pr-4
                outline-none
                focus:border-blue-500
              "
            />

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-3">

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"
          >
            {darkMode ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>

          <button className="relative rounded-xl bg-slate-800 p-3 hover:bg-slate-700">

            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>

          </button>

          <button className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700">
            <Settings size={20} />
          </button>

          <button className="flex items-center gap-3 rounded-xl bg-slate-800 px-3 py-2 hover:bg-slate-700">

            <UserCircle2
              size={40}
              className="text-blue-400"
            />

            <div className="hidden md:block text-left">

              <p className="font-semibold">
                Scholiqen Admin
              </p>

              <p className="text-xs text-slate-400">
                Super Administrator
              </p>

            </div>

          </button>

        </div>

      </div>

    </header>
  );
};

export default AdminHeader;