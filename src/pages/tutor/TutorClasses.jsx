import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Layers3,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
  Clock3,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const TUTOR_CLASSES_URL =
  `${API_URL}/api/academy/tutor/classes`;

/* =========================================================
   LIVE REFRESH
========================================================= */

const LIVE_REFRESH_INTERVAL = 10000;

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}

function normalize(value) {
  return clean(value)
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function arrayFromValue(value) {
  if (Array.isArray(value)) {
    return [
      ...new Set(
        value
          .map(clean)
          .filter(Boolean)
      ),
    ];
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return [
          ...new Set(
            parsed
              .map(clean)
              .filter(Boolean)
          ),
        ];
      }
    } catch {
      // Continue below.
    }

    return [
      ...new Set(
        value
          .split(",")
          .map((item) => clean(item))
          .filter(Boolean)
      ),
    ];
  }

  return [];
}

/* =========================================================
   SUBJECT MATCHING
========================================================= */

function subjectMatches(first, second) {
  const a = normalize(first);
  const b = normalize(second);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  const aliases = {
    "english studies": [
      "english language",
      "english",
    ],

    "english language": [
      "english studies",
      "english",
    ],

    mathematics: [
      "general mathematics",
    ],

    "general mathematics": [
      "mathematics",
    ],

    "computer studies": [
      "computer science",
      "data processing",
      "information technology",
    ],

    "computer science": [
      "computer studies",
      "data processing",
      "information technology",
    ],

    "data processing": [
      "computer studies",
      "computer science",
      "information technology",
    ],

    "information technology": [
      "computer studies",
      "computer science",
      "data processing",
    ],

    phe: [
      "physical education",
      "physical and health education",
    ],

    "physical education": [
      "phe",
      "physical and health education",
    ],

    "physical and health education": [
      "phe",
      "physical education",
    ],

    cca: [
      "cultural and creative arts",
      "fine art",
      "visual arts",
    ],

    "cultural and creative arts": [
      "cca",
      "fine art",
      "visual arts",
    ],

    crs: [
      "christian religious studies",
      "christian religious knowledge",
    ],

    "christian religious studies": [
      "crs",
      "christian religious knowledge",
    ],

    irs: [
      "islamic religious studies",
      "islamic religious knowledge",
    ],

    "islamic religious studies": [
      "irs",
      "islamic religious knowledge",
    ],

    "home economics": [
      "home management",
    ],

    "home management": [
      "home economics",
    ],

    "food & nutrition": [
      "food and nutrition",
    ],

    "food and nutrition": [
      "food & nutrition",
    ],
  };

  if (
    aliases[a]?.some(
      (alias) =>
        normalize(alias) === b
    )
  ) {
    return true;
  }

  if (
    aliases[b]?.some(
      (alias) =>
        normalize(alias) === a
    )
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   GRADE MATCHING
========================================================= */

function normalizeGrade(value) {
  return normalize(value)
    .replace(
      /^primary\s*(\d+)$/,
      "primary $1"
    )
    .replace(
      /^jss\s*(\d+)$/,
      "jss $1"
    )
    .replace(
      /^ss\s*(\d+)$/,
      "ss $1"
    );
}

function gradeMatches(first, second) {
  return (
    normalizeGrade(first) ===
    normalizeGrade(second)
  );
}

/* =========================================================
   SCHOOL LEVEL
========================================================= */

function getSchoolLevel(grade) {
  const value =
    normalizeGrade(grade);

  if (
    value.startsWith("primary")
  ) {
    return "Primary";
  }

  if (
    value.startsWith("jss")
  ) {
    return "Junior Secondary";
  }

  if (
    value.startsWith("ss")
  ) {
    return "Senior Secondary";
  }

  return "Other";
}

/* =========================================================
   STATUS
========================================================= */

function normalizeStatus(value) {
  return normalize(value).replace(
    /[\s-]+/g,
    "_"
  );
}

function isVerifiedStatus(value) {
  const status =
    normalizeStatus(value);

  return (
    status === "verified" ||
    status === "active" ||
    status === "approved"
  );
}

/* =========================================================
   STORAGE
========================================================= */

function extractTutor(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value === "object"
  ) {
    if (value.reference) {
      return value;
    }

    if (
      value.tutor?.reference
    ) {
      return value.tutor;
    }

    if (
      value.user?.reference
    ) {
      return value.user;
    }
  }

  if (
    typeof value === "string"
  ) {
    try {
      const parsed =
        JSON.parse(value);

      if (parsed?.reference) {
        return parsed;
      }

      if (
        parsed?.tutor?.reference
      ) {
        return parsed.tutor;
      }

      if (
        parsed?.user?.reference
      ) {
        return parsed.user;
      }
    } catch {
      // Not JSON.
    }
  }

  return null;
}

function findTutorInStorage(storage) {
  if (!storage) {
    return null;
  }

  const preferredKeys = [
    "tutor",
    "academyTutor",
    "scholiqenTutor",
    "tutorUser",
    "currentTutor",
    "loggedInTutor",
    "user",
    "currentUser",
    "academy_user",
    "scholiqen_user",
    "authUser",
  ];

  for (
    const key of preferredKeys
  ) {
    try {
      const raw =
        storage.getItem(key);

      if (!raw) {
        continue;
      }

      const tutor =
        extractTutor(raw);

      if (tutor?.reference) {
        return tutor;
      }
    } catch {
      // Ignore.
    }
  }

  try {
    for (
      let index = 0;
      index < storage.length;
      index += 1
    ) {
      const key =
        storage.key(index);

      if (!key) {
        continue;
      }

      const raw =
        storage.getItem(key);

      if (!raw) {
        continue;
      }

      const tutor =
        extractTutor(raw);

      if (tutor?.reference) {
        return tutor;
      }
    }
  } catch {
    // Ignore.
  }

  return null;
}

function getStoredTutor() {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  const localTutor =
    findTutorInStorage(
      window.localStorage
    );

  if (
    localTutor?.reference
  ) {
    return localTutor;
  }

  const sessionTutor =
    findTutorInStorage(
      window.sessionStorage
    );

  if (
    sessionTutor?.reference
  ) {
    return sessionTutor;
  }

  return null;
}

/* =========================================================
   FETCH WITH TIMEOUT
========================================================= */

async function fetchWithTimeout(
  url,
  options = {},
  timeout = 12000
) {
  const controller =
    new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    return await fetch(url, {
      ...options,
      signal:
        controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  index,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.07,
        duration: 0.35,
      }}
      className="
        group relative overflow-hidden
        rounded-2xl
        border border-white/10
        bg-white/[0.035]
        p-5
        backdrop-blur-xl
      "
    >
      <div
        className="
          pointer-events-none absolute
          inset-0
          bg-gradient-to-br
          from-cyan-500/[0.07]
          via-transparent
          to-violet-500/[0.06]
          opacity-0
          transition-opacity
          group-hover:opacity-100
        "
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-xl
              border border-cyan-400/10
              bg-cyan-500/10
            "
          >
            <Icon className="h-5 w-5 text-cyan-300" />
          </div>

          <Activity className="h-4 w-4 text-white/20" />
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {value}
          </p>

          <p className="mt-1 text-sm text-white/40">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   CLASS CARD
========================================================= */

function ClassCard({
  item,
  index,
  onOpen,
}) {
  const active =
    Boolean(item.active);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.04,
      }}
      whileHover={{
        y: -4,
      }}
      className="
        group relative overflow-hidden
        rounded-2xl
        border border-white/10
        bg-white/[0.035]
        backdrop-blur-xl
      "
    >
      <div
        className={`
          pointer-events-none
          absolute -right-16 -top-16
          h-36 w-36
          rounded-full
          blur-3xl
          ${
            active
              ? "bg-emerald-400/10"
              : "bg-white/5"
          }
        `}
      />

      <div className="relative p-5">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex h-12 w-12
                shrink-0 items-center
                justify-center
                rounded-xl
                border border-cyan-400/10
                bg-gradient-to-br
                from-cyan-500/20
                to-blue-500/10
              "
            >
              <GraduationCap
                className="h-6 w-6 text-cyan-300"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.15em] text-white/30">
                {item.schoolLevel}
              </p>

              <h3 className="mt-1 truncate text-lg font-bold text-white">
                {item.grade}
              </h3>
            </div>
          </div>

          <span
            className={`
              inline-flex shrink-0
              items-center gap-1.5
              rounded-full
              border
              px-2.5 py-1
              text-[11px] font-bold
              ${
                active
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-white/40"
              }
            `}
          >
            {active ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Clock3 className="h-3.5 w-3.5" />
            )}

            {active
              ? "Active"
              : "Awaiting Students"}
          </span>
        </div>

        {/* SUBJECT */}

        <div
          className="
            mt-5 rounded-xl
            border border-white/8
            bg-black/20
            p-4
          "
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-300" />

            <span className="text-xs uppercase tracking-[0.15em] text-white/30">
              Subject
            </span>
          </div>

          <p className="mt-2 text-base font-bold text-white">
            {item.subject}
          </p>
        </div>

        {/* STUDENTS */}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div
            className="
              rounded-xl
              border border-white/8
              bg-white/[0.025]
              p-3
            "
          >
            <p className="text-[10px] uppercase tracking-wider text-white/30">
              Applied
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              {item.studentCount ??
                0}
            </p>
          </div>

          <div
            className="
              rounded-xl
              border border-white/8
              bg-white/[0.025]
              p-3
            "
          >
            <p className="text-[10px] uppercase tracking-wider text-white/30">
              Verified
            </p>

            <p className="mt-1 text-lg font-bold text-emerald-300">
              {item.verifiedStudentCount ??
                0}
            </p>
          </div>

          <div
            className="
              rounded-xl
              border border-white/8
              bg-white/[0.025]
              p-3
            "
          >
            <p className="text-[10px] uppercase tracking-wider text-white/30">
              Pending
            </p>

            <p className="mt-1 text-lg font-bold text-amber-300">
              {item.pendingStudentCount ??
                0}
            </p>
          </div>
        </div>

        {/* FOOTER */}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-white/35">
            <Users className="h-4 w-4" />

            {item.studentCount ??
              0}{" "}
            student
            {Number(
              item.studentCount
            ) === 1
              ? ""
              : "s"}
          </div>

          <button
            type="button"
            onClick={() =>
              onOpen(item)
            }
            className="
              inline-flex items-center
              gap-2 rounded-xl
              border border-cyan-400/15
              bg-cyan-400/10
              px-3.5 py-2
              text-xs font-bold
              text-cyan-200
              transition
              hover:border-cyan-400/30
              hover:bg-cyan-400/15
            "
          >
            Open

            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  search,
  filter,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-dashed
        border-white/10
        bg-white/[0.02]
        px-6 py-16
        text-center
      "
    >
      <div
        className="
          mx-auto flex h-14 w-14
          items-center justify-center
          rounded-2xl
          border border-white/10
          bg-white/5
        "
      >
        <Layers3 className="h-6 w-6 text-white/30" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-white">
        No assigned classes found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
        {search ||
        filter !== "all"
          ? "Try changing your search or filters."
          : "Your registered teaching classes and subjects will appear here."}
      </p>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function TutorClasses() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [storedTutor] =
    useState(() =>
      getStoredTutor()
    );

  const [reference, setReference] =
    useState(() =>
      clean(
        location.state?.tutor
          ?.reference ||
          location.state
            ?.reference ||
          storedTutor?.reference
      )
    );

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [levelFilter, setLevelFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  /* =======================================================
     FIND REFERENCE
  ======================================================= */

  useEffect(() => {
    const stateReference =
      location.state?.tutor
        ?.reference ||
      location.state?.reference;

    if (stateReference) {
      setReference(
        clean(stateReference)
      );

      return;
    }

    const tutor =
      getStoredTutor();

    if (tutor?.reference) {
      setReference(
        clean(tutor.reference)
      );
    }
  }, [location.state]);

  /* =======================================================
     FETCH LIVE DATA
  ======================================================= */

  const fetchClasses =
    useCallback(
      async (isRefresh = false) => {
        const tutorReference =
          clean(reference);

        if (!tutorReference) {
          setLoading(false);
          setRefreshing(false);

          setError(
            "Tutor reference was not found. Please log in again."
          );

          return;
        }

        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const url =
            `${TUTOR_CLASSES_URL}` +
            `?reference=${encodeURIComponent(
              tutorReference
            )}`;

          const response =
            await fetchWithTimeout(
              url,
              {
                method: "GET",
                headers: {
                  Accept:
                    "application/json",
                },
              },
              12000
            );

          const raw =
            await response.text();

          let result = {};

          try {
            result = raw
              ? JSON.parse(raw)
              : {};
          } catch {
            throw new Error(
              `The server returned an invalid response (${response.status}).`
            );
          }

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                `Unable to load tutor classes (${response.status}).`
            );
          }

          setData(result);
        } catch (
          requestError
        ) {
          console.error(
            "TUTOR CLASSES ERROR:",
            requestError
          );

          if (
            requestError?.name ===
            "AbortError"
          ) {
            setError(
              "The request took too long. Please check that the backend server is running."
            );
          } else {
            setError(
              requestError?.message ||
                "Unable to load your classes."
            );
          }
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [reference]
    );

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    fetchClasses(false);
  }, [
    reference,
    fetchClasses,
  ]);

  /* =======================================================
     LIVE POLLING
  ======================================================= */

  useEffect(() => {
    if (!reference) {
      return undefined;
    }

    const interval =
      setInterval(() => {
        fetchClasses(true);
      }, LIVE_REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [
    reference,
    fetchClasses,
  ]);

  /* =======================================================
     REGISTERED COURSES
     
     IMPORTANT:
     These are the ONLY courses/classes allowed to appear
     inside Assigned Courses.
  ======================================================= */

  const selectedCourses =
    useMemo(() => {
      return Array.isArray(
        data?.selection?.courses
      )
        ? [
            ...new Set(
              data.selection.courses
                .map(clean)
                .filter(Boolean)
            ),
          ]
        : [];
    }, [data]);

  /* =======================================================
     REGISTERED SUBJECTS
     
     IMPORTANT:
     These are the ONLY subjects allowed to appear in
     teaching assignment combinations.
  ======================================================= */

  const selectedSubjects =
    useMemo(() => {
      return Array.isArray(
        data?.selection?.subjects
      )
        ? [
            ...new Set(
              data.selection.subjects
                .map(clean)
                .filter(Boolean)
            ),
          ]
        : [];
    }, [data]);

  /* =======================================================
     RAW BACKEND CLASSES
  ======================================================= */

  const backendClasses =
    useMemo(() => {
      return Array.isArray(
        data?.classes
      )
        ? data.classes
        : [];
    }, [data]);

  /* =======================================================
     ASSIGNED CLASSES
     
     HARD FILTER:
     
     A backend card is allowed ONLY IF:
     
     1. Its grade/class exists in tutor registration.
     2. Its subject exists in tutor registration.
     
     This prevents any unrelated class from appearing even
     if the backend/database happens to return it.
  ======================================================= */

  const classes = useMemo(() => {
    if (
      !selectedCourses.length ||
      !selectedSubjects.length
    ) {
      return [];
    }

    return backendClasses.filter(
      (item) => {
        const registeredCourse =
          selectedCourses.some(
            (course) =>
              gradeMatches(
                course,
                item.grade
              )
          );

        if (!registeredCourse) {
          return false;
        }

        const registeredSubject =
          selectedSubjects.some(
            (subject) =>
              subjectMatches(
                subject,
                item.subject
              )
          );

        if (!registeredSubject) {
          return false;
        }

        return true;
      }
    );
  }, [
    backendClasses,
    selectedCourses,
    selectedSubjects,
  ]);

  /* =======================================================
     EXTRA SAFETY
     
     Make sure every registered course can only produce
     assignment cards using the tutor's registered subjects.
     
     If the backend did not return a card for a registered
     combination, we DO NOT invent one here because student
     counts belong to the backend.
  ======================================================= */

  const assignedClasses =
    useMemo(() => {
      const result = [];
      const seen = new Set();

      classes.forEach((item) => {
        const grade =
          clean(item.grade);

        const subject =
          clean(item.subject);

        if (
          !grade ||
          !subject
        ) {
          return;
        }

        const matchingCourse =
          selectedCourses.some(
            (course) =>
              gradeMatches(
                course,
                grade
              )
          );

        const matchingSubject =
          selectedSubjects.some(
            (registeredSubject) =>
              subjectMatches(
                registeredSubject,
                subject
              )
          );

        if (
          !matchingCourse ||
          !matchingSubject
        ) {
          return;
        }

        const key =
          `${normalizeGrade(
            grade
          )}::${normalize(subject)}`;

        if (seen.has(key)) {
          return;
        }

        seen.add(key);

        result.push(item);
      });

      return result;
    }, [
      classes,
      selectedCourses,
      selectedSubjects,
    ]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredClasses =
    useMemo(() => {
      const searchValue =
        normalize(search);

      return assignedClasses.filter(
        (item) => {
          const grade =
            clean(item.grade);

          const subject =
            clean(item.subject);

          const level =
            clean(
              item.schoolLevel ||
                getSchoolLevel(
                  grade
                )
            );

          const matchesSearch =
            !searchValue ||
            normalize(
              grade
            ).includes(
              searchValue
            ) ||
            normalize(
              subject
            ).includes(
              searchValue
            ) ||
            normalize(
              level
            ).includes(
              searchValue
            );

          const matchesLevel =
            levelFilter ===
              "all" ||
            normalize(level) ===
              normalize(
                levelFilter
              );

          const matchesStatus =
            statusFilter ===
              "all" ||
            (
              statusFilter ===
                "active"
                ? Boolean(
                    item.active
                  )
                : !Boolean(
                    item.active
                  )
            );

          return (
            matchesSearch &&
            matchesLevel &&
            matchesStatus
          );
        }
      );
    }, [
      assignedClasses,
      search,
      levelFilter,
      statusFilter,
    ]);

  /* =======================================================
     STATS
     
     Total Courses is ALWAYS the number of courses selected
     during tutor registration.
  ======================================================= */

  const stats =
    useMemo(() => {
      const backend =
        data?.stats || {};

      return {
        totalCourses:
          selectedCourses.length,

        totalStudents:
          Number(
            backend.totalStudents
          ) || 0,

        totalSubjects:
          selectedSubjects.length,

        activeClasses:
          Number(
            backend.activeClasses
          ) || 0,

        totalAssignments:
          assignedClasses.length,
      };
    }, [
      data,
      selectedCourses,
      selectedSubjects,
      assignedClasses,
    ]);

  /* =======================================================
     LEVEL SUMMARY
     
     Counts only registered courses.
  ======================================================= */

  const levelSummary =
    useMemo(() => {
      const result = {
        Primary: 0,
        "Junior Secondary": 0,
        "Senior Secondary": 0,
        Other: 0,
      };

      selectedCourses.forEach(
        (course) => {
          const level =
            getSchoolLevel(
              course
            );

          if (
            Object.prototype.hasOwnProperty.call(
              result,
              level
            )
          ) {
            result[level] += 1;
          } else {
            result.Other += 1;
          }
        }
      );

      return result;
    }, [
      selectedCourses,
    ]);

  /* =======================================================
     OPEN CLASS
  ======================================================= */

  const handleOpenClass =
    useCallback(
      (item) => {
        navigate(
          `/academy/tutor/classes/${encodeURIComponent(
            item.grade
          )}/${encodeURIComponent(
            item.subject
          )}`,
          {
            state: {
              classData: item,

              tutor:
                data?.tutor ||
                storedTutor,

              /* Pass registration information forward */
              registeredCourses:
                selectedCourses,

              registeredSubjects:
                selectedSubjects,
            },
          }
        );
      },
      [
        navigate,
        data,
        storedTutor,
        selectedCourses,
        selectedSubjects,
      ]
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050914] text-white">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div
              className="
                mx-auto flex h-16 w-16
                items-center justify-center
                rounded-2xl
                border border-cyan-400/10
                bg-cyan-400/5
              "
            >
              <Loader2
                className="
                  h-7 w-7
                  animate-spin
                  text-cyan-300
                "
              />
            </div>

            <h2 className="mt-5 text-lg font-bold">
              Loading your classes
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Loading your real registration
              and student enrollment data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="
            absolute -left-40 -top-40
            h-96 w-96
            rounded-full
            bg-cyan-500/5
            blur-3xl
          "
        />

        <div
          className="
            absolute -right-40 top-1/3
            h-96 w-96
            rounded-full
            bg-violet-500/5
            blur-3xl
          "
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize:
              "24px 24px",
          }}
        />
      </div>

      <main
        className="
          relative mx-auto
          max-w-7xl
          px-4 py-6
          sm:px-6
          lg:px-8
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            mb-8 flex
            flex-col gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-xl
                  border border-cyan-400/10
                  bg-cyan-400/10
                "
              >
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>

              <span
                className="
                  text-xs font-bold
                  uppercase tracking-[0.2em]
                  text-cyan-300/70
                "
              >
                Tutor Academy
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              My Classes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
              Your classes, subjects and
              students are connected
              directly to your tutor
              registration and student
              enrollment records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="
                hidden items-center gap-2
                rounded-full
                border border-emerald-400/10
                bg-emerald-400/5
                px-3 py-2
                text-xs
                text-emerald-300/70
                sm:flex
              "
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

              Live data
            </div>

            <button
              type="button"
              onClick={() =>
                fetchClasses(true)
              }
              disabled={refreshing}
              className="
                inline-flex items-center
                justify-center gap-2
                rounded-xl
                border border-white/10
                bg-white/[0.04]
                px-4 py-2.5
                text-sm font-medium
                text-white/70
                transition
                hover:bg-white/[0.07]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </motion.div>

        {/* ===================================================
            ERROR
        =================================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="
                mb-6 rounded-2xl
                border border-red-400/15
                bg-red-400/5
                p-4
              "
            >
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

                <div className="flex-1">
                  <p className="font-bold text-red-200">
                    Unable to load classes
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-200/60">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fetchClasses(false)
                  }
                  className="
                    rounded-lg
                    border border-red-300/10
                    bg-red-300/5
                    px-3 py-1.5
                    text-xs font-bold
                    text-red-200
                    hover:bg-red-300/10
                  "
                >
                  Retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            STATS
        =================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            index={0}
            icon={Layers3}
            label="Total Courses"
            value={
              stats.totalCourses
            }
            description="Teaching levels selected during registration"
          />

          <StatCard
            index={1}
            icon={Users}
            label="Total Students"
            value={
              stats.totalStudents
            }
            description="Students who applied to your registered classes"
          />

          <StatCard
            index={2}
            icon={BookOpen}
            label="Subjects"
            value={
              stats.totalSubjects
            }
            description="Subjects selected during registration"
          />

          <StatCard
            index={3}
            icon={Activity}
            label="Active Classes"
            value={
              stats.activeClasses
            }
            description="Registered classes currently with verified students"
          />
        </div>

        {/* ===================================================
            REGISTRATION
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="
            mt-6 rounded-2xl
            border border-white/10
            bg-white/[0.025]
            p-5
            backdrop-blur-xl
          "
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />

                <p className="text-sm font-bold text-white">
                  Your Registration
                </p>
              </div>

              <p className="mt-1 text-xs text-white/35">
                These values come directly
                from your tutor
                application.
              </p>
            </div>

            {/* REGISTERED SUBJECTS ONLY */}

            <div className="flex flex-wrap gap-2">
              {selectedSubjects.length >
              0 ? (
                selectedSubjects.map(
                  (subject) => (
                    <span
                      key={subject}
                      className="
                        rounded-full
                        border border-violet-400/10
                        bg-violet-400/5
                        px-3 py-1.5
                        text-xs
                        text-violet-200/80
                      "
                    >
                      {subject}
                    </span>
                  )
                )
              ) : (
                <span className="text-xs text-white/30">
                  No subjects selected
                </span>
              )}
            </div>
          </div>

          {/* REGISTERED COURSES ONLY */}

          <div className="mt-5">
            <p className="mb-3 text-xs uppercase tracking-[0.15em] text-white/30">
              Registered Courses / Classes
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedCourses.length >
              0 ? (
                selectedCourses.map(
                  (course) => (
                    <span
                      key={course}
                      className="
                        rounded-xl
                        border border-cyan-400/10
                        bg-cyan-400/5
                        px-3 py-2
                        text-sm
                        font-medium
                        text-cyan-200/80
                      "
                    >
                      {course}
                    </span>
                  )
                )
              ) : (
                <span className="text-sm text-white/30">
                  No teaching levels selected
                </span>
              )}
            </div>
          </div>

          {/* LEVEL SUMMARY */}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              [
                "Primary",
                levelSummary.Primary,
              ],
              [
                "Junior Secondary",
                levelSummary[
                  "Junior Secondary"
                ],
              ],
              [
                "Senior Secondary",
                levelSummary[
                  "Senior Secondary"
                ],
              ],
            ].map(
              ([label, value]) => (
                <div
                  key={label}
                  className="
                    rounded-xl
                    border border-white/8
                    bg-black/20
                    px-4 py-3
                  "
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">
                      {label}
                    </span>

                    <span className="text-sm font-black text-white">
                      {value}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* ===================================================
            ASSIGNED COURSES
        =================================================== */}

        <div className="mt-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300/60">
                Teaching assignments
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Assigned Courses
              </h2>

              <p className="mt-1 text-sm text-white/35">
                Only courses and subjects
                selected during your
                tutor registration are
                shown here.
              </p>
            </div>

            <div className="text-xs text-white/35">
              {filteredClasses.length} of{" "}
              {assignedClasses.length}{" "}
              registered assignments
            </div>
          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div
            className="
              mt-5 flex flex-col gap-3
              rounded-2xl
              border border-white/10
              bg-white/[0.025]
              p-3
              md:flex-row
            "
          >
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                className="
                  pointer-events-none
                  absolute left-3 top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-white/25
                "
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search your registered class or subject..."
                className="
                  h-11 w-full
                  rounded-xl
                  border border-white/8
                  bg-black/20
                  pl-10 pr-4
                  text-sm text-white
                  outline-none
                  placeholder:text-white/25
                  focus:border-cyan-400/20
                "
              />
            </div>

            {/* LEVEL */}

            <div className="relative">
              <select
                value={
                  levelFilter
                }
                onChange={(event) =>
                  setLevelFilter(
                    event.target.value
                  )
                }
                className="
                  h-11 min-w-[180px]
                  appearance-none
                  rounded-xl
                  border border-white/8
                  bg-black/20
                  px-4 pr-10
                  text-sm text-white/70
                  outline-none
                  focus:border-cyan-400/20
                "
              >
                <option
                  value="all"
                  className="bg-[#080d19]"
                >
                  All Levels
                </option>

                <option
                  value="Primary"
                  className="bg-[#080d19]"
                >
                  Primary
                </option>

                <option
                  value="Junior Secondary"
                  className="bg-[#080d19]"
                >
                  Junior Secondary
                </option>

                <option
                  value="Senior Secondary"
                  className="bg-[#080d19]"
                >
                  Senior Secondary
                </option>
              </select>

              <ChevronDown
                className="
                  pointer-events-none
                  absolute right-3 top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-white/25
                "
              />
            </div>

            {/* STATUS */}

            <div className="relative">
              <select
                value={
                  statusFilter
                }
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="
                  h-11 min-w-[160px]
                  appearance-none
                  rounded-xl
                  border border-white/8
                  bg-black/20
                  px-4 pr-10
                  text-sm text-white/70
                  outline-none
                  focus:border-cyan-400/20
                "
              >
                <option
                  value="all"
                  className="bg-[#080d19]"
                >
                  All Status
                </option>

                <option
                  value="active"
                  className="bg-[#080d19]"
                >
                  Active
                </option>

                <option
                  value="inactive"
                  className="bg-[#080d19]"
                >
                  Awaiting Students
                </option>
              </select>

              <ChevronDown
                className="
                  pointer-events-none
                  absolute right-3 top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-white/25
                "
              />
            </div>
          </div>

          {/* =================================================
              CARDS
          ================================================= */}

          <div className="mt-5">
            {filteredClasses.length ===
            0 ? (
              <EmptyState
                search={search}
                filter={
                  levelFilter
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredClasses.map(
                  (
                    item,
                    index
                  ) => (
                    <ClassCard
                      key={
                        item.id ||
                        `${item.grade}-${item.subject}`
                      }
                      item={item}
                      index={index}
                      onOpen={
                        handleOpenClass
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            REGISTRATION DEBUG / SUMMARY
        =================================================== */}

        <div
          className="
            mt-8 rounded-2xl
            border border-cyan-400/10
            bg-cyan-400/[0.025]
            p-5
          "
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />

            <h3 className="text-sm font-bold text-white">
              Assignment Source
            </h3>
          </div>

          <p className="mt-2 text-xs leading-5 text-white/35">
            Assigned Courses are restricted
            to the teaching levels and
            subjects stored in your tutor
            registration. Student records
            only provide the enrollment
            and activity information for
            those registered assignments.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div
              className="
                rounded-xl
                border border-white/8
                bg-black/20
                p-4
              "
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                Registered Courses
              </p>

              <p className="mt-2 text-xl font-black text-cyan-300">
                {selectedCourses.length}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedCourses.map(
                  (course) => (
                    <span
                      key={course}
                      className="
                        rounded-lg
                        border border-cyan-400/10
                        bg-cyan-400/5
                        px-2 py-1
                        text-[11px]
                        text-cyan-200/70
                      "
                    >
                      {course}
                    </span>
                  )
                )}
              </div>
            </div>

            <div
              className="
                rounded-xl
                border border-white/8
                bg-black/20
                p-4
              "
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                Registered Subjects
              </p>

              <p className="mt-2 text-xl font-black text-violet-300">
                {selectedSubjects.length}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedSubjects.map(
                  (subject) => (
                    <span
                      key={subject}
                      className="
                        rounded-lg
                        border border-violet-400/10
                        bg-violet-400/5
                        px-2 py-1
                        text-[11px]
                        text-violet-200/70
                      "
                    >
                      {subject}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            FOOTER INFO
        =================================================== */}

        <div
          className="
            mt-8 flex flex-col gap-2
            border-t border-white/5
            pt-5
            text-xs text-white/25
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span>
            Tutor Reference:{" "}
            <span className="font-bold text-white/40">
              {reference ||
                "Not available"}
            </span>
          </span>

          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />

            Live database updates every
            10 seconds
          </span>
        </div>
      </main>
    </div>
  );
}