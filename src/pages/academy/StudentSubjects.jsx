import React, {
useCallback,
useEffect,
useMemo,
useState,
} from "react";

import { motion } from "framer-motion";

import {
useNavigate,
useOutletContext,
} from "react-router-dom";

import {
AlertCircle,
ArrowRight,
BookOpen,
CheckCircle2,
Clock3,
GraduationCap,
Loader2,
PlayCircle,
RefreshCw,
Search,
SlidersHorizontal,
TrendingUp,
X,
} from "lucide-react";

/* =========================================================
API
========================================================= */

const API_URL = (
import.meta.env.VITE_API_URL ||
"http://localhost:5000"
).replace(/\/+$/, "");

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

const clean = (value) => {
if (
value === undefined ||
value === null
) {
return "";
}

return String(value).trim();
};

const firstValue = (...values) => {
for (const value of values) {
if (Array.isArray(value)) {
const arrayValue =
value
.filter(Boolean)
.join(" ")
.trim();

  if (arrayValue) {
    return arrayValue;
  }

  continue;
}

const cleaned =
  clean(value);

if (cleaned) {
  return cleaned;
}

}

return "";
};

const safeParseJSON = (
value
) => {
if (
value === undefined ||
value === null
) {
return null;
}

if (
typeof value === "object"
) {
return value;
}

try {
return JSON.parse(
String(value).trim()
);
} catch {
return null;
}
};

/* =========================================================
STORAGE
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
try {
const raw =
window.localStorage.getItem(
key
);

  if (!raw) {
    continue;
  }

  const parsed =
    safeParseJSON(raw);

  if (
    parsed &&
    typeof parsed ===
      "object" &&
    !Array.isArray(parsed)
  ) {
    return (
      parsed.student ||
      parsed.user ||
      parsed
    );
  }
} catch {
  // Ignore malformed storage.
}

}

return null;
};

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
try {
const value =
window.localStorage.getItem(
key
);

  if (
    value &&
    value.trim()
  ) {
    return value.trim();
  }
} catch {
  // Ignore storage errors.
}

}

return "";
};

/* =========================================================
STUDENT
========================================================= */

const getStudentName = (
student
) => {
if (!student) {
return "Student";
}

return (
firstValue(
student.full_name,
student.fullName,
student.student_name,
student.studentName,
student.name,
[
student.first_name,
student.last_name,
]
) ||
"Student"
);
};

/* =========================================================
NUMBERS
========================================================= */

const toNumber = (
value,
fallback = 0
) => {
const number =
Number(value);

return Number.isFinite(
number
)
? number
: fallback;
};

const clampProgress = (
value
) => {
return Math.max(
0,
Math.min(
100,
Math.round(
toNumber(value, 0)
)
)
);
};

const slugify = (
value
) => {
return String(value || "")
.toLowerCase()
.trim()
.replace(
/[^a-z0-9]+/g,
"-"
)
.replace(
/^-+|-+$/g,
"");
};

/* =========================================================
NORMALIZE SUBJECT VALUE
========================================================= */

const normalizeSubjectValue = (
value
) => {
if (
value === undefined ||
value === null
) {
return [];
}

if (
Array.isArray(value)
) {
return value;
}

if (
typeof value === "object"
) {
const keys =
Object.keys(value);

if (
  keys.length > 0 &&
  keys.every(
    (key) =>
      typeof value[key] ===
        "boolean" ||
      typeof value[key] ===
        "number" ||
      value[key] === null
  )
) {
  return keys
    .filter(
      (key) =>
        Boolean(value[key])
    )
    .map(
      (key) => key
    );
}

return [value];

}

const text =
String(value).trim();

if (!text) {
return [];
}

const parsed =
safeParseJSON(text);

if (
parsed !== null
) {
return normalizeSubjectValue(
parsed
);
}

if (
text.includes(",") ||
text.includes(";") ||
text.includes("|")
) {
return text
.split(
/[,;|]/
)
.map(
(item) =>
item.trim()
)
.filter(Boolean);
}

return [text];
};

/* =========================================================
NORMALIZE SUBJECT
========================================================= */

