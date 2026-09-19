import React, {
useCallback,
useEffect,
useMemo,
useState,
} from "react";

import {
motion,
AnimatePresence,
} from "framer-motion";

import {
NavLink,
Outlet,
useLocation,
useNavigate,
} from "react-router-dom";

import {
Award,
Bell,
BookOpen,
BookText,
Brain,
ClipboardCheck,
GraduationCap,
LayoutDashboard,
LogOut,
Menu,
MessageCircle,
PanelLeftClose,
PanelLeftOpen,
Search,
Sparkles,
Target,
User,
Users,
X,
Zap,
} from "lucide-react";

/* =========================================================
API
========================================================= */

const API_URL =
import.meta.env.VITE_API_URL ||
"http://localhost:5000";

/* =========================================================
STORAGE
========================================================= */

const STUDENT_STORAGE_KEYS = [
"scholiqen_student",
"academyStudent",
"student",
"scholiqen_user",
"scholiqen_current_user",
];

const TOKEN_STORAGE_KEYS = [
"scholiqen_academy_token",
"academyToken",
"scholiqen_student_token",
"studentToken",
];

/* =========================================================
HELPERS
========================================================= */

const safeParse = (value) => {
if (!value) {
return null;
}

if (
typeof value === "object"
) {
return value;
}

try {
return JSON.parse(value);
} catch {
return null;
}
};

const cleanValue = (value) => {
if (
value === undefined ||
value === null
) {
return "";
}

return String(value).trim();
};

const getFirstValue = (...values) => {
for (const value of values) {
if (
value !== undefined &&
value !== null &&
String(value).trim()
) {
return value;
}
}

return "";
};

/* =========================================================
STUDENT
========================================================= */

const getStoredStudent = () => {
if (
typeof window ===
"undefined"
) {
return null;
}

for (
const key of STUDENT_STORAGE_KEYS
) {
const stored =
window.localStorage.getItem(
key
);
if (!stored) {
  continue;
}

const parsed =
  safeParse(stored);

if (
  parsed &&
  typeof parsed ===
    "object"
) {
  return (
    parsed.student ||
    parsed.user ||
    parsed
  );
}

}

return null;
};

/* =========================================================
TOKEN
========================================================= */

const getStoredToken = () => {
if (
typeof window ===
"undefined"
) {
return "";
}

for (
const key of TOKEN_STORAGE_KEYS
) {
const token =
window.localStorage.getItem(
key
);

if (token) {
  return token;
}

}

return "";
};

/* =========================================================
STUDENT NAME
========================================================= */

const getStudentName = (
student
) => {
if (!student) {
return "Student";
}

const directName =
getFirstValue(
student.fullName,
student.full_name,
student.name,
student.studentName,
student.student_name
);

if (directName) {
return cleanValue(
directName
);
}

const firstName =
cleanValue(
getFirstValue(
student.firstName,
student.first_name,
student.firstname
)
);

const lastName =
cleanValue(
getFirstValue(
student.lastName,
student.last_name,
student.lastname
)
);

return (
`${firstName} ${lastName}`.trim() ||
"Student"
);
};

/* =========================================================
FIRST NAME
========================================================= */

const getFirstName = (
student
) => {
return (
getStudentName(
student
).split(/\s+/)[0] ||
"Student"
);
};

/* =========================================================
INITIALS
========================================================= */

const getInitials = (
student
) => {
const name =
getStudentName(student);

const parts =
name
.split(/\s+/)
.filter(Boolean);

if (
parts.length === 0
) {
return "S";
}

if (
parts.length === 1
) {
return parts[0]
.charAt(0)
.toUpperCase();
}

return `${parts[0].charAt(
    0
  )}${parts[
    parts.length - 1
  ].charAt(0)}`.toUpperCase();
};

/* =========================================================
CLASS
========================================================= */

const getStudentClass = (
student
) => {
return cleanValue(
getFirstValue(
student?.className,
student?.class_name,
student?.currentClass,
student?.current_class,
student?.studentClass,
student?.student_class,
student?.schoolClass,
student?.school_class,
student?.grade,
student?.classLevel,
student?.class_level,
student?.level,
student?.class
)
);
};

/* =========================================================
SCHOOL LEVEL
========================================================= */

