
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Play,
  Radio,
  RefreshCw,
  Search,
  Users,
  Video,
} from "lucide-react";

import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const LIVE_CLASSES_ENDPOINT =
  `${API_URL}/api/academy/student/live-classes`;

/* =========================================================
   STUDENT SESSION HELPERS
========================================================= */

const getStoredStudent = () => {
  if (typeof window === "undefined") return {};

  const keys = [
    "scholiqen_academy_user",
    "scholiqen_current_user",
    "scholiqen_student",
    "student",
  ];

  for (const key of keys) {
    try {
      const stored = window.localStorage.getItem(key);

      if (!stored) continue;

      const parsed = JSON.parse(stored);

      if (parsed && typeof parsed === "object") {
        return parsed.user || parsed.student || parsed;
      }
    } catch (error) {
      console.warn(`Unable to read ${key}:`, error);
    }
  }

  return {};
};

const getStudentToken = (student) => {
  const contextToken =
    student?.token ||
    student?.accessToken ||
    student?.access_token ||
    student?.authToken ||
    student?.auth_token;

  if (contextToken) {
    return String(contextToken).trim();
  }

  if (typeof window === "undefined") {
    return "";
  }

  const tokenKeys = [
    "scholiqen_academy_token",
    "scholiqen_academy_student_token",
    "scholiqen_auth_token",
    "student_token",
    "access_token",
    "auth_token",
    "token",
  ];

  for (const key of tokenKeys) {
    const value = window.localStorage.getItem(key);

    if (value) {
      return value.trim();
    }
  }

  return "";
};

const getStudentDetails = (contextStudent) => {
  const storedStudent = getStoredStudent();

  const student = {
    ...storedStudent,
    ...(contextStudent || {}),
  };

  const enrollmentId =
    student?.enrollmentId ||
    student?.enrollment_id ||
    student?.enrollmentReference ||
    student?.enrollment_reference ||
    student?.reference ||
    student?.studentReference ||
    student?.student_reference ||
    "";

  const studentId =
    student?.studentId ||
    student?.student_id ||
    student?.id ||
    "";

  const firstName =
    student?.firstName ||
    student?.first_name ||
    "";

  const lastName =
    student?.lastName ||
    student?.last_name ||
    "";

  const studentName =
    student?.fullName ||
    student?.full_name ||
    student?.studentName ||
    student?.student_name ||
    student?.name ||
    `${firstName} ${lastName}`.trim();

  return {
    enrollmentId: String(enrollmentId || "").trim(),
    studentId: String(studentId || "").trim(),
    studentName: String(studentName || "").trim(),
  };
};

/* =========================================================
   STATUS HELPERS
========================================================= */

const normalizeStatus = (value) => {
  const status = String(value || "scheduled")
    .trim()
    .toLowerCase();

  if (
    ["live", "active", "started", "in_progress"].includes(status)
  ) {
    return "live";
  }

  if (
    ["ended", "completed", "finished"].includes(status)
  ) {
    return "completed";
  }

  return "upcoming";
};

const normalizeClass = (item, index) => ({
  id:
    item?.id ??
    item?.classId ??
    item?.class_id ??
    `live-${index}`,

  title:
    item?.title ||
    item?.name ||
    item?.classTitle ||
    "Live Class",

  subject:
    item?.subject ||
    item?.subjectName ||
    item?.subject_name ||
    "General",

  tutorName:
    item?.tutorName ||
    item?.tutor_name ||
    item?.tutor?.name ||
    item?.teacherName ||
    "Assigned Tutor",

  className:
    item?.className ||
    item?.class_name ||
    item?.grade ||
    "Student Class",

  scheduledAt:
    item?.scheduledAt ||
    item?.scheduled_at ||
    item?.scheduled_start ||
    item?.startTime ||
    item?.start_time ||
    item?.date ||
    "",

  startedAt:
    item?.startedAt ||
    item?.started_at ||
    item?.actual_start ||
    "",

  endedAt:
    item?.endedAt ||
    item?.ended_at ||
    item?.actual_end ||
    "",

  status: normalizeStatus(item?.status),

  roomCode:
    item?.roomCode ||
    item?.room_code ||
    item?.room_id ||
    "",

  joinUrl:
    item?.joinUrl ||
    item?.join_url ||
    item?.meetingUrl ||
    item?.meeting_url ||
    "",

  participants: Number(
    item?.participants ||
    item?.participantCount ||
    item?.participant_count ||
    0
  ),
});

