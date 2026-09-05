import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Loader2,
  Megaphone,
  MoreHorizontal,
  RefreshCw,
  Search,
  Users,
  Video,
  ClipboardList,
  FileText,
  FolderOpen,
  UserCheck,
  UserRound,
  XCircle,
  AlertCircle,
  Activity,
  BookMarked,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

/* =========================================================
   API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const CLASS_DETAILS_URL =
  `${API_URL}/api/academy/tutor/classes`;

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function normalize(value) {
  return clean(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function arrayFromValue(value) {
  if (Array.isArray(value)) {
    return value
      .map(clean)
      .filter(Boolean);
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map(clean)
          .filter(Boolean);
      }
    } catch {
      // Continue below.
    }

    return value
      .split(",")
      .map(clean)
      .filter(Boolean);
  }

  return [];
}

/* =========================================================
   TUTOR STORAGE
========================================================= */

function safelyParseStorage(key) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}

function extractTutor(value) {
  if (!value) {
    return null;
  }

  /*
    Possible structures:

    {
      reference: "TUT-001",
      fullName: "John Doe"
    }

    {
      tutor: {
        reference: "TUT-001"
      }
    }

    {
      user: {
        tutor: {
          reference: "TUT-001"
        }
      }
    }

    {
      data: {
        tutor: {
          reference: "TUT-001"
        }
      }
    }
  */

  if (value?.tutor) {
    const nested = extractTutor(value.tutor);

    if (nested) {
      return nested;
    }
  }

  if (value?.user) {
    const nested = extractTutor(value.user);

    if (nested) {
      return nested;
    }
  }

  if (value?.data) {
    const nested = extractTutor(value.data);

    if (nested) {
      return nested;
    }
  }

  if (
    value?.reference ||
    value?.tutorReference ||
    value?.tutor_reference ||
    value?.ref
  ) {
    return value;
  }

  return null;
}

function getStoredTutor() {
  /*
    Check the most likely keys first.
  */

  const possibleKeys = [
    "scholiqen-tutor",
    "scholiqen_tutor",
    "scholiqenTutor",
    "academy-tutor",
    "academy_tutor",
    "academyTutor",
    "currentTutor",
    "tutor",
    "loggedInTutor",
    "logged_in_tutor",
    "user",
    "currentUser",
    "scholiqen-user",
    "scholiqen_user",
  ];

  for (const key of possibleKeys) {
    const stored = safelyParseStorage(key);

    const tutor = extractTutor(stored);

    if (tutor) {
      return tutor;
    }
  }

  /*
    Last-resort scan.

    This helps if the login page uses an unexpected
    localStorage key.
  */

  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key) {
        continue;
      }

      const stored = safelyParseStorage(key);

      const tutor = extractTutor(stored);

      if (tutor) {
        return tutor;
      }
    }
  } catch {
    // Ignore storage errors.
  }

  return null;
}

/* =========================================================
   TUTOR REFERENCE
========================================================= */

function getTutorReference(tutor) {
  if (!tutor) {
    return "";
  }

  return (
    clean(tutor?.reference) ||
    clean(tutor?.tutorReference) ||
    clean(tutor?.tutor_reference) ||
    clean(tutor?.ref) ||
    clean(tutor?.referenceId) ||
    clean(tutor?.reference_id) ||
    ""
  );
}

/* =========================================================
   SCHOOL LEVEL
========================================================= */

function getSchoolLevel(grade) {
  const value = normalize(grade);

  if (value.startsWith("primary")) {
    return "Primary School";
  }

  if (value.startsWith("jss")) {
    return "Junior Secondary";
  }

  if (value.startsWith("ss")) {
    return "Senior Secondary";
  }

  return "School";
}

/* =========================================================
   STUDENT STATUS
========================================================= */

function getStudentStatus(student) {
  const status = normalize(
    student?.enrollmentStatus ||
      student?.enrollment_status ||
      student?.status
  );

  if (status === "verified") {
    return "verified";
  }

  if (
    status === "pending" ||
    status === "submitted" ||
    status === "processing"
  ) {
    return "pending";
  }

  return status || "pending";
}

