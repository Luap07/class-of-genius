import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  BarChart3,
  User,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlayCircle,
  Clock3,
  CheckCircle2,
  Target,
  Flame,
  BookMarked,
  Bell,
  Settings,
  Sparkles,
  CalendarDays,
  ArrowUpRight,
  ShieldCheck,
  Edit3,
  Lock,
  FileText,
  Upload,
  Loader2,
  RefreshCw,
  AlertCircle,
  Paperclip,
  Video,
  Image as ImageIcon,
  File,
} from "lucide-react";

/* =========================================================
   AUTH STORAGE
========================================================= */

const ACADEMY_TOKEN_KEY =
  "scholiqen_academy_token";

const ACADEMY_USER_KEY =
  "scholiqen_academy_user";

const AUTH_TOKEN_KEY =
  "scholiqen_auth_token";

const AUTH_USER_KEY =
  "scholiqen_current_user";

/* =========================================================
   API
========================================================= */

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const API_BASE_URL =
  RAW_API_URL.replace(/\/+$/, "");

const ACADEMY_API_URL =
  API_BASE_URL.endsWith("/api/academy")
    ? API_BASE_URL
    : `${API_BASE_URL}/api/academy`;

const STUDENT_TASKS_URL =
  `${ACADEMY_API_URL}/student/tasks`;

/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "subjects",
    label: "My Subjects",
    icon: BookOpen,
  },
  {
    id: "lessons",
    label: "Lessons",
    icon: PlayCircle,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: ClipboardList,
  },
  {
    id: "cbt",
    label: "CBT Practice",
    icon: ClipboardList,
  },
  {
    id: "progress",
    label: "Progress",
    icon: BarChart3,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Trophy,
  },
  {
    id: "profile",
    label: "My Profile",
    icon: User,
  },
  {
    id: "enrollment",
    label: "Enrollment",
    icon: GraduationCap,
  },
];

/* =========================================================
   DEFAULT SUBJECTS
========================================================= */

const defaultSubjects = [
  {
    name: "Mathematics",
    code: "MATH",
    progress: 72,
    lessons: 24,
    completed: 17,
    icon: "∑",
    description:
      "Numbers, algebra, geometry and problem solving.",
  },
  {
    name: "English Language",
    code: "ENG",
    progress: 64,
    lessons: 28,
    completed: 18,
    icon: "Aa",
    description:
      "Grammar, comprehension, vocabulary and writing.",
  },
  {
    name: "Basic Science",
    code: "SCI",
    progress: 58,
    lessons: 22,
    completed: 13,
    icon: "⚗",
    description:
      "Explore living things, matter, energy and nature.",
  },
  {
    name: "Social Studies",
    code: "SOC",
    progress: 81,
    lessons: 20,
    completed: 16,
    icon: "◎",
    description:
      "Society, culture, citizenship and the environment.",
  },
];

/* =========================================================
   RECENT LESSONS
========================================================= */

const recentLessons = [
  {
    subject: "Mathematics",
    title: "Introduction to Algebra",
    duration: "24 min",
    progress: 80,
  },
  {
    subject: "English Language",
    title: "Parts of Speech",
    duration: "18 min",
    progress: 55,
  },
  {
    subject: "Basic Science",
    title: "Living and Non-Living Things",
    duration: "21 min",
    progress: 35,
  },
];

/* =========================================================
   ACHIEVEMENTS
========================================================= */

const achievements = [
  {
    title: "First Step",
    description:
      "Completed your first lesson.",
    icon: "🚀",
    unlocked: true,
  },
  {
    title: "Quick Learner",
    description:
      "Complete 10 lessons.",
    icon: "⚡",
    unlocked: true,
  },
  {
    title: "7 Day Streak",
    description:
      "Study for seven consecutive days.",
    icon: "🔥",
    unlocked: false,
  },
  {
    title: "CBT Champion",
    description:
      "Score 80% or higher in five CBTs.",
    icon: "🏆",
    unlocked: false,
  },
];

/* =========================================================
   STORAGE HELPERS
========================================================= */

function getStoredAcademyUser() {
  try {
    const academyUser =
      localStorage.getItem(
        ACADEMY_USER_KEY
      );

    if (academyUser) {
      return JSON.parse(academyUser);
    }

    const currentUser =
      localStorage.getItem(
        AUTH_USER_KEY
      );

    if (currentUser) {
      return JSON.parse(currentUser);
    }

    return null;
  } catch (error) {
    console.error(
      "Unable to read student session:",
      error
    );

    return null;
  }
}

function getStoredToken() {
  return (
    localStorage.getItem(
      ACADEMY_TOKEN_KEY
    ) ||
    localStorage.getItem(
      AUTH_TOKEN_KEY
    ) ||
    ""
  );
}

/* =========================================================
   USER HELPERS
========================================================= */