const formatDateTime = (value) => {
  if (!value) {
    return "Schedule not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();

    return (
      data?.message ||
      data?.error ||
      "Something went wrong. Please try again."
    );
  } catch {
    return "Something went wrong. Please try again.";
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentLiveClasses() {
  const outletContext = useOutletContext() || {};
  const student = outletContext.student;

  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState(null);

  /* =======================================================
     LOAD STUDENT LIVE CLASSES
  ======================================================= */

  const loadClasses = useCallback(
    async ({ silent = false } = {}) => {
      const token = getStudentToken(student);

      if (!token) {
        setClasses([]);
        setError(
          "Your student login session was not found. Please log in again."
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(
          LIVE_CLASSES_ENDPOINT,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const data = await response.json();

        const rawItems = Array.isArray(data)
          ? data
          : data?.sessions ||
            data?.liveClasses ||
            data?.live_classes ||
            data?.classes ||
            data?.data ||
            [];

        if (!Array.isArray(rawItems)) {
          throw new Error(
            "The server returned an invalid live classes response."
          );
        }

        const normalized = rawItems.map(normalizeClass);

        setClasses(normalized);
        setError("");
      } catch (err) {
        console.error("STUDENT LIVE CLASSES ERROR:", err);

        setError(
          err.message ||
            "Unable to load live classes. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [student]
  );

  /* =======================================================
     INITIAL LOAD AND AUTOMATIC REFRESH
  ======================================================= */

  useEffect(() => {
    loadClasses();

    const interval = window.setInterval(() => {
      loadClasses({ silent: true });
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadClasses]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredClasses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return classes;
    }

    return classes.filter((item) =>
      [
        item.title,
        item.subject,
        item.tutorName,
        item.className,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [classes, search]);

  const liveClasses = useMemo(
    () =>
      filteredClasses.filter(
        (item) => item.status === "live"
      ),
    [filteredClasses]
  );

  const upcomingClasses = useMemo(
    () =>
      filteredClasses.filter(
        (item) => item.status === "upcoming"
      ),
    [filteredClasses]
  );

  const completedClasses = useMemo(
    () =>
      filteredClasses.filter(
        (item) => item.status === "completed"
      ),
    [filteredClasses]
  );

  /* =======================================================
     JOIN LIVE CLASS

     Sends the student's Enrollment ID and full name
     to the backend before joining.
  ======================================================= */

  const joinClass = async (classItem) => {
    if (!classItem?.id || joiningId) {
      return;
    }

    if (classItem.status !== "live") {
      setError(
        "You can only join after the tutor starts the class."
      );
      return;
    }

    if (!classItem.roomCode && !classItem.joinUrl) {
      setError(
        "The classroom link is not available. Please contact your tutor."
      );
      return;
    }

    const token = getStudentToken(student);

    if (!token) {
      setError(
        "Your student login session has expired. Please log in again."
      );
      return;
    }

    const studentDetails = getStudentDetails(student);

    if (!studentDetails.enrollmentId && !studentDetails.studentId) {
      setError(
        "Your Enrollment ID could not be found in your student session. Please log out and log in again."
      );
      return;
    }

    if (!studentDetails.studentName) {
      setError(
        "Your student name could not be found in your student session. Please log out and log in again."
      );
      return;
    }

    setJoiningId(String(classItem.id));
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/academy/live-classes/${encodeURIComponent(
          classItem.id
        )}/join`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",

          body: JSON.stringify({
            enrollmentId: studentDetails.enrollmentId,
            enrollment_id: studentDetails.enrollmentId,

            studentId: studentDetails.studentId,
            student_id: studentDetails.studentId,

            studentName: studentDetails.studentName,
            student_name: studentDetails.studentName,
            name: studentDetails.studentName,
          }),
        }
      );

      if (!response.ok) {
        const message = await getErrorMessage(response);

        if (response.status === 409) {
          await loadClasses({ silent: true });
        }

        throw new Error(message);
      }

      const data = await response.json();

      if (!data?.success) {
        throw new Error(
          data?.message || "Unable to join this class."
        );
      }

      const returnedSession = data.session || {};

      const roomCode =
        returnedSession.room_code ||
        returnedSession.roomCode ||
        data?.participant?.room_code ||
        classItem.roomCode;

      const joinUrl =
        returnedSession.join_url ||
        returnedSession.meeting_url ||
        classItem.joinUrl;

      if (joinUrl) {
        window.location.assign(joinUrl);
        return;
      }

      if (roomCode) {
        window.location.assign(
          `/academy/live-class/${encodeURIComponent(roomCode)}`
        );
        return;
      }

      throw new Error(
        "You have been registered, but the classroom link is missing."
      );
    } catch (err) {
      console.error("JOIN LIVE CLASS ERROR:", err);

      setError(
        err.message ||
          "Unable to join the live class. Please try again."
      );

      setJoiningId(null);
    }
  };

  /* =======================================================
     CLASS CARD
  ======================================================= */

  const ClassCard = ({ item, live = false }) => {
    const isJoining =
      joiningId === String(item.id);

    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="rounded-3xl border border-white/10 bg-[#071426] p-5 transition hover:border-cyan-400/20"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            {live ? (
              <Radio size={23} />
            ) : (
              <Video size={23} />
            )}
          </div>

          {live ? (
            <span className="flex items-center gap-1.5 rounded-full bg-red-400/10 px-3 py-1 text-xs font-medium text-red-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
              LIVE NOW
            </span>
          ) : item.status === "completed" ? (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              Completed
            </span>
          ) : (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
              Upcoming
            </span>
          )}
        </div>

        <h3 className="mt-5 text-lg font-semibold text-white">
          {item.title}
        </h3>

        <p className="mt-1 text-sm text-cyan-300">
          {item.subject}
        </p>

        <div className="mt-4 space-y-3 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Users size={15} className="shrink-0" />
            <span>{item.tutorName}</span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays
              size={15}
              className="shrink-0"
            />
            <span>{formatDateTime(item.scheduledAt)}</span>
          </div>

          {item.className && (
            <div className="flex items-center gap-2">
              <Video size={15} className="shrink-0" />
              <span>{item.className}</span>
            </div>
          )}

          {item.participants > 0 && (
            <div className="flex items-center gap-2">
              <Users size={15} className="shrink-0" />
              <span>
                {item.participants} students attending
              </span>
            </div>
          )}
        </div>

        {live && (
          <button
            type="button"
            onClick={() => joinClass(item)}
            disabled={Boolean(joiningId)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isJoining ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Joining classroom...
              </>
            ) : (
              <>
                <Play size={16} />
                Join Live Class
              </>
            )}
          </button>
        )}

        {item.status === "upcoming" && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-500">
            <Clock3 size={16} />
            Waiting for tutor to start
          </div>
        )}

        {item.status === "completed" && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-3 text-sm text-emerald-300/70">
            <CheckCircle2 size={16} />
            Class has ended
          </div>
        )}
      </motion.div>
    );
  };

  /* =======================================================
     SECTION
  ======================================================= */

  const Section = ({
    title,
    icon: Icon,
    items,
    live = false,
  }) => {
    if (!items.length) {
      return null;
    }

    return (
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Icon
            size={19}
            className={
              live
                ? "text-red-300"
                : "text-cyan-300"
            }
          />

          <h2 className="text-lg font-semibold text-white">
            {title}
          </h2>

          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-500">
            {items.length}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ClassCard
              key={item.id}
              item={item}
              live={live}
            />
          ))}
        </div>
      </section>
    );
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-full bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">

        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Radio
                size={24}
                className="text-cyan-300"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Live Classes
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Attend your scheduled lessons and join when your tutor goes live.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadClasses({ silent: true })}
            disabled={loading || refreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-4 py-2.5 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => loadClasses()}
              className="shrink-0 font-semibold text-amber-100 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* SEARCH */}

        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by class, subject or tutor..."
            className="w-full rounded-2xl border border-white/10 bg-[#071426] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
          />
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2
                size={22}
                className="animate-spin"
              />
              Loading live classes...
            </div>
          </div>
        ) : filteredClasses.length === 0 ? (
          /* EMPTY STATE */

          <div className="rounded-3xl border border-white/10 bg-[#071426] p-12 text-center">
            <Clock3
              size={42}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-lg font-semibold">
              {search
                ? "No matching classes"
                : "No live classes available"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {search
                ? "Try searching with another class, subject or tutor name."
                : "Your tutor's scheduled live classes will appear here once they have been assigned to your class and subjects."}
            </p>
          </div>
        ) : (
          /* CLASS SECTIONS */

          <div className="space-y-8">
            <Section
              title="Live Now"
              icon={Radio}
              items={liveClasses}
              live
            />

            <Section
              title="Upcoming Classes"
              icon={CalendarDays}
              items={upcomingClasses}
            />

            <Section
              title="Completed Classes"
              icon={CheckCircle2}
              items={completedClasses}
            />
          </div>
        )}

        {/* AUTO REFRESH NOTE */}

        {!loading && classes.length > 0 && (
          <p className="text-center text-xs text-slate-600">
            Class status refreshes automatically every 15 seconds.
          </p>
        )}
      </div>
    </div>
  );
}
