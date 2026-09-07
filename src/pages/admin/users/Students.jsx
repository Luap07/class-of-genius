import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone,
  BookOpen,
  CalendarDays,
  Eye,
  X,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  GraduationCap,
  UserRound,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

/* =========================================================
   HELPERS
========================================================= */

const clean = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const normalize = (value) => clean(value).toLowerCase();

const getStudentName = (student) => {
  const fullName =
    clean(student?.full_name) ||
    clean(student?.fullName) ||
    clean(student?.name);

  if (fullName) return fullName;

  const firstName =
    clean(student?.first_name) ||
    clean(student?.firstName);

  const middleName =
    clean(student?.middle_name) ||
    clean(student?.middleName);

  const lastName =
    clean(student?.last_name) ||
    clean(student?.lastName);

  const joined = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ");

  return joined || "Unknown Student";
};

const getClassName = (student) => {
  return (
    clean(student?.class_name) ||
    clean(student?.className) ||
    clean(student?.class) ||
    clean(student?.grade) ||
    clean(student?.level) ||
    "Not assigned"
  );
};

/*
  IMPORTANT:
  The database is the source of truth.

  If the backend saves:
      enrollment_status = "verified"

  this function returns "verified".

  We do NOT force the UI to say verified when
  the database says pending.
*/
const getEnrollmentStatus = (student) => {
  return (
    clean(student?.enrollment_status) ||
    clean(student?.enrollmentStatus) ||
    "pending"
  );
};

const getAccountStatus = (student) => {
  return (
    clean(student?.account_status) ||
    clean(student?.accountStatus) ||
    "pending"
  );
};

const getPaymentStatus = (student) => {
  return (
    clean(student?.payment_status) ||
    clean(student?.paymentStatus) ||
    "pending"
  );
};

const getEmail = (student) => {
  return (
    clean(student?.email) ||
    clean(student?.student_email) ||
    clean(student?.studentEmail) ||
    "—"
  );
};

const getPhone = (student) => {
  return (
    clean(student?.phone) ||
    clean(student?.phone_number) ||
    clean(student?.phoneNumber) ||
    clean(student?.student_phone) ||
    "—"
  );
};

