// src/components/tutor/TutorSidebar.jsx

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Presentation,
  Library,
  Video,
  Users,
  ClipboardCheck,
  MessageSquare,
  UserCircle,
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

// IMPORTANT:
// If your assets folder is src/assets, this is the correct path
// from src/components/tutor/TutorSidebar.jsx
import Cog from "../../assets/cog.png";

/* =========================================================
   STORAGE KEYS
========================================================= */

const ACADEMY_TOKEN_KEY = "scholiqen_academy_token";
const ACADEMY_USER_KEY = "scholiqen_academy_user";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const API_BASE_URL = `${API_URL}/api/academy`;

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
  const [profileImage, setProfileImage] = useState("");

  /* =======================================================
     GET IMAGE URL
  ======================================================= */

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    const value = String(image).trim();

    if (!value) {
      return "";
    }

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("blob:") ||
      value.startsWith("data:")
    ) {
      return value;
    }

    if (value.startsWith("/")) {
      return `${API_URL}${value}`;
    }

    return `${API_URL}/${value}`;
  };

  /* =======================================================
     GET TUTOR REFERENCE
  ======================================================= */

  const getTutorReference = () => {
    try {
      const directReference =
        localStorage.getItem("tutorReference") ||
        localStorage.getItem("tutor_reference");

      if (directReference) {
        return directReference;
      }

      const possibleKeys = [
        "tutor",
        "academyTutor",
        "scholiqen_user",
        ACADEMY_USER_KEY,
      ];

      for (const key of possibleKeys) {
        const raw = localStorage.getItem(key);

        if (!raw) {
          continue;
        }

        try {
          const parsed = JSON.parse(raw);

          const reference =
            parsed?.tutorReference ||
            parsed?.reference ||
            parsed?.tutor_reference ||
            parsed?.applicationReference ||
            parsed?.application_reference;

          if (reference) {
            return reference;
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    return "";
  };

  /* =======================================================
     GET IMAGE FROM TUTOR OBJECT
  ======================================================= */

  const getTutorProfileImage = (data) => {
    if (!data) {
      return "";
    }

    return (
      data.profileImage ||
      data.profile_image ||
      data.profileImageUrl ||
      data.profile_image_url ||
      data.imageUrl ||
      data.image_url ||
      data.avatar ||
      data.photo ||
      data.profile?.profileImage ||
      data.profile?.profileImageUrl ||
      data.profile?.profile_image_url ||
      data.data?.profileImage ||
      data.data?.profileImageUrl ||
      data.data?.profile_image_url ||
      ""
    );
  };

  /* =======================================================
     LOAD TUTOR
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadTutor = async () => {
      let storedTutor = null;

      try {
        const stored =
          localStorage.getItem(ACADEMY_USER_KEY);

        if (stored) {
          storedTutor = JSON.parse(stored);
        }
      } catch (error) {
        console.error(
          "Unable to load stored tutor:",
          error
        );
      }

      if (!cancelled && storedTutor) {
        setTutor(storedTutor);

        const storedImage =
          getTutorProfileImage(storedTutor);

        if (storedImage) {
          setProfileImage(
            getImageUrl(storedImage)
          );
        }
      }

      /* ---------------------------------------------------
         FETCH ACTUAL PROFILE
      --------------------------------------------------- */

      const tutorReference = getTutorReference();

      if (!tutorReference) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/tutor/profile`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "x-tutor-reference": tutorReference,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        const profile =
          data?.profile ||
          data?.tutor ||
          data?.data ||
          data;

        if (profile) {
          setTutor((previous) => ({
            ...(previous || {}),
            ...profile,
          }));
        }

        const image =
          getTutorProfileImage(profile);

        if (image) {
          setProfileImage(
            getImageUrl(image)
          );
        }
      } catch (error) {
        console.error(
          "Unable to load tutor profile:",
          error
        );
      }
    };

    loadTutor();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     LISTEN FOR PROFILE IMAGE CHANGES
  ======================================================= */

  useEffect(() => {
    const handleProfileImageUpdate = (event) => {
      const image =
        event?.detail?.profileImage ||
        event?.detail?.profileImageUrl ||
        event?.detail?.profile_image_url ||
        "";

      if (image) {
        setProfileImage(
          getImageUrl(image)
        );
      }
    };

    window.addEventListener(
      "tutorProfileUpdated",
      handleProfileImageUpdate
    );

    return () => {
      window.removeEventListener(
        "tutorProfileUpdated",
        handleProfileImageUpdate
      );
    };
  }, []);

  /* =======================================================
     AUTO EXPAND ACTIVE MENU
  ======================================================= */

  useEffect(() => {
    const activeParent = {};

    menuItems.forEach((item) => {
      if (!item.children) {
        return;
      }

      const isActive = item.children.some(
        (child) =>
          location.pathname === child.path ||
          location.pathname.startsWith(
            `${child.path}/`
          )
      );

      if (isActive) {
        activeParent[item.id] = true;
      }
    });

    setExpandedMenus((previous) => ({
      ...previous,
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
    setExpandedMenus((previous) => ({
      ...previous,
      [id]: !previous[id],
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
     SETTINGS TOGGLE
  ======================================================= */

  const handleSettingsToggle = () => {
    navigate("/academy/tutor/settings");
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
      localStorage.removeItem(
        ACADEMY_TOKEN_KEY
      );

      localStorage.removeItem(
        ACADEMY_USER_KEY
      );

      localStorage.removeItem("tutor");
      localStorage.removeItem("academyTutor");
      localStorage.removeItem("scholiqen_user");
      localStorage.removeItem("tutorReference");
      localStorage.removeItem("tutor_reference");
    } catch (error) {
      console.error(
        "Sign out cleanup error:",
        error
      );
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
    [
      tutor?.firstName ||
        tutor?.first_name,
      tutor?.middleName ||
        tutor?.middle_name,
      tutor?.lastName ||
        tutor?.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Tutor";

  /* =======================================================
     TUTOR REFERENCE
  ======================================================= */

  const tutorReference =
    tutor?.reference ||
    tutor?.tutorReference ||
    tutor?.applicationReference ||
    tutor?.tutor_reference ||
    "Academy Tutor";

  /* =======================================================
     INITIALS
  ======================================================= */

  const getInitials = () => {
    const name = tutorName || "Tutor";

    const parts = name
      .split(" ")
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  /* =======================================================
     IMAGE ERROR
  ======================================================= */

  const handleImageError = () => {
    setProfileImage("");
  };

  /* =======================================================
     SIDEBAR CONTENT
  ======================================================= */

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#020617] text-white">

      {/* =================================================
          HEADER
      ================================================== */}

      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">

        <button
          type="button"
          onClick={() =>
            handleNavigation("/academy/tutor")
          }
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-cyan-400/20 bg-cyan-400/10">
            <img
              src={Cog}
              alt="Scholiqen"
              className="h-7 w-7 object-contain"
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
          onClick={() =>
            setIsMobileOpen(false)
          }
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* =================================================
          TUTOR PROFILE
      ================================================== */}

      <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-[#071426] p-3">
        <div className="flex items-center gap-3">

          {/* PROFILE IMAGE */}
          <div className="relative h-11 w-11 shrink-0">

            <div className="absolute -inset-0.5 rounded-full bg-cyan-400/10 blur-sm" />

            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-cyan-400/25 bg-gradient-to-br from-cyan-400/15 to-violet-500/15">

              {profileImage ? (
                <img
                  src={profileImage}
                  alt={`${tutorName} profile`}
                  className="h-full w-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <span className="text-xs font-black text-cyan-200">
                  {getInitials()}
                </span>
              )}
            </div>

            {/* ONLINE INDICATOR */}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#071426] bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.7)]" />
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

      {/* =================================================
          NAVIGATION
      ================================================== */}

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
              !hasChildren &&
              isPathActive(item.path);

            const parentActive =
              hasChildren &&
              item.children.some(
                (child) =>
                  isPathActive(child.path)
              );

            const expanded =
              expandedMenus[item.id] ||
              parentActive;

            return (
              <div key={item.id}>

                {/* PARENT ITEM */}

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

                {/* CHILDREN */}

                {hasChildren &&
                  expanded && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">

                      {item.children.map(
                        (child) => {
                          const childActive =
                            isPathActive(
                              child.path
                            );

                          return (
                            <button
                              key={child.path}
                              type="button"
                              onClick={() =>
                                handleNavigation(
                                  child.path
                                )
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
                        }
                      )}

                    </div>
                  )}

              </div>
            );
          })}

        </div>
      </nav>

      {/* =================================================
          SMART TEACHING AI
      ================================================== */}

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

      {/* =================================================
          BOTTOM ACTIONS
      ================================================== */}

      <div className="border-t border-white/10 px-3 py-3">

        {/* PROFILE */}

        <button
          type="button"
          onClick={() =>
            handleNavigation(
              "/academy/tutor/profile"
            )
          }
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <UserCircle
            size={18}
            className="text-slate-500 group-hover:text-slate-300"
          />

          <span>Profile</span>
        </button>

        {/* SETTINGS WITH COG IMAGE */}

        <button
          type="button"
          onClick={handleSettingsToggle}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
            location.pathname.startsWith(
              "/academy/tutor/settings"
            )
              ? "bg-cyan-400/10 text-cyan-300"
              : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
          }`}
        >

          <span className="flex h-[18px] w-[18px] items-center justify-center overflow-hidden">
            <img
              src={Cog}
              alt="Settings"
              className="h-[17px] w-[17px] object-contain opacity-70 transition group-hover:opacity-100"
            />
          </span>

          <span>Settings</span>
        </button>

        {/* SIGN OUT */}

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
      {/* MOBILE MENU BUTTON */}

      <button
        type="button"
        onClick={() =>
          setIsMobileOpen(true)
        }
        className="fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#071426]/95 text-slate-200 shadow-xl backdrop-blur-xl transition hover:border-cyan-400/20 hover:text-cyan-400 lg:hidden"
        aria-label="Open tutor sidebar"
      >
        <Menu size={21} />
      </button>

      {/* MOBILE BACKDROP */}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          onClick={() =>
            setIsMobileOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* DESKTOP SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[280px] border-r border-white/10 bg-[#020617] lg:block">
        {sidebarContent}
      </aside>

      {/* MOBILE SIDEBAR */}

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
