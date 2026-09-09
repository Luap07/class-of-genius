// src/pages/tutor/TutorStudents.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
  AlertCircle,
  UserRound,
  Activity,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

/* ============================================================
   CONSTANTS
============================================================ */

const ACADEMY_TOKEN_KEY =
  "scholiqen_academy_token";

const ACADEMY_USER_KEY =
  "scholiqen_academy_user";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

/* ============================================================
   HELPERS
============================================================ */

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
    return value
      .map(clean)
      .filter(Boolean);
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed =
        JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map(clean)
          .filter(Boolean);
      }
    } catch {
      // Not JSON.
    }

    return value
      .split(",")
      .map(clean)
      .filter(Boolean);
  }

  return [];
}

function getFullName(student) {
  const firstName = clean(
    student?.firstName ??
      student?.first_name
  );

  const middleName = clean(
    student?.middleName ??
      student?.middle_name
  );

  const lastName = clean(
    student?.lastName ??
      student?.last_name
  );

  return [
    firstName,
    middleName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Student";
}

function getInitials(name) {
  const parts = clean(name)
    .split(" ")
    .filter(Boolean);

  if (!parts.length) {
    return "S";
  }

  return parts
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0)
    )
    .join("")
    .toUpperCase();
}

function normalizeStatus(value) {
  return normalize(value);
}

function isVerified(student) {
  const statuses = [
    student?.enrollmentStatus,
    student?.enrollment_status,
    student?.status,
    student?.accountStatus,
    student?.account_status,
  ];

  return statuses.some(
    (status) =>
      normalizeStatus(status) ===
      "verified"
  );
}

function isPending(student) {
  const statuses = [
    student?.enrollmentStatus,
    student?.enrollment_status,
    student?.status,
    student?.accountStatus,
    student?.account_status,
  ];

  return statuses.some(
    (status) =>
      normalizeStatus(status) ===
      "pending"
  );
}

function getStudentSubjects(student) {
  return arrayFromValue(
    student?.subjects ??
      student?.subject
  );
}

function getEnrollmentId(student) {
  return clean(
    student?.enrollmentId ??
      student?.enrollment_id ??
      student?.id
  );
}

function getEmail(student) {
  return clean(
    student?.email
  );
}

function getPhone(student) {
  return clean(
    student?.studentPhone ??
      student?.student_phone ??
      student?.phone
  );
}

function getGrade(student) {
  return clean(
    student?.grade ??
      student?.className ??
      student?.class_name
  );
}

