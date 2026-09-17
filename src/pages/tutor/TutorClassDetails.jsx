import React, {
useCallback,
useEffect,
useMemo,
useState,
} from "react";

import {
motion,
AnimatePresence,
} from "framer-motion";

import {
useLocation,
useNavigate,
useParams,
} from "react-router-dom";

import {
AlertCircle,
ArrowLeft,
BookOpen,
CalendarDays,
CheckCircle2,
ClipboardList,
Clock3,
FileText,
Loader2,
MessageSquare,
Play,
Plus,
Radio,
RefreshCw,
School,
User,
Users,
Video,
X,
} from "lucide-react";

/* =========================================================
CONFIG
========================================================= */

const API_BASE_URL = (
import.meta.env.VITE_API_URL ||
"http://localhost:5000"
).replace(/\/+$/, "");

/* =========================================================
HELPERS
========================================================= */

const clean = (value) => {
if (
value === undefined ||
value === null
) {
return "";
}

return String(value).trim();
};

const firstValue = (...values) => {
for (const value of values) {
const cleaned = clean(value);

if (cleaned) {
  return cleaned;
}

}

return "";
};

const normalize = (value) =>
clean(value)
.toLowerCase()
.replace(/[_-]+/g, " ")
.replace(/\s+/g, " ")
.trim();

const getStoredTutor = () => {
if (typeof window === "undefined") {
return {};
}

const keys = [
"tutor",
"academyTutor",
"scholiqen_user",
"scholiqen_academy_user",
];

for (const key of keys) {
try {
const raw = localStorage.getItem(key);


  if (!raw) {
    continue;
  }

  const parsed = JSON.parse(raw);

  if (parsed && typeof parsed === "object") {
    return parsed;
  }
} catch {
  // Some keys may contain plain text instead of JSON.
}

}

return {};
};

const getStoredTutorReference = () => {
if (typeof window === "undefined") {
return "";
}

const directKeys = [
"tutorReference",
"tutor_reference",
];

for (const key of directKeys) {
const value = clean(
localStorage.getItem(key)
);

if (value) {
  return value;
}

}

const tutor = getStoredTutor();

return firstValue(
tutor.tutorReference,
tutor.tutor_reference,
tutor.reference,
tutor.applicationReference,
tutor.application_reference,
tutor.tutor?.tutorReference,
tutor.tutor?.tutor_reference,
tutor.tutor?.reference
);
};

const getActivityIcon = (type) => {
const value = normalize(type);

if (
value.includes("live") ||
value.includes("class")
) {
return Radio;
}

if (
value.includes("assignment") ||
value.includes("task")
) {
return ClipboardList;
}

if (
value.includes("lesson") ||
value.includes("material") ||
value.includes("resource")
) {
return BookOpen;
}

if (
value.includes("quiz") ||
value.includes("test")
) {
return FileText;
}

if (
value.includes("chat") ||
value.includes("message")
) {
return MessageSquare;
}

if (
value.includes("student") ||
value.includes("attendance")
) {
return Users;
}

return School;
};

const getActivityLabel = (type) => {
const value = normalize(type);

if (value.includes("live")) {
return "Live Class";
}

if (
value.includes("assignment") ||
value.includes("task")
) {
return "Assignment";
}

if (
value.includes("lesson")
) {
return "Lesson";
}

if (
value.includes("material") ||
value.includes("resource")
) {
return "Material";
}

if (
value.includes("quiz") ||
value.includes("test")
) {
return "Quiz";
}

if (
value.includes("announcement")
) {
return "Announcement";
}

if (
value.includes("attendance")
) {
return "Attendance";
}

if (
value.includes("chat") ||
value.includes("message")
) {
return "Message";
}

return "Activity";
};

const formatDateTime = (value) => {
if (!value) {
return "Date not available";
}

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return clean(value) || "Date not available";
}

return date.toLocaleString(
undefined,
{
dateStyle: "medium",
timeStyle: "short",
}
);
};

const formatDate = (value) => {
if (!value) {
return "Date not available";
}

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return clean(value) || "Date not available";
}

return date.toLocaleDateString(
undefined,
{
dateStyle: "medium",
}
);
};

