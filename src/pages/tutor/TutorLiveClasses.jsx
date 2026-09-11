import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Square,
  Trash2,
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
   HELPERS
========================================================= */

const getStoredTutor = () => {
  const keys = [
    "tutorReference",
    "tutor",
    "academyTutor",
    "scholiqen_user",
  ];

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);

      if (!value) continue;

      const parsed = JSON.parse(value);

      if (parsed && typeof parsed === "object") {
        return parsed;
      }

      return {
        reference: value,
      };
    } catch {
      const value = localStorage.getItem(key);

      if (value) {
        return {
          reference: value,
        };
      }
    }
  }

  return null;
};

const getTutorReference = () => {
  const tutor = getStoredTutor();

  if (!tutor) return "";

  return (
    tutor.tutorReference ||
    tutor.reference ||
    tutor.tutor_reference ||
    tutor.applicationReference ||
    tutor.application_reference ||
    tutor.id ||
    ""
  );
};

const getTutorName = () => {
  const tutor = getStoredTutor();

  if (!tutor) return "Tutor";

  return (
    tutor.name ||
    tutor.full_name ||
    tutor.fullName ||
    tutor.tutorName ||
    "Tutor"
  );
};

const normaliseClass = (item) => {
  if (!item) return null;

  if (typeof item === "string") {
    return {
      id: item,
      name: item,
      subjects: [],
    };
  }

  const id =
    item.id ||
    item.class_id ||
    item.classId ||
    item.grade_id ||
    item.gradeId ||
    item.value ||
    item.name;

  const name =
    item.name ||
    item.class_name ||
    item.className ||
    item.grade ||
    item.grade_name ||
    item.gradeName ||
    item.title ||
    item.label ||
    String(id || "");

  const subjects =
    item.subjects ||
    item.assignedSubjects ||
    item.assigned_subjects ||
    item.subject_list ||
    [];

  return {
    ...item,
    id,
    name,
    subjects: Array.isArray(subjects) ? subjects : [],
  };
};

const normaliseSubject = (item) => {
  if (!item) return null;

  if (typeof item === "string") {
    return {
      id: item,
      name: item,
    };
  }

  const id =
    item.id ||
    item.subject_id ||
    item.subjectId ||
    item.value ||
    item.name;

  const name =
    item.name ||
    item.subject_name ||
    item.subjectName ||
    item.title ||
    item.label ||
    String(id || "");

  return {
    ...item,
    id,
    name,
  };
};

const extractArray = (data, keys = []) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  return [];
};

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const toDateTimeLocalValue = (date) => {
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
};

const getStatus = (session) => {
  const raw = String(
    session?.status ||
      session?.session_status ||
      session?.live_status ||
      session?.state ||
      ""
  ).toLowerCase();

  if (
    raw === "live" ||
    raw === "started" ||
    raw === "active" ||
    session?.is_live === true ||
    session?.isLive === true
  ) {
    return "live";
  }

  if (
    raw === "ended" ||
    raw === "completed" ||
    raw === "finished" ||
    session?.ended_at ||
    session?.endedAt
  ) {
    return "ended";
  }

  const scheduledTime =
    session?.scheduled_at ||
    session?.scheduledAt ||
    session?.start_time ||
    session?.startTime ||
    session?.starts_at ||
    session?.startsAt;

  if (scheduledTime) {
    const timestamp = new Date(scheduledTime).getTime();

    if (!Number.isNaN(timestamp) && timestamp <= Date.now()) {
      return "live";
    }
  }

  return "scheduled";
};

const getSessionId = (session) =>
  session?.id ||
  session?.session_id ||
  session?.sessionId ||
  session?.live_id ||
  session?.liveId ||
  "";

const getJoinUrl = (session) =>
  session?.join_url ||
  session?.joinUrl ||
  session?.meeting_url ||
  session?.meetingUrl ||
  session?.live_url ||
  session?.liveUrl ||
  session?.room_url ||
  session?.roomUrl ||
  session?.url ||
  "";

const getClassName = (session) =>
  session?.class_name ||
  session?.className ||
  session?.class ||
  session?.grade ||
  session?.grade_name ||
  session?.gradeName ||
  "Class";

