import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Layers3,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
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
      const parsed =
        JSON.parse(value);

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

function subjectMatches(
  first,
  second
) {
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

function gradeMatches(
  first,
  second
) {
  return (
    normalizeGrade(first) ===
    normalizeGrade(second)
  );
}

/* =========================================================
   SCHOOL LEVEL
========================================================= */

function getSchoolLevel(
  grade
) {
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

function findTutorInStorage(
  storage
) {
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
   ACCENT PALETTES
========================================================= */

const CARD_ACCENTS = [
  {
    border:
      "border-cyan-400/15",
    glow:
      "bg-cyan-400/10",
    icon:
      "border-cyan-400/15 bg-cyan-400/10",
    iconText:
      "text-cyan-300",
    label:
      "text-cyan-300/70",
    badge:
      "border-cyan-400/15 bg-cyan-400/5 text-cyan-200",
    line:
      "bg-cyan-400",
  },

  {
    border:
      "border-violet-400/15",
    glow:
      "bg-violet-400/10",
    icon:
      "border-violet-400/15 bg-violet-400/10",
    iconText:
      "text-violet-300",
    label:
      "text-violet-300/70",
    badge:
      "border-violet-400/15 bg-violet-400/5 text-violet-200",
    line:
      "bg-violet-400",
  },

  {
    border:
      "border-blue-400/15",
    glow:
      "bg-blue-400/10",
    icon:
      "border-blue-400/15 bg-blue-400/10",
    iconText:
      "text-blue-300",
    label:
      "text-blue-300/70",
    badge:
      "border-blue-400/15 bg-blue-400/5 text-blue-200",
    line:
      "bg-blue-400",
  },

  {
    border:
      "border-emerald-400/15",
    glow:
      "bg-emerald-400/10",
    icon:
      "border-emerald-400/15 bg-emerald-400/10",
    iconText:
      "text-emerald-300",
    label:
      "text-emerald-300/70",
    badge:
      "border-emerald-400/15 bg-emerald-400/5 text-emerald-200",
    line:
      "bg-emerald-400",
  },

  {
    border:
      "border-amber-400/15",
    glow:
      "bg-amber-400/10",
    icon:
      "border-amber-400/15 bg-amber-400/10",
    iconText:
      "text-amber-300",
    label:
      "text-amber-300/70",
    badge:
      "border-amber-400/15 bg-amber-400/5 text-amber-200",
    line:
      "bg-amber-400",
  },

  {
    border:
      "border-pink-400/15",
    glow:
      "bg-pink-400/10",
    icon:
      "border-pink-400/15 bg-pink-400/10",
    iconText:
      "text-pink-300",
    label:
      "text-pink-300/70",
    badge:
      "border-pink-400/15 bg-pink-400/5 text-pink-200",
    line:
      "bg-pink-400",
  },
];

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
  const accent =
    CARD_ACCENTS[
      index % CARD_ACCENTS.length
    ];

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
        duration: 0.35,
      }}
      whileHover={{
        y: -5,
      }}
      className={`
        group relative overflow-hidden
        rounded-2xl
        border
        ${accent.border}
        bg-white/[0.035]
        backdrop-blur-xl
        transition-shadow
        hover:shadow-2xl
      `}
    >
      {/* TOP ACCENT */}

      <div
        className={`
          absolute left-0 right-0 top-0
          h-[2px]
          ${accent.line}
          opacity-70
        `}
      />

      {/* GLOW */}

      <div
        className={`
          pointer-events-none
          absolute -right-20 -top-20
          h-44 w-44
          rounded-full
          blur-3xl
          ${accent.glow}
          opacity-70
        `}
      />

      <div className="relative p-5">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`
                flex h-12 w-12
                shrink-0 items-center
                justify-center
                rounded-xl
                border
                ${accent.icon}
              `}
            >
              <GraduationCap
                className={`
                  h-6 w-6
                  ${accent.iconText}
                `}
              />
            </div>

            <div className="min-w-0">
              <p
                className={`
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  ${accent.label}
                `}
              >
                {item.schoolLevel}
              </p>

              <h3 className="mt-1 truncate text-lg font-black text-white">
                {item.grade}
              </h3>
            </div>
          </div>

          {/* VISUAL INDICATOR ONLY */}

          <div
            className={`
              h-2.5 w-2.5
              shrink-0
              rounded-full
              ${accent.line}
              shadow-lg
            `}
          />
        </div>

        {/* CLASS */}

        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
            Teaching Class
          </p>

          <p className="mt-2 text-base font-bold text-white">
            {item.grade}
          </p>
        </div>

        {/* SUBJECT */}

        <div
          className="
            mt-4 rounded-xl
            border border-white/8
            bg-black/20
            p-4
          "
        >
          <div className="flex items-center gap-2">
            <BookOpen
              className={`
                h-4 w-4
                ${accent.iconText}
              `}
            />

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
              Registered Subject
            </span>
          </div>

          <p className="mt-2 text-base font-black text-white">
            {item.subject}
          </p>
        </div>

        {/* REGISTRATION INDICATOR */}

        <div className="mt-4 flex items-center gap-2">
          <div
            className={`
              h-1.5 w-1.5
              rounded-full
              ${accent.line}
            `}
          />

          <span className="text-xs text-white/35">
            Selected during registration
          </span>
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
        No registered classes found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
        {search ||
        filter !== "all"
          ? "Try changing your search or level filter."
          : "The classes and subjects you selected during registration will appear here."}
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
                `Unable to load tutor registration (${response.status}).`
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
                "Unable to load your registration."
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
     REGISTERED COURSES / CLASSES
     
     These are taken directly from tutor registration.
  ======================================================= */

  const selectedCourses =
    useMemo(() => {
      const direct =
        data?.selection?.courses;

      const fallback =
        data?.tutor?.courses;

      return [
        ...new Set(
          arrayFromValue(
            direct ??
              fallback
          )
        ),
      ];
    }, [data]);

  /* =======================================================
     REGISTERED SUBJECTS
     
     These are the EXACT subjects selected during registration.
  ======================================================= */

  const selectedSubjects =
    useMemo(() => {
      const direct =
        data?.selection?.subjects;

      const fallback =
        data?.tutor?.subjects;

      return [
        ...new Set(
          arrayFromValue(
            direct ??
              fallback
          )
        ),
      ];
    }, [data]);

  /* =======================================================
     CREATE REGISTERED CLASS + SUBJECT CARDS
     
     IMPORTANT:
     
     We do NOT depend on backend student records to decide
     what the tutor teaches.

     Every registered class is paired with every registered
     subject.

     Example:

       Courses:
       - Primary 5
       - JSS 2

       Subjects:
       - Mathematics
       - English Language

     Result:

       Primary 5 — Mathematics
       Primary 5 — English Language
       JSS 2 — Mathematics
       JSS 2 — English Language
  ======================================================= */

  const registeredAssignments =
    useMemo(() => {
      if (
        !selectedCourses.length ||
        !selectedSubjects.length
      ) {
        return [];
      }

      const result = [];
      const seen = new Set();

      selectedCourses.forEach(
        (course) => {
          selectedSubjects.forEach(
            (subject) => {
              const grade =
                clean(course);

              const subjectName =
                clean(subject);

              if (
                !grade ||
                !subjectName
              ) {
                return;
              }

              const key =
                `${normalizeGrade(
                  grade
                )}::${normalize(
                  subjectName
                )}`;

              if (seen.has(key)) {
                return;
              }

              seen.add(key);

              result.push({
                id: key,

                grade,

                subject:
                  subjectName,

                schoolLevel:
                  getSchoolLevel(
                    grade
                  ),

                /*
                 * This is intentionally only an
                 * assignment marker.
                 *
                 * It is NOT student status,
                 * verification status,
                 * payment status,
                 * or class activity status.
                 */
                registered: true,
              });
            }
          );
        }
      );

      return result;
    }, [
      selectedCourses,
      selectedSubjects,
    ]);

  /* =======================================================
     OPTIONAL BACKEND DATA
     
     We only use backend class data for extra metadata when
     it matches a registered class + subject.

     Backend data NEVER creates an assignment outside
     registration.
  ======================================================= */

  const backendClasses =
    useMemo(() => {
      return Array.isArray(
        data?.classes
      )
        ? data.classes
        : [];
    }, [data]);

  const enrichedAssignments =
    useMemo(() => {
      return registeredAssignments.map(
        (registered) => {
          const backendMatch =
            backendClasses.find(
              (item) =>
                gradeMatches(
                  item?.grade,
                  registered.grade
                ) &&
                subjectMatches(
                  item?.subject,
                  registered.subject
                )
            );

          return {
            ...registered,

            /*
             * Keep the registered values as the
             * source of truth.
             */
            grade:
              registered.grade,

            subject:
              registered.subject,

            schoolLevel:
              registered.schoolLevel,

            /*
             * Only carry harmless metadata.
             * No student/status fields are used.
             */
            backendId:
              backendMatch?.id ||
              null,
          };
        }
      );
    }, [
      registeredAssignments,
      backendClasses,
    ]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredClasses =
    useMemo(() => {
      const searchValue =
        normalize(search);

      return enrichedAssignments.filter(
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

          return (
            matchesSearch &&
            matchesLevel
          );
        }
      );
    }, [
      enrichedAssignments,
      search,
      levelFilter,
    ]);

  /* =======================================================
     STATS
     
     Only registration information.
     
     NO:
     - Applied
     - Verified
     - Pending
     - Active
     - Student count
  ======================================================= */

  const stats =
    useMemo(() => {
      return {
        totalCourses:
          selectedCourses.length,

        totalSubjects:
          selectedSubjects.length,

        totalAssignments:
          enrichedAssignments.length,

        primary:
          selectedCourses.filter(
            (course) =>
              getSchoolLevel(
                course
              ) === "Primary"
          ).length,

        juniorSecondary:
          selectedCourses.filter(
            (course) =>
              getSchoolLevel(
                course
              ) ===
              "Junior Secondary"
          ).length,

        seniorSecondary:
          selectedCourses.filter(
            (course) =>
              getSchoolLevel(
                course
              ) ===
              "Senior Secondary"
          ).length,
      };
    }, [
      selectedCourses,
      selectedSubjects,
      enrichedAssignments,
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

              registeredCourses:
                selectedCourses,

              registeredSubjects:
                selectedSubjects,

              /*
               * Explicitly pass the selected
               * registration combination.
               */
              selectedClass:
                item.grade,

              selectedSubject:
                item.subject,
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
              Loading your registration
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Loading your registered
              classes and subjects...
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
              Your teaching classes and
              subjects are displayed
              directly from the choices
              you made during registration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="
                hidden items-center gap-2
                rounded-full
                border border-cyan-400/10
                bg-cyan-400/5
                px-3 py-2
                text-xs
                text-cyan-300/70
                sm:flex
              "
            >
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />

              Registration synced
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
                    Unable to load registration
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
            REGISTRATION STATS
        =================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            index={0}
            icon={Layers3}
            label="Teaching Classes"
            value={
              stats.totalCourses
            }
            description="Classes selected during registration"
          />

          <StatCard
            index={1}
            icon={BookOpen}
            label="Registered Subjects"
            value={
              stats.totalSubjects
            }
            description="Subjects selected during registration"
          />

          <StatCard
            index={2}
            icon={GraduationCap}
            label="Class Subjects"
            value={
              stats.totalAssignments
            }
            description="Registered class and subject combinations"
          />

          <StatCard
            index={3}
            icon={ShieldCheck}
            label="Registration"
            value="Synced"
            description="Showing your actual selections"
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
                These are the exact
                teaching classes and
                subjects you selected
                during registration.
              </p>
            </div>

            {/* SUBJECTS */}

            <div className="flex flex-wrap gap-2">
              {selectedSubjects.length >
              0 ? (
                selectedSubjects.map(
                  (
                    subject,
                    index
                  ) => {
                    const accent =
                      CARD_ACCENTS[
                        index %
                          CARD_ACCENTS.length
                      ];

                    return (
                      <span
                        key={subject}
                        className={`
                          rounded-full
                          border
                          ${accent.border}
                          bg-white/[0.025]
                          px-3 py-1.5
                          text-xs
                          ${accent.label}
                        `}
                      >
                        {subject}
                      </span>
                    );
                  }
                )
              ) : (
                <span className="text-xs text-white/30">
                  No subjects selected
                </span>
              )}
            </div>
          </div>

          {/* COURSES */}

          <div className="mt-5">
            <p className="mb-3 text-xs uppercase tracking-[0.15em] text-white/30">
              Registered Classes
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedCourses.length >
              0 ? (
                selectedCourses.map(
                  (
                    course,
                    index
                  ) => {
                    const accent =
                      CARD_ACCENTS[
                        index %
                          CARD_ACCENTS.length
                      ];

                    return (
                      <span
                        key={course}
                        className={`
                          rounded-xl
                          border
                          ${accent.border}
                          bg-white/[0.025]
                          px-3 py-2
                          text-sm
                          font-medium
                          text-white/75
                        `}
                      >
                        {course}
                      </span>
                    );
                  }
                )
              ) : (
                <span className="text-sm text-white/30">
                  No teaching classes selected
                </span>
              )}
            </div>
          </div>

          {/* LEVEL SUMMARY */}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              [
                "Primary",
                stats.primary,
              ],
              [
                "Junior Secondary",
                stats.juniorSecondary,
              ],
              [
                "Senior Secondary",
                stats.seniorSecondary,
              ],
            ].map(
              ([label, value], index) => {
                const accent =
                  CARD_ACCENTS[
                    index %
                      CARD_ACCENTS.length
                  ];

                return (
                  <div
                    key={label}
                    className={`
                      rounded-xl
                      border
                      ${accent.border}
                      bg-black/20
                      px-4 py-3
                    `}
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
                );
              }
            )}
          </div>
        </motion.div>

        {/* ===================================================
            ASSIGNED / REGISTERED CLASSES
        =================================================== */}

        <div className="mt-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300/60">
                Your registration
              </p>

              <h2 className="mt-2 text-2xl font-black">
                My Teaching Classes
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-white/35">
                Every card below represents
                a class and subject selected
                during your tutor registration.
              </p>
            </div>

            <div className="text-xs text-white/35">
              {filteredClasses.length} of{" "}
              {enrichedAssignments.length}{" "}
              registered combinations
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
                  h-11 min-w-[190px]
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
            REGISTRATION SUMMARY
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
            delay: 0.35,
          }}
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
              Registration Source
            </h3>
          </div>

          <p className="mt-2 text-xs leading-5 text-white/35">
            Your teaching classes and
            subjects shown on this page
            come from the selections made
            during tutor registration.
            No student status or enrollment
            status is used to determine
            which classes you teach.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {/* COURSES */}

            <div
              className="
                rounded-xl
                border border-white/8
                bg-black/20
                p-4
              "
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                Registered Classes
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

            {/* SUBJECTS */}

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
        </motion.div>

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
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />

            Registration synced
          </span>
        </div>
      </main>
    </div>
  );
}