const formatDuration = (seconds) => {
const value = Number(seconds);

if (
!Number.isFinite(value) ||
value <= 0
) {
return "Not recorded";
}

const totalMinutes = Math.floor(
value / 60
);

const hours = Math.floor(
totalMinutes / 60
);

const minutes = totalMinutes % 60;

if (hours > 0) {
return `${hours}h ${minutes}m`;
}

return `${minutes}m`;
};

const extractSessions = (payload) => {
if (Array.isArray(payload)) {
return payload;
}

if (
Array.isArray(payload?.sessions)
) {
return payload.sessions;
}

if (
Array.isArray(payload?.data)
) {
return payload.data;
}

if (
Array.isArray(payload?.liveClasses)
) {
return payload.liveClasses;
}

if (
Array.isArray(payload?.live_classes)
) {
return payload.live_classes;
}

if (
Array.isArray(payload?.data?.sessions)
) {
return payload.data.sessions;
}

return [];
};

const normalizeLiveActivity = (
session,
index
) => {
const id = firstValue(
session.id,
session.live_class_id,
session.sessionId,
`live-${index}`
);

const status = firstValue(
session.status,
"scheduled"
);

const title = firstValue(
session.title,
"Live Class"
);

const timestamp = firstValue(
session.updated_at,
session.started_at,
session.actual_start,
session.scheduled_at,
session.scheduled_start,
session.created_at
);

return {
id,
type: "live",
label: "Live Class",
title,
description: firstValue(
session.description,
"Tutor live class activity."
),
status,
grade: firstValue(
session.grade,
session.class_name
),
className: firstValue(
session.class_name,
session.grade
),
subject: firstValue(
session.subject,
Array.isArray(session.subjects)
? session.subjects[0]
: ""
),
roomCode: firstValue(
session.room_code,
session.room_id
),
joinUrl: firstValue(
session.join_url,
session.meeting_url
),
timestamp,
createdAt: session.created_at,
startedAt: firstValue(
session.started_at,
session.actual_start
),
endedAt: firstValue(
session.ended_at,
session.actual_end
),
durationSeconds:
session.duration_seconds ??
session.recording_duration ??
null,
raw: session,
};
};

/* =========================================================
STAT CARD
========================================================= */

const StatCard = ({
icon: Icon,
label,
value,
description,
active = false,
}) => {
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
className={`rounded-2xl border p-5 ${
        active
          ? "border-cyan-500/30 bg-cyan-500/5"
          : "border-slate-800 bg-slate-900/60"
      }`}
> <div className="flex items-start justify-between gap-4"> <div> <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
{label} </p>


      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>

    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        active
          ? "bg-cyan-500/10 text-cyan-400"
          : "bg-slate-800 text-slate-400"
      }`}
    >
      <Icon size={19} />
    </div>
  </div>
</motion.div>

);
};

/* =========================================================
ACTIVITY ITEM
========================================================= */

const ActivityItem = ({
activity,
onOpen,
}) => {
const Icon = getActivityIcon(
activity.type
);

const isLive =
normalize(activity.status) === "live";

return (
<motion.button
type="button"
onClick={() => onOpen(activity)}
initial={{
opacity: 0,
y: 10,
}}
animate={{
opacity: 1,
y: 0,
}}
whileHover={{
y: -2,
}}
className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left transition hover:border-cyan-500/30 hover:bg-slate-900"
> 
  <div className="flex items-start gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isLive
              ? "bg-red-500/10 text-red-400"
              : "bg-cyan-500/10 text-cyan-400"
          }`}
> 
    <Icon size={19} /> </div>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
          {getActivityLabel(
            activity.type
          )}
        </span>

        {activity.status && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
              isLive
                ? "bg-red-500/10 text-red-400"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {activity.status}
          </span>
        )}
      </div>

      <h3 className="mt-1 truncate text-sm font-semibold text-white">
        {activity.title}
      </h3>

      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
        {activity.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={13} />
          {formatDateTime(
            activity.timestamp
          )}
        </span>

        {activity.subject && (
          <span>
            {activity.subject}
          </span>
        )}

        {activity.grade && (
          <span>
            {activity.grade}
          </span>
        )}
      </div>
    </div>
  </div>
</motion.button>

);
};

