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
import Cog from "../../assets/cog.png";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const API_BASE_URL = `${API_URL}/api/academy`;

const TOKEN_KEY = "scholiqen_academy_token";
const USER_KEY = "scholiqen_academy_user";

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
      { label: "All Classes", path: "/academy/tutor/classes" },
      { label: "Class Details", path: "/academy/tutor/classes/details" },
      { label: "Students", path: "/academy/tutor/students" },
    ],
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: ClipboardList,
    children: [
      { label: "My Tasks", path: "/academy/tutor/tasks" },
      { label: "Create Task", path: "/academy/tutor/tasks/create" },
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
        label: "My Assignments",
        path: "/academy/tutor/assignments",
      },
      {
        label: "Create Assignment",
        path: "/academy/tutor/assignments/create",
      },
      {
        label: "Submissions",
        path: "/academy/tutor/assignments/submissions",
      },
    ],
  },
  {
    id: "lessons",
    label: "Lessons",
    icon: Presentation,
    children: [
      { label: "Lesson Plans", path: "/academy/tutor/lessons" },
      { label: "Create Lesson", path: "/academy/tutor/lessons/create" },
    ],
  },
  {
    id: "materials",
    label: "Materials",
    icon: Library,
    children: [
      { label: "My Materials", path: "/academy/tutor/materials" },
    ],
  },
  {
    id: "live-classes",
    label: "Live Classes",
    icon: Video,
    children: [
      { label: "Upcoming", path: "/academy/tutor/live" },
      { label: "Start Live Class", path: "/academy/tutor/live/start" },
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

function getTutorReference() {
  try {
    const directReference =
      localStorage.getItem("tutorReference") ||
      localStorage.getItem("tutor_reference");

    if (directReference?.startsWith("SQA-")) {
      return directReference;
    }

    const storageKeys = [
      USER_KEY,
      "tutor",
      "academyTutor",
      "scholiqen_user",
    ];

    for (const key of storageKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const user = JSON.parse(raw);
        const reference =
          user?.tutorReference ||
          user?.tutor_reference ||
          user?.applicationReference ||
          user?.application_reference ||
          user?.reference;

        if (typeof reference === "string" && reference.startsWith("SQA-")) {
          return reference;
        }
      } catch {
        // Ignore invalid stored JSON.
      }
    }
  } catch {
    // Ignore storage access errors.
  }

  return "";
}

function getProfileImage(user) {
  return (
    user?.profileImage ||
    user?.profile_image ||
    user?.profileImageUrl ||
    user?.profile_image_url ||
    user?.imageUrl ||
    user?.image_url ||
    user?.avatar ||
    user?.photo ||
    user?.profile?.profileImage ||
    user?.profile?.profileImageUrl ||
    user?.data?.profileImage ||
    user?.data?.profileImageUrl ||
    ""
  );
}

function getImageUrl(image) {
  if (!image) return "";

  const value = String(image).trim();
  if (!value) return "";

  if (/^(https?:\/\/|blob:|data:)/i.test(value)) {
    return value;
  }

  return `${API_URL}/${value.replace(/^\/+/, "")}`;
}

export default function TutorSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [tutor, setTutor] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTutor() {
      let storedTutor = null;

      try {
        const stored = localStorage.getItem(USER_KEY);
        if (stored) storedTutor = JSON.parse(stored);
      } catch {
        // Ignore invalid stored tutor data.
      }

      if (!cancelled && storedTutor) {
        setTutor(storedTutor);
        setProfileImage(getImageUrl(getProfileImage(storedTutor)));
      }

      const reference = getTutorReference();
      if (!reference) return;

      try {
        const response = await fetch(`${API_BASE_URL}/tutor/profile`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-tutor-reference": reference,
          },
          credentials: "include",
        });

        if (!response.ok || cancelled) return;

        const data = await response.json();
        const profile =
          data?.profile ||
          data?.tutor ||
          data?.data ||
          data;

        if (cancelled || !profile) return;

        setTutor((previous) => ({
          ...(previous || {}),
          ...profile,
        }));

        const image = getProfileImage(profile);
        if (image) setProfileImage(getImageUrl(image));
      } catch (error) {
        console.error("Unable to load tutor profile:", error);
      }
    }

    loadTutor();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleProfileImageUpdate = (event) => {
      const image =
        event?.detail?.profileImage ||
        event?.detail?.profileImageUrl ||
        event?.detail?.profile_image_url;

      if (image) setProfileImage(getImageUrl(image));
    };

    window.addEventListener("tutorProfileUpdated", handleProfileImageUpdate);

    return () => {
      window.removeEventListener(
        "tutorProfileUpdated",
        handleProfileImageUpdate
      );
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);

    const activeMenus = {};

    menuItems.forEach((item) => {
      if (
        item.children?.some(
          (child) =>
            location.pathname === child.path ||
            location.pathname.startsWith(`${child.path}/`)
        )
      ) {
        activeMenus[item.id] = true;
      }
    });

    setExpandedMenus((previous) => ({
      ...previous,
      ...activeMenus,
    }));
  }, [location.pathname]);

  const navigateTo = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const toggleMenu = (id) => {
    setExpandedMenus((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const isPathActive = (path) => {
    if (path === "/academy/tutor") {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const handleSignOut = () => {
    [
      TOKEN_KEY,
      USER_KEY,
      "tutor",
      "academyTutor",
      "scholiqen_user",
      "tutorReference",
      "tutor_reference",
    ].forEach((key) => localStorage.removeItem(key));

    navigate("/academy/tutor/login", { replace: true });
  };

  const tutorName =
    tutor?.name ||
    tutor?.full_name ||
    tutor?.fullName ||
    tutor?.tutorName ||
    [
      tutor?.firstName || tutor?.first_name,
      tutor?.middleName || tutor?.middle_name,
      tutor?.lastName || tutor?.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Tutor";

  const tutorReference =
    tutor?.tutorReference ||
    tutor?.tutor_reference ||
    tutor?.applicationReference ||
    tutor?.reference ||
    getTutorReference() ||
    "Academy Tutor";

  const initials = tutorName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#020617] text-white">
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <button
          type="button"
          onClick={() => navigateTo("/academy/tutor")}
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
            <p className="text-sm font-bold tracking-wide">SCHOLIQEN</p>
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

      <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-[#071426] p-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-400/25 bg-cyan-400/10">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${tutorName} profile`}
                className="h-full w-full object-cover"
                onError={() => setProfileImage("")}
              />
            ) : (
              <span className="text-xs font-black text-cyan-200">
                {initials || "TU"}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{tutorName}</p>
            <p className="truncate text-[11px] text-slate-400">
              {tutorReference}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Workspace
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children?.length);
            const active = !hasChildren && isPathActive(item.path);

            const parentActive =
              hasChildren &&
              item.children.some((child) => isPathActive(child.path));

            const expanded =
              Boolean(expandedMenus[item.id]) || Boolean(parentActive);

            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (hasChildren) {
                      toggleMenu(item.id);
                    } else if (item.path) {
                      navigateTo(item.path);
                    }
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                    active || parentActive
                      ? "border border-cyan-400/10 bg-cyan-400/10 text-cyan-300"
                      : "border border-transparent text-slate-300 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        active || parentActive
                          ? "shrink-0 text-cyan-400"
                          : "shrink-0 text-slate-400"
                      }
                    />
                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>
                  </span>

                  {hasChildren &&
                    (expanded ? (
                      <ChevronDown size={16} className="text-slate-500" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-500" />
                    ))}
                </button>

                {hasChildren && expanded && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {item.children.map((child) => {
                      const childActive = isPathActive(child.path);

                      return (
                        <button
                          key={child.path}
                          type="button"
                          onClick={() => navigateTo(child.path)}
                          className={`relative flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            childActive
                              ? "bg-cyan-400/10 font-medium text-cyan-300"
                              : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          {childActive && (
                            <span className="absolute -left-[17px] h-5 w-0.5 rounded-full bg-cyan-400" />
                          )}
                          <span className="truncate">{child.label}</span>
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

      <div className="mx-4 mb-4 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.06] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
            <Sparkles size={17} className="text-cyan-400" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold">Smart Teaching AI</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              Get help creating engaging learning experiences for your students.
            </p>
            <button
              type="button"
              onClick={() => navigateTo("/ai-tutor")}
              className="mt-3 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Open AI Assistant →
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={() => navigateTo("/academy/tutor/profile")}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <UserCircle size={18} />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => navigateTo("/academy/tutor/settings")}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
            location.pathname.startsWith("/academy/tutor/settings")
              ? "bg-cyan-400/10 text-cyan-300"
              : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <img
            src={Cog}
            alt=""
            className="h-[18px] w-[18px] object-contain opacity-70"
          />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#071426]/95 text-slate-200 shadow-xl backdrop-blur-xl transition hover:border-cyan-400/20 hover:text-cyan-400 lg:hidden"
        aria-label="Open tutor sidebar"
      >
        <Menu size={21} />
      </button>

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] transform transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