/* =========================================================
   STUDENT NAME
========================================================= */

function getStudentName(student) {
  const fullName = clean(
    student?.fullName ||
      student?.full_name ||
      student?.name
  );

  if (fullName) {
    return fullName;
  }

  const generatedName = [
    student?.firstName ||
      student?.first_name,

    student?.middleName ||
      student?.middle_name,

    student?.lastName ||
      student?.last_name,
  ]
    .map(clean)
    .filter(Boolean)
    .join(" ");

  return generatedName || "Unnamed Student";
}

/* =========================================================
   STUDENT ID
========================================================= */

function getStudentId(student) {
  return (
    clean(student?.enrollmentId) ||
    clean(student?.enrollment_id) ||
    clean(student?.id) ||
    getStudentName(student)
  );
}

/* =========================================================
   FETCH
========================================================= */

async function fetchWithTimeout(
  url,
  options = {},
  timeout = 15000
) {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(
        `Server returned an invalid response (${response.status}).`
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Request failed with status ${response.status}.`
      );
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const verified = status === "verified";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        verified
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-amber-400/20 bg-amber-400/10 text-amber-300"
      }`}
    >
      {verified ? (
        <CheckCircle2 size={12} />
      ) : (
        <Clock3 size={12} />
      )}

      {verified ? "Verified" : "Pending"}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass = "text-cyan-300",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/[0.06] blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-3">
          <Icon
            size={20}
            className={iconClass}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   SUBJECT CHIP
========================================================= */

function SubjectChip({ subject }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.04]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
        <BookOpen size={17} />
      </div>

      <span className="text-sm font-medium text-slate-200">
        {subject}
      </span>
    </div>
  );
}

/* =========================================================
   STUDENT ROW
========================================================= */

