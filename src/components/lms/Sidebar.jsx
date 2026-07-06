import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FolderOpen,
  TrendingUp,
  Award,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "courses",
    label: "Courses",
    icon: BookOpen,
  },
  {
    id: "assignments",
    label: "Assignments",
    icon: ClipboardList,
  },
  {
    id: "resources",
    label: "Resources",
    icon: FolderOpen,
  },
  {
    id: "progress",
    label: "Progress",
    icon: TrendingUp,
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: Award,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

const Sidebar = ({
  activePage,
  setActivePage,
  sidebarOpen,
  setSidebarOpen,
}) => {
  return (
    <motion.aside
      animate={{
        width: sidebarOpen ? 280 : 90,
      }}
      transition={{
        duration: 0.25,
      }}
      className="h-screen bg-slate-950 border-r border-slate-800 flex flex-col shadow-2xl"
    >
      {/* LOGO */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">

        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xl">
            L
          </div>

          {sidebarOpen && (
            <div>
              <h2 className="font-bold text-lg">LMS Portal</h2>
              <p className="text-xs text-slate-400">Learning System</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-400 hover:text-white"
        >
          {sidebarOpen ? (
            <ChevronLeft size={22} />
          ) : (
            <ChevronRight size={22} />
          )}
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">

        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300
                ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
                    : "hover:bg-slate-900"
                }`}
            >
              <Icon size={22} />

              {sidebarOpen && (
                <span className="font-medium">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="border-t border-slate-800 p-5">

        {sidebarOpen ? (
          <>
            <p className="text-sm font-semibold">ClassOfGenius</p>
            <p className="text-xs text-slate-500 mt-1">Premium LMS</p>
          </>
        ) : (
          <div className="flex justify-center">
            <GraduationCap size={24} />
          </div>
        )}

      </div>
    </motion.aside>
  );
};

export default Sidebar;