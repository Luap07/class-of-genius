import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Video,
  X,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* =========================================================
   GET TUTOR REFERENCE
========================================================= */

function getTutorReference() {
  const keys = [
    "tutorReference",
    "tutor_reference",
    "tutor",
    "academyTutor",
    "scholiqen_user",
  ];

  const extractReference = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) return "";

      try {
        const parsed = JSON.parse(trimmed);

        if (parsed && typeof parsed === "object") {
          return extractReference(parsed);
        }
      } catch {
        // Plain string reference
      }

      return trimmed;
    }

    if (typeof value !== "object") {
      return "";
    }

    const reference =
      value?.tutorReference ||
      value?.tutor_reference ||
      value?.reference ||
      value?.applicationReference ||
      value?.application_reference ||
      value?.id ||
      value?.tutor?.tutorReference ||
      value?.tutor?.tutor_reference ||
      value?.tutor?.reference ||
      value?.tutor?.applicationReference ||
      value?.tutor?.application_reference ||
      value?.user?.tutorReference ||
      value?.user?.tutor_reference ||
      value?.user?.reference ||
      value?.user?.applicationReference ||
      value?.user?.application_reference;

    return reference ? String(reference).trim() : "";
  };

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const reference = extractReference(raw);

      if (reference) {
        return reference;
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return "";
}

/* =========================================================
   API FETCH
========================================================= */

async function apiFetch(path, options = {}) {
  const tutorReference = getTutorReference();

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (tutorReference) {
    headers["x-tutor-reference"] = tutorReference;
  }

  const url = `${API_BASE_URL}${path}`;

  console.log("Tutor Calendar request:", {
    url,
    tutorReference,
  });

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType =
    response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  } else {
    const text = await response.text();

    data = {
      success: response.ok,
      message: text,
    };
  }

  console.log("Tutor Calendar response:", {
    url,
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    const backendMessage =
      data?.details ||
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(backendMessage);
  }

  return data;
}

/* =========================================================
   DATE HELPERS
========================================================= */

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatLongDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* =========================================================
   NORMALIZE LIVE CLASS
========================================================= */

function normalizeLiveClass(item) {
  const scheduledAt =
    item?.scheduledAt ||
    item?.scheduled_at ||
    item?.scheduledStart ||
    item?.scheduled_start ||
    item?.scheduledDate ||
    item?.scheduled_date;

  if (!scheduledAt) return null;

  const date = new Date(scheduledAt);

  if (Number.isNaN(date.getTime())) return null;

  return {
    id: `live-${item.id || item.roomCode || item.room_code || Math.random()}`,
    sourceId: item.id,
    type: "live",
    title: item.title || "Live Class",
    description: item.description || "",
    date,
    className:
      item.className ||
      item.class_name ||
      item.grade ||
      "",
    subject:
      item.subject ||
      item.subject_name ||
      "",
    status: item.status || "scheduled",
    roomCode:
      item.roomCode ||
      item.room_code ||
      "",
  };
}

/* =========================================================
   NORMALIZE ASSIGNMENT
========================================================= */