const normalizeSubject = (
subject,
index,
student
) => {
if (
typeof subject ===
"string"
) {
const name =
subject.trim();

if (!name) {
  return null;
}

const id =
  slugify(name) ||
  `subject-${index + 1}`;

return {
  id,
  subjectId: id,
  name,
  code: "",
  category: "All",
  description:
    `Continue learning ${name} and build your knowledge.`,
  lessons: 0,
  lessonCount: 0,
  completedLessons: 0,
  hours: 0,
  progress: 0,
  progressPercentage: 0,
  status: "Available",
  class: firstValue(
    student?.grade,
    student?.class,
    student?.current_class
  ),
  grade: firstValue(
    student?.grade,
    student?.class,
    student?.current_class
  ),
  studentId: firstValue(
    student?.student_id,
    student?.studentId,
    student?.id
  ),
  enrollmentId: firstValue(
    student?.enrollment_id,
    student?.enrollmentId,
    student?.studentEnrollmentId,
    student?.student_enrollment_id
  ),
};

}

if (
!subject ||
typeof subject !==
"object"
) {
return null;
}

const nested =
subject.subject &&
typeof subject.subject ===
"object"
? subject.subject
: subject;

const name =
firstValue(
nested.name,
nested.subject,
nested.subject_name,
nested.subjectName,
nested.title,
nested.label
);

if (!name) {
return null;
}

const progress =
clampProgress(
firstValue(
nested.progress,
nested.progress_percent,
nested.progressPercentage,
nested.completion,
nested.completion_percent,
nested.completionPercentage
)
);

const lessons =
Math.max(
0,
Math.round(
toNumber(
firstValue(
nested.lessons,
nested.lesson_count,
nested.lessonCount,
nested.total_lessons,
nested.totalLessons
),
0
)
)
);

const hours =
Math.max(
0,
toNumber(
firstValue(
nested.hours,
nested.total_hours,
nested.totalHours,
nested.duration_hours,
nested.durationHours
),
0
)
);

const id =
firstValue(
nested.id,
nested.subject_id,
nested.subjectId,
nested.slug,
nested.subject_slug
) ||
slugify(name) ||
`subject-${index + 1}`;

const resolvedClass =
firstValue(
nested.class,
nested.className,
nested.grade,
nested.level,
student?.grade,
student?.class,
student?.current_class
);

return {
id,
subjectId: id,
name: String(name).trim(),
code: String(
firstValue(
nested.code,
nested.subject_code,
nested.subjectCode
) || ""
).trim(),
category: String(
firstValue(
nested.category,
nested.subject_category,
nested.subjectCategory,
"All"
)
).trim(),
description: String(
firstValue(
nested.description,
nested.summary,
nested.overview
) || ""
).trim(),
lessons,
lessonCount: lessons,
completedLessons: Math.max(
0,
Math.round(
toNumber(
firstValue(
nested.completedLessons,
nested.completed_lessons
),
0
)
)
),
hours,
progress,
progressPercentage:
progress,
status: String(
firstValue(
nested.status,
progress >= 100
? "Completed"
: progress > 0
? "In Progress"
: "Available"
)
),
class:
resolvedClass,
grade: firstValue(
nested.grade,
nested.class,
nested.className,
nested.level,
student?.grade,
student?.class,
student?.current_class
),
studentId: firstValue(
nested.studentId,
nested.student_id,
student?.student_id,
student?.studentId,
student?.id
),
enrollmentId: firstValue(
nested.enrollmentId,
nested.enrollment_id,
student?.enrollment_id,
student?.enrollmentId,
student?.studentEnrollmentId,
student?.student_enrollment_id
),
};
};

/* =========================================================
EXTRACT SUBJECTS
========================================================= */

const extractSubjectCandidates = (
payload
) => {
if (!payload) {
return [];
}

if (
Array.isArray(payload)
) {
return payload;
}

if (
payload.subjects !==
undefined
) {
return normalizeSubjectValue(
payload.subjects
);
}

if (
payload.data?.subjects !==
undefined
) {
return normalizeSubjectValue(
payload.data.subjects
);
}

if (
Array.isArray(
payload.data
)
) {
return payload.data;
}

if (
payload.student?.subjects !==
undefined
) {
return normalizeSubjectValue(
payload.student.subjects
);
}

if (
payload.enrollment?.subjects !==
undefined
) {
return normalizeSubjectValue(
payload.enrollment.subjects
);
}

return [];
};

