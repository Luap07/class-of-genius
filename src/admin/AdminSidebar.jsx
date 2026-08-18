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
  MessageSquareText,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Video,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
  Image as ImageIcon,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";

/* ============================================================
   MENU
============================================================ */

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

  /* ==========================================================
     SCHOOLS
  ========================================================== */

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

  /* ==========================================================
     DOCUMENTS
  ========================================================== */

  {
    title: "Documents",
    icon: FileText,
    path: "/admin/documents",
  },

  /* ==========================================================
     RESOURCES
  ========================================================== */

  {
    title: "Resources",
    icon: Video,
    path: "/admin/resources",
  },

  /* ==========================================================
     VIRTUAL LABS
  ========================================================== */

  {
    title: "Virtual Labs",
    icon: FlaskConical,
    path: "/admin/labs",
  },

  /* ==========================================================
     CBT
  ========================================================== */

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
        title: "Extract From Image",
        path: "/admin/cbt/questions/upload",
      },

      {
        title: "Manage Questions",
        path: "/admin/cbt/questions",
      },

      {
        title: "Subjects",
        path: "/admin/cbt/subjects",
      },

      {
        title: "Exams",
        path: "/admin/cbt/exams",
      },

      {
        title: "Results",
        path: "/admin/cbt/results",
      },

      {
        title: "Analytics",
        path: "/admin/cbt/analytics",
      },
    ],
  },

  /* ==========================================================
     NOVELS
  ========================================================== */

  {
    title: "Novels",
    icon: BookOpen,
    path: "/admin/novels",
  },

  /* ==========================================================
     USERS
  ========================================================== */

  {
    title: "Users",
    icon: Users,
    path: "/admin/users",
  },

  /* ==========================================================
     ANALYTICS
  ========================================================== */

  {
    title: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
  },

  /* ==========================================================
     LANGUAGES
  ========================================================== */

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

  /* ==========================================================
     MESSAGES
  ========================================================== */

  {
    title: "Messages",
    icon: MessageSquareText,
    path: "/admin/messages",
  },

  /* ==========================================================
     SETTINGS
  ========================================================== */

  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },

  /* ==========================================================
     NEWSLETTER
  ========================================================== */

  {
    title: "Newsletter",
    icon: Mail,
    path: "/admin/newsletter",
  },
];