const getSubjectName = (session) =>
  session?.subject_name ||
  session?.subjectName ||
  session?.subject ||
  "Subject";

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
        LIVE
      </span>
    );
  }

  if (status === "ended") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-400">
        <CheckCircle2 size={13} />
        ENDED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
      <Clock3 size={13} />
      SCHEDULED
    </span>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TutorLiveClasses() {
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [creating, setCreating] = useState(false);
  const [startingId, setStartingId] = useState("");
  const [endingId, setEndingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    classId: "",
    subject: "",
    scheduledAt: toDateTimeLocalValue(
      new Date(Date.now() + 30 * 60 * 1000)
    ),
  });

  const tutorReference = getTutorReference();
  const tutorName = getTutorName();

  /* =======================================================
     HEADERS
  ======================================================= */

  const getHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-tutor-reference": tutorReference,
    }),
    [tutorReference]
  );

  /* =======================================================
     FETCH CLASSES
  ======================================================= */

  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/academy/tutor/classes`,
        {
          method: "GET",
          credentials: "include",
          headers: getHeaders(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to load your assigned classes."
        );
      }

      const rawClasses = extractArray(data, [
        "classes",
        "assignedClasses",
        "assigned_classes",
        "data",
        "results",
      ]);

      const normalised = rawClasses
        .map(normaliseClass)
        .filter(Boolean);

      setClasses(normalised);

      if (!form.classId && normalised.length > 0) {
        setForm((current) => ({
          ...current,
          classId: String(normalised[0].id || ""),
        }));
      }
    } catch (err) {
      console.error("Fetch tutor classes error:", err);

      setError(
        err?.message ||
          "Unable to load your assigned classes."
      );
    } finally {
      setLoadingClasses(false);
    }
  }, [form.classId, getHeaders]);

  /* =======================================================
     FETCH LIVE SESSIONS
  ======================================================= */

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);

    try {
      /*
       * The frontend first tries the existing tutor live
       * endpoint. If the endpoint is not available yet,
       * the page remains usable and displays an empty state.
       */

      const endpoints = [
        "/api/academy/tutor/live",
        "/api/academy/tutor/live-classes",
        "/api/academy/tutor/live/classes",
      ];

      let loaded = false;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
              method: "GET",
              credentials: "include",
              headers: getHeaders(),
            }
          );

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            lastError = new Error(
              data?.message ||
                data?.error ||
                `Unable to load live classes (${response.status}).`
            );

            continue;
          }

          const rawSessions = extractArray(data, [
            "sessions",
            "liveClasses",
            "live_classes",
            "classes",
            "data",
            "results",
          ]);

          setSessions(rawSessions);
          loaded = true;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!loaded) {
        /*
         * Do not make the whole page unusable if the live
         * listing endpoint has not been added to the backend.
         */
        setSessions([]);

        console.warn(
          "No tutor live-session listing endpoint responded.",
          lastError
        );
      }
    } catch (err) {
      console.error("Fetch live sessions error:", err);
    } finally {
      setLoadingSessions(false);
    }
  }, [getHeaders]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchClasses();
    fetchSessions();
  }, [fetchClasses, fetchSessions]);

  /* =======================================================
     AUTO STATUS REFRESH
  ======================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setSessions((current) => [...current]);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  /* =======================================================
     SUBJECTS FOR SELECTED CLASS
  ======================================================= */

  const selectedClass = useMemo(
    () =>
      classes.find(
        (item) =>
          String(item.id) === String(form.classId)
      ),
    [classes, form.classId]
  );

  const availableSubjects = useMemo(() => {
    if (!selectedClass) return [];

    const subjects =
      selectedClass.subjects ||
      selectedClass.assignedSubjects ||
      selectedClass.assigned_subjects ||
      [];

    return subjects
      .map(normaliseSubject)
      .filter(Boolean);
  }, [selectedClass]);

  /* =======================================================
     FORM HANDLING
  ======================================================= */

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleClassChange = (value) => {
    const nextClass = classes.find(
      (item) => String(item.id) === String(value)
    );

    const subjects =
      nextClass?.subjects ||
      nextClass?.assignedSubjects ||
      nextClass?.assigned_subjects ||
      [];

    const firstSubject =
      subjects.length > 0
        ? normaliseSubject(subjects[0])
        : null;

    setForm((current) => ({
      ...current,
      classId: value,
      subject: firstSubject?.name || "",
    }));
  };

  /* =======================================================
     CREATE LIVE CLASS
  ======================================================= */

  const handleCreate = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!tutorReference) {
      setError(
        "Tutor reference was not found. Please log in again."
      );
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a live class title.");
      return;
    }

    if (!form.classId) {
      setError("Please select a class.");
      return;
    }

    if (!form.subject.trim()) {
      setError("Please select a subject.");
      return;
    }

    if (!form.scheduledAt) {
      setError("Please select the live class date and time.");
      return;
    }

    const selectedDate = new Date(form.scheduledAt);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.getTime() < Date.now()
    ) {
      setError(
        "The live class date and time must be in the future."
      );
      return;
    }

    setCreating(true);

    try {
      const payload = {
        tutorReference,
        tutor_reference: tutorReference,

        title: form.title.trim(),
        description: form.description.trim(),

        classId: form.classId,
        class_id: form.classId,

        subject: form.subject.trim(),
        subject_name: form.subject.trim(),

        scheduledAt: selectedDate.toISOString(),
        scheduled_at: selectedDate.toISOString(),
      };

      /*
       * Try the existing /live/start route first.
       * This allows the page to work with the Academy
       * live route already present in your backend.
       */
      const response = await fetch(
        `${API_BASE_URL}/api/academy/tutor/live/start`,
        {
          method: "POST",
          credentials: "include",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to create the live class."
        );
      }

      const createdSession =
        data?.session ||
        data?.liveClass ||
        data?.live_class ||
        data?.data ||
        data;

      if (createdSession && typeof createdSession === "object") {
        setSessions((current) => [
          createdSession,
          ...current,
        ]);
      }

      setSuccess(
        data?.message ||
          "Live class created successfully."
      );

      setForm({
        title: "",
        description: "",
        classId: classes[0]?.id
          ? String(classes[0].id)
          : "",
        subject: "",
        scheduledAt: toDateTimeLocalValue(
          new Date(Date.now() + 30 * 60 * 1000)
        ),
      });

      setShowCreateModal(false);

      await fetchSessions();
    } catch (err) {
      console.error("Create live class error:", err);

      setError(
        err?.message ||
          "Unable to create the live class."
      );
    } finally {
      setCreating(false);
    }
  };

  /* =======================================================
     START LIVE CLASS
  ======================================================= */

  const handleStart = async (session) => {
    const id = getSessionId(session);

    setError("");
    setSuccess("");

    if (!id) {
      setError("This live class has no valid session ID.");
      return;
    }

    setStartingId(id);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/academy/tutor/live/start`,
        {
          method: "POST",
          credentials: "include",
          headers: getHeaders(),
          body: JSON.stringify({
            sessionId: id,
            session_id: id,
            tutorReference,
            tutor_reference: tutorReference,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to start this live class."
        );
      }

      const updated =
        data?.session ||
        data?.liveClass ||
        data?.live_class ||
        data?.data;

      setSessions((current) =>
        current.map((item) => {
          if (
            String(getSessionId(item)) !==
            String(id)
          ) {
            return item;
          }

          return {
            ...item,
            ...(updated || {}),
            status: "live",
            session_status: "live",
            started_at:
              updated?.started_at ||
              new Date().toISOString(),
          };
        })
      );

      setSuccess(
        data?.message ||
          "Live class started successfully."
      );

      const joinUrl =
        getJoinUrl(updated) ||
        getJoinUrl(session) ||
        data?.joinUrl ||
        data?.join_url ||
        data?.url;

      if (joinUrl) {
        window.open(
          joinUrl,
          "_blank",
          "noopener,noreferrer"
        );
      }

      await fetchSessions();
    } catch (err) {
      console.error("Start live class error:", err);

      setError(
        err?.message ||
          "Unable to start this live class."
      );
    } finally {
      setStartingId("");
    }
  };

  /* =======================================================
     END LIVE CLASS
  ======================================================= */

  const handleEnd = async (session) => {
    const id = getSessionId(session);

    if (!id) {
      setError("This live class has no valid session ID.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to end this live class?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setEndingId(id);

    try {
      const endpoints = [
        `/api/academy/tutor/live/${id}/end`,
        `/api/academy/tutor/live/end`,
      ];

      let completed = false;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
              method: "POST",
              credentials: "include",
              headers: getHeaders(),
              body: JSON.stringify({
                sessionId: id,
                session_id: id,
                tutorReference,
                tutor_reference: tutorReference,
              }),
            }
          );

          const data = await response
            .json()
            .catch(() => ({}));

          if (!response.ok) {
            lastError = new Error(
              data?.message ||
                data?.error ||
                "Unable to end the live class."
            );

            continue;
          }

          completed = true;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!completed) {
        throw (
          lastError ||
          new Error(
            "Unable to end the live class."
          )
        );
      }

      setSessions((current) =>
        current.map((item) => {
          if (
            String(getSessionId(item)) !==
            String(id)
          ) {
            return item;
          }

          return {
            ...item,
            status: "ended",
            session_status: "ended",
            ended_at: new Date().toISOString(),
          };
        })
      );

      setSuccess("Live class ended successfully.");

      await fetchSessions();
    } catch (err) {
      console.error("End live class error:", err);

      setError(
        err?.message ||
          "Unable to end the live class."
      );
    } finally {
      setEndingId("");
    }
  };

  /* =======================================================
     DELETE / CANCEL
  ======================================================= */

  const handleDelete = async (session) => {
    const id = getSessionId(session);

    if (!id) {
      setError("This live class has no valid session ID.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this scheduled live class?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      const endpoints = [
        `/api/academy/tutor/live/${id}`,
        `/api/academy/tutor/live/delete`,
      ];

      let completed = false;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
              method: endpoint.endsWith(id)
                ? "DELETE"
                : "POST",
              credentials: "include",
              headers: getHeaders(),
              body: endpoint.endsWith(id)
                ? undefined
                : JSON.stringify({
                    sessionId: id,
                    session_id: id,
                    tutorReference,
                    tutor_reference: tutorReference,
                  }),
            }
          );

          const data = await response
            .json()
            .catch(() => ({}));

          if (!response.ok) {
            lastError = new Error(
              data?.message ||
                data?.error ||
                "Unable to delete the live class."
            );

            continue;
          }

          completed = true;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!completed) {
        throw (
          lastError ||
          new Error(
            "Unable to delete the live class."
          )
        );
      }

      setSessions((current) =>
        current.filter(
          (item) =>
            String(getSessionId(item)) !==
            String(id)
        )
      );

      setSuccess("Live class deleted successfully.");
    } catch (err) {
      console.error("Delete live class error:", err);

      setError(
        err?.message ||
          "Unable to delete the live class."
      );
    } finally {
      setDeletingId("");
    }
  };

  /* =======================================================
     JOIN
  ======================================================= */

  const handleJoin = (session) => {
    const joinUrl = getJoinUrl(session);

    if (!joinUrl) {
      setError(
        "A join link has not been generated for this live class yet."
      );
      return;
    }

    window.open(
      joinUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =======================================================
     COPY LINK
  ======================================================= */

  const handleCopyLink = async (session) => {
    const joinUrl = getJoinUrl(session);

    if (!joinUrl) {
      setError(
        "There is no live class link to copy."
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(joinUrl);

      setSuccess("Live class link copied.");
    } catch {
      setError(
        "Unable to copy the live class link."
      );
    }
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const status = getStatus(session);

      if (
        filter !== "all" &&
        status !== filter
      ) {
        return false;
      }

      if (!query) return true;

      const text = [
        session?.title,
        session?.description,
        getClassName(session),
        getSubjectName(session),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [sessions, search, filter]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    let live = 0;
    let scheduled = 0;
    let ended = 0;

    sessions.forEach((session) => {
      const status = getStatus(session);

      if (status === "live") live += 1;
      else if (status === "ended") ended += 1;
      else scheduled += 1;
    });

    return {
      all: sessions.length,
      live,
      scheduled,
      ended,
    };
  }, [sessions]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                <Radio
                  size={21}
                  className="text-cyan-300"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                  Academy
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Live Classes
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              Create and manage live lessons for your
              assigned classes and subjects.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                fetchClasses();
                fetchSessions();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#071426] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-[#0b1a30]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");

                if (classes.length === 0) {
                  fetchClasses();
                }

                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus size={18} />
              Create Live Class
            </button>
          </div>
        </div>

        {/* =================================================
            ALERTS
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
              className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <p className="flex-1 text-sm text-red-200">
                {error}
              </p>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-300 transition hover:text-white"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}

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
              className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4"
            >
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-emerald-400"
              />

              <p className="flex-1 text-sm text-emerald-200">
                {success}
              </p>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="text-emerald-300 transition hover:text-white"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "all"
                ? "border-cyan-400/30 bg-cyan-400/10"
                : "border-slate-800 bg-[#071426] hover:border-slate-700"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <Video
                size={19}
                className="text-cyan-300"
              />

              <span className="text-xs text-slate-500">
                TOTAL
              </span>
            </div>

            <p className="text-2xl font-bold text-white">
              {counts.all}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Live classes
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("live")}
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "live"
                ? "border-red-400/30 bg-red-400/10"
                : "border-slate-800 bg-[#071426] hover:border-slate-700"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <Radio
                size={19}
                className="text-red-300"
              />

              <span className="text-xs text-slate-500">
                NOW
              </span>
            </div>

            <p className="text-2xl font-bold text-white">
              {counts.live}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Currently live
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("scheduled")}
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "scheduled"
                ? "border-cyan-400/30 bg-cyan-400/10"
                : "border-slate-800 bg-[#071426] hover:border-slate-700"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <CalendarDays
                size={19}
                className="text-cyan-300"
              />

              <span className="text-xs text-slate-500">
                UPCOMING
              </span>
            </div>

            <p className="text-2xl font-bold text-white">
              {counts.scheduled}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Scheduled
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("ended")}
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "ended"
                ? "border-slate-600 bg-slate-800/60"
                : "border-slate-800 bg-[#071426] hover:border-slate-700"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <CheckCircle2
                size={19}
                className="text-slate-400"
              />

              <span className="text-xs text-slate-500">
                PAST
              </span>
            </div>

            <p className="text-2xl font-bold text-white">
              {counts.ended}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Ended
            </p>
          </button>
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search live classes..."
              className="w-full rounded-xl border border-slate-800 bg-[#071426] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
            className="rounded-xl border border-slate-800 bg-[#071426] px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400/40"
          >
            <option value="all">
              All classes
            </option>
            <option value="live">
              Live now
            </option>
            <option value="scheduled">
              Scheduled
            </option>
            <option value="ended">
              Ended
            </option>
          </select>
        </div>

        {/* =================================================
            SESSION LIST
        ================================================= */}

        {loadingSessions ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-800 bg-[#071426]">
            <div className="text-center">
              <Loader2
                size={30}
                className="mx-auto mb-3 animate-spin text-cyan-400"
              />

              <p className="text-sm font-medium text-slate-300">
                Loading live classes...
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Please wait
              </p>
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-[#071426] px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Video
                size={28}
                className="text-cyan-300"
              />
            </div>

            <h2 className="text-lg font-bold text-white">
              No live classes found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search || filter !== "all"
                ? "Try changing your search or filter."
                : "Create your first live class and start teaching your students online."}
            </p>

            {!search && filter === "all" && (
              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(true)
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus size={17} />
                Create Live Class
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredSessions.map(
              (session, index) => {
                const status =
                  getStatus(session);

                const id =
                  getSessionId(session);

                const title =
                  session?.title ||
                  session?.name ||
                  "Live Class";

                const description =
                  session?.description ||
                  "Live learning session";

                const scheduledAt =
                  session?.scheduled_at ||
                  session?.scheduledAt ||
                  session?.start_time ||
                  session?.startTime ||
                  session?.starts_at ||
                  session?.startsAt;

                const joinUrl =
                  getJoinUrl(session);

                return (
                  <motion.article
                    key={
                      id ||
                      `${title}-${index}`
                    }
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        Math.min(
                          index * 0.04,
                          0.3
                        ),
                    }}
                    className={`group overflow-hidden rounded-2xl border bg-[#071426] transition ${
                      status === "live"
                        ? "border-red-400/25"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* CARD TOP */}
                    <div className="relative overflow-hidden border-b border-slate-800 p-5">
                      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/5 blur-3xl" />

                      <div className="relative flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              status === "live"
                                ? "bg-red-500/10 text-red-300"
                                : "bg-cyan-400/10 text-cyan-300"
                            }`}
                          >
                            {status ===
                            "live" ? (
                              <Radio
                                size={21}
                              />
                            ) : (
                              <Video
                                size={21}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="mb-2">
                              <StatusBadge
                                status={
                                  status
                                }
                              />
                            </div>

                            <h2 className="truncate text-base font-bold text-white">
                              {title}
                            </h2>

                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                              {description}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              session
                            )
                          }
                          disabled={
                            deletingId === id ||
                            status === "live"
                          }
                          className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Delete"
                        >
                          {deletingId ===
                          id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={17}
                            />
                          )}
                        </button>
                      </div>

                      {/* CLASS + SUBJECT */}
                      <div className="relative mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-800 bg-[#020617]/50 p-3">
                          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                            <Users
                              size={13}
                            />
                            Class
                          </div>

                          <p className="truncate text-sm font-semibold text-slate-200">
                            {getClassName(
                              session
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-[#020617]/50 p-3">
                          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                            <FileText
                              size={13}
                            />
                            Subject
                          </div>

                          <p className="truncate text-sm font-semibold text-slate-200">
                            {getSubjectName(
                              session
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CARD FOOTER */}
                    <div className="p-4">
                      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                        <Calendar
                          size={14}
                        />

                        <span>
                          {formatDateTime(
                            scheduledAt
                          )}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {status === "scheduled" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStart(
                                session
                              )
                            }
                            disabled={
                              startingId ===
                              id
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {startingId ===
                            id ? (
                              <>
                                <Loader2
                                  size={
                                    16
                                  }
                                  className="animate-spin"
                                />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Play
                                  size={
                                    16
                                  }
                                  fill="currentColor"
                                />
                                Start Live
                              </>
                            )}
                          </button>
                        )}

                        {status === "live" && (
                          <>
                            {joinUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleJoin(
                                    session
                                  )
                                }
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                              >
                                <ExternalLink
                                  size={
                                    16
                                  }
                                />
                                Join Room
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleEnd(
                                  session
                                )
                              }
                              disabled={
                                endingId ===
                                id
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {endingId ===
                              id ? (
                                <Loader2
                                  size={
                                    16
                                  }
                                  className="animate-spin"
                                />
                              ) : (
                                <Square
                                  size={
                                    15
                                  }
                                  fill="currentColor"
                                />
                              )}

                              End
                            </button>
                          </>
                        )}

                        {status === "ended" &&
                          joinUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyLink(
                                  session
                                )
                              }
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                            >
                              <Copy
                                size={16}
                              />
                              Copy Link
                            </button>
                          )}
                      </div>
                    </div>
                  </motion.article>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          CREATE MODAL
      ===================================================== */}

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !creating
              ) {
                setShowCreateModal(false);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-[#071426] shadow-2xl"
            >
              {/* MODAL HEADER */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#071426]/95 px-5 py-4 backdrop-blur sm:px-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <Video
                        size={20}
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Create Live Class
                      </h2>

                      <p className="text-xs text-slate-500">
                        Set up your next online lesson
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={creating}
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:opacity-40"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleCreate}
                className="space-y-5 p-5 sm:p-6"
              >
                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Live Class Title
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      updateForm(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Algebra Revision Class"
                    className="w-full rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Description
                    <span className="ml-2 font-normal text-slate-600">
                      Optional
                    </span>
                  </label>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Tell students what this lesson will cover..."
                    className="w-full resize-none rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                </div>

                {/* CLASS + SUBJECT */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      Class
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    {loadingClasses ? (
                      <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-800 bg-[#020617] px-4 text-sm text-slate-500">
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Loading classes...
                      </div>
                    ) : (
                      <select
                        value={form.classId}
                        onChange={(event) =>
                          handleClassChange(
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                        required
                      >
                        <option value="">
                          Select class
                        </option>

                        {classes.map(
                          (item, index) => (
                            <option
                              key={
                                item.id ||
                                index
                              }
                              value={
                                item.id
                              }
                            >
                              {item.name}
                            </option>
                          )
                        )}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      Subject
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    {availableSubjects.length >
                    0 ? (
                      <select
                        value={form.subject}
                        onChange={(event) =>
                          updateForm(
                            "subject",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                        required
                      >
                        <option value="">
                          Select subject
                        </option>

                        {availableSubjects.map(
                          (
                            subject,
                            index
                          ) => (
                            <option
                              key={
                                subject.id ||
                                index
                              }
                              value={
                                subject.name
                              }
                            >
                              {subject.name}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(event) =>
                          updateForm(
                            "subject",
                            event.target.value
                          )
                        }
                        placeholder={
                          form.classId
                            ? "Enter subject"
                            : "Select a class first"
                        }
                        disabled={
                          !form.classId
                        }
                        className="w-full rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                    )}
                  </div>
                </div>

                {/* DATE/TIME */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Scheduled Date & Time
                    <span className="ml-1 text-red-400">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Calendar
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(event) =>
                        updateForm(
                          "scheduledAt",
                          event.target.value
                        )
                      }
                      min={toDateTimeLocalValue(
                        new Date()
                      )}
                      className="w-full rounded-xl border border-slate-800 bg-[#020617] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-cyan-400/40"
                      required
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    Students will see this session
                    as scheduled until you start it.
                  </p>
                </div>

                {/* IMPORTANT INFO */}
                <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0 text-cyan-300">
                      <Radio size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-cyan-200">
                        Class and subject are required
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        The selected class and subject
                        determine which students are
                        eligible to receive this live
                        class.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={creating}
                    onClick={() =>
                      setShowCreateModal(false)
                    }
                    className="rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creating ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus
                          size={17}
                        />
                        Create Live Class
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