const getEnrollmentId = (student) => {
  return (
    clean(student?.enrollment_id) ||
    clean(student?.enrollmentId) ||
    clean(student?.id) ||
    "—"
  );
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return clean(value) || "—";
  }

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return clean(value) || "—";
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name) => {
  const parts = clean(name)
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "ST";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getSubjects = (student) => {
  const raw =
    student?.subjects ||
    student?.selected_subjects ||
    student?.selectedSubjects ||
    student?.subject_list ||
    [];

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item;

        return (
          clean(item?.name) ||
          clean(item?.subject) ||
          clean(item?.title) ||
          ""
        );
      })
      .filter(Boolean);
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) =>
            typeof item === "string"
              ? item
              : clean(item?.name) ||
                clean(item?.subject) ||
                clean(item?.title)
          )
          .filter(Boolean);
      }
    } catch {
      return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

/* =========================================================
   STATUS
========================================================= */

const getStatusMeta = (status) => {
  const value = normalize(status);

  /*
    VERIFIED IS A SUCCESS STATUS.
  */

  if (
    value === "verified" ||
    value === "active" ||
    value === "approved" ||
    value === "accepted"
  ) {
    return {
      label:
        value === "verified"
          ? "Verified"
          : value.charAt(0).toUpperCase() + value.slice(1),
      icon: CheckCircle2,
      className:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      dotClassName: "bg-emerald-400",
    };
  }

  if (
    value === "inactive" ||
    value === "rejected" ||
    value === "declined" ||
    value === "suspended"
  ) {
    return {
      label:
        value.charAt(0).toUpperCase() + value.slice(1),
      icon: XCircle,
      className: "border-red-400/20 bg-red-400/10 text-red-300",
      dotClassName: "bg-red-400",
    };
  }

  return {
    label: "Pending",
    icon: Clock,
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    dotClassName: "bg-amber-400",
  };
};

const StatusBadge = ({
  status,
  small = false,
}) => {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        small
          ? "px-2 py-1 text-[10px]"
          : "px-2.5 py-1.5 text-xs",
        meta.className,
      ].join(" ")}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`}
      />

      <Icon
        size={small ? 11 : 13}
        strokeWidth={2.2}
      />

      {meta.label}
    </span>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  iconClassName,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080d1c]/80 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/5 blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
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

        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl border",
            iconClassName ||
              "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
          ].join(" ")}
        >
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400">
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-medium text-slate-200">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   STUDENT DETAILS MODAL
========================================================= */

const StudentDetailsModal = ({
  student,
  onClose,
}) => {
  if (!student) return null;

  const name = getStudentName(student);
  const email = getEmail(student);
  const phone = getPhone(student);
  const className = getClassName(student);
  const enrollmentStatus = getEnrollmentStatus(student);
  const accountStatus = getAccountStatus(student);
  const paymentStatus = getPaymentStatus(student);
  const subjects = getSubjects(student);

  const registrationDate =
    student?.created_at ||
    student?.createdAt ||
    student?.registration_date ||
    student?.registrationDate;

  const updatedDate =
    student?.updated_at ||
    student?.updatedAt;

  const guardianName =
    clean(student?.guardian_name) ||
    clean(student?.guardianName) ||
    clean(student?.parent_name) ||
    clean(student?.parentName) ||
    "—";

  const guardianPhone =
    clean(student?.guardian_phone) ||
    clean(student?.guardianPhone) ||
    clean(student?.parent_phone) ||
    clean(student?.parentPhone) ||
    "—";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.96,
            y: 20,
          }}
          transition={{
            duration: 0.2,
          }}
          onMouseDown={(event) => event.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070b18] shadow-2xl shadow-black/50"
        >
          {/* Header */}

          <div className="relative border-b border-white/[0.07] px-6 py-5">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.05] via-transparent to-violet-500/[0.05]" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-lg font-bold text-cyan-300">
                  {getInitials(name)}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-white">
                    {name}
                  </h2>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Content */}

          <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-6">
            {/* Statuses */}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Enrollment
                </p>

                <StatusBadge status={enrollmentStatus} />
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Account
                </p>

                <StatusBadge status={accountStatus} />
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Payment
                </p>

                <StatusBadge status={paymentStatus} />
              </div>
            </div>

            {/* Student information */}

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <UserRound
                  size={17}
                  className="text-cyan-300"
                />

                <h3 className="font-semibold text-white">
                  Student Information
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={UserRound}
                  label="Full Name"
                  value={name}
                />

                <InfoItem
                  icon={GraduationCap}
                  label="Class"
                  value={className}
                />

                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={email}
                />

                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={phone}
                />

                <InfoItem
                  icon={ShieldCheck}
                  label="Enrollment ID"
                  value={getEnrollmentId(student)}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Registered"
                  value={formatDate(registrationDate)}
                />
              </div>
            </div>

            {/* Guardian */}

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Users
                  size={17}
                  className="text-violet-300"
                />

                <h3 className="font-semibold text-white">
                  Guardian Information
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={UserRound}
                  label="Guardian Name"
                  value={guardianName}
                />

                <InfoItem
                  icon={Phone}
                  label="Guardian Phone"
                  value={guardianPhone}
                />
              </div>
            </div>

            {/* Subjects */}

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen
                  size={17}
                  className="text-cyan-300"
                />

                <h3 className="font-semibold text-white">
                  Selected Subjects
                </h3>
              </div>

              {subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject, index) => (
                    <span
                      key={`${subject}-${index}`}
                      className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.06] px-3 py-2 text-xs font-medium text-cyan-200"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-slate-500">
                  No subjects recorded.
                </div>
              )}
            </div>

            {/* Dates */}

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays
                  size={17}
                  className="text-emerald-300"
                />

                <h3 className="font-semibold text-white">
                  Registration Details
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={CalendarDays}
                  label="Created At"
                  value={formatDateTime(registrationDate)}
                />

                <InfoItem
                  icon={RefreshCw}
                  label="Last Updated"
                  value={formatDateTime(updatedDate)}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Students() {
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedStudent, setSelectedStudent] = useState(null);

  /* =======================================================
     FETCH STUDENTS
  ======================================================= */

  const fetchStudents = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_URL}/api/academy/admin/enrollments`
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!response.ok) {
          let message = `Request failed with status ${response.status}`;

          if (contentType.includes("application/json")) {
            try {
              const data = await response.json();

              message =
                data?.message ||
                data?.error ||
                message;
            } catch {
              // Ignore JSON parsing errors.
            }
          }

          throw new Error(message);
        }

        if (!contentType.includes("application/json")) {
          const text = await response.text();

          throw new Error(
            `Server returned non-JSON response.${
              text
                ? ` ${text.slice(0, 120)}`
                : ""
            }`
          );
        }

        const data = await response.json();

        let enrollmentList = [];

        if (Array.isArray(data)) {
          enrollmentList = data;
        } else if (Array.isArray(data?.enrollments)) {
          enrollmentList = data.enrollments;
        } else if (Array.isArray(data?.data)) {
          enrollmentList = data.data;
        } else if (
          Array.isArray(data?.students)
        ) {
          enrollmentList = data.students;
        }

        setStudents(enrollmentList);
      } catch (err) {
        console.error(
          "Academy Students Error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load students."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  /* =======================================================
     CLASSES
  ======================================================= */

  const classes = useMemo(() => {
    const values = students
      .map((student) =>
        getClassName(student)
      )
      .filter(
        (value) =>
          value &&
          value !== "Not assigned"
      );

    return [...new Set(values)].sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }, [students]);

  /* =======================================================
     FILTERED STUDENTS
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const query = normalize(search);

    return students.filter((student) => {
      const name = normalize(
        getStudentName(student)
      );

      const email = normalize(
        getEmail(student)
      );

      const phone = normalize(
        getPhone(student)
      );

      const enrollmentId = normalize(
        getEnrollmentId(student)
      );

      const className = normalize(
        getClassName(student)
      );

      const enrollmentStatus =
        normalize(
          getEnrollmentStatus(student)
        );

      const accountStatus =
        normalize(
          getAccountStatus(student)
        );

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        enrollmentId.includes(query) ||
        className.includes(query);

      const matchesClass =
        classFilter === "all" ||
        className === normalize(classFilter);

      const matchesStatus =
        statusFilter === "all" ||
        enrollmentStatus ===
          normalize(statusFilter) ||
        accountStatus ===
          normalize(statusFilter);

      return (
        matchesSearch &&
        matchesClass &&
        matchesStatus
      );
    });
  }, [
    students,
    search,
    classFilter,
    statusFilter,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    let active = 0;
    let pending = 0;
    let inactive = 0;

    students.forEach((student) => {
      const enrollmentStatus =
        normalize(
          getEnrollmentStatus(student)
        );

      const accountStatus =
        normalize(
          getAccountStatus(student)
        );

      /*
        VERIFIED COUNTS AS ACTIVE.
      */

      const isActive =
        enrollmentStatus === "active" ||
        enrollmentStatus === "approved" ||
        enrollmentStatus === "accepted" ||
        enrollmentStatus === "verified" ||
        accountStatus === "active" ||
        accountStatus === "verified";

      const isInactive =
        enrollmentStatus === "inactive" ||
        enrollmentStatus === "rejected" ||
        enrollmentStatus === "declined" ||
        enrollmentStatus === "suspended" ||
        accountStatus === "inactive" ||
        accountStatus === "rejected" ||
        accountStatus === "suspended";

      if (isActive) {
        active += 1;
      } else if (isInactive) {
        inactive += 1;
      } else {
        pending += 1;
      }
    });

    return {
      total: students.length,
      active,
      pending,
      inactive,
    };
  }, [students]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setClassFilter("all");
    setStatusFilter("all");
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050914] text-white">
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(rgba(34,211,238,0.14) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Loader2
                className="animate-spin text-cyan-300"
                size={28}
              />
            </div>

            <p className="mt-4 text-sm text-slate-400">
              Loading students...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      {/* Background */}

      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(34,211,238,0.10) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="pointer-events-none fixed left-[-120px] top-[-120px] h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="pointer-events-none fixed bottom-[-150px] right-[-100px] h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[140px]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <Users size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Students
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage and monitor academy student enrollments.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchStudents(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* =================================================
            ERROR
        ================================================= */}

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
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4"
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-300"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-200">
                Unable to load students
              </p>

              <p className="mt-1 text-xs text-red-300/70">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchStudents()
              }
              className="rounded-lg border border-red-300/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-400/10"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats.total}
            description="All registered students"
            iconClassName="border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
          />

          <StatCard
            icon={UserCheck}
            label="Verified"
            value={stats.active}
            description="Verified / active students"
            iconClassName="border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          />

          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            description="Awaiting verification"
            iconClassName="border-amber-400/20 bg-amber-400/10 text-amber-300"
          />

          <StatCard
            icon={UserX}
            label="Inactive"
            value={stats.inactive}
            description="Inactive or rejected"
            iconClassName="border-red-400/20 bg-red-400/10 text-red-300"
          />
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#080d1c]/80 p-4 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="flex flex-col gap-3 xl:flex-row">
            {/* Search */}

            <div className="relative flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by name, email, phone, ID or class..."
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-cyan-400/30 focus:bg-white/[0.045]"
              />
            </div>

            {/* Class filter */}

            <div className="relative">
              <select
                value={classFilter}
                onChange={(event) =>
                  setClassFilter(
                    event.target.value
                  )
                }
                className="h-11 w-full min-w-[180px] appearance-none rounded-xl border border-white/[0.07] bg-[#0a1020] px-4 pr-10 text-sm text-slate-300 outline-none transition focus:border-cyan-400/30"
              >
                <option value="all">
                  All Classes
                </option>

                {classes.map((className) => (
                  <option
                    key={className}
                    value={className}
                  >
                    {className}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            {/* Status filter */}

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="h-11 w-full min-w-[180px] appearance-none rounded-xl border border-white/[0.07] bg-[#0a1020] px-4 pr-10 text-sm text-slate-300 outline-none transition focus:border-cyan-400/30"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="verified">
                  Verified
                </option>

                <option value="active">
                  Active
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            {/* Clear */}

            {(search ||
              classFilter !== "all" ||
              statusFilter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-11 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 text-sm font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-600">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-400">
                {filteredStudents.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-400">
                {students.length}
              </span>{" "}
              students
            </span>

            {(search ||
              classFilter !== "all" ||
              statusFilter !== "all") && (
              <span>
                Filters active
              </span>
            )}
          </div>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {filteredStudents.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#080d1c]/80 px-6 py-16 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-slate-500">
              <Users size={24} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-white">
              No students found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No students match the current search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/15"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080d1c]/80 shadow-xl shadow-black/10 backdrop-blur-xl lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Class
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Enrollment
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Account
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Payment
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Registered
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.05]">
                    {filteredStudents.map(
                      (student, index) => {
                        const name =
                          getStudentName(
                            student
                          );

                        const email =
                          getEmail(student);

                        const className =
                          getClassName(
                            student
                          );

                        const enrollmentStatus =
                          getEnrollmentStatus(
                            student
                          );

                        const accountStatus =
                          getAccountStatus(
                            student
                          );

                        const paymentStatus =
                          getPaymentStatus(
                            student
                          );

                        const registrationDate =
                          student?.created_at ||
                          student?.createdAt ||
                          student?.registration_date ||
                          student?.registrationDate;

                        return (
                          <motion.tr
                            key={
                              getEnrollmentId(
                                student
                              ) !== "—"
                                ? getEnrollmentId(
                                    student
                                  )
                                : index
                            }
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                            transition={{
                              delay:
                                index *
                                0.02,
                            }}
                            className="group transition hover:bg-white/[0.025]"
                          >
                            {/* Student */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07] text-xs font-bold text-cyan-300">
                                  {getInitials(
                                    name
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white">
                                    {name}
                                  </p>

                                  <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
                                    {email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Class */}

                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                                <GraduationCap
                                  size={15}
                                  className="text-slate-500"
                                />

                                {className}
                              </span>
                            </td>

                            {/* Enrollment */}

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={
                                  enrollmentStatus
                                }
                              />
                            </td>

                            {/* Account */}

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={
                                  accountStatus
                                }
                              />
                            </td>

                            {/* Payment */}

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={
                                  paymentStatus
                                }
                              />
                            </td>

                            {/* Registered */}

                            <td className="px-5 py-4">
                              <span className="text-xs text-slate-500">
                                {formatDate(
                                  registrationDate
                                )}
                              </span>
                            </td>

                            {/* Action */}

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedStudent(
                                    student
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.06] hover:text-cyan-200"
                              >
                                <Eye
                                  size={14}
                                />

                                View
                              </button>
                            </td>
                          </motion.tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =================================================
                MOBILE / TABLET CARDS
            ================================================= */}

            <div className="mt-6 grid gap-4 lg:hidden">
              {filteredStudents.map(
                (student, index) => {
                  const name =
                    getStudentName(student);

                  const email =
                    getEmail(student);

                  const phone =
                    getPhone(student);

                  const className =
                    getClassName(student);

                  const enrollmentStatus =
                    getEnrollmentStatus(
                      student
                    );

                  const accountStatus =
                    getAccountStatus(
                      student
                    );

                  const paymentStatus =
                    getPaymentStatus(
                      student
                    );

                  const registrationDate =
                    student?.created_at ||
                    student?.createdAt ||
                    student?.registration_date ||
                    student?.registrationDate;

                  return (
                    <motion.div
                      key={
                        getEnrollmentId(
                          student
                        ) !== "—"
                          ? getEnrollmentId(
                              student
                            )
                          : index
                      }
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.02,
                      }}
                      className="rounded-2xl border border-white/[0.07] bg-[#080d1c]/80 p-4 shadow-xl shadow-black/10 backdrop-blur-xl"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07] text-xs font-bold text-cyan-300">
                            {getInitials(
                              name
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {name}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {email}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedStudent(
                              student
                            )
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-slate-400 transition hover:bg-cyan-400/[0.06] hover:text-cyan-200"
                        >
                          <Eye size={16} />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                            Class
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-300">
                            {className}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                            Registered
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-300">
                            {formatDate(
                              registrationDate
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500">
                            Enrollment
                          </span>

                          <StatusBadge
                            status={
                              enrollmentStatus
                            }
                            small
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500">
                            Account
                          </span>

                          <StatusBadge
                            status={
                              accountStatus
                            }
                            small
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500">
                            Payment
                          </span>

                          <StatusBadge
                            status={
                              paymentStatus
                            }
                            small
                          />
                        </div>
                      </div>

                      {phone !== "—" && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                          <Phone size={13} />

                          <span className="truncate">
                            {phone}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      <AnimatePresence>
        {selectedStudent && (
          <StudentDetailsModal
            student={selectedStudent}
            onClose={() =>
              setSelectedStudent(null)
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}