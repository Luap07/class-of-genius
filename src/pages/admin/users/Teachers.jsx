import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  RefreshCw,
  Users,
  Clock,
  Mail,
  Phone,
  BookOpen,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  Loader2,
  X,
  UserRound,
  GraduationCap,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const TUTORS_URL = `${API_URL}/api/academy/admin/tutors`;

/* =========================================================
   HELPERS
========================================================= */

const clean = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const normalize = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ");

const getTutorName = (tutor) => {
  const fullName = [
    tutor.first_name || tutor.firstName,
    tutor.middle_name || tutor.middleName,
    tutor.last_name || tutor.lastName,
  ]
    .map(clean)
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    clean(tutor.name) ||
    clean(tutor.tutor_name) ||
    "Unnamed Tutor"
  );
};

const getTutorReference = (tutor) => {
  return (
    clean(tutor.reference) ||
    clean(tutor.application_reference) ||
    clean(tutor.tutor_application_reference) ||
    clean(tutor.reference_id) ||
    clean(tutor.id)
  );
};

const getTutorEmail = (tutor) => {
  return clean(tutor.email) || "No email";
};

const getTutorPhone = (tutor) => {
  return (
    clean(tutor.phone) ||
    clean(tutor.tutor_phone) ||
    clean(tutor.phone_number) ||
    "—"
  );
};

/* =========================================================
   SUBJECT HELPER

   Handles:
   - subjects as array
   - subjects as JSON string
   - subjects as comma-separated string
   - subject
   - teaching_subject
   - specialization
========================================================= */

const getTutorSubjects = (tutor) => {
  let value =
    tutor.subjects ??
    tutor.subject ??
    tutor.teaching_subject ??
    tutor.specialization ??
    "";

  if (Array.isArray(value)) {
    return value
      .map(clean)
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const text = value.trim();

    if (!text) return [];

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed
          .map(clean)
          .filter(Boolean);
      }

      if (typeof parsed === "string") {
        return [clean(parsed)].filter(Boolean);
      }
    } catch {
      // Not JSON. Continue below.
    }

    return text
      .split(",")
      .map((item) => clean(item))
      .filter(Boolean);
  }

  return value ? [clean(value)] : [];
};

const getTutorSubject = (tutor) => {
  const subjects = getTutorSubjects(tutor);

  return subjects.length
    ? subjects.join(", ")
    : "Not specified";
};

/* =========================================================
   STATUS

   IMPORTANT:
   Backend only allows:

   pending -> verified

   No rejected/active/inactive logic here.
========================================================= */

const getTutorStatus = (tutor) => {
  return (
    clean(tutor.application_status) ||
    clean(tutor.status) ||
    clean(tutor.verification_status) ||
    "pending"
  );
};

const isTutorVerified = (tutor) => {
  return normalize(getTutorStatus(tutor)) === "verified";
};

