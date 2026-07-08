import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  FlaskConical,
  FileText,
  BookOpen,
  Users,
  BarChart3,
  Image,
  Settings,
  Menu,
  ChevronLeft,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    title: "LMS",
    icon: GraduationCap,
    path: "/admin/lms",
  },
  {
    title: "Virtual Labs",
    icon: FlaskConical,
    path: "/admin/labs",
  },
  {
    title: "CBT",
    icon: FileText,
    path: "/admin/cbt",
  },
  {
    title: "Novels",
    icon: BookOpen,
    path: "/admin/novels",
  },
  {
    title: "Users",
    icon: Users,
    path: "/admin/users",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
  },
  {
    title: "Media",
    icon: Image,
    path: "/admin/media",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      {/* Logo */}

      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800">

        {!collapsed && (
          <div>
            <h1 className="text-2xl font-extrabold text-blue-400">
              SCHOLIQEN
            </h1>

            <p className="text-xs text-slate-400">
              Admin Panel
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 hover:bg-slate-800"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>

      </div>

      {/* Navigation */}

      <nav className="flex-1 px-3 py-5 space-y-2">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={22} />

              {!collapsed && (
                <span className="font-medium">
                  {item.title}
                </span>
              )}
            </NavLink>
          );

        })}

      </nav>

      {/* Footer */}

      <div className="border-t border-slate-800 p-4">

        {!collapsed ? (
          <div className="rounded-xl bg-slate-800 p-4">

            <p className="font-semibold">
              Scholiqen
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Learning Management System
            </p>

          </div>
        ) : (
          <div className="flex justify-center">
            <GraduationCap size={24} />
          </div>
        )}

      </div>

    </aside>
  );
};

export default AdminSidebar;