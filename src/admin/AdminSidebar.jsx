// src/admin/components/AdminSidebar.jsx

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  FlaskConical,
  FileText,
  Building2,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Mail,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Video,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";

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
    title: "Schools",
    icon: Building2,
    collapsible: true,
    children: [
      {
        title: "Overview",
        path: "/admin/schools",
      },
      {
        title: "Universities",
        path: "/admin/schools/universities",
      },
      {
        title: "Colleges",
        path: "/admin/schools/colleges",
      },
      {
        title: "Polytechnics",
        path: "/admin/schools/polytechnics",
      },
    ],
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
    icon: ClipboardList,
    collapsible: true,
    children: [
      {
        title: "Overview",
        path: "/admin/cbt",
      },
      {
        title: "Upload Questions",
        path: "/admin/cbt/questions/upload",
      },
      {
        title: "Manage Questions",
        path: "/admin/cbt/questions",
      },
      {
        title: "Results",
        path: "/admin/cbt/results",
      },
    ],
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
  const [cbtOpen, setCbtOpen] = useState(true);
  const [schoolsOpen, setSchoolsOpen] = useState(true);
  
  // LIVE MEDIA COUNT
  const [mediaCount, setMediaCount] = useState(0);

  // -------------------------------------------------------
  // FETCH LIVE MEDIA COUNT
  // -------------------------------------------------------

  const fetchMediaCount = async () => {
    const { count, error } = await supabase
      .from("media")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (error) {
      console.error("Error fetching media count:", error);
      return;
    }

    setMediaCount(count || 0);
  };

  // -------------------------------------------------------
  // INITIAL MEDIA COUNT
  // -------------------------------------------------------

  useEffect(() => {
    fetchMediaCount();

    // Refresh count every 30 seconds
    const interval = setInterval(() => {
      fetchMediaCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none transition-all duration-300 relative ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* HEADER LOGO & SIDEBAR TOGGLE */}

      <div
        className={`flex items-center ${
          isCollapsed
            ? "justify-center px-3"
            : "justify-between px-5"
        } py-5 border-b border-slate-800`}
      >
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              SCHOLIQEN
            </h1>

            <p className="text-[11px] text-slate-500 mt-0.5">
              Admin Panel
            </p>
          </div>
        )}

        {isCollapsed && (
          <div>
            <h1 className="text-lg font-extrabold text-blue-500">
              SQ
            </h1>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          title={
            isCollapsed
              ? "Expand Sidebar"
              : "Collapse Sidebar"
          }
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {menuItems.map((item) => {
          const Icon = item.icon;

          // -------------------------------------------------
          // COLLAPSIBLE ITEMS
          // -------------------------------------------------

          if (item.collapsible) {
            // Collapsed sidebar
            if (isCollapsed) {
              const collapsedPath =
                item.title === "Languages"
                  ? "/admin/languages"
                  : item.title === "CBT"
                  ? "/admin/cbt"
                  : "/admin/schools";

              return (
                <NavLink
                  key={item.title}
                  to={collapsedPath}
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

            const isOpen =
              item.title === "Languages"
                ? languagesOpen
                : item.title === "CBT"
                ? cbtOpen
                : schoolsOpen;

            const toggleMenu = () => {
              if (item.title === "Languages") {
                setLanguagesOpen((prev) => !prev);
              } else if (item.title === "CBT") {
                setCbtOpen((prev) => !prev);
              } else {
                setSchoolsOpen((prev) => !prev);
              }
            };

            return (
              <div
                key={item.title}
                className="space-y-1"
              >
                {/* COLLAPSIBLE HEADER */}

                <button
                  onClick={toggleMenu}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition group ${
                    isOpen
                      ? "bg-slate-800/60 text-white"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon
                      size={20}
                      className={
                        isOpen
                          ? "text-blue-500"
                          : "text-slate-400"
                      }
                    />

                    <span className="font-medium text-sm">
                      {item.title}
                    </span>
                  </div>

                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {/* SUB MENU */}

                {isOpen && (
                  <div className="ml-5 pl-3 border-l border-slate-800 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.title}
                        to={child.path}
                        end={
                          child.path === "/admin/languages" ||
                          child.path === "/admin/cbt" ||
                          child.path === "/admin/schools"
                        }
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 ${
                            isActive
                              ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-900/20"
                              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`
                        }
                      >
                        {child.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // -------------------------------------------------
          // STANDARD NAVIGATION ITEM
          // -------------------------------------------------

          return (
            <NavLink
              key={item.title}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed
                    ? "justify-center p-3"
                    : "gap-4 px-4 py-3"
                } rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`
              }
              title={
                isCollapsed
                  ? item.title
                  : undefined
              }
            >
              <Icon size={20} />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium text-sm">
                    {item.title}
                  </span>

                  {/* ---------------------------------------
                      LIVE MEDIA COUNT
                  --------------------------------------- */}

                  {item.title === "Media" && (
                    <span
                      className={`min-w-[24px] h-6 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                        mediaCount > 0
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {mediaCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER */}

      {!isCollapsed && (
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-950/50 p-4 relative border border-slate-800/50">
            <button
              onClick={() =>
                setFooterCollapsed(!footerCollapsed)
              }
              className="absolute top-2.5 right-2.5 text-slate-500 hover:text-white transition p-1"
              title={
                footerCollapsed
                  ? "Expand info"
                  : "Collapse info"
              }
            >
              {footerCollapsed ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
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
                <GraduationCap
                  size={18}
                  className="text-blue-500"
                />

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