const getSchoolLevel = (
student
) => {
return cleanValue(
getFirstValue(
student?.schoolLevel,
student?.school_level,
student?.educationLevel,
student?.education_level,
student?.programmeLevel,
student?.programme_level
)
);
};

/* =========================================================
STUDENT ID
========================================================= */

const getStudentId = (
student
) => {
return cleanValue(
getFirstValue(
student?.studentId,
student?.student_id,
student?.enrollmentId,
student?.enrollment_id,
student?.id,
student?.reference
)
);
};

/* =========================================================
NAVIGATION
========================================================= */

const NAVIGATION = [
{
label: "Overview",
path: "/academy/student",
icon: LayoutDashboard,
},
{
label: "Subjects",
path: "/academy/student/subjects",
icon: BookOpen,
},
{
label: "Lessons",
path: "/academy/student/lessons",
icon: BookText,
},
{
label: "Textbooks",
path: "/academy/student/textbooks",
icon: GraduationCap,
},
{
label: "Tasks",
path: "/academy/student/tasks",
icon: Target,
},
{
label: "Assignments",
path: "/academy/student/assignments",
icon: ClipboardCheck,
},
{
label: "CBT Practice",
path: "/academy/student/cbt",
icon: Brain,
},
{
label: "Live Classes",
path: "/academy/student/live",
icon: Users,
},
{
label: "Messages",
path: "/academy/student/messages",
icon: MessageCircle,
},
{
label: "Progress",
path: "/academy/student/progress",
icon: Zap,
},
{
label: "Achievements",
path: "/academy/student/achievements",
icon: Award,
},
{
label: "Profile",
path: "/academy/student/profile",
icon: User,
},
];

/* =========================================================
COMPONENT
========================================================= */

