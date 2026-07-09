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
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "LMS", icon: GraduationCap, path: "/admin/lms" },
  { title: "Virtual Labs", icon: FlaskConical, path: "/admin/labs" },
  { title: "CBT", icon: FileText, path: "/admin/cbt" },
  { title: "Novels", icon: BookOpen, path: "/admin/novels" },
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { title: "Media", icon: Image, path: "/admin/media" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

const AdminSidebar = () => {
  const [footerCollapsed, setFooterCollapsed] = useState(false);

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">
      {/* Header / Logo (Static) */}
      <div className="h-20 flex flex-col justify-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-extrabold text-blue-500 tracking-wider">SCHOLIQEN</h1>
        <p className="text-[10px] uppercase font-bold text-slate-500">Admin Panel</p>
      </div>

      {/* Navigation (Static) */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
  key={item.title}
  to={item.path}
  end={item.path === "/admin"}
  className={({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
    }`
  }
>
  <Icon size={20} />
  <span className="font-medium text-sm">{item.title}</span>
</NavLink>
          );
        })}
      </nav>

      {/* Footer Info (Collapsible) */}
      <div className="border-t border-slate-800 p-4 transition-all duration-300">
        <div className={`rounded-xl bg-slate-950/50 p-4 relative`}>
          <button
            onClick={() => setFooterCollapsed(!footerCollapsed)}
            className="absolute top-2 right-2 text-slate-500 hover:text-white"
          >
            {footerCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {!footerCollapsed ? (
            <>
              <p className="text-sm font-semibold text-white">Scholiqen</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Learning Management System</p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <GraduationCap size={18} />
              <span className="text-xs font-medium">LMS Info</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;