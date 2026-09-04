import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const getStudentName = (student) => {
  const fullName = [
    student.first_name || student.firstName,
    student.middle_name || student.middleName,
    student.last_name || student.lastName,
  ]
    .map(clean)
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    clean(student.name) ||
    clean(student.student_name) ||
    "Unnamed Student"
  );
};

const getClassName = (student) => {
  return (
    clean(student.grade) ||
    clean(student.class) ||
    clean(student.level) ||
    "Not specified"
  );
};

const getEnrollmentStatus = (student) => {
  return (
    clean(student.enrollment_status) ||
    clean(student.enrollmentStatus) ||
    "pending"
  );
};

const getAccountStatus = (student) => {
  return (
    clean(student.account_status) ||
    clean(student.accountStatus) ||
    "pending"
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return clean(dateValue) || "—";
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return clean(dateValue) || "—";
  }

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalize = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ");

const getInitials = (student) => {
  const name = getStudentName(student);

  const parts = name.split(" ").filter(Boolean);

  if (!parts.length) return "ST";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getSubjects = (student) => {
  if (Array.isArray(student.subjects)) {
    return student.subjects;
  }

  if (typeof student.subjects === "string") {
    try {
      const parsed = JSON.parse(student.subjects);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return student.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);
    }
  }

  return [];
};

/* =========================================================
   STATUS HELPERS
========================================================= */

const getStatusMeta = (status) => {
  const normalized = normalize(status);

  if (
    normalized === "active" ||
    normalized === "approved" ||
    normalized === "accepted" ||
    normalized === "verified"
  ) {
    return {
      label: status || "Active",
      icon: CheckCircle2,
      className:
        "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    };
  }

  if (
    normalized === "inactive" ||
    normalized === "rejected" ||
    normalized === "declined" ||
    normalized === "suspended"
  ) {
    return {
      label: status || "Inactive",
      icon: XCircle,
      className: "text-red-300 bg-red-400/10 border-red-400/20",
    };
  }

  return {
    label: status || "Pending",
    icon: Clock,
    className: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  };
};

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.className}`}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1020]/80 p-5 backdrop-blur-xl"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[11px] text-slate-500">{description}</p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   STUDENT DETAILS MODAL
========================================================= */

function StudentDetailsModal({ student, onClose }) {
  if (!student) return null;

  const name = getStudentName(student);
  const subjects = getSubjects(student);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080d1a] shadow-2xl shadow-black/50"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#080d1a]/95 px-6 py-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-lg font-bold text-cyan-300">
                  {getInitials(student)}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">{name}</h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Enrollment ID:{" "}
                    <span className="text-slate-300">
                      {student.enrollment_id || student.id || "—"}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* Status */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">
                  Enrollment
                </p>

                <StatusBadge status={getEnrollmentStatus(student)} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">
                  Account
                </p>

                <StatusBadge status={getAccountStatus(student)} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">
                  Payment
                </p>

                <StatusBadge status={student.payment_status || "Pending"} />
              </div>
            </div>

            {/* Student information */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <UserRound size={16} className="text-cyan-300" />
                <h3 className="text-sm font-semibold text-white">
                  Student Information
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={student.email}
                />

                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={student.student_phone}
                />

                <InfoItem
                  icon={GraduationCap}
                  label="Class"
                  value={getClassName(student)}
                />

                <InfoItem
                  icon={BookOpen}
                  label="Academic Session"
                  value={student.academic_session}
                />

                <InfoItem
                  icon={UserRound}
                  label="Gender"
                  value={student.gender}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Registered"
                  value={formatDateTime(student.created_at)}
                />
              </div>
            </section>

            {/* Guardian */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-violet-300" />
                <h3 className="text-sm font-semibold text-white">
                  Guardian Information
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={UserRound}
                  label="Guardian"
                  value={[
                    student.guardian_first_name,
                    student.guardian_last_name,
                  ]
                    .map(clean)
                    .filter(Boolean)
                    .join(" ")}
                />

                <InfoItem
                  icon={UserRound}
                  label="Relationship"
                  value={student.guardian_relationship}
                />

                <InfoItem
                  icon={Phone}
                  label="Guardian Phone"
                  value={student.guardian_phone}
                />

                <InfoItem
                  icon={Mail}
                  label="Guardian Email"
                  value={student.guardian_email}
                />
              </div>
            </section>

            {/* Subjects */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-300" />

                <h3 className="text-sm font-semibold text-white">
                  Selected Subjects
                </h3>
              </div>

              {subjects.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject, index) => (
                    <div
                      key={`${subject}-${index}`}
                      className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-xs text-slate-300"
                    >
                      {subject}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center text-xs text-slate-500">
                  No subjects recorded.
                </div>
              )}
            </section>

            {/* IDs */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-300" />

                <h3 className="text-sm font-semibold text-white">
                  Registration Details
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={CreditCard}
                  label="Enrollment Reference"
                  value={student.enrollment_id}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Created"
                  value={formatDateTime(student.created_at)}
                />
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400">
          <Icon size={15} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-medium text-slate-200">
            {clean(value) || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

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
     FETCH REAL STUDENTS
  ======================================================= */

  const fetchStudents = useCallback(async (isRefresh = false) => {
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

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        let message = `Failed to load students (${response.status})`;

        if (contentType.includes("application/json")) {
          const data = await response.json();

          message =
            data?.message ||
            data?.error ||
            message;
        } else {
          const text = await response.text();

          if (text) {
            message = text.slice(0, 250);
          }
        }

        throw new Error(message);
      }

      if (!contentType.includes("application/json")) {
        throw new Error(
          "The server returned an unexpected response. Make sure the Academy API is running."
        );
      }

      const data = await response.json();

      const enrollmentList = Array.isArray(data)
        ? data
        : Array.isArray(data?.enrollments)
        ? data.enrollments
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setStudents(enrollmentList);
    } catch (err) {
      console.error("Students fetch error:", err);

      setError(
        err?.message ||
          "Unable to load enrolled students. Please try again."
      );

      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =======================================================
     LOAD ON PAGE OPEN
  ======================================================= */

  useEffect(() => {
    fetchStudents(false);
  }, [fetchStudents]);

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const classes = useMemo(() => {
    const uniqueClasses = new Set();

    students.forEach((student) => {
      const className = getClassName(student);

      if (className && className !== "Not specified") {
        uniqueClasses.add(className);
      }
    });

    return [...uniqueClasses].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [students]);

  /* =======================================================
     FILTER STUDENTS
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const query = normalize(search);

    return students.filter((student) => {
      const name = normalize(getStudentName(student));
      const email = normalize(student.email);
      const enrollmentId = normalize(student.enrollment_id);
      const studentPhone = normalize(student.student_phone);
      const className = normalize(getClassName(student));

      const enrollmentStatus = normalize(
        getEnrollmentStatus(student)
      );

      const accountStatus = normalize(
        getAccountStatus(student)
      );

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        enrollmentId.includes(query) ||
        studentPhone.includes(query) ||
        className.includes(query);

      const matchesClass =
        classFilter === "all" ||
        normalize(getClassName(student)) === normalize(classFilter);

      const matchesStatus =
        statusFilter === "all" ||
        enrollmentStatus === normalize(statusFilter) ||
        accountStatus === normalize(statusFilter);

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, search, classFilter, statusFilter]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const active = students.filter((student) => {
      const enrollmentStatus = normalize(
        getEnrollmentStatus(student)
      );

      const accountStatus = normalize(
        getAccountStatus(student)
      );

      return (
        enrollmentStatus === "active" ||
        enrollmentStatus === "approved" ||
        enrollmentStatus === "accepted" ||
        accountStatus === "active"
      );
    }).length;

    const pending = students.filter((student) => {
      const enrollmentStatus = normalize(
        getEnrollmentStatus(student)
      );

      const accountStatus = normalize(
        getAccountStatus(student)
      );

      return (
        enrollmentStatus === "pending" ||
        accountStatus === "pending"
      );
    }).length;

    const inactive = students.filter((student) => {
      const enrollmentStatus = normalize(
        getEnrollmentStatus(student)
      );

      const accountStatus = normalize(
        getAccountStatus(student)
      );

      return (
        enrollmentStatus === "inactive" ||
        enrollmentStatus === "rejected" ||
        enrollmentStatus === "declined" ||
        enrollmentStatus === "suspended" ||
        accountStatus === "inactive" ||
        accountStatus === "suspended"
      );
    }).length;

    return {
      total: students.length,
      active,
      pending,
      inactive,
    };
  }, [students]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(#94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="absolute left-[15%] top-[-10%] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-10%] right-[10%] h-[450px] w-[450px] rounded-full bg-violet-600/10 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] p-5 sm:p-7 lg:p-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-[11px] font-medium text-cyan-300">
              <Users size={13} />
              Academy Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Manage Students
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              View students who have actually submitted the Academy
              enrollment form.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchStudents(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <RefreshCw size={17} />
            )}

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-red-300">
                  <AlertCircle size={19} />
                </div>

                <div>
                  <p className="text-sm font-medium text-red-200">
                    Unable to load students
                  </p>

                  <p className="mt-1 text-xs text-red-300/70">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchStudents(true)}
                className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-400/15"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Enrolled"
            value={stats.total}
            description="Students in Academy"
          />

          <StatCard
            icon={UserCheck}
            label="Active"
            value={stats.active}
            description="Approved or active"
          />

          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            description="Awaiting processing"
          />

          <StatCard
            icon={UserX}
            label="Inactive"
            value={stats.inactive}
            description="Inactive or rejected"
          />
        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="mb-5 rounded-2xl border border-white/10 bg-[#0a1020]/80 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, phone, class or enrollment ID..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-white/[0.05]"
              />
            </div>

            {/* Class filter */}
            <div className="relative">
              <select
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
                className="h-11 min-w-[170px] appearance-none rounded-xl border border-white/10 bg-white/[0.035] px-4 pr-10 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
              >
                <option value="all" className="bg-[#080d1a]">
                  All Classes
                </option>

                {classes.map((className) => (
                  <option
                    key={className}
                    value={className}
                    className="bg-[#080d1a]"
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
                  setStatusFilter(event.target.value)
                }
                className="h-11 min-w-[170px] appearance-none rounded-xl border border-white/10 bg-white/[0.035] px-4 pr-10 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
              >
                <option value="all" className="bg-[#080d1a]">
                  All Statuses
                </option>

                <option
                  value="active"
                  className="bg-[#080d1a]"
                >
                  Active
                </option>

                <option
                  value="pending"
                  className="bg-[#080d1a]"
                >
                  Pending
                </option>

                <option
                  value="inactive"
                  className="bg-[#080d1a]"
                >
                  Inactive
                </option>

                <option
                  value="approved"
                  className="bg-[#080d1a]"
                >
                  Approved
                </option>

                <option
                  value="rejected"
                  className="bg-[#080d1a]"
                >
                  Rejected
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>

          {!loading && (
            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-300">
                  {filteredStudents.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-300">
                  {students.length}
                </span>{" "}
                enrolled students
              </p>

              {(search ||
                classFilter !== "all" ||
                statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setClassFilter("all");
                    setStatusFilter("all");
                  }}
                  className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1020]/80 shadow-2xl shadow-black/10 backdrop-blur-xl">
          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
                <Loader2
                  size={24}
                  className="animate-spin text-cyan-300"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-300">
                Loading enrolled students...
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Fetching the latest Academy registrations
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            /* Empty */
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-600">
                {students.length === 0 ? (
                  <Users size={28} />
                ) : (
                  <Search size={28} />
                )}
              </div>

              <h3 className="mt-5 text-sm font-semibold text-white">
                {students.length === 0
                  ? "No enrolled students yet"
                  : "No students found"}
              </h3>

              <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                {students.length === 0
                  ? "Students who submit the Academy enrollment form will appear here automatically."
                  : "Try changing your search or filters to find a student."}
              </p>

              {students.length === 0 && (
                <button
                  type="button"
                  onClick={() => fetchStudents(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/15"
                >
                  <RefreshCw size={14} />
                  Check Again
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Class
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Session
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Enrollment
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Account
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Registered
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((student, index) => {
                      const name = getStudentName(student);

                      return (
                        <motion.tr
                          key={
                            student.enrollment_id ||
                            student.id ||
                            `${name}-${index}`
                          }
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            delay: Math.min(index * 0.025, 0.25),
                          }}
                          className="border-b border-white/5 transition hover:bg-white/[0.025]"
                        >
                          {/* Student */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 text-xs font-bold text-cyan-300">
                                {getInitials(student)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                  {name}
                                </p>

                                <div className="mt-1 flex items-center gap-1.5">
                                  <Mail
                                    size={11}
                                    className="text-slate-600"
                                  />

                                  <p className="max-w-[220px] truncate text-xs text-slate-500">
                                    {student.email || "No email"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Class */}
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-2">
                              <BookOpen
                                size={14}
                                className="text-cyan-400/70"
                              />

                              <span className="text-sm text-slate-300">
                                {getClassName(student)}
                              </span>
                            </div>
                          </td>

                          {/* Session */}
                          <td className="px-5 py-4">
                            <span className="text-xs text-slate-400">
                              {student.academic_session || "—"}
                            </span>
                          </td>

                          {/* Enrollment */}
                          <td className="px-5 py-4">
                            <StatusBadge
                              status={getEnrollmentStatus(student)}
                            />
                          </td>

                          {/* Account */}
                          <td className="px-5 py-4">
                            <StatusBadge
                              status={getAccountStatus(student)}
                            />
                          </td>

                          {/* Registered */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={13}
                                className="text-slate-600"
                              />

                              <span className="text-xs text-slate-400">
                                {formatDate(student.created_at)}
                              </span>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStudent(student)
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs font-medium text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/5 hover:text-cyan-300"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-white/5 md:hidden">
                {filteredStudents.map((student, index) => {
                  const name = getStudentName(student);

                  return (
                    <motion.div
                      key={
                        student.enrollment_id ||
                        student.id ||
                        `${name}-${index}`
                      }
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: Math.min(index * 0.025, 0.25),
                      }}
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/5 text-xs font-bold text-cyan-300">
                          {getInitials(student)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-white">
                                {name}
                              </h3>

                              <p className="mt-1 truncate text-xs text-slate-500">
                                {student.email || "No email"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStudent(student)
                              }
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-cyan-300"
                            >
                              <Eye size={14} />
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                              <p className="text-[9px] uppercase tracking-wider text-slate-600">
                                Class
                              </p>

                              <p className="mt-1 text-xs font-medium text-slate-300">
                                {getClassName(student)}
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                              <p className="text-[9px] uppercase tracking-wider text-slate-600">
                                Session
                              </p>

                              <p className="mt-1 text-xs font-medium text-slate-300">
                                {student.academic_session || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge
                              status={getEnrollmentStatus(student)}
                            />

                            <StatusBadge
                              status={getAccountStatus(student)}
                            />
                          </div>

                          <p className="mt-3 text-[11px] text-slate-600">
                            Registered{" "}
                            {formatDate(student.created_at)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* =================================================
            FOOTER INFO
        ================================================= */}

        {!loading && students.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Live Academy enrollment records
            </p>

            <p>
              Last loaded: {new Date().toLocaleTimeString("en-NG")}
            </p>
          </div>
        )}
      </div>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}