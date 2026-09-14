import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  Users,
  Video,
  X,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =========================================================
   TUTOR REFERENCE
========================================================= */

function getTutorReference() {
  const keys = [
    "tutorReference",
    "tutor",
    "academyTutor",
    "scholiqen_user",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);

        const reference =
          parsed?.tutorReference ||
          parsed?.tutor_reference ||
          parsed?.reference ||
          parsed?.applicationReference ||
          parsed?.application_reference ||
          parsed?.tutor?.reference ||
          parsed?.tutor?.tutorReference ||
          parsed?.user?.reference;

        if (reference) {
          return String(reference);
        }
      } catch {
        if (raw.trim()) {
          return raw.trim();
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return "";
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds) {
  const total = Math.max(0, Number(seconds) || 0);

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}

function normalizeStatus(status) {
  return String(status || "unknown")
    .trim()
    .toLowerCase();
}

function getClassDate(item) {
  return (
    item?.scheduledAt ||
    item?.scheduled_at ||
    item?.startedAt ||
    item?.started_at ||
    item?.actualStart ||
    item?.actual_start ||
    item?.createdAt ||
    item?.created_at ||
    null
  );
}

/* =========================================================
   API FETCH
========================================================= */

async function apiFetch(url, options = {}) {
  const tutorReference = getTutorReference();

  const fullUrl = `${API_BASE_URL}${url}`;

  console.log("=================================");
  console.log("ATTENDANCE API REQUEST");
  console.log("URL:", fullUrl);
  console.log("Tutor Reference:", tutorReference);
  console.log("=================================");

  let response;

  try {
    response = await fetch(fullUrl, {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",

        ...(tutorReference
          ? {
              "x-tutor-reference": tutorReference,
            }
          : {}),

        ...(options.headers || {}),
      },
    });
  } catch (networkError) {
    console.error(
      "ATTENDANCE NETWORK ERROR:",
      networkError
    );

    throw new Error(
      "Cannot connect to the Academy server. Make sure your backend server is running on http://localhost:5000."
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  console.log("ATTENDANCE RESPONSE:", {
    status: response.status,
    data,
  });

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass = "text-indigo-400",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="truncate text-sm font-medium text-slate-200">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon = Users,
  title,
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <Icon className="h-7 w-7 text-slate-500" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   ATTENDANCE ROW
========================================================= */

function AttendanceRow({ record }) {
  const joinedAt =
    record?.joinedAt ||
    record?.joined_at ||
    null;

  const leftAt =
    record?.leftAt ||
    record?.left_at ||
    null;

  const duration =
    record?.durationSeconds ??
    record?.duration_seconds ??
    record?.totalSeconds ??
    record?.total_seconds ??
    0;

  const status = normalizeStatus(
    record?.attendanceStatus ||
      record?.attendance_status ||
      (record?.isPresent === false
        ? "absent"
        : "present")
  );

  const studentName =
    record?.studentName ||
    record?.student_name ||
    "Unknown student";

  const enrollmentId =
    record?.enrollmentId ||
    record?.enrollment_id ||
    "—";

  const isPresent =
    status === "present" ||
    status === "attended" ||
    status === "active" ||
    record?.isPresent === true;

  return (
    <tr className="border-t border-white/[0.07] transition-colors hover:bg-white/[0.025]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white">
            {studentName
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-white">
              {studentName}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              {enrollmentId}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-slate-300">
        {formatDateTime(joinedAt)}
      </td>

      <td className="px-5 py-4 text-sm text-slate-300">
        {leftAt
          ? formatDateTime(leftAt)
          : "Still connected"}
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300">
          <Clock3 className="h-3.5 w-3.5" />
          {formatDuration(duration)}
        </span>
      </td>

      <td className="px-5 py-4">
        {isPresent ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Present
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/20 bg-slate-400/10 px-3 py-1.5 text-xs font-semibold text-slate-400">
            {status || "Unknown"}
          </span>
        )}
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE ATTENDANCE CARD
========================================================= */

function MobileAttendanceCard({ record }) {
  const joinedAt =
    record?.joinedAt ||
    record?.joined_at ||
    null;

  const leftAt =
    record?.leftAt ||
    record?.left_at ||
    null;

  const duration =
    record?.durationSeconds ??
    record?.duration_seconds ??
    record?.totalSeconds ??
    record?.total_seconds ??
    0;

  const status = normalizeStatus(
    record?.attendanceStatus ||
      record?.attendance_status ||
      (record?.isPresent === false
        ? "absent"
        : "present")
  );

  const studentName =
    record?.studentName ||
    record?.student_name ||
    "Unknown student";

  const enrollmentId =
    record?.enrollmentId ||
    record?.enrollment_id ||
    "—";

  const isPresent =
    status === "present" ||
    status === "attended" ||
    status === "active" ||
    record?.isPresent === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-semibold text-white">
            {studentName
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {studentName}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {enrollmentId}
            </p>
          </div>
        </div>

        {isPresent ? (
          <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
            Present
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-slate-400/20 bg-slate-400/10 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
            {status || "Unknown"}
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <InfoItem
          icon={Clock3}
          label="Joined"
          value={formatDateTime(joinedAt)}
        />

        <InfoItem
          icon={Clock3}
          label="Duration"
          value={formatDuration(duration)}
        />

        <InfoItem
          icon={LogOutIcon}
          label="Left"
          value={
            leftAt
              ? formatDateTime(leftAt)
              : "Still connected"
          }
        />

        <InfoItem
          icon={CheckCircle2}
          label="Status"
          value={
            isPresent
              ? "Present"
              : status
          }
        />
      </div>
    </motion.div>
  );
}

function LogOutIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line
        x1="21"
        y1="12"
        x2="9"
        y2="12"
      />
    </svg>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TutorAttendance() {
  const [tutorReference, setTutorReference] =
    useState("");

  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedClassId, setSelectedClassId] =
    useState("");

  const [search, setSearch] = useState("");

  const [loadingClasses, setLoadingClasses] =
    useState(true);

  const [loadingAttendance, setLoadingAttendance] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [showClassMenu, setShowClassMenu] =
    useState(false);

  const dropdownRef = useRef(null);

  /* =======================================================
     GET TUTOR REFERENCE
  ======================================================= */

  useEffect(() => {
    const reference = getTutorReference();

    console.log(
      "Tutor Attendance Reference:",
      reference
    );

    setTutorReference(reference);
  }, []);

  /* =======================================================
     CLOSE DROPDOWN
  ======================================================= */

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setShowClassMenu(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowClassMenu(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =======================================================
     LOAD LIVE CLASSES
  ======================================================= */

  const loadClasses = useCallback(
    async (isRefresh = false) => {
      if (!tutorReference) {
        setLoadingClasses(false);

        setError(
          "Tutor reference was not found. Please log in again."
        );

        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoadingClasses(true);
        }

        setError("");

        const data = await apiFetch(
          "/api/academy/tutor/attendance/classes"
        );

        console.log(
          "LIVE CLASSES ATTENDANCE DATA:",
          data
        );

        const list =
          data?.classes ||
          data?.liveClasses ||
          data?.live_classes ||
          data?.data ||
          data?.results ||
          [];

        const normalized =
          Array.isArray(list)
            ? list
            : [];

        setClasses(normalized);

        setSelectedClassId(
          (current) => {
            if (
              current &&
              normalized.some(
                (item) =>
                  String(
                    item?.id ??
                      item?.liveClassId ??
                      item?.live_class_id
                  ) ===
                  String(current)
              )
            ) {
              return current;
            }

            const first =
              normalized[0];

            return first
              ? String(
                  first?.id ??
                    first?.liveClassId ??
                    first?.live_class_id ??
                    ""
                )
              : "";
          }
        );
      } catch (err) {
        console.error(
          "Failed to load attendance classes:",
          err
        );

        setError(
          err?.message ||
            "Unable to load your live classes."
        );
      } finally {
        setLoadingClasses(false);
        setRefreshing(false);
      }
    },
    [tutorReference]
  );

  /* =======================================================
     LOAD ATTENDANCE
  ======================================================= */

  const loadAttendance =
    useCallback(async () => {
      if (!tutorReference) {
        setAttendance([]);
        return;
      }

      if (!selectedClassId) {
        setAttendance([]);
        return;
      }

      try {
        setLoadingAttendance(true);
        setError("");

        const params =
          new URLSearchParams();

        params.set(
          "liveClassId",
          selectedClassId
        );

        const endpoint =
          `/api/academy/tutor/attendance?${params.toString()}`;

        console.log(
          "LOADING ATTENDANCE:",
          endpoint
        );

        const data =
          await apiFetch(endpoint);

        console.log(
          "ATTENDANCE DATA:",
          data
        );

        const list =
          data?.attendance ||
          data?.records ||
          data?.data ||
          data?.results ||
          [];

        setAttendance(
          Array.isArray(list)
            ? list
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load attendance:",
          err
        );

        setError(
          err?.message ||
            "Unable to load attendance records."
        );

        setAttendance([]);
      } finally {
        setLoadingAttendance(false);
      }
    }, [
      tutorReference,
      selectedClassId,
    ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (!tutorReference) {
      return;
    }

    loadClasses();
  }, [
    tutorReference,
    loadClasses,
  ]);

  /* =======================================================
     ATTENDANCE LOAD
  ======================================================= */

  useEffect(() => {
    if (!tutorReference) {
      return;
    }

    if (!selectedClassId) {
      setAttendance([]);
      return;
    }

    loadAttendance();
  }, [
    tutorReference,
    selectedClassId,
    loadAttendance,
  ]);

  /* =======================================================
     SELECTED CLASS
  ======================================================= */

  const selectedClass =
    useMemo(() => {
      return (
        classes.find(
          (item) =>
            String(
              item?.id ??
                item?.liveClassId ??
                item?.live_class_id
            ) ===
            String(selectedClassId)
        ) || null
      );
    }, [
      classes,
      selectedClassId,
    ]);

  /* =======================================================
     FILTER ATTENDANCE
  ======================================================= */

  const filteredAttendance =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return attendance;
      }

      return attendance.filter(
        (item) => {
          const studentName =
            String(
              item?.studentName ||
                item?.student_name ||
                ""
            ).toLowerCase();

          const enrollmentId =
            String(
              item?.enrollmentId ||
                item?.enrollment_id ||
                ""
            ).toLowerCase();

          const grade =
            String(
              item?.grade ||
                item?.className ||
                item?.class_name ||
                ""
            ).toLowerCase();

          return (
            studentName.includes(query) ||
            enrollmentId.includes(query) ||
            grade.includes(query)
          );
        }
      );
    }, [
      attendance,
      search,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const studentsAttended =
      filteredAttendance.length;

    const totalSeconds =
      filteredAttendance.reduce(
        (sum, item) => {
          return (
            sum +
            Number(
              item?.durationSeconds ??
                item?.duration_seconds ??
                item?.totalSeconds ??
                item?.total_seconds ??
                0
            )
          );
        },
        0
      );

    const averageSeconds =
      studentsAttended > 0
        ? Math.round(
            totalSeconds /
              studentsAttended
          )
        : 0;

    return {
      studentsAttended,
      totalSeconds,
      averageSeconds,
    };
  }, [
    filteredAttendance,
  ]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    async () => {
      await loadClasses(true);
    };

  /* =======================================================
     SELECT CLASS
  ======================================================= */

  const handleSelectClass = (
    id
  ) => {
    setSelectedClassId(
      String(id)
    );

    setShowClassMenu(false);
    setSearch("");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Tutor Attendance
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Track students who actually joined your online live classes.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              refreshing ||
              loadingClasses ||
              loadingAttendance
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* ERROR */}

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
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

              <div className="min-w-0 flex-1">
                <p className="font-medium text-red-300">
                  Attendance error
                </p>

                <p className="mt-1 text-sm text-red-300/70">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="rounded-lg p-1 text-red-300/70 transition hover:bg-red-400/10 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLASS SELECTOR */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-xl shadow-black/10 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Live class
              </label>

              <div
                ref={dropdownRef}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowClassMenu(
                      (value) =>
                        !value
                    )
                  }
                  disabled={
                    loadingClasses
                  }
                  className="flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#020617] px-4 text-left transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-400/10">
                      <Video className="h-4 w-4 text-indigo-400" />
                    </div>

                    <div className="min-w-0">
                      {loadingClasses ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading live classes...
                        </div>
                      ) : selectedClass ? (
                        <>
                          <p className="truncate text-sm font-semibold text-white">
                            {selectedClass?.title ||
                              selectedClass?.name ||
                              selectedClass?.className ||
                              selectedClass?.class_name ||
                              "Live class"}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {selectedClass?.subject ||
                              selectedClass?.subjectName ||
                              selectedClass?.subject_name ||
                              "Online class"}
                            {" • "}
                            {formatDate(
                              getClassDate(
                                selectedClass
                              )
                            )}
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-slate-500">
                          Select a live class
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${
                      showClassMenu
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showClassMenu && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -5,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.12,
                      }}
                      className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-[#0b1220] p-1.5 shadow-2xl shadow-black/40"
                    >
                      {classes.length ===
                      0 ? (
                        <div className="px-4 py-8 text-center">
                          <Video className="mx-auto h-6 w-6 text-slate-600" />

                          <p className="mt-3 text-sm font-medium text-slate-400">
                            No live classes found
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Attendance appears here after you have online live classes.
                          </p>
                        </div>
                      ) : (
                        classes.map(
                          (item) => {
                            const id =
                              item?.id ??
                              item?.liveClassId ??
                              item?.live_class_id;

                            const active =
                              String(id) ===
                              String(
                                selectedClassId
                              );

                            return (
                              <button
                                key={String(
                                  id
                                )}
                                type="button"
                                onClick={() =>
                                  handleSelectClass(
                                    id
                                  )
                                }
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
                                  active
                                    ? "bg-indigo-400/10"
                                    : "hover:bg-white/[0.05]"
                                }`}
                              >
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                    active
                                      ? "bg-indigo-400/15"
                                      : "bg-white/[0.05]"
                                  }`}
                                >
                                  <Video
                                    className={`h-4 w-4 ${
                                      active
                                        ? "text-indigo-400"
                                        : "text-slate-500"
                                    }`}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`truncate text-sm font-semibold ${
                                      active
                                        ? "text-indigo-300"
                                        : "text-slate-200"
                                    }`}
                                  >
                                    {item?.title ||
                                      item?.name ||
                                      item?.className ||
                                      item?.class_name ||
                                      "Live class"}
                                  </p>

                                  <p className="mt-0.5 truncate text-xs text-slate-500">
                                    {item?.subject ||
                                      item?.subjectName ||
                                      item?.subject_name ||
                                      "Online class"}
                                    {" • "}
                                    {formatDate(
                                      getClassDate(
                                        item
                                      )
                                    )}
                                  </p>
                                </div>

                                {active && (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
                                )}
                              </button>
                            );
                          }
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* SEARCH */}

            <div className="w-full lg:max-w-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search student
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by name or enrollment ID..."
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#020617] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-white/[0.05] hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SELECTED CLASS INFO */}

        {selectedClass && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                icon={Video}
                label="Class"
                value={
                  selectedClass?.className ||
                  selectedClass?.class_name ||
                  selectedClass?.grade ||
                  "—"
                }
              />

              <InfoItem
                icon={Users}
                label="Subject"
                value={
                  selectedClass?.subject ||
                  selectedClass?.subjectName ||
                  selectedClass?.subject_name ||
                  "—"
                }
              />

              <InfoItem
                icon={CalendarDays}
                label="Date"
                value={formatDate(
                  getClassDate(
                    selectedClass
                  )
                )}
              />

              <InfoItem
                icon={Clock3}
                label="Time"
                value={formatTime(
                  getClassDate(
                    selectedClass
                  )
                )}
              />
            </div>
          </div>
        )}

        {/* STATS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Students attended"
            value={
              stats.studentsAttended
            }
            description="Students who actually joined"
            iconClass="text-indigo-400"
          />

          <StatCard
            icon={Clock3}
            label="Total class time"
            value={formatDuration(
              stats.totalSeconds
            )}
            description="Combined attendance duration"
            iconClass="text-cyan-400"
          />

          <StatCard
            icon={Clock3}
            label="Average attendance"
            value={formatDuration(
              stats.averageSeconds
            )}
            description="Average time per student"
            iconClass="text-emerald-400"
          />

          <StatCard
            icon={Calendar}
            label="Class date"
            value={
              selectedClass
                ? formatDate(
                    getClassDate(
                      selectedClass
                    )
                  )
                : "—"
            }
            description={
              selectedClass
                ? formatTime(
                    getClassDate(
                      selectedClass
                    )
                  )
                : "Select a live class"
            }
            iconClass="text-amber-400"
          />
        </div>

        {/* ATTENDANCE */}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Attendance records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Only students who joined this online live class are shown.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              Live participation data
            </div>
          </div>

          {/* LOADING */}

          {loadingAttendance ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />

              <p className="mt-4 text-sm font-medium text-slate-400">
                Loading attendance...
              </p>
            </div>
          ) : !selectedClassId ? (
            <EmptyState
              icon={Video}
              title="Select a live class"
              description="Choose one of your online live classes above to view the students who joined."
            />
          ) : filteredAttendance.length ===
            0 ? (
            <EmptyState
              icon={Users}
              title={
                search
                  ? "No students found"
                  : "No attendance yet"
              }
              description={
                search
                  ? "No attendance record matches your search."
                  : "Students will appear here automatically when they join the online live class."
              }
            />
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="bg-white/[0.025] text-left">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Joined
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Left
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Duration
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAttendance.map(
                      (
                        record,
                        index
                      ) => (
                        <AttendanceRow
                          key={
                            record?.id ??
                            record?.enrollmentId ??
                            record?.enrollment_id ??
                            index
                          }
                          record={
                            record
                          }
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}

              <div className="space-y-3 p-4 md:hidden">
                {filteredAttendance.map(
                  (
                    record,
                    index
                  ) => (
                    <MobileAttendanceCard
                      key={
                        record?.id ??
                        record?.enrollmentId ??
                        record?.enrollment_id ??
                        index
                      }
                      record={
                        record
                      }
                    />
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* FOOTER INFO */}

        <div className="mt-6 rounded-2xl border border-indigo-400/10 bg-indigo-400/[0.04] p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-400/10">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">
                Automatic online attendance
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Attendance is based on actual participation in your online
                live classroom. Students assigned to the class but who never
                join the live session will not appear in these records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}