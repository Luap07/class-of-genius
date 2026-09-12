import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
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

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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

      try {
        const parsed = JSON.parse(value);

        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch {
        return { reference: value };
      }
    } catch {
      continue;
    }
  }

  return null;
};

const getTutorReference = () => {
  const tutor = getStoredTutor();

  if (!tutor) return "";

  return String(
    tutor.tutorReference ||
      tutor.reference ||
      tutor.tutor_reference ||
      tutor.applicationReference ||
      tutor.application_reference ||
      tutor.id ||
      ""
  ).trim();
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
      grade: item,
      class_name: item,
      subjects: [],
    };
  }

  const id =
    item.id ??
    item.class_id ??
    item.classId ??
    item.grade_id ??
    item.gradeId ??
    item.value ??
    item.name ??
    "";

  const name =
    item.name ??
    item.class_name ??
    item.className ??
    item.grade ??
    item.grade_name ??
    item.gradeName ??
    item.title ??
    item.label ??
    String(id || "");

  const grade =
    item.grade ??
    item.grade_name ??
    item.gradeName ??
    item.class_name ??
    item.className ??
    item.name ??
    name;

  const subjects =
    item.subjects ??
    item.assignedSubjects ??
    item.assigned_subjects ??
    item.subject_list ??
    item.subjects_list ??
    [];

  return {
    ...item,
    id,
    name,
    grade,
    class_name: name,
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
    item.id ??
    item.subject_id ??
    item.subjectId ??
    item.value ??
    item.name ??
    "";

  const name =
    item.name ??
    item.subject_name ??
    item.subjectName ??
    item.title ??
    item.label ??
    String(id || "");

  return {
    ...item,
    id,
    name,
  };
};

const extractArray = (data, keys = []) => {
  if (Array.isArray(data)) return data;

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

const getSessionId = (session) =>
  session?.id ??
  session?.session_id ??
  session?.sessionId ??
  session?.live_id ??
  session?.liveId ??
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
  session?.grade ||
  session?.grade_name ||
  session?.gradeName ||
  session?.class ||
  session?.class_id ||
  "Class";

const getSubjectName = (session) =>
  session?.subject_name ||
  session?.subjectName ||
  session?.subject ||
  "Subject";

const getScheduledAt = (session) =>
  session?.scheduled_at ||
  session?.scheduledAt ||
  session?.scheduled_start ||
  session?.scheduledStart ||
  session?.start_time ||
  session?.startTime ||
  session?.starts_at ||
  session?.startsAt ||
  "";

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

  return "scheduled";
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
    date.getTime() -
      date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
};

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