function StudentRow({ student }) {
  const name = getStudentName(student);

  const status = getStudentStatus(student);

  const subjects = arrayFromValue(
    student?.subjects ||
      student?.subject
  );

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="flex items-center gap-4 border-b border-white/[0.06] px-4 py-4 last:border-b-0"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-sm font-bold text-cyan-300">
        {initials || "S"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-white">
            {name}
          </p>

          <StatusBadge
            status={status}
          />
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>
            {clean(student?.grade) ||
              "Class not specified"}
          </span>

          {subjects.length > 0 && (
            <>
              <span className="text-slate-700">
                •
              </span>

              <span className="truncate">
                {subjects.join(", ")}
              </span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        className="hidden rounded-lg border border-white/[0.07] bg-white/[0.03] p-2 text-slate-500 transition hover:border-cyan-400/20 hover:text-cyan-300 sm:block"
        title="Student options"
      >
        <MoreHorizontal size={17} />
      </button>
    </motion.div>
  );
}

/* =========================================================
   ACTION CARD
========================================================= */

function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group w-full text-left disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="flex h-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-cyan-400/20 group-hover:bg-cyan-400/[0.04]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-cyan-300 transition group-hover:bg-cyan-400/10">
          <Icon size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <ChevronRight
          size={17}
          className="shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300"
        />
      </div>
    </button>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TutorClassDetails() {
  const navigate = useNavigate();

  const location = useLocation();

  const params = useParams();

  /* =======================================================
     URL / NAVIGATION DATA
  ======================================================= */

  const gradeFromParams = clean(
    params?.grade
  );

  const subjectFromParams = clean(
    params?.subject
  );

  const locationState =
    location.state || {};

  const stateGrade = clean(
    locationState?.grade ||
      locationState?.className ||
      locationState?.course
  );

  const stateReference = clean(
    locationState?.reference ||
      locationState?.tutorReference ||
      locationState?.tutor_reference
  );

  const stateTutor =
    locationState?.tutor ||
    locationState?.user ||
    null;

  const selectedGrade =
    stateGrade ||
    gradeFromParams;

  /* =======================================================
     STATE
  ======================================================= */

  const [tutor, setTutor] =
    useState(stateTutor || null);

  const [classData, setClassData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [studentSearch, setStudentSearch] =
    useState("");

  const [
    activeStudentFilter,
    setActiveStudentFilter,
  ] = useState("all");

  /* =======================================================
     RESOLVE TUTOR
  ======================================================= */

  useEffect(() => {
    const storedTutor =
      getStoredTutor();

    /*
      Prefer navigation tutor,
      then stored tutor.
    */

    if (stateTutor) {
      setTutor(
        extractTutor(stateTutor) ||
          stateTutor
      );

      return;
    }

    if (storedTutor) {
      setTutor(storedTutor);
    }
  }, [stateTutor]);

  /* =======================================================
     LOAD CLASS DETAILS
  ======================================================= */

  const loadClassDetails =
    useCallback(
      async (isRefresh = false) => {
        /*
          Get tutor from:

          1. current state
          2. navigation state
          3. localStorage
        */

        const currentTutor =
          tutor ||
          extractTutor(stateTutor) ||
          getStoredTutor();

        /*
          Get reference from:

          1. tutor object
          2. navigation state
        */

        const reference =
          getTutorReference(
            currentTutor
          ) ||
          stateReference;

        console.log(
          "Tutor Class Details:",
          {
            tutor: currentTutor,
            reference,
            selectedGrade,
          }
        );

        /* ===============================================
           VALIDATION
        =============================================== */

        if (!reference) {
          setLoading(false);

          setError(
            "Tutor information could not be found. Please log in again."
          );

          return;
        }

        if (!selectedGrade) {
          setLoading(false);

          setError(
            "No class was selected. Please return to My Classes and open a class."
          );

          return;
        }

        /* ===============================================
           REQUEST
        =============================================== */

        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const query =
            new URLSearchParams();

          query.set(
            "reference",
            reference
          );

          query.set(
            "grade",
            selectedGrade
          );

          if (subjectFromParams) {
            query.set(
              "subject",
              subjectFromParams
            );
          }

          const requestUrl =
            `${CLASS_DETAILS_URL}?${query.toString()}`;

          console.log(
            "Loading tutor class:",
            requestUrl
          );

          const data =
            await fetchWithTimeout(
              requestUrl
            );

          console.log(
            "Tutor class response:",
            data
          );

          if (!data?.success) {
            throw new Error(
              data?.message ||
                "Unable to load class details."
            );
          }

          setClassData(data);
        } catch (err) {
          console.error(
            "Tutor Class Details Error:",
            err
          );

          if (
            err?.name ===
            "AbortError"
          ) {
            setError(
              "The request took too long. Please check that the server is running and try again."
            );
          } else {
            setError(
              err?.message ||
                "Unable to load this class right now."
            );
          }
        } finally {
          setLoading(false);

          setRefreshing(false);
        }
      },
      [
        tutor,
        stateTutor,
        stateReference,
        selectedGrade,
        subjectFromParams,
      ]
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadClassDetails(false);
  }, [loadClassDetails]);

  /* =======================================================
     LIVE REFRESH
  ======================================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        loadClassDetails(true);
      }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [loadClassDetails]);

  /* =======================================================
     NORMALIZE RESPONSE
  ======================================================= */

  const selectedClass =
    useMemo(() => {
      if (!classData) {
        return null;
      }

      return (
        classData.class ||
        classData.data?.class ||
        classData.course ||
        classData.data?.course ||
        null
      );
    }, [classData]);

  /* =======================================================
     REGISTERED SUBJECTS
  ======================================================= */

  const registeredSubjects =
    useMemo(() => {
      const subjects =
        classData?.selection?.subjects ||
        classData?.registeredSubjects ||
        classData?.data?.selection?.subjects ||
        selectedClass?.subjects ||
        locationState?.subjects ||
        tutor?.subjects ||
        [];

      return [
        ...new Set(
          arrayFromValue(
            subjects
          )
        ),
      ];
    }, [
      classData,
      selectedClass,
      locationState,
      tutor,
    ]);

  /* =======================================================
     STUDENTS
  ======================================================= */

  const students =
    useMemo(() => {
      const value =
        classData?.students ||
        selectedClass?.students ||
        classData?.data?.students ||
        [];

      return Array.isArray(value)
        ? value
        : [];
    }, [
      classData,
      selectedClass,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      const verified =
        students.filter(
          (student) =>
            getStudentStatus(
              student
            ) === "verified"
        );

      const pending =
        students.filter(
          (student) =>
            getStudentStatus(
              student
            ) === "pending"
        );

      return {
        total:
          students.length,

        verified:
          verified.length,

        pending:
          pending.length,

        subjects:
          registeredSubjects.length,
      };
    }, [
      students,
      registeredSubjects,
    ]);

  /* =======================================================
     FILTER STUDENTS
  ======================================================= */

  const filteredStudents =
    useMemo(() => {
      const search =
        normalize(
          studentSearch
        );

      return students.filter(
        (student) => {
          const status =
            getStudentStatus(
              student
            );

          if (
            activeStudentFilter !==
              "all" &&
            status !==
              activeStudentFilter
          ) {
            return false;
          }

          if (!search) {
            return true;
          }

          const name =
            normalize(
              getStudentName(
                student
              )
            );

          const studentSubjects =
            arrayFromValue(
              student?.subjects ||
                student?.subject
            )
              .map(normalize)
              .join(" ");

          const email =
            normalize(
              student?.email
            );

          const enrollmentId =
            normalize(
              student?.enrollmentId ||
                student?.enrollment_id
            );

          return (
            name.includes(
              search
            ) ||
            studentSubjects.includes(
              search
            ) ||
            email.includes(
              search
            ) ||
            enrollmentId.includes(
              search
            )
          );
        }
      );
    }, [
      students,
      studentSearch,
      activeStudentFilter,
    ]);

  /* =======================================================
     DISPLAY DATA
  ======================================================= */

  const displayGrade =
    clean(
      selectedClass?.grade ||
        selectedClass?.className ||
        selectedClass?.course ||
        selectedGrade
    ) || "Class";

  const schoolLevel =
    clean(
      selectedClass?.schoolLevel ||
        selectedClass?.school_level
    ) ||
    getSchoolLevel(
      displayGrade
    );

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goBack = () => {
    navigate(
      "/academy/tutor/classes"
    );
  };

  const goToStudents = () => {
    navigate(
      "/academy/tutor/students",
      {
        state: {
          grade: displayGrade,
          subjects:
            registeredSubjects,
          students,
          tutor,
        },
      }
    );
  };

  const comingSoon = (
    feature
  ) => {
    alert(
      `${feature} will be connected next.`
    );
  };

  /* =======================================================
     ERROR SCREEN
  ======================================================= */

  if (!loading && error) {
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-[-10%] h-80 w-80 rounded-full bg-cyan-500/[0.08] blur-[120px]" />

          <div className="absolute bottom-[-10%] right-[10%] h-80 w-80 rounded-full bg-violet-500/[0.08] blur-[120px]" />
        </div>

        <main className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-5 py-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-white/[0.035] p-8 text-center backdrop-blur-xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-300">
              <AlertCircle
                size={30}
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-white">
              Unable to Load Class
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {error}
            </p>

            {/* Debug information */}
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                Class
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {selectedGrade ||
                  "Not detected"}
              </p>

              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                Tutor Reference
              </p>

              <p className="mt-1 break-all text-sm text-slate-300">
                {getTutorReference(
                  tutor
                ) ||
                  stateReference ||
                  "Not detected"}
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07]"
              >
                <ArrowLeft
                  size={17}
                />

                Back to My Classes
              </button>

              <button
                type="button"
                onClick={() =>
                  loadClassDetails(
                    false
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                <RefreshCw
                  size={17}
                />

                Try Again
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute left-[10%] top-[-10%] h-80 w-80 rounded-full bg-cyan-500/[0.08] blur-[120px]" />

          <div className="absolute bottom-[-10%] right-[10%] h-80 w-80 rounded-full bg-violet-500/[0.08] blur-[120px]" />
        </div>

        <main className="relative mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="flex animate-pulse items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />

            <div>
              <div className="h-5 w-48 rounded bg-white/[0.06]" />

              <div className="mt-2 h-3 w-28 rounded bg-white/[0.04]" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl border border-white/[0.06] bg-white/[0.03]"
                />
              )
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="h-96 rounded-2xl border border-white/[0.06] bg-white/[0.03]" />

            <div className="h-96 rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050816] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-12%] h-[420px] w-[420px] rounded-full bg-cyan-500/[0.07] blur-[140px]" />

        <div className="absolute right-[-8%] top-[25%] h-[400px] w-[400px] rounded-full bg-violet-500/[0.06] blur-[140px]" />

        <div className="absolute bottom-[-15%] left-[30%] h-[350px] w-[350px] rounded-full bg-blue-500/[0.05] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize:
              "24px 24px",
          }}
        />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
              title="Back to My Classes"
            >
              <ArrowLeft
                size={19}
              />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-400/80">
                  My Classes
                </p>

                <span className="text-slate-700">
                  /
                </span>

                <p className="text-xs text-slate-500">
                  Class Details
                </p>
              </div>

              <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                {displayGrade}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-xs font-medium text-emerald-300">
                Live data
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                loadClassDetails(
                  true
                )
              }
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/20 hover:text-cyan-300 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          </div>
        </div>

        {/* =================================================
            CLASS HERO
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl"
        >
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/[0.07] blur-[80px]" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
                  <GraduationCap
                    size={30}
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {displayGrade}
                    </h2>

                    {stats.verified >
                      0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                        <Activity
                          size={12}
                        />

                        Active
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {schoolLevel}
                  </p>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Manage your students,
                    subjects and teaching
                    activities for this
                    registered class.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  comingSoon(
                    "Live Class"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_10px_35px_rgba(34,211,238,0.12)] transition hover:bg-cyan-300"
              >
                <Video size={18} />

                Start Live Class
              </button>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats.total}
            description="Students who applied"
            iconClass="text-cyan-300"
          />

          <StatCard
            icon={UserCheck}
            label="Active Students"
            value={stats.verified}
            description="Verified students"
            iconClass="text-emerald-300"
          />

          <StatCard
            icon={Clock3}
            label="Pending Students"
            value={stats.pending}
            description="Awaiting verification"
            iconClass="text-amber-300"
          />

          <StatCard
            icon={BookOpen}
            label="Subjects"
            value={stats.subjects}
            description="Subjects selected during registration"
            iconClass="text-violet-300"
          />
        </section>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
          {/* ===============================================
              LEFT
          =============================================== */}

          <div className="space-y-6">
            {/* Subjects */}

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl">
              <div className="border-b border-white/[0.07] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Subjects You Teach
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Subjects selected during
                      your tutor registration.
                    </p>
                  </div>

                  <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05] px-2.5 py-1.5 text-xs font-semibold text-cyan-300">
                    {
                      registeredSubjects.length
                    }
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {registeredSubjects.length >
                0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {registeredSubjects.map(
                      (
                        subject
                      ) => (
                        <SubjectChip
                          key={
                            subject
                          }
                          subject={
                            subject
                          }
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
                    <BookMarked
                      size={24}
                      className="mx-auto text-slate-600"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-400">
                      No subjects found
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Students */}

            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl">
              <div className="border-b border-white/[0.07] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Students
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Students who applied for
                      this registered class.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      goToStudents
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:text-cyan-300"
                  >
                    View All

                    <ChevronRight
                      size={14}
                    />
                  </button>
                </div>

                {/* Search */}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      type="text"
                      value={
                        studentSearch
                      }
                      onChange={(
                        event
                      ) =>
                        setStudentSearch(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Search students..."
                      className="w-full rounded-xl border border-white/[0.08] bg-black/20 py-3 pl-10 pr-10 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
                    />

                    {studentSearch && (
                      <button
                        type="button"
                        onClick={() =>
                          setStudentSearch(
                            ""
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300"
                      >
                        <XCircle
                          size={16}
                        />
                      </button>
                    )}
                  </div>

                  <div className="flex rounded-xl border border-white/[0.08] bg-black/20 p-1">
                    {[
                      [
                        "all",
                        "All",
                      ],
                      [
                        "verified",
                        "Active",
                      ],
                      [
                        "pending",
                        "Pending",
                      ],
                    ].map(
                      ([
                        value,
                        label,
                      ]) => (
                        <button
                          key={
                            value
                          }
                          type="button"
                          onClick={() =>
                            setActiveStudentFilter(
                              value
                            )
                          }
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            activeStudentFilter ===
                            value
                              ? "bg-cyan-400/10 text-cyan-300"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div>
                <AnimatePresence mode="popLayout">
                  {filteredStudents.length >
                  0 ? (
                    filteredStudents.map(
                      (
                        student
                      ) => (
                        <StudentRow
                          key={getStudentId(
                            student
                          )}
                          student={
                            student
                          }
                        />
                      )
                    )
                  ) : (
                    <motion.div
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      className="p-10 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-slate-600">
                        <UserRound
                          size={22}
                        />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-300">
                        No students
                        found
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {students.length >
                        0
                          ? "Try changing your search or filter."
                          : "No students have applied for this class yet."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* ===============================================
              RIGHT
          =============================================== */}

          <div className="space-y-6">
            {/* Teaching */}

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6">
              <div className="mb-4">
                <h3 className="text-base font-bold text-white">
                  Teaching
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Manage teaching activities
                  for this class.
                </p>
              </div>

              <div className="space-y-3">
                <ActionCard
                  icon={
                    ClipboardList
                  }
                  title="Create Task"
                  description="Give students work to complete"
                  onClick={() =>
                    comingSoon(
                      "Create Task"
                    )
                  }
                />

                <ActionCard
                  icon={FileText}
                  title="Assignments"
                  description="Create and manage assignments"
                  onClick={() =>
                    comingSoon(
                      "Assignments"
                    )
                  }
                />

                <ActionCard
                  icon={BookOpen}
                  title="Lessons"
                  description="Plan lessons for this class"
                  onClick={() =>
                    comingSoon(
                      "Lessons"
                    )
                  }
                />

                <ActionCard
                  icon={FolderOpen}
                  title="Materials"
                  description="Share learning resources"
                  onClick={() =>
                    comingSoon(
                      "Materials"
                    )
                  }
                />
              </div>
            </section>

            {/* Class Management */}

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6">
              <div className="mb-4">
                <h3 className="text-base font-bold text-white">
                  Class Management
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Tools for managing your
                  classroom.
                </p>
              </div>

              <div className="space-y-3">
                <ActionCard
                  icon={
                    CalendarDays
                  }
                  title="Attendance"
                  description="Record and monitor attendance"
                  onClick={() =>
                    comingSoon(
                      "Attendance"
                    )
                  }
                />

                <ActionCard
                  icon={Megaphone}
                  title="Announcements"
                  description="Send updates to the class"
                  onClick={() =>
                    comingSoon(
                      "Announcements"
                    )
                  }
                />

                <ActionCard
                  icon={Video}
                  title="Live Classroom"
                  description="Start a live teaching session"
                  onClick={() =>
                    comingSoon(
                      "Live Classroom"
                    )
                  }
                />
              </div>
            </section>

            {/* Class status */}

            <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-cyan-400/[0.06] to-violet-500/[0.04] p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300">
                  <Activity
                    size={19}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    Live Class Status
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    This page automatically
                    checks for new student
                    applications and
                    verification changes.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                <span className="text-xs text-slate-500">
                  Auto refresh
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  Every 10 seconds
                </span>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}