const isTutorPending = (tutor) => {
  return normalize(getTutorStatus(tutor)) === "pending";
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return clean(value) || "—";
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
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
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (tutor) => {
  const name = getTutorName(tutor);

  const parts = name
    .split(" ")
    .filter(Boolean);

  if (!parts.length) return "TU";

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
};

/* =========================================================
   STATUS META
========================================================= */

const getStatusMeta = (status) => {
  const normalized = normalize(status);

  if (normalized === "verified") {
    return {
      label: "Verified",
      icon: CheckCircle,
      className:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    };
  }

  return {
    label: "Pending",
    icon: Clock,
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
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
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400">
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
   TUTOR DETAILS MODAL
========================================================= */

function TutorDetailsModal({
  tutor,
  onClose,
}) {
  if (!tutor) return null;

  const name = getTutorName(tutor);
  const reference = getTutorReference(tutor);
  const subjects = getTutorSubjects(tutor);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (
            event.target === event.currentTarget
          ) {
            onClose();
          }
        }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
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
          className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080d1a] shadow-2xl shadow-black/50"
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#080d1a]/95 px-6 py-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-lg font-bold text-violet-300">
                  {getInitials(tutor)}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-white">
                    {name}
                  </h2>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    Application Reference:{" "}
                    <span className="font-mono text-slate-300">
                      {reference || "—"}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* =================================================
                STATUS
            ================================================= */}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">
                  Application Status
                </p>

                <StatusBadge
                  status={getTutorStatus(tutor)}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">
                  Application Reference
                </p>

                <p className="font-mono text-sm font-medium text-slate-200">
                  {reference || "—"}
                </p>
              </div>
            </div>

            {/* =================================================
                TUTOR INFORMATION
            ================================================= */}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <UserRound
                  size={16}
                  className="text-violet-300"
                />

                <h3 className="text-sm font-semibold text-white">
                  Tutor Information
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={getTutorEmail(tutor)}
                />

                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={getTutorPhone(tutor)}
                />

                <InfoItem
                  icon={BookOpen}
                  label="Teaching Subjects"
                  value={
                    subjects.length
                      ? subjects.join(", ")
                      : "Not specified"
                  }
                />

                <InfoItem
                  icon={GraduationCap}
                  label="Qualification"
                  value={
                    tutor.qualification ||
                    tutor.qualifications ||
                    tutor.education
                  }
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Applied"
                  value={formatDateTime(
                    tutor.created_at
                  )}
                />

                <InfoItem
                  icon={ShieldCheck}
                  label="Application Status"
                  value={getTutorStatus(tutor)}
                />
              </div>
            </section>

            {/* =================================================
                ADDITIONAL INFORMATION
            ================================================= */}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-cyan-300"
                />

                <h3 className="text-sm font-semibold text-white">
                  Application Details
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={UserRound}
                  label="Gender"
                  value={tutor.gender}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Date of Birth"
                  value={tutor.date_of_birth}
                />

                <InfoItem
                  icon={GraduationCap}
                  label="Experience"
                  value={
                    tutor.experience ||
                    tutor.years_of_experience
                  }
                />

                <InfoItem
                  icon={BookOpen}
                  label="Specialization"
                  value={
                    tutor.specialization ||
                    tutor.specializations
                  }
                />

                <InfoItem
                  icon={ShieldCheck}
                  label="Account Status"
                  value={tutor.account_status}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Updated"
                  value={formatDateTime(
                    tutor.updated_at
                  )}
                />
              </div>
            </section>

            {/* =================================================
                CLASSES
            ================================================= */}

            {(tutor.classes ||
              tutor.levels) && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <GraduationCap
                    size={16}
                    className="text-blue-300"
                  />

                  <h3 className="text-sm font-semibold text-white">
                    Classes / Levels
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm leading-6 text-slate-400">
                    {Array.isArray(
                      tutor.classes ||
                        tutor.levels
                    )
                      ? (
                          tutor.classes ||
                          tutor.levels
                        ).join(", ")
                      : clean(
                          tutor.classes ||
                            tutor.levels
                        )}
                  </p>
                </div>
              </section>
            )}

            {/* =================================================
                BIO / APPLICATION MESSAGE
            ================================================= */}

            {(tutor.message ||
              tutor.bio ||
              tutor.about ||
              tutor.cover_letter) && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen
                    size={16}
                    className="text-blue-300"
                  />

                  <h3 className="text-sm font-semibold text-white">
                    Application Message
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {tutor.message ||
                      tutor.bio ||
                      tutor.about ||
                      tutor.cover_letter}
                  </p>
                </div>
              </section>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1020]/80 p-5 backdrop-blur-xl"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Teachers() {
  const [teachers, setTeachers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [verifyingReference, setVerifyingReference] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [subject, setSubject] =
    useState("All");

  const [selectedTutor, setSelectedTutor] =
    useState(null);

  /* =======================================================
     FETCH LIVE TUTORS
  ======================================================= */

  const fetchTeachers = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          TUTORS_URL,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (!response.ok) {
          let message = `Failed to load tutors (${response.status})`;

          if (
            contentType.includes(
              "application/json"
            )
          ) {
            const data =
              await response.json();

            message =
              data?.message ||
              data?.error ||
              message;
          } else {
            const text =
              await response.text();

            if (text) {
              message = text.slice(
                0,
                300
              );
            }
          }

          throw new Error(message);
        }

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "The server returned a non-JSON response. Check that your Academy backend is running and that /api/academy/admin/tutors exists."
          );
        }

        const data =
          await response.json();

        const tutorList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.tutors
              )
            ? data.tutors
            : Array.isArray(
                data?.applications
              )
            ? data.applications
            : Array.isArray(
                data?.data
              )
            ? data.data
            : [];

        setTeachers(tutorList);
      } catch (err) {
        console.error(
          "Tutor fetch error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load tutor applications. Please try again."
        );

        setTeachers([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =======================================================
     LOAD WHEN PAGE OPENS
  ======================================================= */

  useEffect(() => {
    fetchTeachers(false);
  }, [fetchTeachers]);

  /* =======================================================
     SUBJECT OPTIONS FROM REAL DATABASE
  ======================================================= */

  const subjects = useMemo(() => {
    const values = new Set();

    teachers.forEach((teacher) => {
      const tutorSubjects =
        getTutorSubjects(teacher);

      tutorSubjects.forEach(
        (item) => {
          const value = clean(item);

          if (value) {
            values.add(value);
          }
        }
      );
    });

    return [
      "All",
      ...Array.from(values).sort(
        (a, b) =>
          a.localeCompare(b)
      ),
    ];
  }, [teachers]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredTeachers = useMemo(() => {
    const query =
      normalize(search);

    return teachers.filter(
      (teacher) => {
        const name =
          normalize(
            getTutorName(
              teacher
            )
          );

        const email =
          normalize(
            getTutorEmail(
              teacher
            )
          );

        const phone =
          normalize(
            getTutorPhone(
              teacher
            )
          );

        const reference =
          normalize(
            getTutorReference(
              teacher
            )
          );

        const tutorSubject =
          normalize(
            getTutorSubject(
              teacher
            )
          );

        const tutorStatus =
          normalize(
            getTutorStatus(
              teacher
            )
          );

        const searchMatch =
          !query ||
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          reference.includes(query) ||
          tutorSubject.includes(query) ||
          tutorStatus.includes(query);

        const subjectMatch =
          subject === "All" ||
          getTutorSubjects(
            teacher
          ).some(
            (item) =>
              normalize(
                item
              ) ===
              normalize(
                subject
              )
          );

        return (
          searchMatch &&
          subjectMatch
        );
      }
    );
  }, [
    teachers,
    search,
    subject,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    let verified = 0;
    let pending = 0;

    teachers.forEach(
      (teacher) => {
        const status =
          normalize(
            getTutorStatus(
              teacher
            )
          );

        if (
          status ===
          "verified"
        ) {
          verified++;
        } else {
          pending++;
        }
      }
    );

    return {
      total: teachers.length,
      verified,
      pending,
    };
  }, [teachers]);

  /* =======================================================
     VERIFY TUTOR

     IMPORTANT:

     This is the ONLY status operation.

     Backend:
     PATCH
     /api/academy/admin/tutor/:reference/status

     Body:
     {
       status: "verified"
     }

     Backend only updates:
     application_status
  ======================================================= */

  const verifyTutor = async (
    tutor
  ) => {
    const reference =
      getTutorReference(
        tutor
      );

    if (!reference) {
      setError(
        "This tutor does not have an application reference."
      );

      return;
    }

    if (
      isTutorVerified(
        tutor
      )
    ) {
      setSuccess(
        "This tutor is already verified."
      );

      return;
    }

    if (
      !isTutorPending(
        tutor
      )
    ) {
      setError(
        "Only pending tutor applications can be verified."
      );

      return;
    }

    try {
      setError("");
      setSuccess("");

      setVerifyingReference(
        reference
      );

      const response =
        await fetch(
          `${API_URL}/api/academy/admin/tutor/${encodeURIComponent(
            reference
          )}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body: JSON.stringify(
              {
                status:
                  "verified",
              }
            ),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data = {};

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

        if (text) {
          data = {
            message: text,
          };
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to verify tutor (${response.status})`
        );
      }

      /*
       * Update only the status in local UI.
       *
       * No account_status.
       * No email_verified.
       * No password.
       * No other field.
       */

      setTeachers(
        (prev) =>
          prev.map(
            (item) => {
              const itemReference =
                getTutorReference(
                  item
                );

              if (
                itemReference !==
                reference
              ) {
                return item;
              }

              return {
                ...item,
                application_status:
                  "verified",
              };
            }
          )
      );

      /* Keep modal synchronized */
      setSelectedTutor(
        (current) => {
          if (!current) {
            return current;
          }

          if (
            getTutorReference(
              current
            ) !== reference
          ) {
            return current;
          }

          return {
            ...current,
            application_status:
              "verified",
          };
        }
      );

      setSuccess(
        `${getTutorName(
          tutor
        )} has been verified successfully.`
      );

      /*
       * Fetch the actual database state
       * after a successful update.
       */
      await fetchTeachers(true);
    } catch (err) {
      console.error(
        "Tutor verification error:",
        err
      );

      setError(
        err?.message ||
          "Unable to verify tutor."
      );
    } finally {
      setVerifyingReference("");
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(#94a3b8 1px, transparent 1px)",
            backgroundSize:
              "24px 24px",
          }}
        />

        <div className="absolute left-[10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[130px]" />

        <div className="absolute bottom-[-10%] right-[5%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] p-5 sm:p-7 lg:p-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-3 py-1.5 text-[11px] font-medium text-violet-300">
              <Users size={13} />

              Academy Tutor Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Manage Tutors
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              View Academy tutor
              applications and verify
              pending tutors.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchTeachers(true)
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <RefreshCw
                size={17}
              />
            )}

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

        <AnimatePresence>
          {success && (
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
              className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-300"
                />

                <div>
                  <p className="text-sm font-medium text-emerald-200">
                    Tutor verified
                  </p>

                  <p className="mt-1 text-xs text-emerald-300/70">
                    {success}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
                className="text-emerald-300/60 transition hover:text-emerald-200"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            ERROR
        ================================================= */}

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
              className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-300"
                />

                <div>
                  <p className="text-sm font-medium text-red-200">
                    Tutor management error
                  </p>

                  <p className="mt-1 text-xs text-red-300/70">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchTeachers(true)
                }
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

        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Users}
            label="Total Tutors"
            value={stats.total}
            description="Real applications"
          />

          <StatCard
            icon={CheckCircle}
            label="Verified"
            value={stats.verified}
            description="Approved tutors"
          />

          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            description="Awaiting verification"
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
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search tutors by name, email, phone, subject or reference..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40 focus:bg-white/[0.05]"
              />
            </div>

            {/* Subject */}

            <div className="relative">
              <select
                value={subject}
                onChange={(event) =>
                  setSubject(
                    event.target.value
                  )
                }
                className="h-11 min-w-[190px] appearance-none rounded-xl border border-white/10 bg-white/[0.035] px-4 pr-10 text-sm text-slate-300 outline-none focus:border-violet-400/40"
              >
                {subjects.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-[#080d1a]"
                    >
                      {item === "All"
                        ? "All Subjects"
                        : item}
                    </option>
                  )
                )}
              </select>

              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {!loading && (
            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-300">
                  {
                    filteredTeachers.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-300">
                  {teachers.length}
                </span>{" "}
                tutor applications
              </p>

              {(search ||
                subject !==
                  "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSubject(
                      "All"
                    );
                  }}
                  className="text-xs font-medium text-violet-300 hover:text-violet-200"
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
          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/5">
                <Loader2
                  size={24}
                  className="animate-spin text-violet-300"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-300">
                Loading tutor
                applications...
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Fetching the latest
                Academy tutor records
              </p>
            </div>
          ) : filteredTeachers.length ===
            0 ? (
            /* =================================================
                EMPTY
            ================================================= */

            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-600">
                {teachers.length ===
                0 ? (
                  <Users
                    size={28}
                  />
                ) : (
                  <Search
                    size={28}
                  />
                )}
              </div>

              <h3 className="mt-5 text-sm font-semibold text-white">
                {teachers.length ===
                0
                  ? "No tutor applications yet"
                  : "No tutors found"}
              </h3>

              <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                {teachers.length ===
                0
                  ? "Tutors who submit the Academy tutor application will appear here automatically."
                  : "Try changing your search or subject filter."}
              </p>

              {teachers.length ===
                0 && (
                <button
                  type="button"
                  onClick={() =>
                    fetchTeachers(
                      true
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-2.5 text-xs font-medium text-violet-300 transition hover:bg-violet-400/15"
                >
                  <RefreshCw
                    size={14}
                  />

                  Check Again
                </button>
              )}
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP
              ================================================= */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Tutor
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Subject
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Reference
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Verification
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Applied
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTeachers.map(
                      (
                        teacher,
                        index
                      ) => {
                        const name =
                          getTutorName(
                            teacher
                          );

                        const reference =
                          getTutorReference(
                            teacher
                          );

                        const verified =
                          isTutorVerified(
                            teacher
                          );

                        const pending =
                          isTutorPending(
                            teacher
                          );

                        const verifying =
                          verifyingReference ===
                          reference;

                        return (
                          <motion.tr
                            key={
                              reference ||
                              teacher.id ||
                              `${name}-${index}`
                            }
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                            transition={{
                              delay: Math.min(
                                index *
                                  0.025,
                                0.25
                              ),
                            }}
                            className="border-b border-white/5 transition hover:bg-white/[0.025]"
                          >
                            {/* Tutor */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-gradient-to-br from-violet-400/10 to-blue-500/10 text-xs font-bold text-violet-300">
                                  {getInitials(
                                    teacher
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white">
                                    {name}
                                  </p>

                                  <div className="mt-1 flex items-center gap-1.5">
                                    <Mail
                                      size={
                                        11
                                      }
                                      className="text-slate-600"
                                    />

                                    <p className="max-w-[230px] truncate text-xs text-slate-500">
                                      {getTutorEmail(
                                        teacher
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Subject */}

                            <td className="px-5 py-4">
                              <div className="flex items-start gap-2">
                                <BookOpen
                                  size={
                                    14
                                  }
                                  className="mt-0.5 shrink-0 text-violet-400/70"
                                />

                                <span className="max-w-[240px] text-sm text-slate-300">
                                  {getTutorSubject(
                                    teacher
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* Reference */}

                            <td className="px-5 py-4">
                              <span className="font-mono text-xs text-slate-400">
                                {reference ||
                                  "—"}
                              </span>
                            </td>

                            {/* Verification */}

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={getTutorStatus(
                                  teacher
                                )}
                              />
                            </td>

                            {/* Applied */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <CalendarDays
                                  size={
                                    13
                                  }
                                  className="text-slate-600"
                                />

                                <span className="text-xs text-slate-400">
                                  {formatDate(
                                    teacher.created_at
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                {/* View */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedTutor(
                                      teacher
                                    )
                                  }
                                  title="View tutor"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/5 hover:text-cyan-300"
                                >
                                  <Eye
                                    size={
                                      15
                                    }
                                  />
                                </button>

                                {/* Verify */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    verifyTutor(
                                      teacher
                                    )
                                  }
                                  disabled={
                                    verified ||
                                    !pending ||
                                    verifying
                                  }
                                  title={
                                    verified
                                      ? "Tutor already verified"
                                      : pending
                                      ? "Verify tutor"
                                      : "Only pending tutors can be verified"
                                  }
                                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                                    verified
                                      ? "cursor-not-allowed border-emerald-400/10 bg-emerald-400/5 text-emerald-300/50"
                                      : "border-emerald-400/10 bg-emerald-400/5 text-emerald-300 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                                  }`}
                                >
                                  {verifying ? (
                                    <Loader2
                                      size={
                                        15
                                      }
                                      className="animate-spin"
                                    />
                                  ) : verified ? (
                                    <Check
                                      size={
                                        15
                                      }
                                    />
                                  ) : (
                                    <CheckCircle
                                      size={
                                        15
                                      }
                                    />
                                  )}
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE
              ================================================= */}

              <div className="divide-y divide-white/5 md:hidden">
                {filteredTeachers.map(
                  (
                    teacher,
                    index
                  ) => {
                    const name =
                      getTutorName(
                        teacher
                      );

                    const reference =
                      getTutorReference(
                        teacher
                      );

                    const verified =
                      isTutorVerified(
                        teacher
                      );

                    const pending =
                      isTutorPending(
                        teacher
                      );

                    const verifying =
                      verifyingReference ===
                      reference;

                    return (
                      <motion.div
                        key={
                          reference ||
                          teacher.id ||
                          `${name}-${index}`
                        }
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-400/5 text-xs font-bold text-violet-300">
                            {getInitials(
                              teacher
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-white">
                                  {name}
                                </h3>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {getTutorEmail(
                                    teacher
                                  )}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedTutor(
                                    teacher
                                  )
                                }
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-cyan-300"
                              >
                                <Eye
                                  size={
                                    14
                                  }
                                />
                              </button>
                            </div>

                            {/* Subject */}

                            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                              <p className="text-[9px] uppercase tracking-wider text-slate-600">
                                Subjects
                              </p>

                              <p className="mt-1 text-xs font-medium leading-5 text-slate-300">
                                {getTutorSubject(
                                  teacher
                                )}
                              </p>
                            </div>

                            {/* Reference */}

                            <div className="mt-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                              <p className="text-[9px] uppercase tracking-wider text-slate-600">
                                Reference
                              </p>

                              <p className="mt-1 font-mono text-xs font-medium text-slate-300">
                                {reference ||
                                  "—"}
                              </p>
                            </div>

                            {/* Applied */}

                            <div className="mt-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                              <p className="text-[9px] uppercase tracking-wider text-slate-600">
                                Applied
                              </p>

                              <p className="mt-1 text-xs font-medium text-slate-300">
                                {formatDate(
                                  teacher.created_at
                                )}
                              </p>
                            </div>

                            {/* Status */}

                            <div className="mt-3">
                              <StatusBadge
                                status={getTutorStatus(
                                  teacher
                                )}
                              />
                            </div>

                            {/* Verify */}

                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={() =>
                                  verifyTutor(
                                    teacher
                                  )
                                }
                                disabled={
                                  verified ||
                                  !pending ||
                                  verifying
                                }
                                className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition ${
                                  verified
                                    ? "cursor-not-allowed border-emerald-400/10 bg-emerald-400/5 text-emerald-300/50"
                                    : "border-emerald-400/10 bg-emerald-400/5 text-emerald-300 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                                }`}
                              >
                                {verifying ? (
                                  <>
                                    <Loader2
                                      size={
                                        14
                                      }
                                      className="animate-spin"
                                    />

                                    Verifying...
                                  </>
                                ) : verified ? (
                                  <>
                                    <Check
                                      size={
                                        14
                                      }
                                    />

                                    Verified
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle
                                      size={
                                        14
                                      }
                                    />

                                    Verify Tutor
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>

        {/* =================================================
            BOTTOM
        ================================================= */}

        {!loading &&
          teachers.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Live Academy tutor
                applications
              </p>

              <p>
                Last loaded:{" "}
                {new Date().toLocaleTimeString(
                  "en-NG"
                )}
              </p>
            </div>
          )}
      </div>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedTutor && (
        <TutorDetailsModal
          tutor={selectedTutor}
          onClose={() =>
            setSelectedTutor(null)
          }
        />
      )}
    </div>
  );
}