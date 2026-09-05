import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Users,
  GraduationCap,
  School,
  ShieldCheck,
  UserPlus,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Search,
  Clock3,
  CheckCircle2,
  XCircle,
  KeyRound,
  Eye,
  X,
  Mail,
  Phone,
  BookOpen,
  UserRound,
  Loader2,
  Shield,
  Copy,
  Check,
  AlertTriangle,
  UserCheck,
  LockKeyhole,
  Sparkles,
  CalendarDays,
  MapPin,
  CreditCard,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { useNavigate } from "react-router-dom";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const STUDENT_PASSWORD_URL =
  `${API_URL}/api/academy/admin/student-password`;

const TUTOR_PASSWORD_URL =
  `${API_URL}/api/academy/admin/tutor-password`;

/* =========================================================
   HELPERS
========================================================= */

const getFullName = (person) => {
  if (!person) return "Unknown User";

  return [
    person.first_name || person.firstName,
    person.middle_name || person.middleName,
    person.last_name || person.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Unknown User";
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const normalizeStatus = (value) => {
  return String(value || "pending")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
};

const isVerifiedStatus = (status) => {
  return normalizeStatus(status) === "verified";
};

const isRejectedStatus = (status) => {
  return [
    "rejected",
    "declined",
    "suspended",
  ].includes(normalizeStatus(status));
};

const getStatusLabel = (status) => {
  const value = normalizeStatus(status);

  const labels = {
    pending: "Pending",
    verified: "Verified",
    active: "Active",
    approved: "Approved",
    completed: "Completed",
    payment_verified: "Payment Verified",
    payment_pending: "Payment Pending",
    rejected: "Rejected",
    declined: "Declined",
    suspended: "Suspended",
  };

  return labels[value] || String(status || "Pending");
};

const getStatusClasses = (status) => {
  const value = normalizeStatus(status);

  if (value === "verified") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (value === "payment_verified") {
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }

  if (
    value === "rejected" ||
    value === "declined" ||
    value === "suspended"
  ) {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }

  return "bg-amber-500/10 text-amber-400 border-amber-500/20";
};

const getStatusIcon = (status) => {
  const value = normalizeStatus(status);

  if (value === "verified") {
    return CheckCircle2;
  }

  if (value === "payment_verified") {
    return ShieldCheck;
  }

  if (
    value === "rejected" ||
    value === "declined" ||
    value === "suspended"
  ) {
    return XCircle;
  }

  return Clock3;
};

const parseArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Continue below.
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const displayArray = (value) => {
  const array = parseArray(value);

  if (!array.length) {
    return "—";
  }

  return array.join(", ");
};

const generatePassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "@#$%";

  const getRandom = (chars) => {
    return chars[
      Math.floor(Math.random() * chars.length)
    ];
  };

  let result =
    getRandom(upper) +
    getRandom(lower) +
    getRandom(numbers) +
    getRandom(symbols);

  const all =
    upper +
    lower +
    numbers +
    symbols;

  while (result.length < 10) {
    result += getRandom(all);
  }

  return result
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/* =========================================================
   COMPONENT
========================================================= */

const UsersDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState("students");

  const [students, setStudents] =
    useState([]);

  const [tutors, setTutors] =
    useState([]);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [loadingTutors, setLoadingTutors] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [passwordModal, setPasswordModal] =
    useState(null);

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  /* =========================================================
     FETCH STUDENTS
  ========================================================= */

  const fetchStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/academy/admin/enrollments`
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Unable to load student enrollments."
        );
      }

      setStudents(
        Array.isArray(data.enrollments)
          ? data.enrollments
          : []
      );
    } catch (err) {
      console.error(
        "Student enrollment fetch error:",
        err
      );

      setError(
        err.message ||
        "Unable to load student enrollments."
      );
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  /* =========================================================
     FETCH TUTORS
  ========================================================= */

  const fetchTutors = useCallback(async () => {
    try {
      setLoadingTutors(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/academy/admin/tutors`
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Unable to load tutor applications."
        );
      }

      setTutors(
        Array.isArray(data.tutors)
          ? data.tutors
          : []
      );
    } catch (err) {
      console.error(
        "Tutor application fetch error:",
        err
      );

      setError(
        err.message ||
        "Unable to load tutor applications."
      );
    } finally {
      setLoadingTutors(false);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchStudents();
    fetchTutors();
  }, [
    fetchStudents,
    fetchTutors,
  ]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const refreshAll = async () => {
    setError("");

    await Promise.all([
      fetchStudents(),
      fetchTutors(),
    ]);
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const getStudentStatus = (student) => {
    return student.enrollment_status || "pending";
  };

  const getTutorStatus = (tutor) => {
    return tutor.application_status || "pending";
  };

  /* =========================================================
     COUNTS
  ========================================================= */

  const pendingStudents = useMemo(() => {
    return students.filter(
      (student) =>
        normalizeStatus(
          getStudentStatus(student)
        ) === "pending"
    ).length;
  }, [students]);

  const pendingTutors = useMemo(() => {
    return tutors.filter(
      (tutor) =>
        normalizeStatus(
          getTutorStatus(tutor)
        ) === "pending"
    ).length;
  }, [tutors]);

  const activeStudents = useMemo(() => {
    return students.filter(
      (student) =>
        isVerifiedStatus(
          getStudentStatus(student)
        )
    ).length;
  }, [students]);

  const activeTutors = useMemo(() => {
    return tutors.filter(
      (tutor) =>
        isVerifiedStatus(
          getTutorStatus(tutor)
        )
    ).length;
  }, [tutors]);

  const totalActiveUsers =
    activeStudents +
    activeTutors;

  /* =========================================================
     FILTER STUDENTS
  ========================================================= */

  const filteredStudents = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    if (!query) {
      return students;
    }

    return students.filter((student) => {
      const name =
        getFullName(student).toLowerCase();

      const email =
        String(student.email || "")
          .toLowerCase();

      const grade =
        String(student.grade || "")
          .toLowerCase();

      const level =
        String(student.school_level || "")
          .toLowerCase();

      const phone =
        String(
          student.student_phone ||
          student.phone ||
          ""
        ).toLowerCase();

      const enrollmentId =
        String(
          student.enrollment_id ||
          student.reference ||
          ""
        ).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        grade.includes(query) ||
        level.includes(query) ||
        phone.includes(query) ||
        enrollmentId.includes(query)
      );
    });
  }, [students, search]);

  /* =========================================================
     FILTER TUTORS
  ========================================================= */

  const filteredTutors = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    if (!query) {
      return tutors;
    }

    return tutors.filter((tutor) => {
      const name =
        getFullName(tutor).toLowerCase();

      const email =
        String(tutor.email || "")
          .toLowerCase();

      const phone =
        String(
          tutor.phone ||
          tutor.tutor_phone ||
          ""
        ).toLowerCase();

      const reference =
        String(
          tutor.reference ||
          tutor.application_reference ||
          ""
        ).toLowerCase();

      const subject =
        String(
          tutor.subject ||
          tutor.subjects ||
          ""
        ).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        reference.includes(query) ||
        subject.includes(query)
      );
    });
  }, [tutors, search]);

  /* =========================================================
     OPEN PASSWORD MODAL
  ========================================================= */

  const openPasswordModal = (user, type) => {
    setPassword("");
    setConfirmPassword("");
    setPasswordMessage("");
    setCopied(false);

    setPasswordModal({
      user,
      type,
    });
  };

  const closePasswordModal = () => {
    if (savingPassword) {
      return;
    }

    setPasswordModal(null);
    setPassword("");
    setConfirmPassword("");
    setPasswordMessage("");
    setCopied(false);
  };

  /* =========================================================
     GENERATE PASSWORD
  ========================================================= */

  const handleGeneratePassword = () => {
    const generated = generatePassword();

    setPassword(generated);
    setConfirmPassword(generated);
    setPasswordMessage("");
    setCopied(false);
  };

  /* =========================================================
     SAVE PASSWORD
  ========================================================= */

  const savePassword = async () => {
    if (!password) {
      setPasswordMessage(
        "Please enter a password."
      );
      return;
    }

    if (password.length < 6) {
      setPasswordMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMessage(
        "The passwords do not match."
      );
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordMessage("");

      const user = passwordModal.user;
      const type = passwordModal.type;

      const endpoint =
        type === "student"
          ? STUDENT_PASSWORD_URL
          : TUTOR_PASSWORD_URL;

      const payload =
        type === "student"
          ? {
              enrollmentId:
                user.enrollment_id ||
                user.id ||
                user.reference,
              password,
            }
          : {
              reference:
                user.reference ||
                user.application_reference ||
                user.id,
              password,
            };

      const response = await fetch(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Unable to save password."
        );
      }

      setPasswordMessage(
        data?.message ||
        "Password saved successfully."
      );

      if (type === "student") {
        await fetchStudents();
      } else {
        await fetchTutors();
      }

      setTimeout(() => {
        closePasswordModal();
      }, 1200);
    } catch (err) {
      console.error(
        "Password assignment error:",
        err
      );

      setPasswordMessage(
        err.message ||
        "Unable to save password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  /* =========================================================
     COPY PASSWORD
  ========================================================= */

  const copyPassword = async () => {
    if (!password) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        password
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error(
        "Copy failed:",
        err
      );
    }
  };

  /* =========================================================
     STATS
  ========================================================= */

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      icon: GraduationCap,
    },
    {
      title: "Pending Students",
      value: pendingStudents,
      icon: Clock3,
    },
    {
      title: "Tutor Applications",
      value: tutors.length,
      icon: School,
    },
    {
      title: "Pending Tutors",
      value: pendingTutors,
      icon: UserPlus,
    },
  ];

  const isLoading =
    activeTab === "students"
      ? loadingStudents
      : loadingTutors;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#020617]
        p-4
        text-white
        md:p-6
      "
    >
      {/* BACKGROUND */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-20
        "
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(#38bdf8 1px, transparent 1px)",
            backgroundSize:
              "28px 28px",
          }}
        />
      </div>

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-20
          h-96
          w-96
          rounded-full
          bg-cyan-500/10
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-20
          h-96
          w-96
          rounded-full
          bg-violet-500/10
          blur-[120px]
        "
      />

      <div className="relative z-10">

        {/* HEADER */}

        <div
          className="
            mb-8
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <div
              className="
                mb-2
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-cyan-400/20
                  bg-cyan-500/10
                "
              >
                <Users
                  className="text-cyan-400"
                  size={25}
                />
              </div>

              <div>
                <h1
                  className="
                    text-2xl
                    font-bold
                    md:text-3xl
                  "
                >
                  User Management
                </h1>

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  Manage students, tutors and
                  account passwords
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={refreshAll}
            disabled={
              loadingStudents ||
              loadingTutors
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-700
              bg-slate-900/80
              px-5
              py-3
              text-sm
              font-semibold
              text-slate-200
              transition
              hover:border-cyan-400/40
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={17}
              className={
                loadingStudents ||
                loadingTutors
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* VERIFIED USERS */}

        <div
          className="
            mb-6
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-emerald-500/10
            bg-emerald-500/5
            p-4
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-emerald-500/10
            "
          >
            <UserCheck
              size={20}
              className="text-emerald-400"
            />
          </div>

          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              Verified Accounts
            </p>

            <p
              className="
                text-lg
                font-bold
                text-emerald-400
              "
            >
              {totalActiveUsers}
            </p>
          </div>
        </div>

        {/* STATS */}

        <div
          className="
            mb-8
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.05,
                }}
                className="
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-900/80
                  p-5
                  shadow-xl
                  shadow-black/20
                  backdrop-blur
                  transition
                  hover:-translate-y-1
                  hover:border-cyan-400/20
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-slate-800
                    "
                  >
                    <Icon
                      size={22}
                      className="text-cyan-400"
                    />
                  </div>

                  <TrendingUp
                    size={18}
                    className="text-emerald-400"
                  />
                </div>

                <p
                  className="
                    mt-5
                    text-sm
                    text-slate-400
                  "
                >
                  {item.title}
                </p>

                <p
                  className="
                    mt-1
                    text-3xl
                    font-bold
                  "
                >
                  {item.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* MANAGEMENT */}

        <div
          className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-950/80
            shadow-2xl
            shadow-black/30
            backdrop-blur
          "
        >
          {/* TABS */}

          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-slate-800
              p-4
              md:flex-row
              md:items-center
              md:justify-between
              md:p-5
            "
          >
            <div
              className="
                flex
                rounded-xl
                border
                border-slate-800
                bg-slate-900
                p-1
              "
            >
              <button
                onClick={() => {
                  setActiveTab("students");
                  setSearch("");
                }}
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  ${
                    activeTab === "students"
                      ? "bg-cyan-500/15 text-cyan-400"
                      : "text-slate-400 hover:text-white"
                  }
                `}
              >
                <GraduationCap size={17} />

                Students

                {pendingStudents > 0 && (
                  <span
                    className="
                      rounded-full
                      bg-amber-500/15
                      px-2
                      py-0.5
                      text-[10px]
                      text-amber-400
                    "
                  >
                    {pendingStudents}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("tutors");
                  setSearch("");
                }}
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  ${
                    activeTab === "tutors"
                      ? "bg-violet-500/15 text-violet-400"
                      : "text-slate-400 hover:text-white"
                  }
                `}
              >
                <School size={17} />

                Tutors

                {pendingTutors > 0 && (
                  <span
                    className="
                      rounded-full
                      bg-amber-500/15
                      px-2
                      py-0.5
                      text-[10px]
                      text-amber-400
                    "
                  >
                    {pendingTutors}
                  </span>
                )}
              </button>
            </div>

            {/* SEARCH */}

            <div
              className="
                relative
                w-full
                md:max-w-sm
              "
            >
              <Search
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder={
                  activeTab === "students"
                    ? "Search students..."
                    : "Search tutors..."
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900
                  py-3
                  pl-10
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-400/40
                "
              />
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="
                m-5
                flex
                items-start
                gap-3
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                p-4
                text-sm
                text-red-400
              "
            >
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>{error}</div>
            </div>
          )}

          {/* LOADING */}

          {isLoading ? (
            <div
              className="
                flex
                min-h-[300px]
                items-center
                justify-center
              "
            >
              <div
                className="
                  flex
                  flex-col
                  items-center
                  gap-3
                  text-slate-400
                "
              >
                <Loader2
                  size={30}
                  className="
                    animate-spin
                    text-cyan-400
                  "
                />

                <span className="text-sm">
                  Loading {activeTab}...
                </span>
              </div>
            </div>
          ) : activeTab === "students" ? (

            /* =================================================
               STUDENTS
            ================================================= */

            <div className="p-4 md:p-5">
              {filteredStudents.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No student enrollments"
                  description={
                    search
                      ? "No students match your search."
                      : "New student enrollments will appear here."
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map(
                    (student, index) => {
                      const status =
                        getStudentStatus(student);

                      const StatusIcon =
                        getStatusIcon(status);

                      return (
                        <motion.div
                          key={
                            student.enrollment_id ||
                            student.id ||
                            index
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
                          className="
                            rounded-2xl
                            border
                            border-slate-800
                            bg-slate-900/70
                            p-4
                            transition
                            hover:border-cyan-400/20
                            hover:bg-slate-900
                          "
                        >
                          <div
                            className="
                              flex
                              flex-col
                              gap-4
                              lg:flex-row
                              lg:items-center
                              lg:justify-between
                            "
                          >
                            <div
                              className="
                                flex
                                min-w-0
                                items-center
                                gap-4
                              "
                            >
                              <div
                                className="
                                  flex
                                  h-12
                                  w-12
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-cyan-500/10
                                  text-cyan-400
                                "
                              >
                                <GraduationCap
                                  size={22}
                                />
                              </div>

                              <div className="min-w-0">
                                <div
                                  className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                  "
                                >
                                  <h3
                                    className="
                                      truncate
                                      font-semibold
                                    "
                                  >
                                    {getFullName(
                                      student
                                    )}
                                  </h3>

                                  <span
                                    className={`
                                      inline-flex
                                      items-center
                                      gap-1
                                      rounded-full
                                      border
                                      px-2
                                      py-0.5
                                      text-[10px]
                                      font-semibold
                                      uppercase
                                      ${getStatusClasses(
                                        status
                                      )}
                                    `}
                                  >
                                    <StatusIcon
                                      size={11}
                                    />

                                    {getStatusLabel(
                                      status
                                    )}
                                  </span>
                                </div>

                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-slate-400
                                  "
                                >
                                  {student.email ||
                                    "No email"}
                                </p>

                                <div
                                  className="
                                    mt-2
                                    flex
                                    flex-wrap
                                    gap-x-4
                                    gap-y-1
                                    text-xs
                                    text-slate-500
                                  "
                                >
                                  <span>
                                    {student.school_level ||
                                      "—"}
                                  </span>

                                  <span>
                                    {student.grade ||
                                      "—"}
                                  </span>

                                  <span>
                                    {student.academic_session ||
                                      "—"}
                                  </span>

                                  <span>
                                    {formatDate(
                                      student.created_at
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div
                              className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                              "
                            >
                              <button
                                onClick={() =>
                                  setSelectedUser({
                                    type: "student",
                                    user: student,
                                  })
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-slate-700
                                  bg-slate-800
                                  px-4
                                  py-2.5
                                  text-sm
                                  text-slate-200
                                  transition
                                  hover:border-cyan-400/30
                                  hover:bg-slate-700
                                "
                              >
                                <Eye size={16} />
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openPasswordModal(
                                    student,
                                    "student"
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-cyan-400/20
                                  bg-cyan-500/10
                                  px-4
                                  py-2.5
                                  text-sm
                                  font-semibold
                                  text-cyan-400
                                  transition
                                  hover:bg-cyan-500/20
                                "
                              >
                                <KeyRound
                                  size={16}
                                />

                                Set Password
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          ) : (

            /* =================================================
               TUTORS
            ================================================= */

            <div className="p-4 md:p-5">
              {filteredTutors.length === 0 ? (
                <EmptyState
                  icon={School}
                  title="No tutor applications"
                  description={
                    search
                      ? "No tutors match your search."
                      : "New tutor applications will appear here."
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredTutors.map(
                    (tutor, index) => {
                      const status =
                        getTutorStatus(tutor);

                      const StatusIcon =
                        getStatusIcon(status);

                      return (
                        <motion.div
                          key={
                            tutor.reference ||
                            tutor.application_reference ||
                            tutor.id ||
                            index
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
                          className="
                            rounded-2xl
                            border
                            border-slate-800
                            bg-slate-900/70
                            p-4
                            transition
                            hover:border-violet-400/20
                            hover:bg-slate-900
                          "
                        >
                          <div
                            className="
                              flex
                              flex-col
                              gap-4
                              lg:flex-row
                              lg:items-center
                              lg:justify-between
                            "
                          >
                            <div
                              className="
                                flex
                                min-w-0
                                items-center
                                gap-4
                              "
                            >
                              <div
                                className="
                                  flex
                                  h-12
                                  w-12
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-violet-500/10
                                  text-violet-400
                                "
                              >
                                <School
                                  size={22}
                                />
                              </div>

                              <div className="min-w-0">
                                <div
                                  className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                  "
                                >
                                  <h3
                                    className="
                                      truncate
                                      font-semibold
                                    "
                                  >
                                    {getFullName(
                                      tutor
                                    )}
                                  </h3>

                                  <span
                                    className={`
                                      inline-flex
                                      items-center
                                      gap-1
                                      rounded-full
                                      border
                                      px-2
                                      py-0.5
                                      text-[10px]
                                      font-semibold
                                      uppercase
                                      ${getStatusClasses(
                                        status
                                      )}
                                    `}
                                  >
                                    <StatusIcon
                                      size={11}
                                    />

                                    {getStatusLabel(
                                      status
                                    )}
                                  </span>
                                </div>

                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-slate-400
                                  "
                                >
                                  {tutor.email ||
                                    "No email"}
                                </p>

                                <div
                                  className="
                                    mt-2
                                    flex
                                    flex-wrap
                                    gap-x-4
                                    gap-y-1
                                    text-xs
                                    text-slate-500
                                  "
                                >
                                  <span>
                                    {displayArray(
                                      tutor.subjects ||
                                      tutor.subject
                                    )}
                                  </span>

                                  <span>
                                    {tutor.reference ||
                                      tutor.application_reference ||
                                      "No reference"}
                                  </span>

                                  <span>
                                    {formatDate(
                                      tutor.created_at
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div
                              className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                              "
                            >
                              <button
                                onClick={() =>
                                  setSelectedUser({
                                    type: "tutor",
                                    user: tutor,
                                  })
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-slate-700
                                  bg-slate-800
                                  px-4
                                  py-2.5
                                  text-sm
                                  text-slate-200
                                  transition
                                  hover:border-violet-400/30
                                  hover:bg-slate-700
                                "
                              >
                                <Eye size={16} />
                                View
                              </button>

                              <button
                                onClick={() =>
                                  openPasswordModal(
                                    tutor,
                                    "tutor"
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-violet-400/20
                                  bg-violet-500/10
                                  px-4
                                  py-2.5
                                  text-sm
                                  font-semibold
                                  text-violet-400
                                  transition
                                  hover:bg-violet-500/20
                                "
                              >
                                <KeyRound
                                  size={16}
                                />

                                Set Password
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* QUICK MANAGEMENT */}

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-4
            md:grid-cols-3
          "
        >
          <QuickManagementCard
            icon={GraduationCap}
            title="Manage Students"
            description="View registered Academy students"
            onClick={() =>
              navigate(
                "/admin/users/students"
              )
            }
          />

          <QuickManagementCard
            icon={School}
            title="Manage Teachers"
            description="Manage active Academy tutors"
            onClick={() =>
              navigate(
                "/admin/users/teachers"
              )
            }
          />

          <QuickManagementCard
            icon={ShieldCheck}
            title="Manage Admins"
            description="Manage platform administrators"
            onClick={() =>
              navigate(
                "/admin/users/admins"
              )
            }
          />
        </div>
      </div>

      {/* USER DETAILS MODAL */}

      <AnimatePresence>
        {selectedUser && (
          <UserDetailsModal
            data={selectedUser}
            onClose={() =>
              setSelectedUser(null)
            }
            onPassword={() => {
              const user =
                selectedUser.user;

              const type =
                selectedUser.type;

              setSelectedUser(null);

              openPasswordModal(
                user,
                type
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* PASSWORD MODAL */}

      <AnimatePresence>
        {passwordModal && (
          <PasswordModal
            data={passwordModal}
            password={password}
            confirmPassword={confirmPassword}
            message={passwordMessage}
            saving={savingPassword}
            copied={copied}
            onPasswordChange={
              setPassword
            }
            onConfirmChange={
              setConfirmPassword
            }
            onGenerate={
              handleGeneratePassword
            }
            onCopy={copyPassword}
            onSave={savePassword}
            onClose={closePasswordModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div
      className="
        flex
        min-h-[280px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-slate-800
        bg-slate-900/30
        text-center
      "
    >
      <div
        className="
          mb-4
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-slate-800
          text-slate-500
        "
      >
        <Icon size={25} />
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p
        className="
          mt-1
          max-w-sm
          text-sm
          text-slate-500
        "
      >
        {description}
      </p>
    </div>
  );
};

/* =========================================================
   QUICK MANAGEMENT CARD
========================================================= */

const QuickManagementCard = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="
        group
        flex
        items-center
        justify-between
        rounded-2xl
        border
        border-slate-800
        bg-slate-900/70
        p-5
        text-left
        transition
        hover:-translate-y-1
        hover:border-cyan-400/20
        hover:bg-slate-900
      "
    >
      <div
        className="
          flex
          items-center
          gap-4
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-slate-800
            text-cyan-400
          "
        >
          <Icon size={21} />
        </div>

        <div>
          <h3 className="font-semibold">
            {title}
          </h3>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            {description}
          </p>
        </div>
      </div>

      <ArrowRight
        size={18}
        className="
          text-slate-600
          transition
          group-hover:translate-x-1
          group-hover:text-cyan-400
        "
      />
    </button>
  );
};

/* =========================================================
   PASSWORD MODAL
========================================================= */

const PasswordModal = ({
  data,
  password,
  confirmPassword,
  message,
  saving,
  copied,
  onPasswordChange,
  onConfirmChange,
  onGenerate,
  onCopy,
  onSave,
  onClose,
}) => {
  const {
    user,
    type,
  } = data;

  const isStudent =
    type === "student";

  const success =
    message &&
    message
      .toLowerCase()
      .includes("successfully");

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
      className="
        fixed
        inset-0
        z-[110]
        flex
        items-center
        justify-center
        bg-black/80
        p-4
        backdrop-blur-md
      "
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-slate-800
          bg-[#020617]
          p-6
          shadow-2xl
          shadow-black/50
        "
      >
        <div
          className="
            mb-6
            flex
            items-start
            justify-between
          "
        >
          <div>
            <div
              className="
                mb-3
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-cyan-500/10
              "
            >
              <KeyRound
                className="text-cyan-400"
                size={23}
              />
            </div>

            <h2
              className="
                text-xl
                font-bold
              "
            >
              Set Account Password
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-400
              "
            >
              {getFullName(user)}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-600
              "
            >
              {isStudent
                ? "Student account"
                : "Tutor account"}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="
              rounded-xl
              p-2
              text-slate-500
              transition
              hover:bg-slate-800
              hover:text-white
              disabled:opacity-50
            "
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">

          {/* PASSWORD */}

          <div>
            <div
              className="
                mb-2
                flex
                items-center
                justify-between
              "
            >
              <label
                className="
                  text-sm
                  font-medium
                  text-slate-300
                "
              >
                Password
              </label>

              <button
                type="button"
                onClick={onGenerate}
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-cyan-400
                  hover:text-cyan-300
                "
              >
                <Sparkles size={13} />
                Generate
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={password}
                onChange={(e) =>
                  onPasswordChange(
                    e.target.value
                  )
                }
                placeholder="Enter password"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900
                  px-4
                  py-3
                  pr-12
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-400/40
                "
              />

              <button
                type="button"
                onClick={onCopy}
                disabled={!password}
                className="
                  absolute
                  right-2
                  top-1/2
                  -translate-y-1/2
                  rounded-lg
                  p-2
                  text-slate-500
                  transition
                  hover:bg-slate-800
                  hover:text-cyan-400
                  disabled:opacity-30
                "
              >
                {copied ? (
                  <Check size={17} />
                ) : (
                  <Copy size={17} />
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-300
              "
            >
              Confirm Password
            </label>

            <input
              type="text"
              value={confirmPassword}
              onChange={(e) =>
                onConfirmChange(
                  e.target.value
                )
              }
              placeholder="Confirm password"
              className="
                w-full
                rounded-xl
                border
                border-slate-800
                bg-slate-900
                px-4
                py-3
                text-white
                outline-none
                placeholder:text-slate-600
                focus:border-cyan-400/40
              "
            />
          </div>

          {/* SECURITY INFO */}

          <div
            className="
              rounded-xl
              border
              border-cyan-400/10
              bg-cyan-500/5
              p-3
            "
          >
            <div className="flex gap-2">
              <LockKeyhole
                size={16}
                className="
                  mt-0.5
                  shrink-0
                  text-cyan-400
                "
              />

              <p
                className="
                  text-xs
                  leading-5
                  text-slate-400
                "
              >
                The password will be securely
                stored by the server. Send the
                login credentials to the user
                through a secure channel.
              </p>
            </div>
          </div>

          {/* MESSAGE */}

          {message && (
            <div
              className={`
                rounded-xl
                border
                p-3
                text-sm
                ${
                  success
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/20 bg-red-500/10 text-red-400"
                }
              `}
            >
              {message}
            </div>
          )}

          {/* SAVE */}

          <button
            onClick={onSave}
            disabled={saving}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              px-4
              py-3
              font-semibold
              text-white
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Shield size={18} />

                Save Password
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* =========================================================
   USER DETAILS MODAL
========================================================= */

const UserDetailsModal = ({
  data,
  onClose,
  onPassword,
}) => {
  const {
    type,
    user,
  } = data;

  const isStudent =
    type === "student";

  const status = isStudent
    ? (
        user.enrollment_status ||
        "pending"
      )
    : (
        user.application_status ||
        "pending"
      );

  const StatusIcon =
    getStatusIcon(status);

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
      className="
        fixed
        inset-0
        z-[90]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/80
        p-4
        backdrop-blur-md
      "
      onClick={onClose}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          my-8
          w-full
          max-w-3xl
          rounded-3xl
          border
          border-slate-800
          bg-[#020617]
          shadow-2xl
          shadow-black/50
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-slate-800
            p-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className={`
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                ${
                  isStudent
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "bg-violet-500/10 text-violet-400"
                }
              `}
            >
              {isStudent ? (
                <GraduationCap
                  size={26}
                />
              ) : (
                <School size={26} />
              )}
            </div>

            <div>
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <h2
                  className="
                    text-xl
                    font-bold
                  "
                >
                  {getFullName(user)}
                </h2>

                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    border
                    px-2
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    ${getStatusClasses(
                      status
                    )}
                  `}
                >
                  <StatusIcon size={11} />

                  {getStatusLabel(status)}
                </span>
              </div>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                {isStudent
                  ? "Student Enrollment"
                  : "Tutor Application"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-xl
              p-2
              text-slate-500
              hover:bg-slate-800
              hover:text-white
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}

        <div
          className="
            max-h-[65vh]
            overflow-y-auto
            p-6
          "
        >
          {/* STATUS */}

          <div
            className="
              mb-5
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/50
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  ${
                    isVerifiedStatus(status)
                      ? "bg-emerald-500/10"
                      : "bg-amber-500/10"
                  }
                `}
              >
                <StatusIcon
                  size={20}
                  className={
                    isVerifiedStatus(status)
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                >
                  Status
                </p>

                <p
                  className={`
                    mt-1
                    text-sm
                    font-semibold
                    ${
                      isVerifiedStatus(status)
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }
                  `}
                >
                  {getStatusLabel(status)}
                </p>
              </div>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >
            <InfoItem
              icon={Mail}
              label="Email"
              value={user.email}
            />

            <InfoItem
              icon={Phone}
              label={
                isStudent
                  ? "Student Phone"
                  : "Phone"
              }
              value={
                user.student_phone ||
                user.phone ||
                user.tutor_phone
              }
            />

            {isStudent ? (
              <>
                <InfoItem
                  icon={BookOpen}
                  label="School Level"
                  value={
                    user.school_level
                  }
                />

                <InfoItem
                  icon={GraduationCap}
                  label="Class"
                  value={user.grade}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Academic Session"
                  value={
                    user.academic_session
                  }
                />

                <InfoItem
                  icon={UserRound}
                  label="Gender"
                  value={user.gender}
                />

                <InfoItem
                  icon={UserRound}
                  label="Guardian"
                  value={[
                    user.guardian_first_name,
                    user.guardian_last_name,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />

                <InfoItem
                  icon={Phone}
                  label="Guardian Phone"
                  value={
                    user.guardian_phone
                  }
                />

                <InfoItem
                  icon={UserRound}
                  label="Relationship"
                  value={
                    user.guardian_relationship
                  }
                />

                <InfoItem
                  icon={Mail}
                  label="Guardian Email"
                  value={
                    user.guardian_email
                  }
                />

                <InfoItem
                  icon={CreditCard}
                  label="Payment Status"
                  value={
                    user.payment_status
                  }
                />

                <InfoItem
                  icon={ShieldCheck}
                  label="Enrollment Status"
                  value={
                    user.enrollment_status
                  }
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Date Registered"
                  value={formatDate(
                    user.created_at
                  )}
                />

                <InfoItem
                  icon={KeyRound}
                  label="Enrollment ID"
                  value={
                    user.enrollment_id ||
                    user.id
                  }
                />

                <div
                  className="
                    md:col-span-2
                  "
                >
                  <div
                    className="
                      rounded-2xl
                      border
                      border-slate-800
                      bg-slate-900/60
                      p-4
                    "
                  >
                    <p
                      className="
                        mb-3
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      Selected Subjects
                    </p>

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                      "
                    >
                      {parseArray(
                        user.subjects
                      ).length > 0 ? (
                        parseArray(
                          user.subjects
                        ).map(
                          (
                            subject,
                            index
                          ) => (
                            <span
                              key={index}
                              className="
                                rounded-lg
                                border
                                border-cyan-400/10
                                bg-cyan-500/10
                                px-3
                                py-1.5
                                text-xs
                                text-cyan-300
                              "
                            >
                              {subject}
                            </span>
                          )
                        )
                      ) : (
                        <span
                          className="
                            text-sm
                            text-slate-500
                          "
                        >
                          No subjects recorded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <InfoItem
                  icon={BookOpen}
                  label="Subjects"
                  value={displayArray(
                    user.subjects ||
                    user.subject
                  )}
                />

                <InfoItem
                  icon={ShieldCheck}
                  label="Application Status"
                  value={
                    user.application_status ||
                    user.status
                  }
                />

                <InfoItem
                  icon={GraduationCap}
                  label="Qualification"
                  value={
                    user.qualification ||
                    user.highest_qualification
                  }
                />

                <InfoItem
                  icon={Clock3}
                  label="Experience"
                  value={
                    user.experience ||
                    user.years_of_experience
                  }
                />

                <InfoItem
                  icon={UserRound}
                  label="Gender"
                  value={user.gender}
                />

                <InfoItem
                  icon={MapPin}
                  label="Location"
                  value={[
                    user.city,
                    user.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />

                <InfoItem
                  icon={School}
                  label="Institution"
                  value={user.institution}
                />

                <InfoItem
                  icon={BookOpen}
                  label="Specialization"
                  value={
                    user.specialization
                  }
                />

                <InfoItem
                  icon={KeyRound}
                  label="Reference"
                  value={
                    user.reference ||
                    user.application_reference
                  }
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Applied"
                  value={formatDate(
                    user.created_at
                  )}
                />

                <div
                  className="
                    md:col-span-2
                  "
                >
                  <div
                    className="
                      rounded-2xl
                      border
                      border-slate-800
                      bg-slate-900/60
                      p-4
                    "
                  >
                    <p
                      className="
                        mb-2
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      Teaching Classes
                    </p>

                    <p
                      className="
                        text-sm
                        text-slate-300
                      "
                    >
                      {displayArray(
                        user.classes ||
                        user.levels
                      )}
                    </p>
                  </div>
                </div>

                {user.bio && (
                  <div
                    className="
                      md:col-span-2
                    "
                  >
                    <div
                      className="
                        rounded-2xl
                        border
                        border-slate-800
                        bg-slate-900/60
                        p-4
                      "
                    >
                      <p
                        className="
                          mb-2
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-slate-500
                        "
                      >
                        Tutor Information
                      </p>

                      <p
                        className="
                          whitespace-pre-wrap
                          text-sm
                          leading-6
                          text-slate-300
                        "
                      >
                        {typeof user.bio ===
                        "string"
                          ? user.bio
                          : JSON.stringify(
                              user.bio,
                              null,
                              2
                            )}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-slate-800
            p-6
            sm:flex-row
            sm:justify-end
          "
        >
          <button
            onClick={onClose}
            className="
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              px-5
              py-3
              text-sm
              text-slate-300
              hover:bg-slate-800
            "
          >
            Close
          </button>

          <button
            onClick={onPassword}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:opacity-90
            "
          >
            <KeyRound size={17} />

            Set Password
          </button>
        </div>
      </motion.div>
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
    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900/50
        p-4
      "
    >
      <div
        className="
          mb-2
          flex
          items-center
          gap-2
        "
      >
        <Icon
          size={15}
          className="text-slate-500"
        />

        <span
          className="
            text-xs
            text-slate-500
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          break-words
          text-sm
          font-medium
          text-slate-200
        "
      >
        {value || "—"}
      </p>
    </div>
  );
};

export default UsersDashboard;