function getDisplayName(user) {
  if (!user) {
    return "Student";
  }

  return (
    user.firstName ||
    user.first_name ||
    user.full_name?.split(" ")[0] ||
    user.fullName?.split(" ")[0] ||
    user.name?.split(" ")[0] ||
    user.username ||
    "Student"
  );
}

function getFullName(user) {
  if (!user) {
    return "Student";
  }

  const direct =
    user.full_name ||
    user.fullName ||
    user.name;

  if (direct) {
    return direct;
  }

  const combined = [
    user.firstName ||
      user.first_name,
    user.middleName ||
      user.middle_name,
    user.lastName ||
      user.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    combined ||
    user.username ||
    "Student"
  );
}

function getGrade(user) {
  if (!user) {
    return "Academy Student";
  }

  return (
    user.grade ||
    user.class_level ||
    user.class ||
    user.school_level ||
    user.schoolLevel ||
    "Academy Student"
  );
}

function getStudentId(user) {
  if (!user) {
    return "";
  }

  return (
    user.student_id ||
    user.studentId ||
    user.student_reference ||
    user.studentReference ||
    user.reference ||
    user.id ||
    ""
  );
}

function getStudentEmail(user) {
  if (!user) {
    return "";
  }

  return (
    user.email ||
    user.student_email ||
    user.studentEmail ||
    ""
  );
}

/* =========================================================
   NORMALIZATION
========================================================= */

