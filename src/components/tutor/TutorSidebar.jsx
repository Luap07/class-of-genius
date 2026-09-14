// src/components/tutor/TutorSidebar.jsx

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Presentation,
  Library,
  Video,
  Users,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  CalendarDays,
  X,
  Sparkles,
  Menu,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

/* =========================================================
   STORAGE KEYS
========================================================= */

const ACADEMY_TOKEN_KEY = "scholiqen_academy_token";
const ACADEMY_USER_KEY = "scholiqen_academy_user";

/* =========================================================
   MENU ITEMS
========================================================= */

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/academy/tutor",
  },

  {
    id: "classes",
    label: "My Classes",
    icon: GraduationCap,
    children: [
      {
        label: "All Classes",
        path: "/academy/tutor/classes",
      },
      {
        label: "Class Details",
        path: "/academy/tutor/classes/details",
      },
      {
        label: "Students",
        path: "/academy/tutor/students",
      },
    ],
  },

  {
    id: "tasks",
    label: "Tasks",
    icon: ClipboardList,
    children: [
      {
        label: "My Tasks",
        path: "/academy/tutor/tasks",
      },
      {
        label: "Create Task",
        path: "/academy/tutor/tasks/create",
      },
      {
        label: "Submissions",
        path: "/academy/tutor/task/submissions",
      },
    ],
  },

  {
    id: "assignments",
    label: "Assignments",
    icon: ClipboardCheck,
    children: [
      {
        label: "Assignments",
        path: "/academy/tutor/assignments",
      },
      {
        label: "Create Assignment",
        path: "/academy/tutor/assignments/create",
      },
    ],
  },

  {
    id: "lessons",
    label: "Lessons",
    icon: Presentation,
    children: [
      {
        label: "Lesson Plans",
        path: "/academy/tutor/lessons",
      },
      {
        label: "Create Lesson",
        path: "/academy/tutor/lessons/create",
      },
    ],
  },

  {
    id: "materials",
    label: "Materials",
    icon: Library,
    children: [
      {
        label: "My Materials",
        path: "/academy/tutor/materials",
      },
      
    ],
  },

  {
    id: "live-classes",
    label: "Live Classes",
    icon: Video,
    children: [
      {
        label: "Upcoming",
        path: "/academy/tutor/live",
      },
      {
        label: "Start Live Class",
        path: "/academy/tutor/live/start",
      },
      {
        label: "Live Classroom",
        path: "/academy/tutor/live/classroom",
      },
    ],
  },

  {
    id: "attendance",
    label: "Attendance",
    icon: Users,
    path: "/academy/tutor/attendance",
  },

  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDays,
    path: "/academy/tutor/calendar",
  },

  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    children: [
      {
        label: "Students",
        path: "/academy/tutor/messages/students",
      },
      
    ],
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const TutorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [tutor, setTutor] = useState(null);

  /* =======================================================
     LOAD TUTOR
  ======================================================= */

  useEffect(() => {
    try {
      const storedTutor = localStorage.getItem(ACADEMY_USER_KEY);

      if (storedTutor) {
        const parsedTutor = JSON.parse(storedTutor);
        setTutor(parsedTutor);
      }
    } catch (error) {
      console.error("Unable to load tutor:", error);
    }
  }, []);

  /* =======================================================
     AUTO EXPAND ACTIVE MENU
  ======================================================= */

  useEffect(() => {
    const activeParent = {};

    menuItems.forEach((item) => {
      if (!item.children) return;

      const isActive = item.children.some((child) =>
        location.pathname === child.path ||
        location.pathname.startsWith(`${child.path}/`)
      );

      if (isActive) {
        activeParent[item.id] = true;
      }
    });

    setExpandedMenus((prev) => ({
      ...prev,
      ...activeParent,
    }));
  }, [location.pathname]);

  /* =======================================================
     CLOSE MOBILE SIDEBAR ON ROUTE CHANGE
  ======================================================= */

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  /* =======================================================
     TOGGLE MENU
  ======================================================= */

  const toggleMenu = (id) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  /* =======================================================
     ACTIVE CHECK
  ======================================================= */

  const isPathActive = (path) => {
    if (path === "/academy/tutor") {
      return location.pathname === "/academy/tutor";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  /* =======================================================
     SIGN OUT
  ======================================================= */

  const handleSignOut = () => {
    try {
      localStorage.removeItem(ACADEMY_TOKEN_KEY);
      localStorage.removeItem(ACADEMY_USER_KEY);

      localStorage.removeItem("tutor");
      localStorage.removeItem("academyTutor");
      localStorage.removeItem("scholiqen_user");
      localStorage.removeItem("tutorReference");
    } catch (error) {
      console.error("Sign out cleanup error:", error);
    }

    navigate("/academy/tutor/login", {
      replace: true,
    });
  };

  /* =======================================================
     TUTOR NAME
  ======================================================= */

  const tutorName =
    tutor?.name ||
    tutor?.full_name ||
    tutor?.fullName ||
    tutor?.tutorName ||
    "Tutor";

  const tutorReference =
    tutor?.reference ||
    tutor?.tutorReference ||
    tutor?.applicationReference ||
    "Academy Tutor";

  /* =======================================================
     SIDEBAR CONTENT
  ======================================================= */

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#020617] text-white">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <button
          type="button"
          onClick={() => handleNavigation("/academy/tutor")}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
            <GraduationCap
              size={22}
              className="text-cyan-400"
            />
          </div>

          <div className="text-left">
            <p className="text-sm font-bold tracking-wide text-white">
              SCHOLIQEN
            </p>

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-400/80">
              Academy Tutor
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* ===================================================
          TUTOR PROFILE
      =================================================== */}

      <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-[#071426] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
            <UserCircle
              size={27}
              className="text-cyan-400"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {tutorName}
            </p>

            <p className="truncate text-[11px] text-slate-400">
              {tutorReference}
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <div className="mb-3 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Workspace
          </p>
        </div>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const hasChildren =
              Array.isArray(item.children) &&
              item.children.length > 0;

            const active =
              !hasChildren && isPathActive(item.path);

            const parentActive =
              hasChildren &&
              item.children.some((child) =>
                isPathActive(child.path)
              );

            const expanded =
              expandedMenus[item.id] || parentActive;

            return (
              <div key={item.id}>
                {/* =========================================
                    PARENT ITEM
                ========================================= */}

                <button
                  type="button"
                  onClick={() => {
                    if (hasChildren) {
                      toggleMenu(item.id);
                    } else if (item.path) {
                      handleNavigation(item.path);
                    }
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                    active || parentActive
                      ? "border border-cyan-400/10 bg-cyan-400/10 text-cyan-300"
                      : "border border-transparent text-slate-300 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon
                      size={18}
                      className={`shrink-0 ${
                        active || parentActive
                          ? "text-cyan-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />

                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>
                  </span>

                  {hasChildren && (
                    <span className="shrink-0 text-slate-500">
                      {expanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                  )}
                </button>

                {/* =========================================
                    CHILDREN
                ========================================= */}

                {hasChildren && expanded && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {item.children.map((child) => {
                      const childActive = isPathActive(
                        child.path
                      );

                      return (
                        <button
                          key={child.path}
                          type="button"
                          onClick={() =>
                            handleNavigation(child.path)
                          }
                          className={`relative flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                            childActive
                              ? "bg-cyan-400/10 font-medium text-cyan-300"
                              : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          {childActive && (
                            <span className="absolute -left-[17px] h-5 w-0.5 rounded-full bg-cyan-400" />
                          )}

                          <span className="truncate">
                            {child.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* ===================================================
          SMART TEACHING AI
      =================================================== */}

      <div className="mx-4 mb-4 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] to-blue-500/[0.04] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
            <Sparkles
              size={17}
              className="text-cyan-400"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">
              Smart Teaching AI
            </p>

            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              Get help creating engaging learning
              experiences for your students.
            </p>

            <button
              type="button"
              onClick={() =>
                handleNavigation("/ai-tutor")
              }
              className="mt-3 text-[11px] font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              Open AI Assistant →
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          BOTTOM ACTIONS
      =================================================== */}

      <div className="border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={() =>
            handleNavigation("/academy/tutor/profile")
          }
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <UserCircle
            size={18}
            className="text-slate-500 group-hover:text-slate-300"
          />

          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() =>
            handleNavigation("/academy/tutor/settings")
          }
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <Settings
            size={18}
            className="text-slate-500 group-hover:text-slate-300"
          />

          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut
            size={18}
            className="text-slate-500 group-hover:text-red-400"
          />

          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          MOBILE MENU BUTTON
      =================================================== */}

      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#071426]/95 text-slate-200 shadow-xl backdrop-blur-xl transition hover:border-cyan-400/20 hover:text-cyan-400 lg:hidden"
        aria-label="Open tutor sidebar"
      >
        <Menu size={21} />
      </button>

      {/* ===================================================
          MOBILE BACKDROP
      =================================================== */}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ===================================================
          DESKTOP SIDEBAR
      =================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[280px] border-r border-white/10 bg-[#020617] lg:block">
        {sidebarContent}
      </aside>

      {/* ===================================================
          MOBILE SIDEBAR
      =================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[285px] border-r border-white/10 bg-[#020617] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default TutorSidebar;