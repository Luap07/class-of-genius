import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  Play,
  Radio,
  Search,
  Users,
  Video,
} from "lucide-react";

import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const LIVE_CLASSES_ENDPOINT =
  `${API_URL}/api/academy/student/live-classes`;

const DEMO_CLASSES = [
  {
    id: "live-001",
    title: "Mathematics Revision Class",
    subject: "Mathematics",
    tutorName: "Mr. Adewale",
    className: "SS 1",
    scheduledAt: "2026-09-19T16:00:00",
    status: "upcoming",
    roomCode: "MATH-SS1",
    joinUrl: "",
    participants: 18,
  },
  {
    id: "live-002",
    title: "English Language Live Session",
    subject: "English Language",
    tutorName: "Mrs. Johnson",
    className: "SS 1",
    scheduledAt: "2026-09-18T19:00:00",
    status: "live",
    roomCode: "ENG-SS1",
    joinUrl: "",
    participants: 24,
  },
  {
    id: "live-003",
    title: "Biology Discussion",
    subject: "Biology",
    tutorName: "Dr. Okafor",
    className: "SS 1",
    scheduledAt: "2026-09-14T16:00:00",
    status: "completed",
    roomCode: "BIO-SS1",
    joinUrl: "",
    participants: 21,
  },
];

const getStudentId = (student) => {
  if (!student) return "";

  return (
    student.id ||
    student.studentId ||
    student.student_id ||
    student.enrollmentId ||
    student.enrollment_id ||
    ""
  );
};

const normalizeClass = (
  item,
  index
) => ({
  id:
    item?.id ||
    item?.classId ||
    item?.class_id ||
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
    "Tutor",

  className:
    item?.className ||
    item?.class_name ||
    item?.grade ||
    "Student Class",

  scheduledAt:
    item?.scheduledAt ||
    item?.scheduled_at ||
    item?.startTime ||
    item?.start_time ||
    item?.date ||
    "",

  status:
    String(
      item?.status ||
      "upcoming"
    ).toLowerCase(),

  roomCode:
    item?.roomCode ||
    item?.room_code ||
    "",

  joinUrl:
    item?.joinUrl ||
    item?.join_url ||
    item?.meetingUrl ||
    item?.meeting_url ||
    "",

  participants:
    item?.participants ||
    item?.participantCount ||
    item?.participant_count ||
    0,
});

const formatDateTime = (value) => {
  if (!value) {
    return "Schedule not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

export default function StudentLiveClasses() {
  const { student } = useOutletContext() || {};

  const [classes, setClasses] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const studentId =
    getStudentId(student);

  const loadClasses = async () => {
    setLoading(true);
    setError("");

    try {
      const url = new URL(
        LIVE_CLASSES_ENDPOINT
      );

      if (studentId) {
        url.searchParams.set(
          "studentId",
          studentId
        );
      }

      const response = await fetch(
        url.toString()
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load live classes."
        );
      }

      const data =
        await response.json();

      const rawItems =
        Array.isArray(data)
          ? data
          : data.liveClasses ||
            data.live_classes ||
            data.classes ||
            data.data ||
            [];

      if (!Array.isArray(rawItems)) {
        throw new Error(
          "Invalid live class response."
        );
      }

      setClasses(
        rawItems.map(
          normalizeClass
        )
      );
    } catch (err) {
      console.error(
        "STUDENT LIVE CLASSES ERROR:",
        err
      );

      setClasses(
        DEMO_CLASSES
      );

      setError(
        "Live classes could not be loaded from the server. Showing available sample classes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [studentId]);

  const filteredClasses =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return classes.filter(
        (item) =>
          !query ||
          item.title
            .toLowerCase()
            .includes(query) ||
          item.subject
            .toLowerCase()
            .includes(query) ||
          item.tutorName
            .toLowerCase()
            .includes(query)
      );
    }, [classes, search]);

  const liveClasses =
    filteredClasses.filter(
      (item) =>
        item.status === "live" ||
        item.status === "active"
    );

  const upcomingClasses =
    filteredClasses.filter(
      (item) =>
        item.status === "upcoming" ||
        item.status === "scheduled"
    );

  const completedClasses =
    filteredClasses.filter(
      (item) =>
        item.status === "completed" ||
        item.status === "ended"
    );

  const joinClass = (classItem) => {
    if (classItem.joinUrl) {
      window.open(
        classItem.joinUrl,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    if (classItem.roomCode) {
      window.location.href =
        `/academy/live-class/${classItem.roomCode}`;
    }
  };

  const ClassCard = ({
    item,
    live = false,
  }) => (
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
        ) : (
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
            {item.status ===
            "completed"
              ? "Completed"
              : "Upcoming"}
          </span>
        )}
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {item.title}
      </h3>

      <p className="mt-1 text-sm text-cyan-300">
        {item.subject}
      </p>

      <div className="mt-4 space-y-2 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Users size={15} />
          <span>
            {item.tutorName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={15} />
          <span>
            {formatDateTime(
              item.scheduledAt
            )}
          </span>
        </div>

        {item.participants > 0 && (
          <div className="flex items-center gap-2">
            <Users size={15} />
            <span>
              {item.participants} students
            </span>
          </div>
        )}
      </div>

      {live && (
        <button
          type="button"
          onClick={() =>
            joinClass(item)
          }
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          <Play size={16} />
          Join Live Class
        </button>
      )}

      {!live &&
        item.status !==
          "completed" &&
        item.status !== "ended" && (
          <button
            type="button"
            onClick={() =>
              joinClass(item)
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <ExternalLink size={16} />
            View Class
          </button>
        )}
    </motion.div>
  );

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

          <h2 className="text-lg font-semibold">
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

  return (
    <div className="min-h-full bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">

        <div>
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
                Join live lessons and attend scheduled
                tutor sessions.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search live classes..."
            className="w-full rounded-2xl border border-white/10 bg-[#071426] py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-cyan-400/40"
          />
        </div>

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
        ) : filteredClasses.length ===
          0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#071426] p-12 text-center">
            <Clock3
              size={42}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-lg font-semibold">
              No live classes found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Your scheduled classes will appear
              here.
            </p>
          </div>
        ) : (
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
      </div>
    </div>
  );
}