function clean(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function normalizeText(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   ARRAY HELPER
========================================================= */

function arrayFromValue(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.values(value);
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    try {
      const parsed =
        JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return Object.values(parsed);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

/* =========================================================
   RESPONSE PARSER
========================================================= */

async function parseResponse(response) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

/* =========================================================
   TASK NORMALIZER
========================================================= */

function normalizeTask(rawTask) {
  const raw =
    rawTask?.task ||
    rawTask?.activity ||
    rawTask;

  if (!raw) {
    return null;
  }

  let metadata =
    raw.metadata;

  if (
    typeof metadata === "string"
  ) {
    try {
      metadata =
        JSON.parse(metadata);
    } catch {
      metadata = {};
    }
  }

  if (
    !metadata ||
    typeof metadata !== "object"
  ) {
    metadata = {};
  }

  const attachments =
    arrayFromValue(
      raw.attachments ||
        metadata.attachments ||
        raw.files ||
        metadata.files
    );

  const taskId = clean(
    raw.id ||
      raw.task_id ||
      raw.activity_id ||
      raw.activityId
  );

  const grade = clean(
    raw.grade ||
      raw.class ||
      raw.class_name ||
      raw.className ||
      metadata.grade ||
      metadata.class ||
      metadata.className
  );

  const subject = clean(
    raw.subject ||
      raw.subject_name ||
      raw.subjectName ||
      metadata.subject ||
      metadata.subjectName
  );

  const title = clean(
    raw.title ||
      raw.name ||
      metadata.title
  );

  const description = clean(
    raw.description ||
      metadata.description
  );

  const instructions = clean(
    raw.instructions ||
      metadata.instructions
  );

  const dueDate = clean(
    raw.due_date ||
      raw.dueDate ||
      metadata.dueDate ||
      metadata.due_date
  );

  const maxScore =
    raw.max_score ??
    raw.maxScore ??
    metadata.maxScore ??
    metadata.max_score ??
    null;

  const createdAt =
    raw.created_at ||
    raw.createdAt ||
    metadata.createdAt ||
    null;

  return {
    ...raw,
    id: taskId,
    taskId,
    grade,
    subject,
    title:
      title ||
      "Untitled Task",
    description,
    instructions,
    dueDate,
    maxScore,
    createdAt,
    metadata,
    attachments,
  };
}

/* =========================================================
   EXTRACT TASKS
========================================================= */

function extractTasks(payload) {
  if (!payload) {
    return [];
  }

  let source = [];

  if (Array.isArray(payload)) {
    source = payload;
  } else if (
    Array.isArray(payload.tasks)
  ) {
    source = payload.tasks;
  } else if (
    Array.isArray(payload.activities)
  ) {
    source = payload.activities;
  } else if (
    Array.isArray(
      payload.classActivities
    )
  ) {
    source =
      payload.classActivities;
  } else if (
    Array.isArray(
      payload.class_activities
    )
  ) {
    source =
      payload.class_activities;
  } else if (
    payload.data &&
    Array.isArray(payload.data)
  ) {
    source = payload.data;
  } else if (
    payload.data?.tasks &&
    Array.isArray(
      payload.data.tasks
    )
  ) {
    source =
      payload.data.tasks;
  }

  return source
    .map(normalizeTask)
    .filter(
      (task) =>
        task &&
        task.taskId
    );
}

/* =========================================================
   DATE HELPERS
========================================================= */

function formatTaskDate(value) {
  if (!value) {
    return "No due date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function isPastDue(value) {
  if (!value) {
    return false;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return false;
  }

  return (
    date.getTime() <
    Date.now()
  );
}

/* =========================================================
   ATTACHMENT ICON
========================================================= */

function AttachmentIcon({
  attachment,
}) {
  const name = clean(
    attachment?.name ||
      attachment?.fileName ||
      attachment?.file_name ||
      attachment?.filename ||
      attachment?.originalname ||
      attachment?.type
  ).toLowerCase();

  if (
    name.endsWith(".mp4") ||
    name.endsWith(".webm") ||
    name.endsWith(".mov") ||
    name.includes("video")
  ) {
    return (
      <Video className="h-4 w-4 text-violet-400" />
    );
  }

  if (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif") ||
    name.endsWith(".svg") ||
    name.endsWith(".avif") ||
    name.includes("image")
  ) {
    return (
      <ImageIcon className="h-4 w-4 text-emerald-400" />
    );
  }

  if (
    name.endsWith(".pdf") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return (
      <FileText className="h-4 w-4 text-cyan-400" />
    );
  }

  return (
    <File className="h-4 w-4 text-slate-400" />
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  iconClass =
    "text-cyan-400",
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black text-white">
            {value}
          </p>

          {detail && (
            <p className="mt-1 text-xs text-slate-500">
              {detail}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <Icon
            className={`h-5 w-5 ${iconClass}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
          {eyebrow}
        </p>
      )}

      <h2 className="text-2xl font-black tracking-tight text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MAIN PORTAL
========================================================= */

export default function StudentLearningPortal() {
  const navigate =
    useNavigate();

  const [activeSection, setActiveSection] =
    useState("overview");

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [tasks, setTasks] =
    useState([]);

  const [tasksLoading, setTasksLoading] =
    useState(false);

  const [tasksError, setTasksError] =
    useState("");

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    const storedUser =
      getStoredAcademyUser();

    if (!storedUser) {
      navigate(
        "/academy/student-enrollment-login",
        {
          replace: true,
        }
      );

      return;
    }

    setUser(storedUser);
  }, [navigate]);

  /* =======================================================
     USER DETAILS
  ======================================================= */

  const displayName =
    useMemo(
      () =>
        getDisplayName(user),
      [user]
    );

  const fullName =
    useMemo(
      () =>
        getFullName(user),
      [user]
    );

  const grade =
    useMemo(
      () =>
        getGrade(user),
      [user]
    );

  const studentId =
    useMemo(
      () =>
        getStudentId(user),
      [user]
    );

  const email =
    useMemo(
      () =>
        getStudentEmail(user),
      [user]
    );

  const initials =
    useMemo(() => {
      const parts =
        fullName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2);

      return (
        parts
          .map(
            (part) =>
              part[0]?.toUpperCase()
          )
          .join("") || "S"
      );
    }, [fullName]);

  /* =======================================================
     LOAD STUDENT TASKS
  ======================================================= */

  const loadTasks =
    async () => {
      setTasksLoading(true);
      setTasksError("");

      try {
        const token =
          getStoredToken();

        const params =
          new URLSearchParams();

        if (studentId) {
          params.set(
            "studentId",
            studentId
          );
        }

        if (email) {
          params.set(
            "email",
            email
          );
        }

        if (fullName) {
          params.set(
            "fullName",
            fullName
          );
        }

        if (grade) {
          params.set(
            "grade",
            grade
          );
        }

        const query =
          params.toString();

        const url =
          query
            ? `${STUDENT_TASKS_URL}?${query}`
            : STUDENT_TASKS_URL;

        const response =
          await fetch(url, {
            method: "GET",
            headers: {
              Accept:
                "application/json",
              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
          });

        const payload =
          await parseResponse(
            response
          );

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              payload?.error ||
              "Unable to load student tasks."
          );
        }

        const receivedTasks =
          extractTasks(
            payload
          );

        setTasks(
          receivedTasks
        );
      } catch (error) {
        console.error(
          "Student tasks error:",
          error
        );

        setTasksError(
          error?.message ||
            "Unable to load your tasks."
        );

        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

  /* =======================================================
     LOAD TASKS WHEN USER AVAILABLE
  ======================================================= */

  useEffect(() => {
    if (!user) {
      return;
    }

    loadTasks();
  }, [
    user,
    studentId,
    email,
    fullName,
    grade,
  ]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout =
    () => {
      localStorage.removeItem(
        ACADEMY_TOKEN_KEY
      );

      localStorage.removeItem(
        ACADEMY_USER_KEY
      );

      localStorage.removeItem(
        AUTH_TOKEN_KEY
      );

      localStorage.removeItem(
        AUTH_USER_KEY
      );

      navigate(
        "/academy/student-enrollment-login",
        {
          replace: true,
        }
      );
    };

  /* =======================================================
     SECTION NAVIGATION
  ======================================================= */

  const goToSection =
    (section) => {
      setActiveSection(
        section
      );

      setMobileOpen(false);

      if (
        section === "tasks"
      ) {
        loadTasks();
      }
    };

  /* =======================================================
     RENDER CONTENT
  ======================================================= */

  const renderContent =
    () => {
      switch (
        activeSection
      ) {
        case "subjects":
          return (
            <SubjectsSection
              grade={grade}
            />
          );

        case "lessons":
          return (
            <LessonsSection />
          );

        case "tasks":
          return (
            <TasksSection
              tasks={tasks}
              loading={
                tasksLoading
              }
              error={
                tasksError
              }
              onRefresh={
                loadTasks
              }
              navigate={
                navigate
              }
            />
          );

        case "cbt":
          return (
            <CBTSection
              navigate={
                navigate
              }
            />
          );

        case "progress":
          return (
            <ProgressSection />
          );

        case "achievements":
          return (
            <AchievementsSection />
          );

        case "profile":
          return (
            <ProfileSection
              user={user}
              fullName={
                fullName
              }
              grade={grade}
              initials={
                initials
              }
            />
          );

        case "enrollment":
          return (
            <EnrollmentSection
              user={user}
              fullName={
                fullName
              }
              grade={grade}
            />
          );

        default:
          return (
            <OverviewSection
              displayName={
                displayName
              }
              grade={grade}
              tasks={tasks}
              tasksLoading={
                tasksLoading
              }
              navigate={
                navigate
              }
              goToSection={
                goToSection
              }
            />
          );
      }
    };

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(56,189,248,0.9) 1px, transparent 0)",
            backgroundSize:
              "32px 32px",
          }}
        />

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute -right-40 top-1/3 h-[550px] w-[550px] rounded-full bg-violet-600/10 blur-[150px]" />

        <div className="absolute bottom-[-250px] left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setMobileOpen(
                false
              )
            }
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-white/10 bg-[#070b1c]/95 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-5">
          <button
            type="button"
            onClick={() =>
              goToSection(
                "overview"
              )
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>

            <div className="text-left">
              <p className="font-black tracking-tight">
                SCHOLIQEN
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                Academy
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                false
              )
            }
            className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {fullName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {grade}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            Student Portal
          </p>

          <div className="space-y-1">
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  activeSection ===
                  item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      goToSection(
                        item.id
                      )
                    }
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                      active
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "text-slate-500 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] ${
                        active
                          ? "text-cyan-400"
                          : "text-slate-600 group-hover:text-slate-300"
                      }`}
                    />

                    <span>
                      {item.label}
                    </span>

                    {item.id ===
                      "tasks" &&
                      tasks.length >
                        0 && (
                        <span className="ml-auto min-w-5 rounded-full bg-cyan-400/10 px-1.5 py-0.5 text-center text-[9px] font-black text-cyan-400">
                          {tasks.length}
                        </span>
                      )}

                    {active &&
                      item.id !==
                        "tasks" && (
                        <motion.div
                          layoutId="student-learning-active"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400"
                        />
                      )}
                  </button>
                );
              }
            )}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/settings"
              )
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </button>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-400/80 transition hover:bg-red-500/5 hover:text-red-300"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="relative min-h-screen lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-white/10 bg-[#050816]/80 px-5 backdrop-blur-2xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  true
                )
              }
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-400 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="hidden text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 sm:block">
                Scholiqen Academy
              </p>

              <h1 className="text-lg font-black sm:text-xl">
                {activeSection ===
                "overview"
                  ? `Welcome, ${displayName}`
                  : navigation.find(
                      (item) =>
                        item.id ===
                        activeSection
                    )?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />

              {tasks.length >
                0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                goToSection(
                  "profile"
                )
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1.5 pr-3 transition hover:bg-white/[0.06]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-black">
                {initials}
              </div>

              <span className="hidden max-w-[120px] truncate text-xs font-bold text-slate-300 sm:block">
                {displayName}
              </span>
            </button>
          </div>
        </header>

        <main className="relative z-10 p-5 sm:p-8">
          <div className="mx-auto max-w-[1400px]">
            <AnimatePresence
              mode="wait"
            >
              <motion.div
                key={
                  activeSection
                }
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                transition={{
                  duration: 0.25,
                }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function OverviewSection({
  displayName,
  grade,
  tasks,
  tasksLoading,
  navigate,
  goToSection,
}) {
  const previewTasks =
    tasks.slice(0, 3);

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-500/[0.09] via-blue-500/[0.06] to-violet-600/[0.09] p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />

        <div className="relative max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            YOUR LEARNING SPACE
          </div>

          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Keep learning,
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {displayName}.
            </span>
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
            Continue your lessons,
            practise with CBT
            questions and complete
            tasks given to your class
            by your tutors.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                goToSection(
                  "lessons"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-black shadow-lg shadow-blue-500/20 transition hover:scale-[1.02]"
            >
              Continue Learning
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                goToSection(
                  "tasks"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              View Tasks
              <ClipboardList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Subjects"
          value="4"
          detail="Assigned to your class"
        />

        <StatCard
          icon={ClipboardList}
          label="Tasks"
          value={
            tasksLoading
              ? "..."
              : String(
                  tasks.length
                )
          }
          detail="Tutor tasks"
          iconClass="text-cyan-400"
        />

        <StatCard
          icon={Target}
          label="Average Score"
          value="78%"
          detail="Across recent CBTs"
          iconClass="text-violet-400"
        />

        <StatCard
          icon={Flame}
          label="Study Streak"
          value="6 days"
          detail="Keep it going!"
          iconClass="text-orange-400"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Continue
              </p>

              <h3 className="mt-1 text-xl font-black">
                Recent Lessons
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                goToSection(
                  "lessons"
                )
              }
              className="text-xs font-bold text-slate-500 transition hover:text-cyan-400"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {recentLessons.map(
              (lesson) => (
                <motion.button
                  key={
                    lesson.title
                  }
                  type="button"
                  whileHover={{
                    x: 3,
                  }}
                  onClick={() =>
                    goToSection(
                      "lessons"
                    )
                  }
                  className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-300">
                    <PlayCircle className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      {lesson.subject}
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-white">
                      {lesson.title}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          style={{
                            width: `${lesson.progress}%`,
                          }}
                        />
                      </div>

                      <span className="text-[10px] font-bold text-slate-600">
                        {lesson.progress}
                        %
                      </span>
                    </div>
                  </div>

                  <div className="hidden items-center gap-1 text-xs text-slate-600 sm:flex">
                    <Clock3 className="h-3.5 w-3.5" />
                    {
                      lesson.duration
                    }
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-700" />
                </motion.button>
              )
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Class work
              </p>

              <h3 className="mt-1 text-xl font-black">
                Tasks
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                goToSection(
                  "tasks"
                )
              }
              className="text-xs font-bold text-slate-500 transition hover:text-cyan-400"
            >
              View all
            </button>
          </div>

          {tasksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          ) : previewTasks.length >
            0 ? (
            <div className="space-y-3">
              {previewTasks.map(
                (task) => (
                  <button
                    key={
                      task.taskId
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        `/academy/student/task/${encodeURIComponent(
                          task.taskId
                        )}`,
                        {
                          state: {
                            task,
                          },
                        }
                      )
                    }
                    className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                      <ClipboardList className="h-5 w-5 text-cyan-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white">
                        {task.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-600">
                        {task.subject ||
                          "General Task"}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-700 transition group-hover:text-cyan-400" />
                  </button>
                )
              )}
            </div>
          ) : (
            <EmptyTasks
              compact
              onOpen={() =>
                goToSection(
                  "tasks"
                )
              }
            />
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-400/10">
              <Flame className="h-6 w-6 text-orange-400" />
            </div>

            <div>
              <p className="text-sm font-black">
                6 Day Study Streak
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Study today to reach
                your 7-day achievement.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2">
            {[
              "M",
              "T",
              "W",
              "T",
              "F",
              "S",
              "S",
            ].map(
              (day, index) => (
                <div
                  key={`${day}-${index}`}
                  className="text-center"
                >
                  <p className="mb-2 text-[9px] font-bold text-slate-700">
                    {day}
                  </p>

                  <div
                    className={`h-8 rounded-lg ${
                      index < 6
                        ? "border border-cyan-400/20 bg-cyan-400/20"
                        : "border border-white/10 bg-white/[0.025]"
                    }`}
                  />
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.07] to-blue-500/[0.03] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10">
              <Trophy className="h-6 w-6 text-violet-400" />
            </div>

            <div>
              <p className="text-sm font-black">
                Your next achievement
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Complete one more
                study session to keep
                your learning streak
                alive.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              goToSection(
                "achievements"
              )
            }
            className="mt-5 inline-flex items-center gap-2 text-xs font-black text-violet-400 hover:text-violet-300"
          >
            View achievements
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   TASKS
========================================================= */

function TasksSection({
  tasks,
  loading,
  error,
  onRefresh,
  navigate,
}) {
  const [
    subjectFilter,
    setSubjectFilter,
  ] = useState("all");

  const subjects =
    useMemo(() => {
      return [
        "all",
        ...Array.from(
          new Set(
            tasks
              .map(
                (task) =>
                  clean(
                    task.subject
                  )
              )
              .filter(Boolean)
          )
        ),
      ];
    }, [tasks]);

  const filteredTasks =
    useMemo(() => {
      if (
        subjectFilter ===
        "all"
      ) {
        return tasks;
      }

      return tasks.filter(
        (task) =>
          normalizeText(
            task.subject
          ) ===
          normalizeText(
            subjectFilter
          )
      );
    }, [
      tasks,
      subjectFilter,
    ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Class work"
          title="My Tasks"
          description="Tasks created by your tutors for your enrolled class and subjects."
        />

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {subjects.length >
        1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {subjects.map(
            (subject) => (
              <button
                key={subject}
                type="button"
                onClick={() =>
                  setSubjectFilter(
                    subject
                  )
                }
                className={`rounded-xl border px-4 py-2 text-xs font-black transition ${
                  subjectFilter ===
                  subject
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-white/[0.025] text-slate-500 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {subject ===
                "all"
                  ? "All Subjects"
                  : subject}
              </button>
            )
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

            <div className="flex-1">
              <p className="text-sm font-black text-red-300">
                Unable to load tasks
              </p>

              <p className="mt-1 text-xs leading-5 text-red-400/70">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg border border-red-400/20 px-3 py-2 text-[10px] font-black text-red-300 hover:bg-red-400/10"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading &&
        tasks.length ===
          0 && (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-400" />

              <p className="mt-4 text-sm font-bold text-slate-400">
                Loading your tasks...
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Checking tasks for your
                class and subjects.
              </p>
            </div>
          </div>
        )}

      {!loading &&
        filteredTasks.length ===
          0 && (
          <EmptyTasks />
        )}

      {filteredTasks.length >
        0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredTasks.map(
            (task) => {
              const overdue =
                isPastDue(
                  task.dueDate
                );

              return (
                <motion.div
                  key={
                    task.taskId
                  }
                  whileHover={{
                    y: -3,
                  }}
                  className="group rounded-3xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-cyan-400/20 sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
                      <ClipboardList className="h-6 w-6 text-cyan-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-cyan-400">
                          Task
                        </span>

                        {overdue && (
                          <span className="rounded-full bg-red-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-red-400">
                            Past Due
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-black text-white">
                        {task.title}
                      </h3>

                      <p className="mt-1 text-xs font-bold text-cyan-400">
                        {task.subject ||
                          "General"}
                      </p>
                    </div>
                  </div>

                  {task.description && (
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-500">
                      {
                        task.description
                      }
                    </p>
                  )}

                  {task.instructions && (
                    <div className="mt-4 rounded-2xl border border-white/5 bg-black/10 p-4">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                        Instructions
                      </p>

                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">
                        {
                          task.instructions
                        }
                      </p>
                    </div>
                  )}

                  {task.attachments
                    ?.length >
                    0 && (
                    <div className="mt-4">
                      <p className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-600">
                        <Paperclip className="h-3 w-3" />
                        Task Materials
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {task.attachments
                          .slice(
                            0,
                            4
                          )
                          .map(
                            (
                              attachment,
                              index
                            ) => (
                              <div
                                key={`${task.taskId}-attachment-${index}`}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2"
                              >
                                <AttachmentIcon
                                  attachment={
                                    attachment
                                  }
                                />

                                <span className="max-w-[150px] truncate text-[10px] font-bold text-slate-400">
                                  {clean(
                                    attachment?.name ||
                                      attachment?.fileName ||
                                      attachment?.file_name ||
                                      attachment?.filename ||
                                      `Attachment ${index + 1}`
                                  )}
                                </span>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-2 border-t border-white/5 pt-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CalendarDays className="h-4 w-4" />

                      <span>
                        {task.dueDate
                          ? `Due ${formatTaskDate(
                              task.dueDate
                            )}`
                          : "No due date"}
                      </span>
                    </div>

                    {task.maxScore !==
                      null &&
                      task.maxScore !==
                        undefined &&
                      clean(
                        task.maxScore
                      ) !== "" && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 sm:justify-end">
                          <Target className="h-4 w-4" />

                          <span>
                            {task.maxScore}{" "}
                            marks
                          </span>
                        </div>
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/academy/student/task/${encodeURIComponent(
                          task.taskId
                        )}`,
                        {
                          state: {
                            task,
                          },
                        }
                      )
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-3 text-xs font-black text-slate-950 shadow-lg shadow-blue-500/10 transition hover:scale-[1.01]"
                  >
                    <Upload className="h-4 w-4" />
                    Open Task & Submit Work
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   EMPTY TASKS
========================================================= */

function EmptyTasks({
  compact = false,
  onOpen,
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.025] text-center ${
        compact
          ? "p-6"
          : "p-10 sm:p-14"
      }`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
        <ClipboardList className="h-7 w-7 text-cyan-400" />
      </div>

      <h3 className="mt-5 text-lg font-black text-white">
        No tasks yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
        When a tutor creates a
        task for your enrolled
        class and subject, it will
        appear here.
      </p>

      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-slate-300 hover:bg-white/[0.08] hover:text-white"
        >
          Open Tasks
        </button>
      )}
    </div>
  );
}

/* =========================================================
   SUBJECTS
========================================================= */

function SubjectsSection({
  grade,
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="Your curriculum"
        title="My Subjects"
        description={`Subjects assigned to you for ${grade}. Your progress will update as you complete lessons, activities and assessments.`}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {defaultSubjects.map(
          (subject) => (
            <motion.div
              key={
                subject.code
              }
              whileHover={{
                y: -5,
              }}
              className="group rounded-3xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-cyan-400/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-lg font-black text-cyan-300">
                  {
                    subject.icon
                  }
                </div>

                <span className="text-[10px] font-black text-slate-700">
                  {
                    subject.code
                  }
                </span>
              </div>

              <h3 className="mt-5 text-lg font-black">
                {subject.name}
              </h3>

              <p className="mt-2 min-h-[48px] text-xs leading-5 text-slate-600">
                {
                  subject.description
                }
              </p>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600">
                    Progress
                  </span>

                  <span className="text-xs font-black text-cyan-400">
                    {
                      subject.progress
                    }
                    %
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{
                      width: `${subject.progress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                <span className="text-slate-600">
                  {
                    subject.completed
                  }
                  /
                  {
                    subject.lessons
                  }{" "}
                  lessons
                </span>

                <button
                  type="button"
                  className="font-bold text-cyan-400 transition hover:text-cyan-300"
                >
                  Open
                </button>
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   LESSONS
========================================================= */

function LessonsSection() {
  return (
    <div>
      <SectionHeader
        eyebrow="Learning"
        title="Lessons"
        description="Continue your lessons and build your understanding one topic at a time."
      />

      <div className="grid gap-4">
        {recentLessons.map(
          (lesson) => (
            <motion.div
              key={
                lesson.title
              }
              whileHover={{
                x: 3,
              }}
              className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
                  <PlayCircle className="h-7 w-7 text-cyan-400" />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {
                      lesson.subject
                    }
                  </p>

                  <h3 className="mt-1 text-lg font-black">
                    {
                      lesson.title
                    }
                  </h3>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        style={{
                          width: `${lesson.progress}%`,
                        }}
                      />
                    </div>

                    <span className="text-xs font-bold text-slate-600">
                      {
                        lesson.progress
                      }
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock3 className="h-4 w-4" />
                    {
                      lesson.duration
                    }
                  </div>

                  <button
                    type="button"
                    className="rounded-xl bg-cyan-400/10 px-4 py-2.5 text-xs font-black text-cyan-400 transition hover:bg-cyan-400/15"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CBT
========================================================= */

function CBTSection({
  navigate,
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="Practice"
        title="CBT Practice"
        description="Test your knowledge with computer-based practice questions and improve your examination readiness."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            title:
              "Subject Practice",
            description:
              "Practise questions from your individual school subjects.",
            icon: BookOpen,
            action:
              "Start Practice",
          },
          {
            title:
              "Timed Test",
            description:
              "Challenge yourself with a realistic timed examination.",
            icon: Clock3,
            action:
              "Take Test",
          },
          {
            title:
              "Past Questions",
            description:
              "Review examination-style questions and explanations.",
            icon: ClipboardList,
            action:
              "Explore",
          },
        ].map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <motion.div
                key={
                  item.title
                }
                whileHover={{
                  y: -4,
                }}
                className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10">
                  <Icon className="h-6 w-6 text-blue-400" />
                </div>

                <h3 className="mt-5 text-lg font-black">
                  {
                    item.title
                  }
                </h3>

                <p className="mt-2 min-h-[50px] text-sm leading-6 text-slate-600">
                  {
                    item.description
                  }
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/cbt"
                    )
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2.5 text-xs font-black"
                >
                  {
                    item.action
                  }
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            );
          }
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-cyan-400/10 bg-cyan-400/[0.03] p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
            <Target className="h-7 w-7 text-cyan-400" />
          </div>

          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
              Current performance
            </p>

            <h3 className="mt-1 text-xl font-black">
              78% Average CBT
              Score
            </h3>

            <p className="mt-1 text-xs text-slate-600">
              Keep practising to
              reach your 85% target.
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-black text-cyan-400">
              78%
            </p>

            <p className="text-[10px] font-bold text-slate-700">
              TARGET: 85%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressSection() {
  return (
    <div>
      <SectionHeader
        eyebrow="Performance"
        title="My Progress"
        description="See how your learning is developing across your subjects."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          icon={Target}
          label="Average Score"
          value="78%"
          detail="+6% this month"
          iconClass="text-cyan-400"
        />

        <StatCard
          icon={BookMarked}
          label="Lessons"
          value="64"
          detail="Completed this term"
          iconClass="text-blue-400"
        />

        <StatCard
          icon={Clock3}
          label="Study Time"
          value="18h"
          detail="This month"
          iconClass="text-violet-400"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <h3 className="text-lg font-black">
          Subject Performance
        </h3>

        <div className="mt-6 space-y-5">
          {defaultSubjects.map(
            (subject) => (
              <div
                key={
                  subject.code
                }
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold">
                    {
                      subject.name
                    }
                  </span>

                  <span className="text-xs font-black text-cyan-400">
                    {
                      subject.progress
                    }
                    %
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${subject.progress}%`,
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ACHIEVEMENTS
========================================================= */

function AchievementsSection() {
  return (
    <div>
      <SectionHeader
        eyebrow="Milestones"
        title="Achievements"
        description="Every lesson, test and study session gets you closer to your next achievement."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {achievements.map(
          (achievement) => (
            <motion.div
              key={
                achievement.title
              }
              whileHover={{
                y: -4,
              }}
              className={`rounded-3xl border p-6 ${
                achievement.unlocked
                  ? "border-cyan-400/15 bg-cyan-400/[0.035]"
                  : "border-white/10 bg-white/[0.02] opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-4xl">
                  {
                    achievement.icon
                  }
                </div>

                {achievement.unlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Lock className="h-5 w-5 text-slate-700" />
                )}
              </div>

              <h3 className="mt-6 font-black">
                {
                  achievement.title
                }
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                {
                  achievement.description
                }
              </p>

              <p
                className={`mt-5 text-[10px] font-black uppercase tracking-wider ${
                  achievement.unlocked
                    ? "text-emerald-400"
                    : "text-slate-700"
                }`}
              >
                {achievement.unlocked
                  ? "Unlocked"
                  : "Locked"}
              </p>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfileSection({
  user,
  fullName,
  grade,
  initials,
}) {
  const email =
    user?.email ||
    "Not available";

  const username =
    user?.username ||
    "Not available";

  const phone =
    user?.phone ||
    user?.studentPhone ||
    "Not available";

  return (
    <div>
      <SectionHeader
        eyebrow="Account"
        title="My Profile"
        description="View the student information associated with your Scholiqen Academy account."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl font-black shadow-xl shadow-blue-500/20">
            {initials}
          </div>

          <h3 className="mt-5 text-xl font-black">
            {fullName}
          </h3>

          <p className="mt-1 text-sm text-cyan-400">
            {grade}
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4 text-left">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />

              <div>
                <p className="text-xs font-black text-emerald-300">
                  Account Active
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  Your student
                  account is active.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black text-slate-400 transition hover:text-white"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <h3 className="text-lg font-black">
            Student Information
          </h3>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ProfileField
              label="Full Name"
              value={
                fullName
              }
            />

            <ProfileField
              label="Username"
              value={
                username
              }
            />

            <ProfileField
              label="Email Address"
              value={
                email
              }
            />

            <ProfileField
              label="Phone Number"
              value={
                phone
              }
            />

            <ProfileField
              label="Class / Grade"
              value={
                grade
              }
            />

            <ProfileField
              label="Student ID"
              value={
                user?.student_id ||
                user?.studentId ||
                user?.reference ||
                "Pending"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold text-slate-300">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   ENROLLMENT
========================================================= */

function EnrollmentSection({
  user,
  fullName,
  grade,
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="School records"
        title="Enrollment Details"
        description="Your Academy enrollment information and student status."
      />

      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
            <GraduationCap className="h-7 w-7 text-cyan-400" />
          </div>

          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
              Scholiqen Academy
            </p>

            <h3 className="mt-1 text-xl font-black">
              {fullName}
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              {grade}
            </p>
          </div>

          <div className="rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-400">
            ENROLLED
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileField
            label="Academic Session"
            value={
              user?.academic_session ||
              user?.academicSession ||
              "2026/2027"
            }
          />

          <ProfileField
            label="School Level"
            value={
              user?.school_level ||
              user?.schoolLevel ||
              "Secondary"
            }
          />

          <ProfileField
            label="Class / Grade"
            value={
              grade
            }
          />

          <ProfileField
            label="Enrollment Status"
            value="Active"
          />

          <ProfileField
            label="Student ID"
            value={
              user?.student_id ||
              user?.studentId ||
              user?.reference ||
              "Pending"
            }
          />

          <ProfileField
            label="Enrollment Date"
            value={
              user?.enrollment_date ||
              user?.enrollmentDate ||
              "Pending"
            }
          />
        </div>

        <div className="mt-7 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

            <div>
              <p className="text-sm font-black">
                Keep your student credentials safe
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Your Academy
                credentials are used
                to access your
                student portal.
                Never share your
                password with
                another person.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