function normalizeAssignment(item) {
  const dueAt =
    item?.dueAt ||
    item?.due_at ||
    item?.dueDate ||
    item?.due_date ||
    item?.deadline ||
    item?.deadlineAt ||
    item?.deadline_at;

  if (!dueAt) return null;

  const date = new Date(dueAt);

  if (Number.isNaN(date.getTime())) return null;

  return {
    id: `assignment-${
      item.id ||
      item.reference ||
      item.assignmentReference ||
      Math.random()
    }`,

    sourceId:
      item.id ||
      item.reference ||
      item.assignmentReference,

    type: "assignment",

    title:
      item.title ||
      item.name ||
      item.assignmentTitle ||
      item.assignment_title ||
      "Assignment",

    description:
      item.description ||
      item.instructions ||
      "",

    date,

    className:
      item.grade ||
      item.className ||
      item.class_name ||
      item.class ||
      "",

    subject:
      item.subject ||
      item.subject_name ||
      "",

    status:
      item.status ||
      "scheduled",
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorCalendar() {
  const today = useMemo(() => new Date(), []);

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [view, setView] = useState("month");

  /* =======================================================
     LOAD CALENDAR
  ======================================================= */

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError("");

    const tutorReference = getTutorReference();

    if (!tutorReference) {
      setLoading(false);
      setEvents([]);

      setError(
        "Tutor reference was not found. Please log in again."
      );

      console.error(
        "Tutor Calendar: No tutor reference found in localStorage."
      );

      return;
    }

    try {
      /*
       * Load both independently.
       *
       * IMPORTANT:
       * The correct assignment endpoint is:
       *
       * /api/academy/tutor/assignments
       */

      const [liveClassResult, assignmentResult] =
        await Promise.allSettled([
          apiFetch(
            "/api/academy/tutor/live-classes"
          ),

          apiFetch(
            "/api/academy/tutor/assignments"
          ),
        ]);

      /* =====================================================
         LIVE CLASSES
      ===================================================== */

      let normalizedLiveClasses = [];

      if (
        liveClassResult.status === "fulfilled"
      ) {
        const response =
          liveClassResult.value;

        const liveClasses =
          response?.sessions ||
          response?.liveClasses ||
          response?.live_classes ||
          response?.data ||
          response?.results ||
          [];

        normalizedLiveClasses =
          Array.isArray(liveClasses)
            ? liveClasses
                .map(normalizeLiveClass)
                .filter(Boolean)
            : [];
      } else {
        console.error(
          "Failed to load live classes:",
          liveClassResult.reason
        );
      }

      /* =====================================================
         ASSIGNMENTS
      ===================================================== */

      let normalizedAssignments = [];

      if (
        assignmentResult.status === "fulfilled"
      ) {
        const response =
          assignmentResult.value;

        /*
         * Backend currently returns:
         *
         * {
         *   success: true,
         *   assignments: [...]
         * }
         */

        const assignments =
          response?.assignments ||
          response?.tasks ||
          response?.data ||
          response?.results ||
          [];

        normalizedAssignments =
          Array.isArray(assignments)
            ? assignments
                .map(normalizeAssignment)
                .filter(Boolean)
            : [];
      } else {
        console.error(
          "Failed to load assignments:",
          assignmentResult.reason
        );
      }

      /* =====================================================
         SHOW ASSIGNMENT ERROR ONLY IF ASSIGNMENT REQUEST FAILED
      ===================================================== */

      if (
        assignmentResult.status ===
        "rejected"
      ) {
        const assignmentError =
          assignmentResult.reason?.message ||
          "Unable to load assignments.";

        setError(
          `Assignments: ${assignmentError}`
        );
      }

      /* =====================================================
         COMBINE EVENTS
      ===================================================== */

      const combined = [
        ...normalizedLiveClasses,
        ...normalizedAssignments,
      ].sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime()
      );

      setEvents(combined);

      console.log(
        "Tutor Calendar loaded:",
        {
          tutorReference,
          liveClasses:
            normalizedLiveClasses.length,
          assignments:
            normalizedAssignments.length,
          total: combined.length,
        }
      );
    } catch (err) {
      console.error(
        "Tutor Calendar error:",
        err
      );

      setError(
        err?.message ||
          "Failed to load your planned calendar."
      );

      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  /* =======================================================
     MONTH DAYS
  ======================================================= */

  const monthDays = useMemo(() => {
    const year =
      currentDate.getFullYear();

    const month =
      currentDate.getMonth();

    const firstDay =
      new Date(year, month, 1);

    const lastDay =
      new Date(year, month + 1, 0);

    const daysInMonth =
      lastDay.getDate();

    const startingDay =
      firstDay.getDay();

    const cells = [];

    for (
      let i = 0;
      i < startingDay;
      i++
    ) {
      cells.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      cells.push(
        new Date(year, month, day)
      );
    }

    while (
      cells.length % 7 !== 0
    ) {
      cells.push(null);
    }

    return cells;
  }, [currentDate]);

  /* =======================================================
     EVENTS FOR DAY
  ======================================================= */

  const eventsForDay = useCallback(
    (day) => {
      if (!day) return [];

      return events
        .filter((event) =>
          isSameDay(event.date, day)
        )
        .sort(
          (a, b) =>
            a.date.getTime() -
            b.date.getTime()
        );
    },
    [events]
  );

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  const previousMonth = () => {
    setCurrentDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1
        )
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1
        )
    );
  };

  const goToday = () => {
    setCurrentDate(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );
  };

  /* =======================================================
     UPCOMING
  ======================================================= */

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return events
      .filter(
        (event) =>
          event.date >= now
      )
      .sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime()
      )
      .slice(0, 5);
  }, [events]);

  /* =======================================================
     MONTH EVENTS
  ======================================================= */

  const monthEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.date.getFullYear() ===
          currentDate.getFullYear() &&
        event.date.getMonth() ===
          currentDate.getMonth()
    );
  }, [events, currentDate]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                <CalendarDays className="h-6 w-6 text-blue-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Calendar
                </h1>

                <p className="text-sm text-slate-400">
                  View your planned classes and assignments.
                </p>
              </div>

            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <button
              type="button"
              onClick={goToday}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Today
            </button>

            <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900">

              <button
                type="button"
                onClick={previousMonth}
                className="p-2.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="min-w-[160px] text-center text-sm font-semibold">
                {MONTH_NAMES[currentDate.getMonth()]}{" "}
                {currentDate.getFullYear()}
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="p-2.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

            </div>

            <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1">

              {["month", "week", "day"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setView(item)
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                      view === item
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            </div>

          </div>
        </div>

        {/* STATS */}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-500">
              Planned this month
            </p>

            <p className="mt-1 text-2xl font-bold">
              {monthEvents.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-500">
              Live classes
            </p>

            <p className="mt-1 text-2xl font-bold">
              {
                monthEvents.filter(
                  (event) =>
                    event.type === "live"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-500">
              Assignments
            </p>

            <p className="mt-1 text-2xl font-bold">
              {
                monthEvents.filter(
                  (event) =>
                    event.type ===
                    "assignment"
                ).length
              }
            </p>
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* CALENDAR */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">

          {/* DAY NAMES */}

          <div className="grid grid-cols-7 border-b border-slate-800">

            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="border-r border-slate-800 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 last:border-r-0"
              >
                {day}
              </div>
            ))}

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="text-sm text-slate-400">
                Loading calendar...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7">

              {monthDays.map(
                (day, index) => {
                  const dayEvents =
                    eventsForDay(day);

                  const isToday =
                    day &&
                    isSameDay(
                      day,
                      today
                    );

                  return (
                    <div
                      key={`${day?.toISOString() || "empty"}-${index}`}
                      className="min-h-[125px] border-b border-r border-slate-800 p-2 last:border-r-0"
                    >

                      {day && (
                        <>
                          <div className="mb-2 flex items-center justify-between">

                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                isToday
                                  ? "bg-blue-600 text-white"
                                  : "text-slate-400"
                              }`}
                            >
                              {day.getDate()}
                            </span>

                            {dayEvents.length >
                              0 && (
                              <span className="text-[10px] text-slate-600">
                                {
                                  dayEvents.length
                                }
                              </span>
                            )}

                          </div>

                          <div className="space-y-1.5">

                            {dayEvents
                              .slice(0, 3)
                              .map(
                                (event) => (
                                  <button
                                    key={
                                      event.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      setSelectedEvent(
                                        event
                                      )
                                    }
                                    className={`w-full rounded-lg border px-2 py-1.5 text-left transition ${
                                      event.type ===
                                      "live"
                                        ? "border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20"
                                        : "border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20"
                                    }`}
                                  >

                                    <div className="flex items-center gap-1.5">

                                      {event.type ===
                                      "live" ? (
                                        <Video className="h-3 w-3 shrink-0 text-blue-400" />
                                      ) : (
                                        <FileText className="h-3 w-3 shrink-0 text-amber-400" />
                                      )}

                                      <span className="truncate text-[11px] font-medium text-slate-200">
                                        {
                                          event.title
                                        }
                                      </span>

                                    </div>

                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">

                                      <Clock3 className="h-3 w-3" />

                                      {formatTime(
                                        event.date
                                      )}

                                    </div>

                                  </button>
                                )
                              )}

                            {dayEvents.length >
                              3 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedEvent(
                                    dayEvents[3]
                                  )
                                }
                                className="text-[10px] text-blue-400 hover:text-blue-300"
                              >
                                +
                                {dayEvents.length -
                                  3}{" "}
                                more
                              </button>
                            )}

                          </div>
                        </>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* UPCOMING */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">

          <div className="mb-4">

            <h2 className="font-semibold">
              Upcoming
            </h2>

            <p className="text-xs text-slate-500">
              Your next planned activities.
            </p>

          </div>

          {upcomingEvents.length ===
          0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 py-8 text-center text-sm text-slate-500">
              No upcoming activities.
            </div>
          ) : (
            <div className="space-y-2">

              {upcomingEvents.map(
                (event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() =>
                      setSelectedEvent(
                        event
                      )
                    }
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-left transition hover:border-slate-700 hover:bg-slate-900"
                  >

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        event.type === "live"
                          ? "bg-blue-500/10"
                          : "bg-amber-500/10"
                      }`}
                    >

                      {event.type ===
                      "live" ? (
                        <Video className="h-5 w-5 text-blue-400" />
                      ) : (
                        <FileText className="h-5 w-5 text-amber-400" />
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-medium text-white">
                        {event.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {event.className ||
                          "Class"}

                        {event.subject
                          ? ` • ${event.subject}`
                          : ""}
                      </p>

                    </div>

                    <div className="shrink-0 text-right">

                      <p className="text-xs font-medium text-slate-300">
                        {formatTime(
                          event.date
                        )}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-500">
                        {event.date.toLocaleDateString(
                          [],
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>

                    </div>

                  </button>
                )
              )}

            </div>
          )}

        </div>

      </div>

      {/* EVENT MODAL */}

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedEvent(null)
          }
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0b1120] p-6 shadow-2xl"
          >

            <div className="mb-5 flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    selectedEvent.type ===
                    "live"
                      ? "bg-blue-500/10"
                      : "bg-amber-500/10"
                  }`}
                >

                  {selectedEvent.type ===
                  "live" ? (
                    <Video className="h-5 w-5 text-blue-400" />
                  ) : (
                    <FileText className="h-5 w-5 text-amber-400" />
                  )}

                </div>

                <div>

                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {selectedEvent.type ===
                    "live"
                      ? "Live Class"
                      : "Assignment"}
                  </p>

                  <h3 className="mt-1 text-lg font-bold">
                    {selectedEvent.title}
                  </h3>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEvent(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-3">

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                <p className="text-xs text-slate-500">
                  Date & time
                </p>

                <p className="mt-1 text-sm font-medium text-slate-200">
                  {formatLongDate(
                    selectedEvent.date
                  )}
                </p>

                <p className="mt-1 text-sm text-blue-400">
                  {formatTime(
                    selectedEvent.date
                  )}
                </p>

              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                  <p className="text-xs text-slate-500">
                    Class
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {selectedEvent.className ||
                      "Not specified"}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                  <p className="text-xs text-slate-500">
                    Subject
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {selectedEvent.subject ||
                      "Not specified"}
                  </p>

                </div>

              </div>

              {selectedEvent.description && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                  <p className="text-xs text-slate-500">
                    Description
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {
                      selectedEvent.description
                    }
                  </p>

                </div>
              )}

              {selectedEvent.status && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize text-slate-200">
                    {
                      selectedEvent.status
                    }
                  </p>

                </div>
              )}

            </div>

          </motion.div>

        </div>
      )}

    </div>
  );
}