export default function StudentLearningPortal() {
const navigate =
useNavigate();

const location =
useLocation();

const [student, setStudent] =
useState(() =>
getStoredStudent()
);

const [
sidebarCollapsed,
setSidebarCollapsed,
] = useState(false);

const [
mobileSidebarOpen,
setMobileSidebarOpen,
] = useState(false);

const [
notifications,
] = useState([]);

const [
loadingStudent,
setLoadingStudent,
] = useState(false);

/* =======================================================
LOAD STUDENT
======================================================= */

const loadStudent =
useCallback(
async () => {
const storedStudent =
getStoredStudent();

    if (storedStudent) {
      setStudent(
        storedStudent
      );
    }

    const token =
      getStoredToken();

    if (!token) {
      return;
    }

    try {
      setLoadingStudent(
        true
      );

      const headers = {
        Accept:
          "application/json",
        Authorization:
          `Bearer ${token}`,
      };

      const studentId =
        getStudentId(
          storedStudent
        );

      const email =
        cleanValue(
          getFirstValue(
            storedStudent?.email,
            storedStudent?.studentEmail,
            storedStudent?.student_email
          )
        );

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

      const response =
        await fetch(
          `${API_URL}/api/academy/student/profile${
            params.toString()
              ? `?${params.toString()}`
              : ""
          }`,
          {
            method: "GET",
            headers,
          }
        );

      if (!response.ok) {
        return;
      }

      const payload =
        await response.json();

      const remoteStudent =
        payload?.student ||
        payload?.data?.student ||
        payload?.data ||
        null;

      if (
        remoteStudent &&
        typeof remoteStudent ===
          "object"
      ) {
        setStudent(
          (current) => ({
            ...(current || {}),
            ...remoteStudent,
          })
        );
      }
    } catch (error) {
      console.warn(
        "STUDENT PORTAL PROFILE LOAD:",
        error
      );
    } finally {
      setLoadingStudent(
        false
      );
    }
  },
  []
);

/* =======================================================
EFFECTS
======================================================= */

useEffect(() => {
loadStudent();
}, [loadStudent]);

useEffect(() => {
setMobileSidebarOpen(
false
);
}, [location.pathname]);

useEffect(() => {
const handleKeyDown =
(event) => {
if (
event.key ===
"Escape"
) {
setMobileSidebarOpen(
false
);
}
};

window.addEventListener(
  "keydown",
  handleKeyDown
);

return () => {
  window.removeEventListener(
    "keydown",
    handleKeyDown
  );
};

}, []);

/* =======================================================
MEMO VALUES
======================================================= */

const studentName =
useMemo(
() =>
getStudentName(
student
),
[student]
);

const firstName =
useMemo(
() =>
getFirstName(
student
),
[student]
);

const initials =
useMemo(
() =>
getInitials(
student
),
[student]
);

const studentClass =
useMemo(
() =>
getStudentClass(
student
),
[student]
);

const schoolLevel =
useMemo(
() =>
getSchoolLevel(
student
),
[student]
);

const studentReference =
useMemo(
() =>
getStudentId(
student
),
[student]
);

const heroSubtitle =
useMemo(() => {
if (
schoolLevel &&
studentClass
) {
return `${schoolLevel} • ${studentClass}`;
}

  if (studentClass) {
    return studentClass;
  }

  if (schoolLevel) {
    return schoolLevel;
  }

  return "Scholiqen Academy Student";
}, [
  schoolLevel,
  studentClass,
]);

/* =======================================================
PAGE TITLE
======================================================= */

const pageTitle =
useMemo(() => {
if (
location.pathname ===
"/academy/student" ||
location.pathname ===
"/academy/student/"
) {
return "Student Dashboard";
}

  const matched =
    NAVIGATION.find(
      (item) =>
        location.pathname ===
          item.path ||
        location.pathname.startsWith(
          `${item.path}/`
        )
    );

  return (
    matched?.label ||
    "Student Portal"
  );
}, [
  location.pathname,
]);

/* =======================================================
ACTIONS
======================================================= */

const handleLogout =
useCallback(() => {
if (
typeof window !==
"undefined"
) {
[
...STUDENT_STORAGE_KEYS,
...TOKEN_STORAGE_KEYS,
].forEach(
(key) => {
window.localStorage.removeItem(
key
);
}
);
}
setStudent(null);

  navigate(
    "/academy/student-enrollment-login",
    {
      replace: true,
    }
  );
}, [navigate]);

const handleHome =
useCallback(() => {
navigate("/academy");
}, [navigate]);

const handleProfile =
useCallback(() => {
navigate(
"/academy/student/profile"
);
}, [navigate]);

const handleSearch =
useCallback(() => {
navigate(
"/academy/student/subjects"
);
}, [navigate]);

/* =======================================================
SIDEBAR WIDTH
======================================================= */

const sidebarWidth =
sidebarCollapsed
? 82
: 270;

/* =======================================================
SIDEBAR
======================================================= */

const SidebarContent = ({
mobile = false,
}) => {
return (
<div
className={[
"flex h-full flex-col",
mobile
? "w-[285px]"
: "",
].join(" ")}
>
{/* LOGO */}
    <div className="flex h-[78px] shrink-0 items-center border-b border-white/[0.06] px-5">
      <button
        type="button"
        onClick={
          handleHome
        }
        className="group flex min-w-0 items-center gap-3"
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-400/20 bg-slate-900">
          <img
            src="/src/assets/cog.png"
            alt="Scholiqen"
            className="h-full w-full object-cover"
            onError={(
              event
            ) => {
              event.currentTarget.style.display =
                "none";
            }}
          />

          <GraduationCap
            size={21}
            className="absolute text-cyan-300"
          />
        </div>

        {!sidebarCollapsed ||
        mobile ? (
          <div className="min-w-0 text-left">
            <div className="truncate text-[15px] font-bold tracking-wide text-white">
              SCHOLIQEN
            </div>

            <div className="truncate text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-400">
              Academy
            </div>
          </div>
        ) : null}
      </button>

      {mobile ? (
        <button
          type="button"
          onClick={() =>
            setMobileSidebarOpen(
              false
            )
          }
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <X
            size={19}
          />
        </button>
      ) : null}
    </div>

    {/* PROFILE */}

    <div
      className={[
        "border-b border-white/[0.06] p-4",
        sidebarCollapsed &&
        !mobile
          ? "flex justify-center"
          : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={
          handleProfile
        }
        className={[
          "group flex w-full items-center rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5 transition hover:border-cyan-400/20 hover:bg-white/[0.045]",
          sidebarCollapsed &&
          !mobile
            ? "w-auto"
            : "",
        ].join(" ")}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-sm font-bold text-cyan-300 ring-1 ring-cyan-400/20">
          {initials}
        </div>

        {!sidebarCollapsed ||
        mobile ? (
          <div className="ml-3 min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-white">
              {studentName}
            </p>

            <p className="truncate text-[11px] text-slate-500">
              {studentClass ||
                "Student"}
            </p>
          </div>
        ) : null}
      </button>
    </div>

    {/* NAVIGATION */}

    <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
      <div className="mb-3 px-2">
        {!sidebarCollapsed ||
        mobile ? (
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Learning
          </p>
        ) : (
          <div className="mx-auto h-px w-6 bg-white/[0.07]" />
        )}
      </div>

      <div className="space-y-1">
        {NAVIGATION.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <NavLink
                key={
                  item.path
                }
                to={
                  item.path
                }
                end={
                  item.path ===
                  "/academy/student"
                }
                title={
                  sidebarCollapsed &&
                  !mobile
                    ? item.label
                    : undefined
                }
                className={({
                  isActive,
                }) =>
                  [
                    "group relative flex items-center rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                    sidebarCollapsed &&
                    !mobile
                      ? "justify-center"
                      : "gap-3",
                    isActive
                      ? "bg-cyan-400/[0.09] text-cyan-300"
                      : "text-slate-400 hover:bg-white/[0.035] hover:text-white",
                  ].join(
                    " "
                  )
                }
              >
                {({
                  isActive,
                }) => (
                  <>
                    {isActive ? (
                      <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-cyan-400" />
                    ) : null}

                    <Icon
                      size={18}
                      strokeWidth={
                        isActive
                          ? 2.2
                          : 1.8
                      }
                      className={
                        isActive
                          ? "text-cyan-300"
                          : "text-slate-500 transition group-hover:text-slate-300"
                      }
                    />

                    {!sidebarCollapsed ||
                    mobile ? (
                      <span className="truncate">
                        {
                          item.label
                        }
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          }
        )}
      </div>
    </nav>

    {/* LOGOUT */}

    <div className="shrink-0 border-t border-white/[0.06] p-3">
      <button
        type="button"
        onClick={
          handleLogout
        }
        title={
          sidebarCollapsed &&
          !mobile
            ? "Logout"
            : undefined
        }
        className={[
          "flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-red-500/[0.07] hover:text-red-300",
          sidebarCollapsed &&
          !mobile
            ? "justify-center"
            : "gap-3",
        ].join(" ")}
      >
        <LogOut
          size={18}
        />

        {!sidebarCollapsed ||
        mobile ? (
          <span>
            Logout
          </span>
        ) : null}
      </button>
    </div>
  </div>
);

};

/* =======================================================
RETURN
======================================================= */

return ( <div className="min-h-screen bg-[#020617] text-white">
{/* ===================================================
DESKTOP SIDEBAR
=================================================== */}
  <aside
    className="fixed inset-y-0 left-0 z-40 hidden border-r border-white/[0.06] bg-[#050b16] lg:block"
    style={{
      width:
        sidebarWidth,
      transition:
        "width 220ms ease",
    }}
  >
    <SidebarContent />
  </aside>

  {/* ===================================================
      MOBILE SIDEBAR
  =================================================== */}

  <AnimatePresence>
    {mobileSidebarOpen ? (
      <>
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
            setMobileSidebarOpen(
              false
            )
          }
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
        />

        <motion.aside
          initial={{
            x: -300,
          }}
          animate={{
            x: 0,
          }}
          exit={{
            x: -300,
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 30,
          }}
          className="fixed inset-y-0 left-0 z-[60] w-[285px] border-r border-white/[0.07] bg-[#050b16] lg:hidden"
        >
          <SidebarContent
            mobile
          />
        </motion.aside>
      </>
    ) : null}
  </AnimatePresence>

  {/* ===================================================
      MAIN AREA
  =================================================== */}

  <div
    className="flex min-h-screen flex-col"
    style={{
      marginLeft:
        typeof window !==
          "undefined" &&
        window.innerWidth >=
          1024
          ? sidebarWidth
          : 0,

      transition:
        "margin-left 220ms ease",
    }}
  >
    {/* =================================================
        TOPBAR
    ================================================= */}

    <header className="sticky top-0 z-30 flex h-[78px] shrink-0 items-center border-b border-white/[0.06] bg-[#020617]/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={() =>
            setMobileSidebarOpen(
              true
            )
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
        >
          <Menu
            size={20}
          />
        </button>

        <button
          type="button"
          onClick={() =>
            setSidebarCollapsed(
              (current) =>
                !current
            )
          }
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.05] hover:text-white lg:flex"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen
              size={19}
            />
          ) : (
            <PanelLeftClose
              size={19}
            />
          )}
        </button>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
            Scholiqen Academy
          </p>

          <h1 className="truncate text-base font-semibold text-white sm:text-lg">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={
            handleSearch
          }
          className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.05] hover:text-white sm:flex"
        >
          <Search
            size={18}
          />
        </button>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          <Bell
            size={18}
          />

          {notifications.length >
          0 ? (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={
            handleProfile
          }
          className="ml-1 flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-2 transition hover:bg-white/[0.05]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-xs font-bold text-cyan-300 ring-1 ring-cyan-400/15">
            {initials}
          </div>

          <span className="hidden max-w-[130px] truncate text-xs font-medium text-slate-300 md:block">
            {studentName}
          </span>
        </button>
      </div>
    </header>

    {/* =================================================
        MAIN CONTENT
    ================================================= */}

    <main className="flex flex-1 flex-col">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative shrink-0 overflow-hidden border-b border-white/[0.06] bg-[#071426]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-cyan-500/[0.07] blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-600/[0.06] blur-3xl" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(34,211,238,0.08),transparent_32%),linear-gradient(120deg,rgba(7,20,38,1),rgba(2,6,23,0.96))]" />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-5 py-3 sm:px-7 sm:py-4 lg:px-9 lg:py-5">
          <div className="flex items-center justify-between gap-6">
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className="min-w-0 max-w-3xl"
            >
              <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1">
                <Sparkles
                  size={12}
                  className="text-cyan-300"
                />

                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Your Learning Space
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[32px]">
                Welcome back,{" "}
                <span className="text-cyan-300">
                  {firstName}
                </span>
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400 sm:text-sm">
                Keep learning, complete your lessons, practice your skills, and stay on track with your Scholiqen Academy journey.
              </p>

              <div className="mt-2.5 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1">
                  <GraduationCap
                    size={14}
                    className="text-cyan-300"
                  />

                  <span className="text-[11px] font-medium text-slate-300">
                    {heroSubtitle}
                  </span>
                </div>

                {studentReference ? (
                  <div className="hidden items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 sm:inline-flex">
                    <User
                      size={13}
                      className="text-slate-500"
                    />

                    <span className="text-[11px] text-slate-500">
                      Student
                    </span>

                    <span className="max-w-[140px] truncate text-[11px] font-medium text-slate-300">
                      {
                        studentReference
                      }
                    </span>
                  </div>
                ) : null}
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.4,
              }}
              className="hidden shrink-0 lg:block"
            >
              <div className="relative flex h-24 w-52 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.11),transparent_60%)]" />

                <div className="relative flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07]">
                    <GraduationCap
                      size={24}
                      strokeWidth={1.4}
                      className="text-cyan-300"
                    />
                  </div>

                  <div>
                    <div className="text-base font-bold text-white">
                      Learn
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Practice • Grow
                    </div>

                    <div className="text-[10px] font-semibold text-cyan-300">
                      Succeed
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =================================================
          OUTLET

          IMPORTANT:
          NO TOP PADDING.
          NO EXTRA GAP.
          
          The child page begins directly beneath
          the hero.
      ================================================= */}

      <div className="mx-auto w-full max-w-[1600px] flex-1 px-5 sm:px-7 lg:px-9">
        <Outlet
          context={{
            student,
            reloadStudent:
              loadStudent,
            studentName,
            firstName,
            studentClass,
            schoolLevel,
            studentReference,
          }}
        />
      </div>
    </main>

    {/* PROFILE LOADING */}

    {loadingStudent ? (
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#071426]/95 px-3 py-2 text-xs text-slate-400 shadow-xl backdrop-blur-xl">
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-300" />

        Loading profile...
      </div>
    ) : null}
  </div>
</div>

);
}
