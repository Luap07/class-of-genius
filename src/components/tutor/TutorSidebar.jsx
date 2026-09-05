// src/components/tutor/TutorSidebar.jsx

import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
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
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

/* ============================================================
   AUTH KEYS
============================================================ */

const ACADEMY_TOKEN_KEY = "scholiqen_academy_token";
const ACADEMY_USER_KEY = "scholiqen_academy_user";

/* ============================================================
   MENU DATA
============================================================ */

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/academy/tutor",
  },

  {
    label: "My Classes",
    icon: Users,
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
        path: "/academy/tutor/tasks/submissions",
      },
    ],
  },

  {
    label: "Assignments",
    icon: FileText,
    children: [
      {
        label: "Assignments",
        path: "/academy/tutor/assignments",
      },
      {
        label: "Create Assignment",
        path: "/academy/tutor/assignments/create",
      },
      {
        label: "Grading",
        path: "/academy/tutor/assignments/grading",
      },
    ],
  },

  {
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
      {
        label: "Lesson History",
        path: "/academy/tutor/lessons/history",
      },
    ],
  },

  {
    label: "Materials",
    icon: Library,
    children: [
      {
        label: "My Materials",
        path: "/academy/tutor/materials",
      },
      {
        label: "Upload Material",
        path: "/academy/tutor/materials/upload",
      },
    ],
  },

  {
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
      {
        label: "Past Classes",
        path: "/academy/tutor/live/history",
      },
    ],
  },

  {
    label: "Attendance",
    icon: ClipboardCheck,
    path: "/academy/tutor/attendance",
  },

  {
    label: "Student Progress",
    icon: BarChart3,
    path: "/academy/tutor/progress",
  },

  {
    label: "Calendar",
    icon: CalendarDays,
    path: "/academy/tutor/calendar",
  },

  {
    label: "Messages",
    icon: MessageSquare,
    children: [
      {
        label: "Students",
        path: "/academy/tutor/messages/students",
      },
      {
        label: "Class Messages",
        path: "/academy/tutor/messages/classes",
      },
    ],
  },

  {
    label: "Announcements",
    icon: Bell,
    path: "/academy/tutor/announcements",
  },
];

/* ============================================================
   COMPONENT
============================================================ */