/* =========================================================
CLASS
========================================================= */

const getPayloadClass = (
payload
) => {
return firstValue(
payload?.class,
payload?.grade,
payload?.className,
payload?.studentClass,
payload?.student_class,

payload?.student?.grade,
payload?.student?.class,
payload?.student?.current_class,

payload?.enrollment?.grade,
payload?.enrollment?.class,
payload?.enrollment?.current_class,

payload?.data?.class,
payload?.data?.grade,
payload?.data?.className

);
};

/* =========================================================
ANIMATION
========================================================= */

const containerVariants = {
hidden: {
opacity: 0,
},

show: {
opacity: 1,
transition: {
staggerChildren: 0.04,
},
},
};

const itemVariants = {
hidden: {
opacity: 0,
y: 6,
},

show: {
opacity: 1,
y: 0,
transition: {
duration: 0.22,
},
},
};

/* =========================================================
SUBJECT CARD
========================================================= */

function SubjectCard({
subject,
onOpen,
}) {
const completed =
subject.progress >= 100;

return (
<motion.div
variants={itemVariants}
className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-[#071426] transition hover:border-cyan-400/20"
> <div className="relative h-32 overflow-hidden border-b border-white/[0.06] bg-[#0a1a30]"> <div className="absolute right-[-35px] top-[-45px] h-32 w-32 rounded-full bg-cyan-400/[0.05] blur-2xl" />
    <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-300">
      <BookOpen
        size={22}
      />
    </div>

    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {subject.code ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-400">
            {subject.code}
          </p>
        ) : null}

        <h3 className="mt-1 truncate text-base font-bold text-white">
          {subject.name}
        </h3>
      </div>

      {completed ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
          <CheckCircle2
            size={12}
          />

          Completed
        </span>
      ) : null}
    </div>
  </div>

  <div className="p-5">
    <p className="line-clamp-2 min-h-[40px] text-xs leading-5 text-slate-500">
      {subject.description ||
        `Continue learning ${subject.name} and build your knowledge.`}
    </p>

    <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-500">
      <span className="flex items-center gap-1.5">
        <PlayCircle
          size={13}
        />

        {subject.lessons}{" "}
        {subject.lessons ===
        1
          ? "lesson"
          : "lessons"}
      </span>

      <span className="flex items-center gap-1.5">
        <Clock3
          size={13}
        />

        {subject.hours} hrs
      </span>
    </div>

    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">
          Progress
        </span>

        <span className="text-[11px] font-bold text-white">
          {subject.progress}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${subject.progress}%`,
          }}
          transition={{
            duration: 0.7,
          }}
          className="h-full rounded-full bg-cyan-400"
        />
      </div>
    </div>

    <button
      type="button"
      onClick={() =>
        onOpen(subject)
      }
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
    >
      {completed
        ? "Review Subject"
        : subject.progress > 0
          ? "Continue Learning"
          : "Start Subject"}

      <ArrowRight
        size={15}
      />
    </button>
  </div>
</motion.div>

);
}

/* =========================================================
PAGE
========================================================= */

export default function StudentSubjects() {
const navigate =
useNavigate();

const outletContext =
useOutletContext();

const contextStudent =
outletContext?.student ||
null;

const [localStudent] =
useState(() =>
getStoredStudent()
);

const student =
contextStudent ||
localStudent;

const studentName =
getStudentName(
student
);

const [
subjects,
setSubjects,
] = useState([]);

const [
loading,
setLoading,
] = useState(true);

const [
error,
setError,
] = useState("");

const [
lastUpdated,
setLastUpdated,
] = useState(null);

const [
studentClass,
setStudentClass,
] = useState(
firstValue(
student?.grade,
student?.class,
student?.current_class
)
);

const [
search,
setSearch,
] = useState("");

const [
filter,
setFilter,
] = useState("All");

/* =======================================================
LOAD
======================================================= */

const loadSubjects =
useCallback(
async () => {
setLoading(true);
setError("");

    try {
      const storedStudent =
        getStoredStudent();

      const currentStudent =
        contextStudent ||
        storedStudent ||
        student ||
        null;

      const token =
        getStoredToken();

      const studentId =
        firstValue(
          currentStudent?.student_id,
          currentStudent?.studentId,
          currentStudent?.id
        );

      const enrollmentId =
        firstValue(
          currentStudent?.enrollment_id,
          currentStudent?.enrollmentId,
          currentStudent?.studentEnrollmentId,
          currentStudent?.student_enrollment_id
        );

      const email =
        firstValue(
          currentStudent?.email,
          currentStudent?.student_email,
          currentStudent?.email_address
        );

      const params =
        new URLSearchParams();

      if (studentId) {
        params.set(
          "studentId",
          studentId
        );
      }

      if (enrollmentId) {
        params.set(
          "enrollmentId",
          enrollmentId
        );
      }

      if (email) {
        params.set(
          "email",
          email
        );
      }

      const url =
        `${API_URL}/api/academy/student/subjects` +
        (
          params.toString()
            ? `?${params.toString()}`
            : ""
        );

      const headers = {
        Accept:
          "application/json",
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;

        headers[
          "x-academy-token"
        ] = token;
      }

      const response =
        await fetch(
          url,
          {
            method: "GET",
            headers,
            credentials:
              "include",
            cache:
              "no-store",
          }
        );

      let payload =
        null;

      try {
        payload =
          await response.json();
      } catch {
        payload =
          null;
      }

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            payload?.error ||
            `Unable to load subjects (${response.status}).`
        );
      }

      const rawSubjects =
        extractSubjectCandidates(
          payload
        );

      const normalized =
        rawSubjects
          .map(
            (
              item,
              index
            ) =>
              normalizeSubject(
                item,
                index,
                currentStudent
              )
          )
          .filter(Boolean);

      /* =================================================
         DEDUPLICATE
         
         NO SUBJECT LIMIT
      ================================================= */

      const subjectMap =
        new Map();

      for (
        const subject of normalized
      ) {
        const idKey =
          clean(
            subject.subjectId ||
              subject.id
          )
            .toLowerCase()
            .trim();

        const nameKey =
          subject.name
            .toLowerCase()
            .trim();

        const key =
          idKey ||
          nameKey;

        if (!key) {
          continue;
        }

        if (
          !subjectMap.has(
            key
          )
        ) {
          subjectMap.set(
            key,
            subject
          );
        }
      }

      const uniqueSubjects =
        Array.from(
          subjectMap.values()
        );

      const resolvedClass =
        firstValue(
          getPayloadClass(
            payload
          ),
          ...uniqueSubjects
            .map(
              (item) =>
                item.class
            )
            .filter(Boolean),
          currentStudent?.grade,
          currentStudent?.class,
          currentStudent?.current_class
        );

      setStudentClass(
        resolvedClass
      );

      setSubjects(
        uniqueSubjects
      );

      setLastUpdated(
        new Date()
      );
    } catch (
      requestError
    ) {
      console.error(
        "STUDENT SUBJECTS ERROR:",
        requestError
      );

      setSubjects([]);

      setError(
        requestError?.message ||
          "Unable to load your subjects."
      );
    } finally {
      setLoading(false);
    }
  },
  [
    contextStudent,
    student,
  ]
);

useEffect(() => {
loadSubjects();
}, [loadSubjects]);

useEffect(() => {
const handleVisibility =
() => {
if (
document.visibilityState ===
"visible"
) {
loadSubjects();
}
};

document.addEventListener(
  "visibilitychange",
  handleVisibility
);

return () => {
  document.removeEventListener(
    "visibilitychange",
    handleVisibility
  );
};

}, [loadSubjects]);

/* =======================================================
FILTERS
======================================================= */

const filterOptions =
useMemo(() => {
const categories =
subjects
.map(
(subject) =>
subject.category
)
.filter(
(category) =>
category &&
category !== "All"
);

  return [
    "All",
    ...Array.from(
      new Set(
        categories
      )
    ),
  ];
}, [subjects]);

const filteredSubjects =
useMemo(() => {
const query =
search
.trim()
.toLowerCase();

  return subjects.filter(
    (subject) => {
      const matchesSearch =
        !query ||
        subject.name
          .toLowerCase()
          .includes(query) ||
        subject.code
          .toLowerCase()
          .includes(query) ||
        subject.category
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "All" ||
        subject.category ===
          filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    }
  );
}, [
  subjects,
  search,
  filter,
]);

/* =======================================================
SUMMARY
======================================================= */

const completedSubjects =
subjects.filter(
(subject) =>
subject.progress >=
100
).length;

const activeSubjects =
subjects.filter(
(subject) =>
subject.progress > 0
).length;

const averageProgress =
subjects.length > 0
? Math.round(
subjects.reduce(
(
total,
subject
) =>
total +
subject.progress,
0
) /
subjects.length
)
: 0;

/* =======================================================
OPEN SUBJECT
======================================================= */

const handleOpenSubject =
(subject) => {
const subjectId =
subject.id ||
slugify(
subject.name
);

  navigate(
    `/academy/student/lessons?subject=${encodeURIComponent(
      subjectId
    )}`
  );
};

/* =======================================================
LOADING
======================================================= */

if (loading) {
return ( <div className="flex min-h-[45vh] w-full items-center justify-center"> <div className="flex flex-col items-center text-center"> <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05] text-cyan-300"> <Loader2
           size={25}
           className="animate-spin"
         /> </div>

      <h2 className="mt-4 text-base font-bold text-white">
        Loading your subjects
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Connecting to your Academy enrollment...
      </p>
    </div>
  </div>
);

}

/* =======================================================
PAGE
======================================================= */

return (
<motion.div
variants={
containerVariants
}
initial="hidden"
animate="show"
className="w-full"
>
{/* ===================================================
SUBJECT HEADER
      NO TOP MARGIN.
      THIS TOUCHES THE PORTAL HERO.
  =================================================== */}

  <motion.section
    variants={
      itemVariants
    }
    className="relative overflow-hidden border-x border-b border-white/[0.07] bg-[#071426] px-5 py-5 sm:px-6 sm:py-6"
  >
    <div className="absolute right-[-70px] top-[-80px] h-56 w-56 rounded-full bg-cyan-400/[0.035] blur-3xl" />

    <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
            <GraduationCap
              size={17}
            />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400">
            My Learning
          </span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          My Subjects
        </h2>

        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-400 sm:text-sm">
          Welcome, {studentName}. These are the subjects connected to your Academy enrollment.
        </p>

        {studentClass ? (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.05] px-3 py-1.5 text-[10px] font-semibold text-cyan-300">
            <GraduationCap
              size={12}
            />

            {studentClass}
          </div>
        ) : null}

        {lastUpdated ? (
          <p className="mt-1.5 text-[9px] text-slate-600">
            Live data updated{" "}
            {lastUpdated.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center">
            <p className="text-base font-bold text-white">
              {subjects.length}
            </p>

            <p className="mt-0.5 text-[9px] text-slate-600">
              Subjects
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center">
            <p className="text-base font-bold text-white">
              {activeSubjects}
            </p>

            <p className="mt-0.5 text-[9px] text-slate-600">
              Active
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center">
            <p className="text-base font-bold text-cyan-300">
              {averageProgress}%
            </p>

            <p className="mt-0.5 text-[9px] text-slate-600">
              Average
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            loadSubjects
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
        >
          <RefreshCw
            size={15}
          />
        </button>
      </div>
    </div>
  </motion.section>

  {/* ===================================================
      ERROR
  =================================================== */}

  {error ? (
    <motion.section
      variants={
        itemVariants
      }
      className="mt-3 rounded-2xl border border-red-400/10 bg-red-400/[0.04] p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-300">
          <AlertCircle
            size={18}
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-red-200">
            Subjects could not be loaded
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {error}
          </p>
        </div>
      </div>
    </motion.section>
  ) : null}

  {/* ===================================================
      CONTROLS
  =================================================== */}

  <motion.section
    variants={
      itemVariants
    }
    className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <div className="relative w-full sm:max-w-md">
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
      />

      <input
        type="text"
        value={search}
        onChange={(
          event
        ) =>
          setSearch(
            event.target.value
          )
        }
        placeholder="Search your subjects..."
        className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#071426] pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/30"
      />

      {search ? (
        <button
          type="button"
          onClick={() =>
            setSearch("")
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
        >
          <X
            size={16}
          />
        </button>
      ) : null}
    </div>

    <div className="flex items-center gap-2 overflow-x-auto">
      <div className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/[0.07] bg-[#071426] px-3 text-slate-500">
        <SlidersHorizontal
          size={15}
        />

        <span className="text-xs font-medium">
          Filter
        </span>
      </div>

      {filterOptions.map(
        (item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setFilter(
                item
              )
            }
            className={[
              "h-10 shrink-0 rounded-xl px-4 text-xs font-semibold transition",
              filter === item
                ? "bg-cyan-400 text-[#020617]"
                : "border border-white/[0.07] bg-[#071426] text-slate-500 hover:text-white",
            ].join(" ")}
          >
            {item}
          </button>
        )
      )}
    </div>
  </motion.section>

  {/* ===================================================
      SUBJECT CARDS
      
      ONLY 3PX GAP FROM CONTROLS.
      NO LARGE EMPTY SPACE.
  =================================================== */}

  {filteredSubjects.length >
  0 ? (
    <motion.section
      variants={
        containerVariants
      }
      initial="hidden"
      animate="show"
      className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {filteredSubjects.map(
        (subject) => (
          <SubjectCard
            key={
              subject.id
            }
            subject={
              subject
            }
            onOpen={
              handleOpenSubject
            }
          />
        )
      )}
    </motion.section>
  ) : (
    <motion.section
      variants={
        itemVariants
      }
      className="mt-3 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#071426] px-6 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
        {error ? (
          <AlertCircle
            size={23}
          />
        ) : (
          <Search
            size={23}
          />
        )}
      </div>

      <h3 className="mt-4 text-base font-bold text-white">
        {error
          ? "Unable to display subjects"
          : search ||
              filter !==
                "All"
            ? "No subjects found"
            : "No subjects assigned yet"}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {error
          ? "There was a problem communicating with the Academy server."
          : search ||
              filter !==
                "All"
            ? "Try a different search term or change the subject filter."
            : studentClass
              ? `No subjects were found for ${studentClass} in your enrollment record.`
              : "Your subjects will appear here once they are available for your enrollment."}
      </p>

      <button
        type="button"
        onClick={() => {
          if (error) {
            loadSubjects();
          } else {
            setSearch("");
            setFilter(
              "All"
            );
          }
        }}
        className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
      >
        {error ? (
          <>
            <RefreshCw
              size={14}
            />

            Reload Subjects
          </>
        ) : (
          "Clear Filters"
        )}
      </button>
    </motion.section>
  )}

  {/* ===================================================
      SUMMARY
  =================================================== */}

  <motion.section
    variants={
      itemVariants
    }
    className="mt-4 grid gap-4 md:grid-cols-3"
  >
    <div className="rounded-2xl border border-white/[0.07] bg-[#071426] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <BookOpen
            size={18}
          />
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Total Subjects
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            {subjects.length}
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-white/[0.07] bg-[#071426] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <CheckCircle2
            size={18}
          />
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Completed Subjects
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            {completedSubjects}
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-white/[0.07] bg-[#071426] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
          <TrendingUp
            size={18}
          />
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Average Progress
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            {averageProgress}%
          </p>
        </div>
      </div>
    </div>
  </motion.section>

  {/* ===================================================
      FOOTER
  =================================================== */}

  <motion.div
    variants={
      itemVariants
    }
    className="mt-4 mb-2 flex items-center gap-3 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4"
  >
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
      <GraduationCap
        size={17}
      />
    </div>

    <div>
      <p className="text-xs font-semibold text-slate-300">
        Your Academy subjects
      </p>

      <p className="mt-1 text-[11px] leading-5 text-slate-600">
        Your subject list comes directly from your Academy enrollment record. Lesson and progress figures will populate as your learning activity is connected.
      </p>
    </div>
  </motion.div>
</motion.div>

);
}