/* =========================================================
ACTIVITY MODAL
========================================================= */

const ActivityModal = ({
activity,
onClose,
onOpenRoom,
}) => {
if (!activity) {
return null;
}

const isLive =
normalize(activity.status) === "live";

return ( <AnimatePresence>
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
className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
onMouseDown={(event) => {
if (
event.target ===
event.currentTarget
) {
onClose();
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
className="w-full max-w-xl rounded-3xl border border-slate-800 bg-[#071426] shadow-2xl"
> <div className="flex items-center justify-between border-b border-slate-800 p-5"> <div> <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
Activity Details </p>

          <h2 className="mt-1 text-lg font-bold text-white">
            {activity.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <p className="text-sm leading-6 text-slate-400">
            {activity.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Activity
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {activity.label}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {activity.status ||
                "Unknown"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Subject
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {activity.subject ||
                "Not specified"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Class
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {activity.grade ||
                "Not specified"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:col-span-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Time
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {formatDateTime(
                activity.timestamp
              )}
            </p>
          </div>

          {activity.durationSeconds !==
            null &&
            activity.durationSeconds !==
              undefined && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:col-span-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  Duration
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock3 size={14} />
                  {formatDuration(
                    activity.durationSeconds
                  )}
                </p>
              </div>
            )}
        </div>

        {isLive &&
          activity.roomCode && (
            <button
              type="button"
              onClick={() =>
                onOpenRoom(activity)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              <Video size={17} />
              Open Live Class
            </button>
          )}
      </div>
    </motion.div>
  </motion.div>
</AnimatePresence>

);
};

/* =========================================================
MAIN COMPONENT
========================================================= */

const TutorClassDetails = () => {
const location = useLocation();
const navigate = useNavigate();
const params = useParams();

const classData =
location.state?.classData ||
location.state?.class ||
location.state?.selectedClass ||
{};

const stateTutor =
location.state?.tutor ||
classData?.tutor ||
{};

const storedTutor =
useMemo(
() => getStoredTutor(),
[]
);

const grade = useMemo(
() =>
firstValue(
classData.grade,
classData.className,
classData.class_name,
classData.gradeName,
classData.grade_name,
location.state?.grade,
params.grade,
"Senior Secondary"
),
[
classData,
location.state,
params.grade,
]
);

const subject = useMemo(
() =>
firstValue(
classData.subject,
classData.subject_name,
classData.subjectName,
location.state?.subject,
params.subject,
"Mathematics"
),
[
classData,
location.state,
params.subject,
]
);

const tutorReference = useMemo(
() =>
firstValue(
location.state?.tutorReference,
location.state?.tutor_reference,

    stateTutor.tutorReference,
    stateTutor.tutor_reference,
    stateTutor.reference,

    classData.tutorReference,
    classData.tutor_reference,

    storedTutor.tutorReference,
    storedTutor.tutor_reference,
    storedTutor.reference,

    getStoredTutorReference()
  ),
[
  location.state,
  stateTutor,
  classData,
  storedTutor,
]

);

const tutorName = firstValue(
stateTutor.name,
stateTutor.fullName,
stateTutor.full_name,
stateTutor.tutorName,
storedTutor.name,
storedTutor.fullName,
"Tutor"
);

const tutorEmail = firstValue(
stateTutor.email,
stateTutor.emailAddress,
storedTutor.email
);

const classId = firstValue(
classData.id,
classData.classId,
classData.class_id,
classData.grade_id,
classData.gradeId,
location.state?.classId,
location.state?.class_id
);

const className = firstValue(
classData.className,
classData.class_name,
classData.name,
classData.gradeName,
classData.grade_name,
grade
);

const studentCount =
Number(
classData.studentCount ??
classData.student_count ??
classData.studentsCount ??
(
Array.isArray(
classData.students
)
? classData.students.length
: 0
)
) || 0;

const [activities, setActivities] =
useState([]);

const [loading, setLoading] =
useState(true);

const [refreshing, setRefreshing] =
useState(false);

const [error, setError] =
useState("");

const [lastChecked, setLastChecked] =
useState(null);

const [selectedActivity, setSelectedActivity] =
useState(null);

const [startingLive, setStartingLive] =
useState(false);

const [actionError, setActionError] =
useState("");

const [activityFilter, setActivityFilter] =
useState("all");

/* =========================================================
LOAD REAL LIVE CLASS ACTIVITIES
========================================================= */

const loadActivities = useCallback(
async ({
silent = false,
} = {}) => {
if (!tutorReference) {
setLoading(false);
setRefreshing(false);
setError(
"Tutor reference was not found. Please log in again."
);
return;
}

  if (silent) {
    setRefreshing(true);
  } else {
    setLoading(true);
  }

  try {
    const paramsObject =
      new URLSearchParams();

    paramsObject.set(
      "tutorReference",
      tutorReference
    );

    const response =
      await fetch(
        `${API_BASE_URL}/api/academy/tutor/live-classes?${paramsObject.toString()}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
            "x-tutor-reference":
              tutorReference,
          },
        }
      );

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    let payload;

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      payload =
        await response.json();
    } else {
      const text =
        await response.text();

      throw new Error(
        text ||
          `Request failed with status ${response.status}`
      );
    }

    if (!response.ok) {
      throw new Error(
        payload?.message ||
          payload?.error ||
          `Request failed with status ${response.status}`
      );
    }

    const sessions =
      extractSessions(payload);

    const normalizedActivities =
      sessions
        .map(
          normalizeLiveActivity
        )
        .sort((a, b) => {
          const aTime =
            new Date(
              a.timestamp || 0
            ).getTime();

          const bTime =
            new Date(
              b.timestamp || 0
            ).getTime();

          return bTime - aTime;
        });

    setActivities(
      normalizedActivities
    );

    setLastChecked(
      new Date()
    );

    setError("");
  } catch (requestError) {
    console.error(
      "Live activity connection error:",
      requestError
    );

    setError(
      requestError?.message ||
        "Failed to check live class activity."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
},
[tutorReference]

);

/* =========================================================
INITIAL LOAD + LIVE POLLING
========================================================= */

useEffect(() => {
loadActivities();
const interval =
  window.setInterval(() => {
    loadActivities({
      silent: true,
    });
  }, 5000);

return () => {
  window.clearInterval(
    interval
  );
};

}, [loadActivities]);

/* =========================================================
ACTIVITY STATS
========================================================= */

const liveClasses =
activities.length;

const currentlyLive =
activities.filter(
(activity) =>
normalize(
activity.status
) === "live"
).length;

const scheduledClasses =
activities.filter(
(activity) =>
normalize(
activity.status
) === "scheduled"
).length;

const completedClasses =
activities.filter(
(activity) =>
normalize(
activity.status
) === "ended" ||
normalize(
activity.status
) === "completed"
).length;

const filteredActivities =
useMemo(() => {
if (
activityFilter === "all"
) {
return activities;
}

  return activities.filter(
    (activity) => {
      if (
        activityFilter ===
        "live"
      ) {
        return (
          normalize(
            activity.status
          ) === "live"
        );
      }

      return (
        normalize(
          activity.type
        ) ===
        normalize(
          activityFilter
        )
      );
    }
  );
}, [
  activities,
  activityFilter,
]);

/* =========================================================
RUN LIVE CLASS
========================================================= */

const handleRunLiveClass =
useCallback(async () => {
setActionError("");

  if (!tutorReference) {
    setActionError(
      "Tutor reference was not found. Please log in again."
    );
    return;
  }

  if (!classId) {
    setActionError(
      "This class does not have a valid class ID. Go back to My Classes and open the class again."
    );
    return;
  }

  if (!grade) {
    setActionError(
      "Grade/class is required before starting a Live Class."
    );
    return;
  }

  if (!subject) {
    setActionError(
      "Subject is required before starting a Live Class."
    );
    return;
  }

  setStartingLive(true);

  try {
    /* -----------------------------------------------------
       STEP 1: CREATE LIVE CLASS
    ----------------------------------------------------- */

    const createResponse =
      await fetch(
        `${API_BASE_URL}/api/academy/tutor/live-classes`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
            "x-tutor-reference":
              tutorReference,
          },
          body: JSON.stringify({
            tutorReference,
            tutor_reference:
              tutorReference,

            classId,
            class_id: classId,

            className,
            class_name:
              className,

            grade,

            subject,

            title: `${subject} Live Class`,

            description: `Live ${subject} class for ${grade}.`,
          }),
        }
      );

    const createContentType =
      createResponse.headers.get(
        "content-type"
      ) || "";

    let createPayload;

    if (
      createContentType.includes(
        "application/json"
      )
    ) {
      createPayload =
        await createResponse.json();
    } else {
      const text =
        await createResponse.text();

      throw new Error(
        text ||
          `Failed to create Live Class (${createResponse.status})`
      );
    }

    if (!createResponse.ok) {
      throw new Error(
        createPayload?.message ||
          createPayload?.error ||
          `Failed to create Live Class (${createResponse.status})`
      );
    }

    const session =
      createPayload?.session ||
      createPayload?.data;

    if (!session?.id) {
      throw new Error(
        "Live Class was created, but the server did not return a valid Live Class ID."
      );
    }

    /* -----------------------------------------------------
       STEP 2: START LIVE CLASS
    ----------------------------------------------------- */

    const startResponse =
      await fetch(
        `${API_BASE_URL}/api/academy/tutor/live-classes/${session.id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
            "x-tutor-reference":
              tutorReference,
          },
          body: JSON.stringify({
            tutorReference,
            tutor_reference:
              tutorReference,
          }),
        }
      );

    const startContentType =
      startResponse.headers.get(
        "content-type"
      ) || "";

    let startPayload;

    if (
      startContentType.includes(
        "application/json"
      )
    ) {
      startPayload =
        await startResponse.json();
    } else {
      const text =
        await startResponse.text();

      throw new Error(
        text ||
          `Failed to start Live Class (${startResponse.status})`
      );
    }

    if (!startResponse.ok) {
      throw new Error(
        startPayload?.message ||
          startPayload?.error ||
          `Failed to start Live Class (${startResponse.status})`
      );
    }

    const startedSession =
      startPayload?.session ||
      session;

    const roomCode = firstValue(
      startedSession.room_code,
      startedSession.room_id,
      session.room_code,
      session.room_id
    );

    /* -----------------------------------------------------
       STEP 3: REFRESH ACTIVITY DATA
    ----------------------------------------------------- */

    await loadActivities({
      silent: true,
    });

    /* -----------------------------------------------------
       STEP 4: OPEN THE ACTUAL LIVE ROOM
    ----------------------------------------------------- */

    if (roomCode) {
      navigate(
        `/academy/live-class/${encodeURIComponent(
          roomCode
        )}`,
        {
          state: {
            liveClass:
              startedSession,

            session:
              startedSession,

            tutor: stateTutor,

            tutorReference,

            grade,

            subject,

            classData,
          },
        }
      );

      return;
    }

    /* -----------------------------------------------------
       FALLBACK: OPEN TUTOR LIVE CLASS PAGE
    ----------------------------------------------------- */

    navigate(
      "/academy/tutor/live",
      {
        state: {
          liveClass:
            startedSession,

          session:
            startedSession,

          tutor: stateTutor,

          tutorReference,

          grade,

          subject,

          classData,
        },
      }
    );
  } catch (requestError) {
    console.error(
      "Run Live Class error:",
      requestError
    );

    setActionError(
      requestError?.message ||
        "Unable to start Live Class."
    );
  } finally {
    setStartingLive(false);
  }
}, [
  tutorReference,
  classId,
  grade,
  subject,
  className,
  stateTutor,
  classData,
  navigate,
  loadActivities,
]);

/* =========================================================
OPEN EXISTING LIVE ROOM
========================================================= */

const handleOpenRoom = (
activity
) => {
if (!activity?.roomCode) {
setActionError(
"This Live Class does not have a room code."
);
return;
}

navigate(
  `/academy/live-class/${encodeURIComponent(
    activity.roomCode
  )}`,
  {
    state: {
      liveClass:
        activity.raw,

      session:
        activity.raw,

      tutor: stateTutor,

      tutorReference,

      grade:
        activity.grade ||
        grade,

      subject:
        activity.subject ||
        subject,

      classData,
    },
  }
);

};

/* =========================================================
QUICK ACTIONS
========================================================= */

const handleQuickAction = (
action
) => {
if (action === "live") {
handleRunLiveClass();
return;
}

if (action === "assignment") {
  navigate(
    "/academy/tutor/assignments/create",
    {
      state: {
        classData,
        tutor: stateTutor,
        tutorReference,
        grade,
        subject,
      },
    }
  );
  return;
}

if (action === "lesson") {
  navigate(
    "/academy/tutor/materials",
    {
      state: {
        classData,
        tutor: stateTutor,
        tutorReference,
        grade,
        subject,
      },
    }
  );
  return;
}

if (action === "quiz") {
  navigate(
    "/academy/tutor/assignments/create",
    {
      state: {
        classData,
        tutor: stateTutor,
        tutorReference,
        grade,
        subject,
        createQuiz: true,
      },
    }
  );
}

};

/* =========================================================
RENDER
========================================================= */

return ( <div className="min-h-screen bg-[#020617] text-white">
{/* =================== HEADER =========================== */}

  <div className="border-b border-slate-800 bg-[#071426]/90">
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/academy/tutor/classes"
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Tutor Class
            </p>

            <h1 className="mt-1 text-xl font-bold text-white">
              {subject}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {grade}
              {className &&
                className !==
                  grade
                ? ` • ${className}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Activity Checking Live
          </div>

          <button
            type="button"
            onClick={() =>
              loadActivities({
                silent: true,
              })
            }
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* =====================================================
      CONTENT
  ===================================================== */}

  <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    {/* HERO */}
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#071426] via-[#081827] to-[#020617] p-6 sm:p-8">
      <div className="relative z-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs font-semibold text-cyan-400">
                {grade}
              </span>

              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-400">
                {subject}
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Manage your class
              <span className="text-cyan-400">
                {" "}
                in real time.
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Start a Live Class, manage
              your teaching activities, and
              monitor the activities recorded
              for this class directly from the
              backend.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  handleQuickAction(
                    "live"
                  )
                }
                disabled={startingLive}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {startingLive ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Starting Live Class...
                  </>
                ) : (
                  <>
                    <Play size={17} />
                    Run Live Class
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
                <User size={15} />
                {tutorName}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[420px]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <Users
                size={18}
                className="text-cyan-400"
              />

              <p className="mt-3 text-2xl font-bold text-white">
                {studentCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Students
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <Radio
                size={18}
                className="text-red-400"
              />

              <p className="mt-3 text-2xl font-bold text-white">
                {currentlyLive}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Live Now
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <Video
                size={18}
                className="text-cyan-400"
              />

              <p className="mt-3 text-2xl font-bold text-white">
                {liveClasses}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Live Classes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ACTION ERROR */}
    <AnimatePresence>
      {actionError && (
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
          className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            <p className="font-semibold">
              Live Class error
            </p>

            <p className="mt-1 text-red-300/80">
              {actionError}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setActionError("")
            }
            className="text-red-400 hover:text-red-200"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    {/* STATS */}
    <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Video}
        label="Live Classes"
        value={liveClasses}
        description="Recorded in the backend"
      />

      <StatCard
        icon={Radio}
        label="Live Now"
        value={currentlyLive}
        description="Currently active"
        active={
          currentlyLive > 0
        }
      />

      <StatCard
        icon={CalendarDays}
        label="Scheduled"
        value={scheduledClasses}
        description="Waiting to start"
      />

      <StatCard
        icon={CheckCircle2}
        label="Completed"
        value={completedClasses}
        description="Finished Live Classes"
      />
    </section>

    {/* MAIN GRID */}
    <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* ACTIVITY */}
      <div className="rounded-3xl border border-slate-800 bg-[#071426]/70">
        <div className="border-b border-slate-800 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Radio
                  size={17}
                  className="text-cyan-400"
                />

                <h2 className="text-lg font-bold text-white">
                  Activity Overview
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Live activity is checked
                automatically every 5 seconds.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                {
                  key: "all",
                  label: "All",
                },
                {
                  key: "live",
                  label: "Live",
                },
                {
                  key: "ended",
                  label: "Completed",
                },
                {
                  key: "scheduled",
                  label: "Scheduled",
                },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() =>
                    setActivityFilter(
                      filter.key
                    )
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activityFilter ===
                    filter.key
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-900 text-slate-500 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {lastChecked && (
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Last checked{" "}
              {formatDateTime(
                lastChecked
              )}
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center">
              <Loader2
                size={28}
                className="animate-spin text-cyan-400"
              />

              <p className="mt-4 text-sm font-semibold text-white">
                Checking class activity...
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Connecting to the Live Class
                backend.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <div>
                  <p className="text-sm font-semibold text-red-300">
                    Activity connection error
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-300/70">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      loadActivities()
                    }
                    className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    <RefreshCw
                      size={14}
                    />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : filteredActivities.length ===
            0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/20 px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-slate-600">
                <Radio size={24} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-white">
                No Live Class activity yet
              </h3>

              <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                Start a Live Class and its
                real backend activity will
                appear here automatically.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleRunLiveClass()
                }
                disabled={startingLive}
                className="mt-5 flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
              >
                <Play size={14} />
                Start Live Class
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map(
                (activity) => (
                  <ActivityItem
                    key={`${activity.id}-${activity.timestamp}`}
                    activity={
                      activity
                    }
                    onOpen={
                      setSelectedActivity
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="space-y-6">
        {/* QUICK ACTIONS */}
        <div className="rounded-3xl border border-slate-800 bg-[#071426]/70 p-5">
          <div className="flex items-center gap-2">
            <Plus
              size={17}
              className="text-cyan-400"
            />

            <h2 className="text-sm font-bold text-white">
              Quick Actions
            </h2>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() =>
                handleQuickAction(
                  "live"
                )
              }
              disabled={startingLive}
              className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-left transition hover:border-red-500/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                {startingLive ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Video size={17} />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-white">
                  {startingLive
                    ? "Starting..."
                    : "Run Live Class"}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Open the real classroom
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickAction(
                  "assignment"
                )
              }
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left transition hover:border-cyan-500/20 hover:bg-slate-900"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <ClipboardList
                  size={17}
                />
              </div>

              <div>
                <p className="text-xs font-bold text-white">
                  Create Assignment
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Give students new work
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickAction(
                  "lesson"
                )
              }
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left transition hover:border-cyan-500/20 hover:bg-slate-900"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <BookOpen
                  size={17}
                />
              </div>

              <div>
                <p className="text-xs font-bold text-white">
                  Add Lesson
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Add learning material
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickAction(
                  "quiz"
                )
              }
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left transition hover:border-cyan-500/20 hover:bg-slate-900"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <FileText
                  size={17}
                />
              </div>

              <div>
                <p className="text-xs font-bold text-white">
                  Create Quiz
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Test student knowledge
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* CLASS INFO */}
        <div className="rounded-3xl border border-slate-800 bg-[#071426]/70 p-5">
          <div className="flex items-center gap-2">
            <School
              size={17}
              className="text-cyan-400"
            />

            <h2 className="text-sm font-bold text-white">
              Class Information
            </h2>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Grade
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {grade}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Subject
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {subject}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Tutor
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {tutorName}
              </p>

              {tutorEmail && (
                <p className="mt-1 truncate text-xs text-slate-500">
                  {tutorEmail}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Students
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {studentCount}
              </p>
            </div>
          </div>
        </div>

        {/* BACKEND STATUS */}
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2
                size={18}
              />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-300">
                Backend Connected
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-300/60">
                Live Class activity is
                being read from the real
                academy_live_classes table.
              </p>

              {lastChecked && (
                <p className="mt-2 text-[10px] text-emerald-300/40">
                  Checked{" "}
                  {formatDateTime(
                    lastChecked
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </section>
  </main>

  {/* =====================================================
      ACTIVITY MODAL
  ===================================================== */}

  <ActivityModal
    activity={
      selectedActivity
    }
    onClose={() =>
      setSelectedActivity(
        null
      )
    }
    onOpenRoom={(activity) => {
      setSelectedActivity(
        null
      );

      handleOpenRoom(
        activity
      );
    }}
  />
</div>


);
};

export default TutorClassDetails;