export default function TutorSidebar({
  mobileOpen = false,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({
    "My Classes": true,
  });

  const [loggingOut, setLoggingOut] = useState(false);

  /* ==========================================================
     GET TUTOR
  ========================================================== */

  const getTutor = () => {
    try {
      const savedUser = localStorage.getItem(
        ACADEMY_USER_KEY
      );

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  };

  const tutor = getTutor();

  /* ==========================================================
     NAME
  ========================================================== */

  const tutorName =
    [
      tutor?.firstName,
      tutor?.middleName,
      tutor?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    tutor?.name ||
    "Tutor";

  /* ==========================================================
     SPECIALIZATION
  ========================================================== */

  const specialization =
    tutor?.specialization ||
    tutor?.qualification ||
    "Tutor";

  /* ==========================================================
     AVATAR INITIALS
  ========================================================== */

  const initials = tutorName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  /* ==========================================================
     ACTIVE ROUTE
  ========================================================== */

  const isActive = (path) => {
    if (path === "/academy/tutor") {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  /* ==========================================================
     MENU ACTIVE
  ========================================================== */

  const isParentActive = (item) => {
    if (!item.children) {
      return false;
    }

    return item.children.some((child) =>
      isActive(child.path)
    );
  };

  /* ==========================================================
     TOGGLE MENU
  ========================================================== */

  const toggleMenu = (label) => {
    setOpenMenus((previous) => ({
      ...previous,
      [label]: !previous[label],
    }));
  };

  /* ==========================================================
     NAVIGATE
  ========================================================== */

  const handleNavigation = (path) => {
    navigate(path);

    if (onClose) {
      onClose();
    }
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    localStorage.removeItem(
      ACADEMY_TOKEN_KEY
    );

    localStorage.removeItem(
      ACADEMY_USER_KEY
    );

    navigate("/academy/login", {
      replace: true,
    });
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* ======================================================
          MOBILE BACKDROP
      ====================================================== */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-[280px]
          flex-col
          border-r
          border-white/10
          bg-[#050816]
          shadow-2xl
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ==================================================
            BRAND
        ================================================== */}

        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <button
            type="button"
            onClick={() =>
              handleNavigation(
                "/academy/tutor"
              )
            }
            className="flex items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 shadow-lg shadow-cyan-500/20">
              <GraduationCap
                size={23}
                className="text-white"
              />

              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#050816] bg-cyan-400" />
            </div>

            <div className="text-left">
              <div className="text-lg font-black tracking-tight text-white">
                Scholiqen
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Tutor Academy
              </div>
            </div>
          </button>

          {/* Mobile Close */}

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* ==================================================
            TUTOR PROFILE
        ================================================== */}

        <div className="border-b border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-500/10">
                {initials || "T"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {tutorName}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {specialization}
                </p>
              </div>

              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />
            </div>
          </div>
        </div>

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Teaching
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                isActive(item.path) ||
                isParentActive(item);

              const expanded =
                openMenus[item.label];

              /* ==============================================
                 SIMPLE ITEM
              ============================================== */

              if (!item.children) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      handleNavigation(
                        item.path
                      )
                    }
                    className={`
                      group
                      relative
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      transition-all
                      duration-200
                      ${
                        active
                          ? "bg-cyan-400/10 text-cyan-300"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }
                    `}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400" />
                    )}

                    <Icon
                      size={18}
                      className={`
                        shrink-0 transition
                        ${
                          active
                            ? "text-cyan-400"
                            : "text-slate-500 group-hover:text-slate-300"
                        }
                      `}
                    />

                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              }

              /* ==============================================
                 PARENT ITEM
              ============================================== */

              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() =>
                      toggleMenu(
                        item.label
                      )
                    }
                    className={`
                      group
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      transition-all
                      ${
                        active
                          ? "bg-white/[0.04] text-white"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={`
                        shrink-0
                        ${
                          active
                            ? "text-cyan-400"
                            : "text-slate-500 group-hover:text-slate-300"
                        }
                      `}
                    />

                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>

                    {expanded ? (
                      <ChevronDown
                        size={15}
                        className="text-slate-600"
                      />
                    ) : (
                      <ChevronRight
                        size={15}
                        className="text-slate-600"
                      />
                    )}
                  </button>

                  {/* ==========================================
                      CHILDREN
                  ========================================== */}

                  {expanded && (
                    <div className="ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children.map(
                        (child) => {
                          const childActive =
                            isActive(
                              child.path
                            );

                          return (
                            <button
                              key={
                                child.path
                              }
                              type="button"
                              onClick={() =>
                                handleNavigation(
                                  child.path
                                )
                              }
                              className={`
                                relative
                                flex
                                w-full
                                items-center
                                rounded-lg
                                px-3
                                py-2
                                text-left
                                text-xs
                                transition
                                ${
                                  childActive
                                    ? "bg-cyan-400/10 font-semibold text-cyan-300"
                                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                                }
                              `}
                            >
                              {childActive && (
                                <span className="absolute -left-[17px] top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-cyan-400" />
                              )}

                              {child.label}
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ==================================================
              SMART TEACHING
          ================================================== */}

          <div className="mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Smart Teaching
          </div>

          <button
            type="button"
            onClick={() =>
              handleNavigation(
                "/academy/tutor/ai-assistant"
              )
            }
            className="group mt-2 flex w-full items-center gap-3 rounded-xl border border-violet-500/10 bg-gradient-to-r from-violet-500/10 to-cyan-500/5 px-3 py-3 text-left transition hover:border-violet-400/20 hover:bg-violet-500/15"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15">
              <Sparkles
                size={17}
                className="text-violet-400"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white">
                AI Teaching Assistant
              </p>

              <p className="mt-0.5 truncate text-[10px] text-slate-500">
                Plan, grade & analyze
              </p>
            </div>
          </button>
        </nav>

        {/* ==================================================
            BOTTOM ACTIONS
        ================================================== */}

        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() =>
              handleNavigation(
                "/academy/tutor/profile"
              )
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <UserCircle size={18} />

            <span className="text-sm font-medium">
              My Profile
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleNavigation(
                "/academy/tutor/settings"
              )
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <Settings size={18} />

            <span className="text-sm font-medium">
              Settings
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={18} />

            <span className="text-sm font-medium">
              {loggingOut
                ? "Signing out..."
                : "Sign Out"}
            </span>
          </button>

          <div className="mt-3 px-3 text-center text-[9px] text-slate-700">
            Scholiqen Tutor Academy
          </div>
        </div>
      </aside>
    </>
  );
}