/* ============================================================
   COMPONENT
============================================================ */

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const [footerCollapsed, setFooterCollapsed] =
    useState(false);

  const [languagesOpen, setLanguagesOpen] =
    useState(false);

  const [cbtOpen, setCbtOpen] =
    useState(false);

  const [schoolsOpen, setSchoolsOpen] =
    useState(false);

  const [mediaCount, setMediaCount] =
    useState(0);

  /* ==========================================================
     MEDIA COUNT
  ========================================================== */

  const fetchMediaCount = async () => {
    try {
      const { count, error } = await supabase
        .from("media")
        .select("*", {
          count: "exact",
          head: true,
        });

      if (error) {
        console.error(
          "Error fetching media count:",
          error
        );

        return;
      }

      setMediaCount(count || 0);
    } catch (error) {
      console.error(
        "Media count error:",
        error
      );
    }
  };

  useEffect(() => {
    fetchMediaCount();

    const interval = setInterval(() => {
      fetchMediaCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* ==========================================================
     COLLAPSIBLE STATE
  ========================================================== */

  const getOpenState = (title) => {
    if (title === "Languages") {
      return languagesOpen;
    }

    if (title === "CBT") {
      return cbtOpen;
    }

    if (title === "Schools") {
      return schoolsOpen;
    }

    return false;
  };

  const toggleMenu = (title) => {
    if (title === "Languages") {
      setLanguagesOpen((previous) => !previous);
      return;
    }

    if (title === "CBT") {
      setCbtOpen((previous) => !previous);
      return;
    }

    if (title === "Schools") {
      setSchoolsOpen((previous) => !previous);
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col select-none border-r border-slate-800 bg-slate-900 transition-all duration-300 ${
        isCollapsed
          ? "w-20"
          : "w-72"
      }`}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className={`flex items-center border-b border-slate-800 py-5 ${
          isCollapsed
            ? "justify-center px-3"
            : "justify-between px-5"
        }`}
      >
        {!isCollapsed ? (
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              SCHOLIQEN
            </h1>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Admin Panel
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-lg font-extrabold text-blue-500">
              SQ
            </h1>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setIsCollapsed(
              (previous) => !previous
            )
          }
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
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

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6 scrollbar-thin scrollbar-thumb-slate-800">
        {menuItems.map((item) => {
          const Icon = item.icon;

          /* ==================================================
             COLLAPSIBLE
          ================================================== */

          if (item.collapsible) {
            /* ================================================
               COLLAPSED SIDEBAR
            ================================================= */

            if (isCollapsed) {
              let collapsedPath = "/admin";

              if (item.title === "CBT") {
                collapsedPath =
                  "/admin/cbt";
              }

              if (item.title === "Languages") {
                collapsedPath =
                  "/admin/languages";
              }

              if (item.title === "Schools") {
                collapsedPath =
                  "/admin/schools";
              }

              return (
                <NavLink
                  key={item.title}
                  to={collapsedPath}
                  end={
                    collapsedPath ===
                    "/admin/cbt"
                  }
                  className={({ isActive }) =>
                    `flex items-center justify-center rounded-xl p-3 transition-all duration-200 ${
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

            /* ================================================
               EXPANDED SIDEBAR
            ================================================= */

            const isOpen =
              getOpenState(item.title);

            return (
              <div
                key={item.title}
                className="space-y-1"
              >
                {/* ==========================================
                    SECTION BUTTON
                ========================================== */}

                <button
                  type="button"
                  onClick={() =>
                    toggleMenu(item.title)
                  }
                  className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 transition ${
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

                    <span className="text-sm font-medium">
                      {item.title}
                    </span>
                  </div>

                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {/* ==========================================
                    CHILDREN
                ========================================== */}

                {isOpen && (
                  <div className="ml-5 space-y-1 border-l border-slate-800 pl-3">
                    {item.children.map(
                      (child) => {
                        const isQuestionImporter =
                          child.path ===
                          "/admin/cbt/questions/upload";

                        return (
                          <NavLink
                            key={`${child.title}-${child.path}`}
                            to={child.path}
                            end={
                              child.path ===
                                "/admin/cbt" ||
                              child.path ===
                                "/admin/schools" ||
                              child.path ===
                                "/admin/languages"
                            }
                            className={({ isActive }) =>
                              `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 ${
                                isActive
                                  ? "bg-blue-600 font-medium text-white shadow-md shadow-blue-900/20"
                                  : isQuestionImporter
                                  ? "text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              }`
                            }
                          >
                            {isQuestionImporter && (
                              <ImageIcon
                                size={15}
                                className="shrink-0"
                              />
                            )}

                            <span>
                              {child.title}
                            </span>
                          </NavLink>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            );
          }

          /* ==================================================
             STANDARD ITEM
          ================================================== */

          return (
            <NavLink
              key={item.title}
              to={item.path}
              end={
                item.path === "/admin"
              }
              className={({ isActive }) =>
                `flex items-center rounded-xl transition-all duration-200 ${
                  isCollapsed
                    ? "justify-center p-3"
                    : "gap-4 px-4 py-3"
                } ${
                  isActive
                    ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-900/20"
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
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>

                  {item.title ===
                    "Media" && (
                    <span
                      className={`flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                        mediaCount > 0
                          ? "border border-blue-500/20 bg-blue-500/15 text-blue-400"
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

      {/* ======================================================
          FOOTER
      ====================================================== */}

      {!isCollapsed && (
        <div className="border-t border-slate-800 p-4">
          <div className="relative rounded-xl border border-slate-800/50 bg-slate-950/50 p-4">
            <button
              type="button"
              onClick={() =>
                setFooterCollapsed(
                  (previous) => !previous
                )
              }
              className="absolute right-2.5 top-2.5 rounded p-1 text-slate-500 transition hover:text-white"
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
                <p className="text-sm font-semibold tracking-wide text-white">
                  Scholiqen
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                  Learning Management
                  System
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 py-0.5 text-slate-400">
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