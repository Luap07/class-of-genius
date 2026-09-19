import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  Play,
  RefreshCw,
  Search,
  Video,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

/* ============================================================
   CONFIG
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const AUTH_TOKEN_KEY = "scholiqen_academy_token";
const AUTH_USER_KEY = "scholiqen_academy_user";

/* ============================================================
   HELPERS
============================================================ */

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeClass = (value) => {
  const text = normalizeText(value);

  if (!text) return "";

  return text
    .replace(/^class\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const normalizeSubject = (value) => {
  const text = normalizeText(value);

  if (!text) return "";

  const lower = text.toLowerCase();

  const aliases = {
    maths: "Mathematics",
    math: "Mathematics",
    mathematics: "Mathematics",

    english: "English Language",
    "english studies": "English Language",
    "english language": "English Language",

    ict: "Computer Studies",
    "computer science": "Computer Studies",
    "computer studies": "Computer Studies",

    biology: "Biology",
    chemistry: "Chemistry",
    physics: "Physics",

    "basic science": "Basic Science",
    "basic technology": "Basic Technology",

    civic: "Civic Education",
    "civic education": "Civic Education",

    crs: "Christian Religious Studies",
    "christian religious studies":
      "Christian Religious Studies",

    irs: "Islamic Religious Studies",
    "islamic religious studies":
      "Islamic Religious Studies",

    phe: "Physical and Health Education",
    "physical education":
      "Physical and Health Education",
    "physical and health education":
      "Physical and Health Education",

    cca: "Cultural and Creative Arts",
    "cultural and creative arts":
      "Cultural and Creative Arts",

    economics: "Economics",
    geography: "Geography",
    government: "Government",
    literature: "Literature in English",
    "literature in english": "Literature in English",

    commerce: "Commerce",
    accounting: "Financial Accounting",
    "financial accounting": "Financial Accounting",
  };

  return aliases[lower] || text;
};

const resolveMediaUrl = (url) => {
  if (!url) return "";

  const value = String(url).trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/${value}`;
};

/* ============================================================
   STUDENT STORAGE
============================================================ */

const getStudentFromStorage = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);

    if (!raw) return null;

    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "Unable to read academy student:",
      error
    );

    return null;
  }
};

const getStudentClass = (student) => {
  if (!student) return "";

  return (
    student.grade ||
    student.class ||
    student.className ||
    student.gradeLevel ||
    student.studentClass ||
    ""
  );
};

const getStudentSubjects = (student) => {
  if (!student) return [];

  const possibleSubjects =
    student.subjects ||
    student.subject ||
    student.enrolledSubjects ||
    student.registeredSubjects ||
    [];

  if (Array.isArray(possibleSubjects)) {
    return possibleSubjects
      .map((subject) => {
        if (
          typeof subject === "string"
        ) {
          return normalizeSubject(subject);
        }

        return normalizeSubject(
          subject?.name ||
            subject?.subject ||
            subject?.title ||
            ""
        );
      })
      .filter(Boolean);
  }

  if (typeof possibleSubjects === "string") {
    return possibleSubjects
      .split(",")
      .map(normalizeSubject)
      .filter(Boolean);
  }

  return [];
};

/* ============================================================
   RESOURCE HELPERS
============================================================ */

const getVideoTitle = (lesson) =>
  normalizeText(
    lesson?.title ||
      lesson?.name ||
      lesson?.resource_title ||
      lesson?.resourceTitle ||
      "Untitled Lesson"
  );

const getVideoSubject = (lesson) =>
  normalizeSubject(
    lesson?.subject ||
      lesson?.subject_name ||
      lesson?.subjectName ||
      lesson?.category ||
      lesson?.category_name ||
      ""
  );

const getVideoDescription = (lesson) =>
  normalizeText(
    lesson?.description ||
      lesson?.content ||
      lesson?.summary ||
      ""
  );

const getVideoClass = (lesson) =>
  lesson?.class ||
  lesson?.class_name ||
  lesson?.className ||
  lesson?.grade ||
  lesson?.grade_level ||
  lesson?.gradeLevel ||
  "";

const getVideoUrl = (lesson) => {
  /*
   * Keep resource-link support first.
   *
   * The backend may return any of these names depending
   * on the resource record.
   */

  const url =
    lesson?.resource_link ||
    lesson?.resourceLink ||
    lesson?.resource_url ||
    lesson?.resourceUrl ||
    lesson?.video_url ||
    lesson?.videoUrl ||
    lesson?.file_url ||
    lesson?.fileUrl ||
    lesson?.url ||
    lesson?.src ||
    "";

  return resolveMediaUrl(url);
};

const getThumbnailUrl = (lesson) => {
  const url =
    lesson?.thumbnail_url ||
    lesson?.thumbnailUrl ||
    lesson?.thumbnail ||
    lesson?.poster ||
    lesson?.image_url ||
    lesson?.imageUrl ||
    "";

  return resolveMediaUrl(url);
};

const getResourceType = (lesson) =>
  normalizeText(
    lesson?.resource_type ||
      lesson?.resourceType ||
      lesson?.type ||
      lesson?.file_type ||
      lesson?.fileType ||
      ""
  ).toLowerCase();

/* ============================================================
   DATE HELPERS
============================================================ */

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

/* ============================================================
   THUMBNAIL
============================================================ */

function LessonThumbnail({
  lesson,
  onOpen,
}) {
  const thumbnail = getThumbnailUrl(lesson);
  const videoUrl = getVideoUrl(lesson);

  return (
    <button
      type="button"
      onClick={() => onOpen(lesson)}
      className="group relative block h-full w-full overflow-hidden bg-slate-950 text-left"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={getVideoTitle(lesson)}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : videoUrl ? (
        <video
          src={videoUrl}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-950 via-slate-950 to-blue-950">
          <Video
            size={52}
            className="text-cyan-400/70"
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-cyan-500/90 text-white shadow-xl transition duration-300 group-hover:scale-110">
          <Play
            size={22}
            fill="currentColor"
            className="ml-1"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-cyan-200 backdrop-blur-md">
          <Video size={12} />
          Video Lesson
        </div>

        <p className="line-clamp-2 text-sm font-semibold text-white">
          {getVideoTitle(lesson)}
        </p>
      </div>
    </button>
  );
}

/* ============================================================
   LESSON CARD
============================================================ */

function LessonCard({
  lesson,
  onOpen,
}) {
  const subject = getVideoSubject(lesson);
  const description =
    getVideoDescription(lesson);

  const date =
    formatDate(
      lesson?.created_at ||
        lesson?.createdAt ||
        lesson?.uploaded_at ||
        lesson?.uploadedAt
    );

  const duration =
    lesson?.duration ||
    lesson?.duration_minutes ||
    lesson?.durationMinutes ||
    "";

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -10,
      }}
      transition={{
        duration: 0.25,
      }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/10"
    >
      <div className="aspect-video">
        <LessonThumbnail
          lesson={lesson}
          onOpen={onOpen}
        />
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {subject && (
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
              {subject}
            </span>
          )}

          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400">
            Video
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-bold text-white">
          {getVideoTitle(lesson)}
        </h3>

        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
            {description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          {date && (
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              {date}
            </span>
          )}

          {duration && (
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} />
              {duration}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpen(lesson)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          <Play
            size={17}
            fill="currentColor"
          />

          Watch Lesson

          <ChevronRight size={17} />
        </button>
      </div>
    </motion.article>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyLessons({
  hasFilters,
  onReset,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
        <BookOpen size={30} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-white">
        {hasFilters
          ? "No lessons found"
          : "No video lessons available"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        {hasFilters
          ? "Try another search or subject filter."
          : "Video lessons for your class will appear here when they are available."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <X size={16} />
          Clear Filters
        </button>
      )}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function StudentLessons() {
  const navigate = useNavigate();

  const outletContext =
    useOutletContext?.() || {};

  const studentFromContext =
    outletContext?.student ||
    outletContext?.user ||
    null;

  const [
    student,
    setStudent,
  ] = useState(
    studentFromContext ||
      getStudentFromStorage()
  );

  const [
    lessons,
    setLessons,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState("All");

  /* ==========================================================
     STUDENT CLASS
  ========================================================== */

  const studentClass = useMemo(
    () => getStudentClass(student),
    [student]
  );

  const normalizedStudentClass =
    useMemo(
      () =>
        normalizeClass(
          studentClass
        ),
      [studentClass]
    );

  /* ==========================================================
     FETCH LESSONS
  ========================================================== */

  const fetchLessons = useCallback(
    async ({
      showRefresh = false,
    } = {}) => {
      const token =
        localStorage.getItem(
          AUTH_TOKEN_KEY
        );

      const currentStudent =
        student ||
        getStudentFromStorage();

      if (currentStudent) {
        setStudent(currentStudent);
      }

      if (!token) {
        setError(
          "Your student session has expired. Please log in again."
        );
        setLoading(false);
        return;
      }

      const currentClass =
        getStudentClass(
          currentStudent
        );

      if (!currentClass) {
        setError(
          "Your class could not be identified."
        );
        setLoading(false);
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params =
          new URLSearchParams();

        params.set(
          "class",
          currentClass
        );

        const response =
          await fetch(
            `${API_URL}/api/academy/student/resources?${params.toString()}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept:
                  "application/json",
              },
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let payload = null;

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
              `Unable to load lessons (${response.status})`
          );
        }

        const rawResources =
          Array.isArray(payload)
            ? payload
            : Array.isArray(
                payload?.resources
              )
            ? payload.resources
            : Array.isArray(
                payload?.data
              )
            ? payload.data
            : Array.isArray(
                payload?.results
              )
            ? payload.results
            : [];

        /*
         * Only video resources belong
         * on Student Lessons.
         */

        const videoResources =
          rawResources.filter(
            (resource) => {
              const type =
                getResourceType(
                  resource
                );

              const url =
                getVideoUrl(
                  resource
                );

              const looksLikeVideo =
                type.includes("video") ||
                type.includes("mp4") ||
                type.includes("webm") ||
                type.includes("mov");

              /*
               * Some existing resources may
               * not have resource_type set.
               * If a video link exists, allow it.
               */

              return (
                looksLikeVideo ||
                Boolean(url)
              );
            }
          );

        /*
         * IMPORTANT:
         * Keep only resources belonging
         * to the student's class.
         */

        const classFiltered =
          videoResources.filter(
            (resource) => {
              const resourceClass =
                normalizeClass(
                  getVideoClass(
                    resource
                  )
                );

              if (
                !resourceClass
              ) {
                /*
                 * If the backend has already
                 * filtered by the student's class,
                 * allow the resource.
                 */
                return true;
              }

              return (
                resourceClass ===
                normalizedStudentClass
              );
            }
          );

        setLessons(
          classFiltered
        );
      } catch (fetchError) {
        console.error(
          "Student lessons fetch error:",
          fetchError
        );

        setError(
          fetchError?.message ||
            "Unable to load lessons."
        );

        setLessons([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      student,
      normalizedStudentClass,
    ]
  );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    const storedStudent =
      getStudentFromStorage();

    if (storedStudent) {
      setStudent(storedStudent);
    }

    fetchLessons();
  }, [fetchLessons]);

  /* ==========================================================
     SUBJECTS
  ========================================================== */

  const subjects = useMemo(() => {
    const lessonSubjects =
      lessons
        .map(getVideoSubject)
        .filter(Boolean);

    const studentSubjects =
      getStudentSubjects(
        student
      );

    return [
      "All",
      ...Array.from(
        new Set([
          ...studentSubjects,
          ...lessonSubjects,
        ])
      ).sort((a, b) =>
        a.localeCompare(b)
      ),
    ];
  }, [lessons, student]);

  /* ==========================================================
     FILTERED LESSONS
  ========================================================== */

  const filteredLessons =
    useMemo(() => {
      const query =
        normalizeText(
          search
        ).toLowerCase();

      return lessons.filter(
        (lesson) => {
          const title =
            getVideoTitle(
              lesson
            ).toLowerCase();

          const subject =
            getVideoSubject(
              lesson
            ).toLowerCase();

          const description =
            getVideoDescription(
              lesson
            ).toLowerCase();

          const matchesSearch =
            !query ||
            title.includes(
              query
            ) ||
            subject.includes(
              query
            ) ||
            description.includes(
              query
            );

          const matchesSubject =
            selectedSubject ===
              "All" ||
            normalizeSubject(
              getVideoSubject(
                lesson
              )
            ) ===
              normalizeSubject(
                selectedSubject
              );

          return (
            matchesSearch &&
            matchesSubject
          );
        }
      );
    }, [
      lessons,
      search,
      selectedSubject,
    ]);

  /* ==========================================================
     OPEN VIDEO READER
  ========================================================== */

  const openLesson = useCallback(
    (lesson) => {
      if (!lesson?.id) {
        console.error(
          "Cannot open lesson: missing resource id.",
          lesson
        );
        return;
      }

      /*
       * Your App.jsx already has:
       *
       * /video/:id
       *
       * So every Watch Lesson button
       * opens the existing VideoReader.
       *
       * The VideoReader receives the
       * resource ID and can then load
       * the actual resource link.
       */

      navigate(
        `/video/${encodeURIComponent(
          lesson.id
        )}`
      );
    },
    [navigate]
  );

  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  const resetFilters = () => {
    setSearch("");
    setSelectedSubject("All");
  };

  const hasFilters =
    Boolean(
      normalizeText(search)
    ) ||
    selectedSubject !== "All";

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-transparent">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Loader2
                size={27}
                className="animate-spin text-cyan-400"
              />
            </div>

            <p className="text-sm text-slate-400">
              Loading your lessons...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="min-h-full bg-transparent text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-400">
                <BookOpen size={17} />

                <span>
                  Student Learning Portal
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Video Lessons
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Watch lessons created for your
                class and subjects.
              </p>

              {studentClass && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                  <BookOpen size={14} />

                  Class: {studentClass}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                fetchLessons({
                  showRefresh: true,
                })
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </motion.div>

        {/* ====================================================
            ERROR
        ==================================================== */}

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
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4"
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-300">
                Unable to load lessons
              </p>

              <p className="mt-1 text-sm leading-6 text-red-200/70">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchLessons()
              }
              className="shrink-0 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-400/20"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* ====================================================
            SEARCH + FILTER
        ==================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.05,
          }}
          className="mb-7 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-xl shadow-black/10"
        >
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
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
                placeholder="Search lessons..."
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[55%]">
              {subjects.map(
                (subject) => {
                  const active =
                    selectedSubject ===
                    subject;

                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() =>
                        setSelectedSubject(
                          subject
                        )
                      }
                      className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                          : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {subject}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </motion.div>

        {/* ====================================================
            RESULT COUNT
        ==================================================== */}

        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-300">
              {filteredLessons.length}{" "}
              {filteredLessons.length === 1
                ? "lesson"
                : "lessons"}
            </p>

            {hasFilters && (
              <p className="mt-1 text-xs text-slate-500">
                Filtered from{" "}
                {lessons.length} available
                lessons
              </p>
            )}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>

        {/* ====================================================
            LESSON GRID
        ==================================================== */}

        <AnimatePresence mode="popLayout">
          {filteredLessons.length > 0 ? (
            <motion.div
              layout
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredLessons.map(
                (lesson, index) => (
                  <LessonCard
                    key={
                      lesson?.id ||
                      `lesson-${index}`
                    }
                    lesson={lesson}
                    onOpen={openLesson}
                  />
                )
              )}
            </motion.div>
          ) : (
            <EmptyLessons
              hasFilters={hasFilters}
              onReset={resetFilters}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
