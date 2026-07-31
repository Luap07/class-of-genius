// src/admin/components/AdminSidebar.jsx

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
  Mail,
  ChevronUp,
  ChevronDown,
  Video,
  Languages,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
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
    title: "Documents",
    icon: FileText,
    path: "/admin/documents",
  },
  {
    title: "Resources",
    icon: Video,
    path: "/admin/resources",
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
  // LANGUAGES (Collapsible Section)
  {
    title: "Languages",
    icon: Languages,
    collapsible: true,
    children: [
      {
        title: "Overview",
        path: "/admin/languages",
      },
      {
        title: "Vocabulary Bank",
        path: "/admin/languages/vocabulary",
      },
      {
        title: "Grammar Rules",
        path: "/admin/languages/grammar",
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
  {
    title: "Newsletter",
    icon: Mail,
    path: "/admin/newsletter",
  },
];

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [footerCollapsed, setFooterCollapsed] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(true);

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none transition-all duration-300 relative ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* HEADER LOGO & SIDEBAR TOGGLE BUTTON */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-xl font-extrabold text-blue-500 tracking-wider truncate">
              SCHOLIQEN
            </h1>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">
              Admin Panel
            </p>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto">
            <h1 className="text-lg font-extrabold text-blue-500">SQ</h1>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* NAVIGATION SECTION */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {menuItems.map((item) => {
          const Icon = item.icon;

          // RENDER COLLAPSIBLE MENU ITEM (LANGUAGES)
          if (item.collapsible) {
            // When the sidebar is collapsed, show standard link/icon or prevent drop open
            if (isCollapsed) {
              return (
                <NavLink
                  key={item.title}
                  to="/admin/languages"
                  className={({ isActive }) =>
                    `flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    }`
                  }
                  title={item.title}
                >
                  <Icon size={20} />
                </NavLink>
              );
            }

            return (
              <div key={item.title} className="space-y-1">
                <button
                  onClick={() => setLanguagesOpen(!languagesOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition group ${
                    languagesOpen
                      ? "bg-slate-800/60 text-white"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon size={20} className={languagesOpen ? "text-blue-500" : "text-slate-400"} />
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  {languagesOpen ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {/* SUB-MENU ITEMS */}
                {languagesOpen && (
                  <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.title}
                        to={child.path}
                        end={child.path === "/admin/languages"}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 ${
                            isActive
                              ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-900/20"
                              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`
                        }
                      >
                        <Globe size={15} className="opacity-70" />
                        <span>{child.title}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // RENDER STANDARD NAVLINK ITEM
          return (
            <NavLink
              key={item.title}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3"} rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`
              }
              title={isCollapsed ? item.title : undefined}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="font-medium text-sm">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER SECTION */}
      {!isCollapsed && (
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-950/50 p-4 relative border border-slate-800/50">
            <button
              onClick={() => setFooterCollapsed(!footerCollapsed)}
              className="absolute top-2.5 right-2.5 text-slate-500 hover:text-white transition p-1"
              title={footerCollapsed ? "Expand info" : "Collapse info"}
            >
              {footerCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {!footerCollapsed ? (
              <div className="pr-5">
                <p className="text-sm font-semibold text-white tracking-wide">
                  Scholiqen
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Learning Management System
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-slate-400 py-0.5">
                <GraduationCap size={18} className="text-blue-500" />
                <span className="text-xs font-semibold text-slate-300">
                  LMS Info
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;