function getSubject(student) {
  return clean(
    student?.matchedSubject ??
      student?.matched_subject ??
      student?.subject
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function TutorStudents() {
  /* ==========================================================
     STATE
  ========================================================== */

  const [tutor, setTutor] =
    useState(null);

  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [classFilter, setClassFilter] =
    useState("all");

  const [subjectFilter, setSubjectFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [showFilters, setShowFilters] =
    useState(false);

  /* ==========================================================
     LOAD SAVED TUTOR
  ========================================================== */

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem(
          ACADEMY_USER_KEY
        );

      if (!savedUser) {
        setError(
          "Tutor session not found. Please sign in again."
        );

        setLoading(false);

        return;
      }

      const parsedUser =
        JSON.parse(savedUser);

      setTutor(parsedUser);
    } catch (sessionError) {
      console.error(
        "Tutor session error:",
        sessionError
      );

      setError(
        "Unable to read tutor session. Please sign in again."
      );

      setLoading(false);
    }
  }, []);

  /* ==========================================================
     TUTOR REFERENCE
  ========================================================== */

  const tutorReference = useMemo(() => {
    return clean(
      tutor?.reference ??
        tutor?.tutorReference ??
        tutor?.tutor_reference ??
        tutor?.ref
    );
  }, [tutor]);

  /* ==========================================================
     FETCH STUDENTS
  ========================================================== */

  const fetchStudents = useCallback(
    async (showRefresh = false) => {
      if (!tutorReference) {
        setError(
          "Tutor reference is missing from your Academy session."
        );

        setLoading(false);

        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const token =
          localStorage.getItem(
            ACADEMY_TOKEN_KEY
          );

        const headers = {
          Accept:
            "application/json",
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const requestUrl =
         `${API_BASE_URL}/api/academy/tutor/classes?reference=${encodeURIComponent(tutorReference)}`;

        /* ====================================================
           DEBUG INFORMATION
        ==================================================== */

        console.log(
          "========================================"
        );

        console.log(
          "SCHOLIQEN TUTOR STUDENTS"
        );

        console.log(
          "========================================"
        );

        console.log(
          "API URL:",
          requestUrl
        );

        console.log(
          "Tutor reference:",
          tutorReference
        );

        console.log(
          "Academy token exists:",
          Boolean(token)
        );

        /* ====================================================
           REQUEST
        ==================================================== */

        const response =
          await fetch(
            requestUrl,
            {
              method: "GET",
              headers,
            }
          );

        console.log(
          "HTTP status:",
          response.status
        );

        console.log(
          "HTTP status text:",
          response.statusText
        );

        console.log(
          "Response OK:",
          response.ok
        );

        /* ====================================================
           READ RESPONSE AS TEXT FIRST
        ==================================================== */

        const responseText =
          await response.text();

        console.log(
          "Raw server response:",
          responseText
        );

        /* ====================================================
           PARSE JSON
        ==================================================== */

        let data = null;

        if (responseText) {
          try {
            data =
              JSON.parse(
                responseText
              );
          } catch (parseError) {
            console.error(
              "JSON parsing failed:",
              parseError
            );

            throw new Error(
              `Server returned invalid JSON. HTTP ${response.status}.`
            );
          }
        }

        console.log(
          "Parsed server response:",
          data
        );

        /* ====================================================
           HTTP ERROR
        ==================================================== */

        if (!response.ok) {
          const serverMessage =
            clean(
              data?.message ??
                data?.error ??
                data?.details
            );

          throw new Error(
            serverMessage ||
              `Tutor students request failed with HTTP ${response.status}.`
          );
        }

        /* ====================================================
           SUCCESS CHECK
        ==================================================== */

        if (
          data?.success !== true
        ) {
          throw new Error(
            clean(
              data?.message ??
                data?.error
            ) ||
              "The tutor classes endpoint did not return success: true."
          );
        }

        /* ====================================================
           CLASSES
        ==================================================== */

        const classes =
          Array.isArray(
            data?.classes
          )
            ? data.classes
            : [];

        console.log(
          "Tutor classes:",
          classes
        );

        console.log(
          "Number of tutor classes:",
          classes.length
        );

        /* ====================================================
           COLLECT STUDENTS
        ==================================================== */

        const collected = [];

        classes.forEach(
          (classItem) => {
            const classStudents =
              Array.isArray(
                classItem?.students
              )
                ? classItem.students
                : [];

            console.log(
              "Tutor class:",
              {
                id:
                  classItem?.id,
                grade:
                  classItem?.grade,
                subject:
                  classItem?.subject,
                schoolLevel:
                  classItem?.schoolLevel,
                studentCount:
                  classStudents.length,
              }
            );

            classStudents.forEach(
              (student) => {
                collected.push({
                  ...student,

                  /* ------------------------------------------
                     CLASS
                  ------------------------------------------ */

                  grade:
                    getGrade(
                      student
                    ) ||
                    clean(
                      classItem?.grade
                    ),

                  className:
                    clean(
                      student?.className ??
                        student?.class_name
                    ) ||
                    clean(
                      classItem?.className
                    ) ||
                    clean(
                      classItem?.grade
                    ),

                  /* ------------------------------------------
                     SCHOOL LEVEL
                  ------------------------------------------ */

                  schoolLevel:
                    clean(
                      student?.schoolLevel ??
                        student?.school_level
                    ) ||
                    clean(
                      classItem?.schoolLevel
                    ),

                  /* ------------------------------------------
                     MATCHED SUBJECT
                  ------------------------------------------ */

                  matchedSubject:
                    clean(
                      student?.matchedSubject ??
                        student?.matched_subject
                    ) ||
                    clean(
                      classItem?.subject
                    ),

                  /* ------------------------------------------
                     TUTOR CLASS
                  ------------------------------------------ */

                  tutorClassId:
                    classItem?.id ??
                    null,
                });
              }
            );
          }
        );

        console.log(
          "Collected student records:",
          collected.length
        );

        /* ====================================================
           REMOVE DUPLICATES
        ==================================================== */

        const uniqueStudents = [];

        const seen =
          new Set();

        collected.forEach(
          (student) => {
            const enrollmentId =
              getEnrollmentId(
                student
              );

            const email =
              normalize(
                getEmail(student)
              );

            const grade =
              normalize(
                getGrade(student)
              );

            const subject =
              normalize(
                getSubject(student)
              );

            const identity =
              enrollmentId ||
              email ||
              normalize(
                getFullName(student)
              );

            const uniqueKey = [
              identity,
              grade,
              subject,
            ].join("|");

            if (
              seen.has(
                uniqueKey
              )
            ) {
              return;
            }

            seen.add(
              uniqueKey
            );

            uniqueStudents.push(
              student
            );
          }
        );

        /* ====================================================
           SORT
        ==================================================== */

        uniqueStudents.sort(
          (a, b) =>
            getFullName(
              a
            ).localeCompare(
              getFullName(
                b
              )
            )
        );

        console.log(
          "Final student records:",
          uniqueStudents
        );

        console.log(
          "Final student count:",
          uniqueStudents.length
        );

        /* ====================================================
           UPDATE STATE
        ==================================================== */

        setStudents(
          uniqueStudents
        );
      } catch (fetchError) {
        console.error(
          "========================================"
        );

        console.error(
          "TUTOR STUDENTS ERROR"
        );

        console.error(
          "========================================"
        );

        console.error(
          fetchError
        );

        setError(
          fetchError?.message ||
            "Unable to load students."
        );

        setStudents([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tutorReference]
  );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    if (!tutorReference) {
      return;
    }

    fetchStudents(false);
  }, [
    tutorReference,
    fetchStudents,
  ]);

  /* ==========================================================
     FILTER OPTIONS
  ========================================================== */

  const classOptions = useMemo(() => {
    const values =
      students
        .map(
          (student) =>
            getGrade(student)
        )
        .filter(Boolean);

    return [
      ...new Set(values),
    ].sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }, [students]);

  const subjectOptions =
    useMemo(() => {
      const values = [];

      students.forEach(
        (student) => {
          const subject =
            getSubject(
              student
            );

          if (subject) {
            values.push(
              subject
            );
          }
        }
      );

      return [
        ...new Set(values),
      ].sort(
        (a, b) =>
          a.localeCompare(b)
      );
    }, [students]);

  /* ==========================================================
     FILTERED STUDENTS
  ========================================================== */

  const filteredStudents =
    useMemo(() => {
      const searchValue =
        normalize(search);

      return students.filter(
        (student) => {
          const name =
            normalize(
              getFullName(
                student
              )
            );

          const email =
            normalize(
              getEmail(
                student
              )
            );

          const phone =
            normalize(
              getPhone(
                student
              )
            );

          const grade =
            normalize(
              getGrade(
                student
              )
            );

          const subject =
            normalize(
              getSubject(
                student
              )
            );

          let status = normalize(
            student?.enrollmentStatus ??
              student?.enrollment_status ??
              student?.status ??
              student?.accountStatus ??
              student?.account_status
          );

          if (
            isVerified(
              student
            )
          ) {
            status =
              "verified";
          } else if (
            isPending(
              student
            )
          ) {
            status =
              "pending";
          }

          const matchesSearch =
            !searchValue ||
            name.includes(
              searchValue
            ) ||
            email.includes(
              searchValue
            ) ||
            phone.includes(
              searchValue
            ) ||
            grade.includes(
              searchValue
            ) ||
            subject.includes(
              searchValue
            );

          const matchesClass =
            classFilter ===
              "all" ||
            grade ===
              normalize(
                classFilter
              );

          const matchesSubject =
            subjectFilter ===
              "all" ||
            subject ===
              normalize(
                subjectFilter
              );

          const matchesStatus =
            statusFilter ===
              "all" ||
            status ===
              normalize(
                statusFilter
              );

          return (
            matchesSearch &&
            matchesClass &&
            matchesSubject &&
            matchesStatus
          );
        }
      );
    }, [
      students,
      search,
      classFilter,
      subjectFilter,
      statusFilter,
    ]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const stats = useMemo(() => {
    const uniqueStudents =
      new Set();

    students.forEach(
      (student) => {
        const identity =
          getEnrollmentId(
            student
          ) ||
          getEmail(
            student
          ) ||
          getFullName(
            student
          );

        if (identity) {
          uniqueStudents.add(
            normalize(
              identity
            )
          );
        }
      }
    );

    const verified =
      students.filter(
        isVerified
      ).length;

    const pending =
      students.filter(
        isPending
      ).length;

    const classes =
      new Set(
        students
          .map(
            (student) =>
              normalize(
                getGrade(
                  student
                )
              )
          )
          .filter(Boolean)
      ).size;

    const subjects =
      new Set(
        students
          .map(
            (student) =>
              normalize(
                getSubject(
                  student
                )
              )
          )
          .filter(Boolean)
      ).size;

    return {
      uniqueStudents:
        uniqueStudents.size,

      totalRecords:
        students.length,

      verified,

      pending,

      classes,

      subjects,
    };
  }, [students]);

  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  const resetFilters =
    useCallback(() => {
      setSearch("");
      setClassFilter("all");
      setSubjectFilter("all");
      setStatusFilter("all");
    }, []);

  const hasActiveFilters =
    Boolean(
      search ||
        classFilter !==
          "all" ||
        subjectFilter !==
          "all" ||
        statusFilter !==
          "all"
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10">
                <Users
                  size={18}
                  className="text-cyan-400"
                />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                My Classes
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Students
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              View students registered for
              the classes and subjects you
              teach.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchStudents(true)
            }
            disabled={
              loading ||
              refreshing
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-300">
                    Unable to load students
                  </p>

                  <p className="mt-1 break-words text-xs leading-5 text-red-300/70">
                    {error}
                  </p>

                  <p className="mt-2 text-[10px] text-red-300/50">
                    Check the browser console for
                    the API URL, tutor reference,
                    HTTP status and server response.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="rounded-lg p-1 text-red-400 transition hover:bg-red-400/10 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Students"
            value={
              stats.uniqueStudents
            }
            description="Registered students"
          />

          <StatCard
            icon={ShieldCheck}
            label="Verified"
            value={
              stats.verified
            }
            description="Verified enrollments"
          />

          <StatCard
            icon={Clock3}
            label="Pending"
            value={
              stats.pending
            }
            description="Awaiting verification"
          />

          <StatCard
            icon={BookOpen}
            label="Subjects"
            value={
              stats.subjects
            }
            description="Subjects represented"
          />
        </div>

        {/* ==================================================
            SEARCH / FILTERS
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-3 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search students, email, class or subject..."
                className="w-full rounded-xl border border-white/10 bg-[#080d20] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>

            {/* FILTER */}

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (value) =>
                    !value
                )
              }
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                showFilters ||
                hasActiveFilters
                  ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              Filters

              <ChevronDown
                size={16}
                className={
                  showFilters
                    ? "rotate-180 transition-transform"
                    : "transition-transform"
                }
              />
            </button>
          </div>

          {/* FILTER PANEL */}

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid gap-3 border-t border-white/5 pt-3 sm:grid-cols-3">

                  <FilterSelect
                    label="Class"
                    value={
                      classFilter
                    }
                    onChange={
                      setClassFilter
                    }
                    options={
                      classOptions
                    }
                  />

                  <FilterSelect
                    label="Subject"
                    value={
                      subjectFilter
                    }
                    onChange={
                      setSubjectFilter
                    }
                    options={
                      subjectOptions
                    }
                  />

                  <FilterSelect
                    label="Status"
                    value={
                      statusFilter
                    }
                    onChange={
                      setStatusFilter
                    }
                    options={[
                      "verified",
                      "pending",
                    ]}
                  />
                </div>

                {hasActiveFilters && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={
                        resetFilters
                      }
                      className="text-xs font-semibold text-slate-500 transition hover:text-cyan-300"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==================================================
            RESULT COUNT
        ================================================== */}

        {!loading && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">
              Showing{" "}
              <span className="text-slate-400">
                {
                  filteredStudents.length
                }
              </span>{" "}
              of{" "}
              <span className="text-slate-400">
                {
                  students.length
                }
              </span>{" "}
              student records
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="inline-flex items-center gap-1 text-xs text-cyan-400 transition hover:text-cyan-300"
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>
        )}

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <LoadingState />
        ) : filteredStudents.length ===
          0 ? (
          <EmptyState
            hasFilters={
              hasActiveFilters
            }
            onReset={
              resetFilters
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredStudents.map(
              (
                student,
                index
              ) => (
                <StudentCard
                  key={`${getEnrollmentId(
                    student
                  )}-${normalize(
                    getGrade(
                      student
                    )
                  )}-${normalize(
                    getSubject(
                      student
                    )
                  )}-${index}`}
                  student={
                    student
                  }
                  index={
                    index
                  }
                  onClick={() =>
                    setSelectedStudent(
                      student
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* ====================================================
          STUDENT MODAL
      ==================================================== */}

      <AnimatePresence>
        {selectedStudent && (
          <StudentModal
            student={
              selectedStudent
            }
            onClose={() =>
              setSelectedStudent(
                null
              )
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 shadow-xl shadow-black/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black text-white">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            {description}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10">
          <Icon
            size={17}
            className="text-cyan-400"
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   FILTER SELECT
============================================================ */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full appearance-none rounded-xl border border-white/10 bg-[#080d20] px-3 py-2.5 pr-9 text-xs font-medium text-slate-300 outline-none transition focus:border-cyan-400/30"
        >
          <option value="all">
            All {label}s
          </option>

          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
        />
      </div>
    </label>
  );
}

/* ============================================================
   STUDENT CARD
============================================================ */

function StudentCard({
  student,
  index,
  onClick,
}) {
  const name =
    getFullName(student);

  const initials =
    getInitials(name);

  const grade =
    getGrade(student) ||
    "Class not set";

  const subject =
    getSubject(student) ||
    "Subject not set";

  const email =
    getEmail(student);

  const phone =
    getPhone(student);

  const verified =
    isVerified(student);

  const pending =
    isPending(student);

  return (
    <motion.button
      type="button"
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: Math.min(
          index * 0.035,
          0.25
        ),
      }}
      whileHover={{
        y: -3,
      }}
      onClick={onClick}
      className="group w-full rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left shadow-xl shadow-black/10 transition hover:border-cyan-400/20 hover:bg-white/[0.04]"
    >
      {/* TOP */}

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-sm font-black text-cyan-300 ring-1 ring-cyan-400/10">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-white transition group-hover:text-cyan-300">
                {name}
              </h3>

              <p className="mt-0.5 truncate text-[11px] text-slate-600">
                {getEnrollmentId(
                  student
                ) ||
                  "Student"}
              </p>
            </div>

            <StatusBadge
              verified={
                verified
              }
              pending={
                pending
              }
              status={
                student?.enrollmentStatus ??
                  student?.enrollment_status ??
                  student?.status
              }
            />
          </div>
        </div>
      </div>

      {/* CLASS / SUBJECT */}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/5 bg-black/10 p-3">
          <div className="flex items-center gap-2">
            <GraduationCap
              size={14}
              className="text-cyan-400"
            />

            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
              Class
            </span>
          </div>

          <p className="mt-1.5 truncate text-xs font-bold text-slate-300">
            {grade}
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/10 p-3">
          <div className="flex items-center gap-2">
            <BookOpen
              size={14}
              className="text-violet-400"
            />

            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
              Subject
            </span>
          </div>

          <p className="mt-1.5 truncate text-xs font-bold text-slate-300">
            {subject}
          </p>
        </div>
      </div>

      {/* CONTACT */}

      <div className="mt-3 space-y-1.5">
        {email && (
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-slate-600">
            <Mail
              size={13}
              className="shrink-0"
            />

            <span className="truncate">
              {email}
            </span>
          </div>
        )}

        {phone && (
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-slate-600">
            <Phone
              size={13}
              className="shrink-0"
            />

            <span className="truncate">
              {phone}
            </span>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-700">
          <UserRound
            size={12}
          />
          View student
        </span>

        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-500 opacity-0 transition group-hover:opacity-100">
          View details
          <span>→</span>
        </span>
      </div>
    </motion.button>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  verified,
  pending,
  status,
}) {
  if (verified) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/10 bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300">
        <CheckCircle2
          size={11}
        />
        Verified
      </span>
    );
  }

  if (pending) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/10 bg-amber-400/10 px-2 py-1 text-[9px] font-bold text-amber-300">
        <Clock3
          size={11}
        />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex max-w-[100px] shrink-0 items-center gap-1 truncate rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-bold text-slate-500">
      {clean(status) ||
        "Unknown"}
    </span>
  );
}

/* ============================================================
   LOADING STATE
============================================================ */

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({
        length: 6,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.025] p-4"
          >
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/5" />

              <div className="flex-1">
                <div className="h-3 w-32 rounded bg-white/5" />

                <div className="mt-2 h-2.5 w-20 rounded bg-white/5" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="h-16 rounded-xl bg-white/5" />
              <div className="h-16 rounded-xl bg-white/5" />
            </div>

            <div className="mt-3 h-2.5 w-44 rounded bg-white/5" />

            <div className="mt-2 h-2.5 w-32 rounded bg-white/5" />
          </div>
        )
      )}
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  hasFilters,
  onReset,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10">
        <Users
          size={28}
          className="text-cyan-400"
        />
      </div>

      <h3 className="mt-5 text-lg font-bold text-white">
        {hasFilters
          ? "No students found"
          : "No students yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {hasFilters
          ? "No student matches the current search or filters."
          : "Students who register for your assigned classes and subjects will appear here automatically."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 rounded-xl border border-cyan-400/10 bg-cyan-400/10 px-4 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/15"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/* ============================================================
   STUDENT MODAL
============================================================ */

function StudentModal({
  student,
  onClose,
}) {
  const name =
    getFullName(student);

  const initials =
    getInitials(name);

  const subjects =
    getStudentSubjects(
      student
    );

  const grade =
    getGrade(student) ||
    "Not specified";

  const schoolLevel =
    clean(
      student?.schoolLevel ??
        student?.school_level
    ) ||
    "Not specified";

  const session =
    clean(
      student?.academicSession ??
        student?.academic_session
    ) ||
    "Not specified";

  const email =
    getEmail(student) ||
    "Not provided";

  const phone =
    getPhone(student) ||
    "Not provided";

  const matchedSubject =
    getSubject(
      student
    ) ||
    "Not specified";

  const verified =
    isVerified(student);

  const pending =
    isPending(student);

  return (
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 12,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 12,
        }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#080d20] shadow-2xl shadow-black/50"
      >
        {/* HEADER */}

        <div className="relative border-b border-white/10 p-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4 pr-10">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-lg font-black text-cyan-300 ring-1 ring-cyan-400/10">
              {initials}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-white">
                {name}
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                {getEnrollmentId(
                  student
                ) ||
                  "Student enrollment"}
              </p>

              <div className="mt-2">
                <StatusBadge
                  verified={
                    verified
                  }
                  pending={
                    pending
                  }
                  status={
                    student?.enrollmentStatus ??
                      student?.enrollment_status ??
                      student?.status
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}

        <div className="space-y-5 p-5">

          {/* ACADEMIC */}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <GraduationCap
                size={15}
                className="text-cyan-400"
              />

              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Academic Information
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <DetailBox
                label="Class"
                value={grade}
              />

              <DetailBox
                label="School Level"
                value={
                  schoolLevel
                }
              />

              <DetailBox
                label="Academic Session"
                value={
                  session
                }
              />

              <DetailBox
                label="Matched Subject"
                value={
                  matchedSubject
                }
              />
            </div>
          </div>

          {/* REGISTERED SUBJECTS */}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <BookOpen
                size={15}
                className="text-violet-400"
              />

              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Registered Subjects
              </h3>
            </div>

            {subjects.length >
            0 ? (
              <div className="flex flex-wrap gap-2">
                {subjects.map(
                  (
                    subject
                  ) => (
                    <span
                      key={
                        subject
                      }
                      className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${
                        normalize(
                          subject
                        ) ===
                        normalize(
                          matchedSubject
                        )
                          ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                          : "border-white/10 bg-white/[0.03] text-slate-500"
                      }`}
                    >
                      {
                        subject
                      }
                    </span>
                  )
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                No subjects recorded.
              </p>
            )}
          </div>

          {/* CONTACT */}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Mail
                size={15}
                className="text-emerald-400"
              />

              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Contact
              </h3>
            </div>

            <div className="space-y-2">
              <DetailBox
                label="Email"
                value={email}
              />

              <DetailBox
                label="Phone"
                value={phone}
              />
            </div>
          </div>

          {/* ENROLLMENT */}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck
                size={15}
                className="text-emerald-400"
              />

              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Enrollment
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <DetailBox
                label="Enrollment Status"
                value={
                  clean(
                    student?.enrollmentStatus ??
                      student?.enrollment_status
                  ) ||
                  "Not specified"
                }
              />

              <DetailBox
                label="Payment Status"
                value={
                  clean(
                    student?.paymentStatus ??
                      student?.payment_status
                  ) ||
                  "Not specified"
                }
              />
            </div>
          </div>

          {/* CLASS ACTIVITY */}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Activity
                size={15}
                className="text-cyan-400"
              />

              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Teaching Assignment
              </h3>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/10 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                Tutor Class
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-300">
                {getGrade(
                  student
                )}
              </p>

              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                Subject
              </p>

              <p className="mt-1 text-xs font-semibold text-cyan-300">
                {matchedSubject}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   DETAIL BOX
============================================================ */

function DetailBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/10 p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold text-slate-300">
        {value}
      </p>
    </div>
  );
}