export default function TutorLiveClasses() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loadingClasses, setLoadingClasses] =
    useState(true);

  const [loadingSessions, setLoadingSessions] =
    useState(true);

  const [creating, setCreating] = useState(false);
  const [startingId, setStartingId] = useState("");
  const [endingId, setEndingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    classId: "",
    className: "",
    grade: "",
    subject: "",
    scheduledAt: toDateTimeLocalValue(
      new Date(Date.now() + 30 * 60 * 1000)
    ),
  });

  const tutorReference = getTutorReference();
  const tutorName = getTutorName();

  const getHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-tutor-reference": tutorReference,
    }),
    [tutorReference]
  );

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

      const data = await response
        .json()
        .catch(() => ({}));

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

      setForm((current) => {
        if (
          current.classId ||
          normalised.length === 0
        ) {
          return current;
        }

        const firstClass = normalised[0];

        const firstSubject =
          Array.isArray(firstClass.subjects) &&
          firstClass.subjects.length
            ? normaliseSubject(
                firstClass.subjects[0]
              )
            : null;

        const className = String(
          firstClass.name ||
            firstClass.class_name ||
            firstClass.grade ||
            ""
        ).trim();

        const grade = String(
          firstClass.grade ||
            firstClass.grade_name ||
            className
        ).trim();

        return {
          ...current,
          classId: String(firstClass.id || ""),
          className,
          grade,
          subject: firstSubject?.name || "",
        };
      });
    } catch (err) {
      console.error(
        "Fetch tutor classes error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your assigned classes."
      );
    } finally {
      setLoadingClasses(false);
    }
  }, [getHeaders]);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/academy/tutor/live-classes`,
        {
          method: "GET",
          credentials: "include",
          headers: getHeaders(),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to load your live classes."
        );
      }

      const rawSessions = extractArray(data, [
        "sessions",
        "liveClasses",
        "live_classes",
        "data",
        "results",
      ]);

      setSessions(rawSessions);
    } catch (err) {
      console.error(
        "Fetch live classes error:",
        err
      );

      setSessions([]);

      setError(
        err?.message ||
          "Unable to load your live classes."
      );
    } finally {
      setLoadingSessions(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchClasses();
    fetchSessions();
  }, [fetchClasses, fetchSessions]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchSessions();
    }, 30000);

    return () => clearInterval(timer);
  }, [fetchSessions]);

  const selectedClass = useMemo(
    () =>
      classes.find(
        (item) =>
          String(item.id) ===
          String(form.classId)
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

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleClassChange = (value) => {
    const nextClass = classes.find(
      (item) =>
        String(item.id) === String(value)
    );

    const subjects =
      nextClass?.subjects ||
      nextClass?.assignedSubjects ||
      nextClass?.assigned_subjects ||
      [];

    const firstSubject =
      subjects.length
        ? normaliseSubject(subjects[0])
        : null;

    const className = String(
      nextClass?.name ||
        nextClass?.class_name ||
        nextClass?.className ||
        nextClass?.grade ||
        nextClass?.grade_name ||
        nextClass?.gradeName ||
        ""
    ).trim();

    const grade = String(
      nextClass?.grade ||
        nextClass?.grade_name ||
        nextClass?.gradeName ||
        nextClass?.class_name ||
        nextClass?.className ||
        className
    ).trim();

    setForm((current) => ({
      ...current,
      classId: String(value || ""),
      className,
      grade,
      subject: firstSubject?.name || "",
    }));
  };

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

    const selected = classes.find(
      (item) =>
        String(item.id) ===
        String(form.classId)
    );

    const finalClassName = String(
      selected?.name ||
        selected?.class_name ||
        selected?.className ||
        selected?.grade ||
        selected?.grade_name ||
        selected?.gradeName ||
        form.className ||
        form.grade ||
        ""
    ).trim();

    const finalGrade = String(
      selected?.grade ||
        selected?.grade_name ||
        selected?.gradeName ||
        selected?.class_name ||
        selected?.className ||
        finalClassName ||
        form.grade ||
        form.className ||
        ""
    ).trim();

    if (!finalClassName) {
      setError(
        "The selected class has no class name/grade."
      );
      return;
    }

    if (!finalGrade) {
      setError(
        "The selected class has no grade."
      );
      return;
    }

    if (!form.subject.trim()) {
      setError("Please select a subject.");
      return;
    }

    if (!form.scheduledAt) {
      setError(
        "Please select the live class date and time."
      );
      return;
    }

    const selectedDate = new Date(
      form.scheduledAt
    );

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.getTime() <= Date.now()
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

        classId: String(form.classId),
        class_id: String(form.classId),

        className: finalClassName,
        class_name: finalClassName,

        grade: finalGrade,

        subject: form.subject.trim(),
        subject_name: form.subject.trim(),

        scheduledAt:
          selectedDate.toISOString(),
        scheduled_at:
          selectedDate.toISOString(),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/academy/tutor/live-classes`,
        {
          method: "POST",
          credentials: "include",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const rawText = await response.text();

      let data = {};

      try {
        data = rawText
          ? JSON.parse(rawText)
          : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            data?.detail ||
            rawText ||
            `Server returned HTTP ${response.status}`
        );
      }

      const createdSession =
        data?.session ||
        data?.liveClass ||
        data?.live_class ||
        data?.data;

      if (
        createdSession &&
        typeof createdSession === "object"
      ) {
        setSessions((current) => [
          createdSession,
          ...current,
        ]);
      }

      setSuccess(
        data?.message ||
          "Live class scheduled successfully."
      );

      const firstClass = classes[0];

      const firstSubject =
        firstClass?.subjects?.length
          ? normaliseSubject(
              firstClass.subjects[0]
            )
          : null;

      const firstClassName = String(
        firstClass?.name ||
          firstClass?.class_name ||
          firstClass?.className ||
          firstClass?.grade ||
          firstClass?.grade_name ||
          ""
      ).trim();

      const firstGrade = String(
        firstClass?.grade ||
          firstClass?.grade_name ||
          firstClass?.gradeName ||
          firstClass?.class_name ||
          firstClassName
      ).trim();

      setForm({
        title: "",
        description: "",
        classId: firstClass?.id
          ? String(firstClass.id)
          : "",
        className: firstClassName,
        grade: firstGrade,
        subject: firstSubject?.name || "",
        scheduledAt:
          toDateTimeLocalValue(
            new Date(
              Date.now() +
                30 * 60 * 1000
            )
          ),
      });

      setShowCreateModal(false);

      await fetchSessions();
    } catch (err) {
      console.error(
        "CREATE LIVE CLASS ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to create the live class."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleStart = async (session) => {
    const id = getSessionId(session);

    setError("");
    setSuccess("");

    if (!id) {
      setError(
        "This live class has no valid session ID."
      );
      return;
    }

    setStartingId(String(id));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/academy/tutor/live-classes/${encodeURIComponent(
          id
        )}/start`,
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
        data?.data ||
        {};

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
            ...updated,
            status: "live",
            session_status: "live",
            is_live: true,
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

      await fetchSessions();

      /*
       * Go to the INTERNAL TutorLiveClassroom.
       *
       * App.jsx defines:
       * /academy/tutor/live/:id
       */
      navigate(
        `/academy/tutor/live/${encodeURIComponent(
          String(id)
        )}`
      );
    } catch (err) {
      console.error(
        "Start live class error:",
        err
      );

      setError(
        err?.message ||
          "Unable to start this live class."
      );
    } finally {
      setStartingId("");
    }
  };

  const handleEnd = async (session) => {
    const id = getSessionId(session);

    if (!id) {
      setError(
        "This live class has no valid session ID."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to end this live class?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setEndingId(String(id));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/academy/tutor/live-classes/${encodeURIComponent(
          id
        )}/end`,
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
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to end the live class."
        );
      }

      const updated =
        data?.session ||
        data?.liveClass ||
        data?.live_class ||
        data?.data ||
        {};

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
            ...updated,
            status: "ended",
            session_status: "ended",
            is_live: false,
            ended_at:
              updated?.ended_at ||
              new Date().toISOString(),
          };
        })
      );

      setSuccess(
        data?.message ||
          "Live class ended successfully."
      );

      await fetchSessions();
    } catch (err) {
      console.error(
        "End live class error:",
        err
      );

      setError(
        err?.message ||
          "Unable to end the live class."
      );
    } finally {
      setEndingId("");
    }
  };

  const handleDelete = async (session) => {
    const id = getSessionId(session);
    const status = getStatus(session);

    if (!id) {
      setError(
        "This live class has no valid session ID."
      );
      return;
    }

    if (status === "live") {
      setError(
        "A live class cannot be deleted while it is running. End the class first."
      );
      return;
    }

    if (
      !window.confirm(
        status === "ended"
          ? "Delete this ended live class?"
          : "Delete this scheduled live class?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(String(id));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/academy/tutor/live-classes/${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: getHeaders(),
          body: JSON.stringify({
            tutorReference,
            tutor_reference: tutorReference,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to delete the live class."
        );
      }

      setSessions((current) =>
        current.filter(
          (item) =>
            String(getSessionId(item)) !==
            String(id)
        )
      );

      setSuccess(
        data?.message ||
          "Live class deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete live class error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete the live class."
      );
    } finally {
      setDeletingId("");
    }
  };

  /*
   * JOIN INTERNAL CLASSROOM
   */
  const handleJoin = (session) => {
    const id = getSessionId(session);

    if (!id) {
      setError(
        "This live class has no valid session ID."
      );
      return;
    }

    /*
     * IMPORTANT:
     * This MUST match App.jsx:
     *
     * /academy/tutor/live/:id
     */
    navigate(
      `/academy/tutor/live/${encodeURIComponent(
        String(id)
      )}`
    );
  };

  const handleCopyLink = async (session) => {
    const joinUrl = getJoinUrl(session);

    if (!joinUrl) {
      setError(
        "There is no classroom link to copy."
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(
        joinUrl
      );

      setSuccess(
        "Live classroom link copied."
      );
    } catch {
      setError(
        "Unable to copy the live classroom link."
      );
    }
  };

  const filteredSessions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

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
        session?.name,
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

  const counts = useMemo(() => {
    let live = 0;
    let scheduled = 0;
    let ended = 0;

    sessions.forEach((session) => {
      const status = getStatus(session);

      if (status === "live") {
        live++;
      } else if (status === "ended") {
        ended++;
      } else {
        scheduled++;
      }
    });

    return {
      all: sessions.length,
      live,
      scheduled,
      ended,
    };
  }, [sessions]);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
              Create and manage live lessons for
              your assigned classes and subjects.
            </p>

            {tutorName && (
              <p className="mt-2 text-xs text-slate-600">
                Signed in as {tutorName}
              </p>
            )}
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
                onClick={() =>
                  setError("")
                }
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
                onClick={() =>
                  setSuccess("")
                }
                className="text-emerald-300 transition hover:text-white"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button
            type="button"
            onClick={() =>
              setFilter("all")
            }
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
            onClick={() =>
              setFilter("live")
            }
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
            onClick={() =>
              setFilter("scheduled")
            }
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
            onClick={() =>
              setFilter("ended")
            }
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

            {!search &&
              filter === "all" && (
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
                  getScheduledAt(session);

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
                      delay: Math.min(
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
                            {status === "live" ? (
                              <Radio size={21} />
                            ) : (
                              <Video size={21} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="mb-2">
                              <StatusBadge
                                status={status}
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
                            deletingId ===
                              String(id) ||
                            status === "live"
                          }
                          className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                          title={
                            status === "live"
                              ? "End the live class first"
                              : "Delete"
                          }
                        >
                          {deletingId ===
                          String(id) ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>

                      <div className="relative mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-800 bg-[#020617]/50 p-3">
                          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                            <Users size={13} />
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
                            <FileText size={13} />
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

                    <div className="p-4">
                      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={14} />

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
                              String(id)
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {startingId ===
                            String(id) ? (
                              <>
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Play
                                  size={16}
                                  fill="currentColor"
                                />
                                Start Live
                              </>
                            )}
                          </button>
                        )}

                        {status === "live" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleJoin(
                                  session
                                )
                              }
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                            >
                              <Video size={16} />
                              Join Room
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEnd(
                                  session
                                )
                              }
                              disabled={
                                endingId ===
                                String(id)
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {endingId ===
                              String(id) ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Square
                                  size={15}
                                  fill="currentColor"
                                />
                              )}
                              End
                            </button>
                          </>
                        )}

                        {status === "ended" && (
                          <>
                            {joinUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyLink(
                                    session
                                  )
                                }
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                              >
                                <Copy size={16} />
                                Copy Link
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  session
                                )
                              }
                              disabled={
                                deletingId ===
                                String(id)
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                            >
                              {deletingId ===
                              String(id) ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </>
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

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target ===
                  event.currentTarget &&
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
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#071426]/95 px-5 py-4 backdrop-blur sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Video size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Create Live Class
                    </h2>

                    <p className="text-xs text-slate-500">
                      Schedule your next online
                      lesson
                    </p>
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

              <form
                onSubmit={handleCreate}
                className="space-y-5 p-5 sm:p-6"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Live Class Title
                    <span className="ml-1 text-red-400">
                      *
                    </span>
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
                    ) : classes.length === 0 ? (
                      <div className="rounded-xl border border-red-400/20 bg-red-500/5 p-3 text-xs leading-5 text-red-300">
                        No assigned classes were
                        found for this tutor.
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
                              value={String(
                                item.id
                              )}
                            >
                              {item.name}
                            </option>
                          )
                        )}
                      </select>
                    )}

                    {form.classId &&
                      form.className && (
                        <p className="mt-2 text-xs text-slate-600">
                          Selected:{" "}
                          <span className="text-slate-400">
                            {form.className}
                          </span>
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      Subject
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    {availableSubjects.length > 0 ? (
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
                        disabled={!form.classId}
                        className="w-full rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                    )}
                  </div>
                </div>

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
                        new Date(
                          Date.now() +
                            60 * 1000
                        )
                      )}
                      className="w-full rounded-xl border border-slate-800 bg-[#020617] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-cyan-400/40"
                      required
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    Students will see this
                    session as scheduled until
                    you start it.
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0 text-cyan-300">
                      <Radio size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-cyan-200">
                        Class and subject are
                        required
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Only students assigned to
                        the selected class and
                        subject should receive
                        this live class.
                      </p>
                    </div>
                  </div>
                </div>

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
                    disabled={
                      creating ||
                      loadingClasses ||
                      classes.length === 0
                    }
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
                        <Plus size={17} />
                        Schedule Live Class
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