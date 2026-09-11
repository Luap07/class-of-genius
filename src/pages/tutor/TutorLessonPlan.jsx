import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  File,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const ACADEMY_TOKEN_KEY =
  "scholiqen_academy_token";

const ACADEMY_USER_KEY =
  "scholiqen_academy_user";

/* =========================================================
   HELPERS
========================================================= */

const clean = (value) =>
  String(value ?? "").trim();

/* ---------------------------------------------------------
   Read JSON safely
--------------------------------------------------------- */

const getStoredJson = (...keys) => {
  for (const key of keys) {
    try {
      const value =
        localStorage.getItem(key);

      if (!value) continue;

      const parsed =
        JSON.parse(value);

      if (parsed) {
        return parsed;
      }
    } catch {
      // Ignore invalid JSON.
    }
  }

  return null;
};

/* ---------------------------------------------------------
   Get Academy user
--------------------------------------------------------- */

const getAcademyUser = () => {
  return getStoredJson(
    ACADEMY_USER_KEY,
    "academyUser",
    "academy_user",
    "scholiqen_user"
  );
};

/* ---------------------------------------------------------
   Get tutor reference

   IMPORTANT:
   Academy auth uses:
   scholiqen_academy_user

   Tutor reference may be stored in different
   shapes depending on the login response.
--------------------------------------------------------- */

const getTutorReference = () => {
  const storedUser =
    getAcademyUser();

  /* -----------------------------------------------
     Direct localStorage reference keys
  ------------------------------------------------ */

  const directKeys = [
    "tutorReference",
    "tutor_reference",
    "academyTutorReference",
    "academy_tutor_reference",
    "userReference",
    "user_reference",
  ];

  for (const key of directKeys) {
    const value = clean(
      localStorage.getItem(key)
    );

    if (value) {
      return value;
    }
  }

  /* -----------------------------------------------
     Search the Academy user object
  ------------------------------------------------ */

  const possibleReferences = [
    storedUser?.tutorReference,
    storedUser?.tutor_reference,
    storedUser?.reference,
    storedUser?.userReference,
    storedUser?.user_reference,

    storedUser?.tutor?.reference,
    storedUser?.tutor?.tutorReference,
    storedUser?.tutor?.tutor_reference,
    storedUser?.tutor?.reference_id,

    storedUser?.academyTutor?.reference,
    storedUser?.academyTutor?.tutorReference,
    storedUser?.academyTutor?.tutor_reference,

    storedUser?.user?.reference,
    storedUser?.user?.tutorReference,
    storedUser?.user?.tutor_reference,

    storedUser?.data?.reference,
    storedUser?.data?.tutorReference,
    storedUser?.data?.tutor_reference,

    storedUser?.profile?.reference,
    storedUser?.profile?.tutorReference,
    storedUser?.profile?.tutor_reference,
  ];

  for (const value of possibleReferences) {
    const reference = clean(value);

    if (reference) {
      return reference;
    }
  }

  /*
    Do NOT use user.id as tutor reference.

    The backend requires the tutor's actual
    tutor reference, not an arbitrary user ID.
  */

  return "";
};

/* ---------------------------------------------------------
   Academy token
--------------------------------------------------------- */

const getAcademyToken = () => {
  return clean(
    localStorage.getItem(
      ACADEMY_TOKEN_KEY
    )
  );
};

/* ---------------------------------------------------------
   Auth headers
--------------------------------------------------------- */

const getAuthHeaders = () => {
  const token =
    getAcademyToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

/* ---------------------------------------------------------
   Class
--------------------------------------------------------- */

const getClassName = (lesson) =>
  clean(
    lesson?.class_name ||
      lesson?.className ||
      lesson?.grade
  );

/* ---------------------------------------------------------
   Title
--------------------------------------------------------- */

const getLessonTitle = (lesson) =>
  clean(lesson?.title) ||
  "Untitled Lesson";

/* ---------------------------------------------------------
   Subject
--------------------------------------------------------- */

const getLessonSubject = (lesson) =>
  clean(lesson?.subject) ||
  "Subject not set";

/* ---------------------------------------------------------
   Status
--------------------------------------------------------- */

const getLessonStatus = (lesson) =>
  clean(lesson?.status) ||
  "published";

/* ---------------------------------------------------------
   Description
--------------------------------------------------------- */

const getDescription = (lesson) =>
  clean(lesson?.description);

/* ---------------------------------------------------------
   Content
--------------------------------------------------------- */

const getLessonContent = (lesson) =>
  clean(lesson?.content);

/* ---------------------------------------------------------
   Date
--------------------------------------------------------- */

const getLessonDate = (lesson) =>
  lesson?.created_at ||
  lesson?.createdAt ||
  lesson?.updated_at ||
  lesson?.updatedAt;

/* ---------------------------------------------------------
   Date formatter
--------------------------------------------------------- */

const formatDate = (value) => {
  if (!value) {
    return "No date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "No date";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

/* ---------------------------------------------------------
   Date/time formatter
--------------------------------------------------------- */

const formatDateTime = (value) => {
  if (!value) {
    return "No date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "No date";
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

/* ---------------------------------------------------------
   Response parser
--------------------------------------------------------- */

const getLessonsFromResponse = (
  data
) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.lessons
    )
  ) {
    return data.lessons;
  }

  if (
    Array.isArray(
      data?.data
    )
  ) {
    return data.data;
  }

  if (
    Array.isArray(
      data?.items
    )
  ) {
    return data.items;
  }

  return [];
};

/* ---------------------------------------------------------
   Resources
--------------------------------------------------------- */

const getResources = (
  lesson
) => {
  if (
    Array.isArray(
      lesson?.resources
    )
  ) {
    return lesson.resources;
  }

  if (
    Array.isArray(
      lesson?.files
    )
  ) {
    return lesson.files;
  }

  return [];
};

/* ---------------------------------------------------------
   Resource name
--------------------------------------------------------- */

const getResourceName = (
  resource
) =>
  clean(
    resource?.file_name ||
      resource?.filename ||
      resource?.name ||
      resource?.original_name
  ) ||
  "Lesson resource";

/* ---------------------------------------------------------
   Resource URL
--------------------------------------------------------- */

const getResourceUrl = (
  resource
) =>
  clean(
    resource?.file_url ||
      resource?.url ||
      resource?.path
  );

/* ---------------------------------------------------------
   Resource icon
--------------------------------------------------------- */

const getResourceIcon = (
  resource
) => {
  const mime =
    clean(
      resource?.file_type ||
        resource?.mime_type ||
        resource?.type
    ).toLowerCase();

  const name =
    getResourceName(
      resource
    ).toLowerCase();

  if (
    mime.includes("video") ||
    /\.(mp4|webm|mov|m4v)$/i.test(
      name
    )
  ) {
    return Video;
  }

  if (
    mime.includes("image") ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(
      name
    )
  ) {
    return ImageIcon;
  }

  if (
    mime.includes("pdf") ||
    /\.pdf$/i.test(name)
  ) {
    return FileText;
  }

  return File;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TutorLessonPlan() {
  const navigate =
    useNavigate();

  const [
    tutorReference,
    setTutorReference,
  ] = useState(() =>
    getTutorReference()
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
    success,
    setSuccess,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    classFilter,
    setClassFilter,
  ] = useState("all");

  const [
    subjectFilter,
    setSubjectFilter,
  ] = useState("all");

  const [
    selectedLesson,
    setSelectedLesson,
  ] = useState(null);

  const [
    editingLesson,
    setEditingLesson,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  /* =======================================================
     REFRESH AUTH DATA
  ======================================================= */

  useEffect(() => {
    const refreshTutorReference =
      () => {
        const reference =
          getTutorReference();

        setTutorReference(
          reference
        );
      };

    refreshTutorReference();

    window.addEventListener(
      "storage",
      refreshTutorReference
    );

    return () => {
      window.removeEventListener(
        "storage",
        refreshTutorReference
      );
    };
  }, []);

  /* =======================================================
     FETCH LESSONS
  ======================================================= */

  const fetchLessons =
    useCallback(
      async (
        isRefresh = false
      ) => {
        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          /*
            Re-read the reference every time.

            This prevents a stale reference from being
            captured before Academy login finished.
          */

          const currentTutorReference =
            getTutorReference();

          if (
            currentTutorReference
          ) {
            setTutorReference(
              currentTutorReference
            );
          }

          /*
            The backend requires tutor reference.
          */

          if (
            !currentTutorReference
          ) {
            throw new Error(
              "Tutor reference is missing. Please log in to your Academy tutor account again."
            );
          }

          const token =
            getAcademyToken();

          if (!token) {
            throw new Error(
              "Academy session is missing. Please log in again."
            );
          }

          const url =
            `${API_BASE}/api/academy/tutor/lessons` +
            `?tutorReference=${encodeURIComponent(
              currentTutorReference
            )}`;

          const response =
            await fetch(url, {
              method: "GET",
              headers: {
                ...getAuthHeaders(),
                Accept:
                  "application/json",
              },
            });

          const data =
            await response
              .json()
              .catch(
                () => ({})
              );

          if (!response.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                `Unable to load lessons. Server returned ${response.status}.`
            );
          }

          const fetchedLessons =
            getLessonsFromResponse(
              data
            );

          setLessons(
            fetchedLessons
          );
        } catch (err) {
          console.error(
            "Tutor lesson fetch error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load your lessons."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  /* =======================================================
     FILTER DATA
  ======================================================= */

  const classOptions =
    useMemo(() => {
      return [
        ...new Set(
          lessons
            .map(
              getClassName
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(b)
      );
    }, [lessons]);

  const subjectOptions =
    useMemo(() => {
      return [
        ...new Set(
          lessons
            .map(
              getLessonSubject
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(b)
      );
    }, [lessons]);

  const filteredLessons =
    useMemo(() => {
      const query =
        clean(search)
          .toLowerCase();

      return lessons.filter(
        (lesson) => {
          const title =
            getLessonTitle(
              lesson
            ).toLowerCase();

          const subject =
            getLessonSubject(
              lesson
            ).toLowerCase();

          const className =
            getClassName(
              lesson
            ).toLowerCase();

          const description =
            getDescription(
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
            className.includes(
              query
            ) ||
            description.includes(
              query
            );

          const matchesClass =
            classFilter ===
              "all" ||
            getClassName(
              lesson
            ) === classFilter;

          const matchesSubject =
            subjectFilter ===
              "all" ||
            getLessonSubject(
              lesson
            ) ===
              subjectFilter;

          return (
            matchesSearch &&
            matchesClass &&
            matchesSubject
          );
        }
      );
    }, [
      lessons,
      search,
      classFilter,
      subjectFilter,
    ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const publishedCount =
    useMemo(() => {
      return lessons.filter(
        (lesson) =>
          getLessonStatus(
            lesson
          ).toLowerCase() ===
          "published"
      ).length;
    }, [lessons]);

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreateLesson =
    () => {
      navigate(
        "/academy/tutor/lessons/create"
      );
    };

  /* =======================================================
     EDIT
  ======================================================= */

  const openEdit = (
    lesson
  ) => {
    setError("");
    setSuccess("");

    setEditingLesson({
      ...lesson,

      title:
        getLessonTitle(
          lesson
        ),

      description:
        getDescription(
          lesson
        ),

      content:
        getLessonContent(
          lesson
        ),

      subject:
        getLessonSubject(
          lesson
        ) ===
        "Subject not set"
          ? ""
          : getLessonSubject(
              lesson
            ),

      class_name:
        getClassName(
          lesson
        ),

      grade:
        clean(
          lesson?.grade
        ) ||
        getClassName(
          lesson
        ),

      status:
        getLessonStatus(
          lesson
        ),
    });
  };

  const handleEditChange =
    (
      field,
      value
    ) => {
      setEditingLesson(
        (current) => ({
          ...current,
          [field]:
            value,
        })
      );
    };

  /* =======================================================
     SAVE EDIT
  ======================================================= */

  const handleSaveEdit =
    async (event) => {
      event.preventDefault();

      if (
        !editingLesson?.id
      ) {
        return;
      }

      const currentTutorReference =
        getTutorReference();

      if (
        !currentTutorReference
      ) {
        setError(
          "Tutor reference is missing. Please log in again."
        );
        return;
      }

      const title =
        clean(
          editingLesson.title
        );

      const subject =
        clean(
          editingLesson.subject
        );

      const className =
        clean(
          editingLesson.class_name ||
            editingLesson.className ||
            editingLesson.grade
        );

      const description =
        clean(
          editingLesson.description
        );

      const content =
        clean(
          editingLesson.content
        );

      if (!title) {
        setError(
          "Lesson title is required."
        );
        return;
      }

      if (!subject) {
        setError(
          "Subject is required."
        );
        return;
      }

      if (!className) {
        setError(
          "Class is required."
        );
        return;
      }

      if (!content) {
        setError(
          "Lesson content is required."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE}/api/academy/tutor/lessons/${editingLesson.id}`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                ...getAuthHeaders(),

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  reference:
                    editingLesson.reference ||
                    editingLesson.lesson_reference ||
                    "",

                  tutorReference:
                    currentTutorReference,

                  tutor_reference:
                    currentTutorReference,

                  title,

                  description,

                  content,

                  subject,

                  class_name:
                    className,

                  className:
                    className,

                  grade:
                    clean(
                      editingLesson.grade
                    ) ||
                    className,

                  status:
                    clean(
                      editingLesson.status
                    ) ||
                    "published",
                }),
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => ({})
            );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to update the lesson."
          );
        }

        const serverLesson =
          data?.lesson ||
          data?.data ||
          null;

        const updatedLesson =
          {
            ...editingLesson,
            ...(serverLesson ||
              {}),

            tutor_reference:
              currentTutorReference,

            title,

            description,

            content,

            subject,

            class_name:
              className,

            className:
              className,

            grade:
              clean(
                editingLesson.grade
              ) ||
              className,

            status:
              clean(
                editingLesson.status
              ) ||
              "published",
          };

        setLessons(
          (current) =>
            current.map(
              (lesson) =>
                String(
                  lesson.id
                ) ===
                String(
                  editingLesson.id
                )
                  ? updatedLesson
                  : lesson
            )
        );

        if (
          selectedLesson &&
          String(
            selectedLesson.id
          ) ===
            String(
              editingLesson.id
            )
        ) {
          setSelectedLesson(
            updatedLesson
          );
        }

        setEditingLesson(
          null
        );

        setSuccess(
          "Lesson updated successfully."
        );
      } catch (err) {
        console.error(
          "Update lesson error:",
          err
        );

        setError(
          err?.message ||
            "Unable to update the lesson."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete =
    async () => {
      if (
        !deleteTarget?.id
      ) {
        return;
      }

      const currentTutorReference =
        getTutorReference();

      if (
        !currentTutorReference
      ) {
        setError(
          "Tutor reference is missing. Please log in again."
        );
        return;
      }

      try {
        setDeleting(true);
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE}/api/academy/tutor/lessons/${deleteTarget.id}`,
            {
              method:
                "DELETE",

              headers: {
                ...getAuthHeaders(),

                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => ({})
            );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to delete the lesson."
          );
        }

        setLessons(
          (current) =>
            current.filter(
              (lesson) =>
                String(
                  lesson.id
                ) !==
                String(
                  deleteTarget.id
                )
            )
        );

        if (
          selectedLesson &&
          String(
            selectedLesson.id
          ) ===
            String(
              deleteTarget.id
            )
        ) {
          setSelectedLesson(
            null
          );
        }

        if (
          editingLesson &&
          String(
            editingLesson.id
          ) ===
            String(
              deleteTarget.id
            )
        ) {
          setEditingLesson(
            null
          );
        }

        setDeleteTarget(
          null
        );

        setSuccess(
          "Lesson deleted successfully."
        );
      } catch (err) {
        console.error(
          "Delete lesson error:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete the lesson."
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-400">
              <BookOpen size={17} />

              <span>
                Scholiqen Academy
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Lesson Plan
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              View and manage every
              lesson you have created
              for your students.
            </p>

            {tutorReference && (
              <p className="mt-2 text-xs text-slate-600">
                Tutor reference:{" "}
                <span className="text-slate-500">
                  {tutorReference}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                fetchLessons(true)
              }
              disabled={
                loading ||
                refreshing
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#071426] px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-500/40 hover:bg-[#0b1b31] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              onClick={
                handleCreateLesson
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus size={18} />

              Create Lesson
            </button>
          </div>
        </div>

        {/* =================================================
            NOTIFICATIONS
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
              className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              <CheckCircle2
                size={18}
              />

              <span className="flex-1">
                {success}
              </span>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
                className="text-emerald-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}

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
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span className="flex-1">
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="text-red-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={BookOpen}
            label="Total Lessons"
            value={
              lessons.length
            }
          />

          <StatCard
            icon={
              GraduationCap
            }
            label="Classes"
            value={
              classOptions.length
            }
          />

          <StatCard
            icon={
              CheckCircle2
            }
            label="Published"
            value={
              publishedCount
            }
          />
        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-800 bg-[#071426] p-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search lesson title, subject or class..."
                className="h-11 w-full rounded-xl border border-slate-800 bg-[#020617] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>

            <select
              value={
                classFilter
              }
              onChange={(
                event
              ) =>
                setClassFilter(
                  event.target
                    .value
                )
              }
              className="h-11 rounded-xl border border-slate-800 bg-[#020617] px-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
            >
              <option value="all">
                All Classes
              </option>

              {classOptions.map(
                (
                  className
                ) => (
                  <option
                    key={
                      className
                    }
                    value={
                      className
                    }
                  >
                    {className}
                  </option>
                )
              )}
            </select>

            <select
              value={
                subjectFilter
              }
              onChange={(
                event
              ) =>
                setSubjectFilter(
                  event.target
                    .value
                )
              }
              className="h-11 rounded-xl border border-slate-800 bg-[#020617] px-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
            >
              <option value="all">
                All Subjects
              </option>

              {subjectOptions.map(
                (
                  subject
                ) => (
                  <option
                    key={
                      subject
                    }
                    value={
                      subject
                    }
                  >
                    {subject}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-800 bg-[#071426]">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                <Loader2
                  size={27}
                  className="animate-spin text-cyan-400"
                />
              </div>

              <div className="text-center">
                <p className="font-medium text-slate-200">
                  Loading lessons
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Getting your lesson
                  plans...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          filteredLessons.length ===
            0 && (
            <div className="rounded-2xl border border-slate-800 bg-[#071426] px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-[#020617]">
                <BookOpen
                  size={28}
                  className="text-cyan-400"
                />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                {lessons.length ===
                0
                  ? "No lesson plans yet"
                  : "No matching lessons"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {lessons.length ===
                0
                  ? "Lessons you create will appear here so you can view, edit and manage them."
                  : "Try another search term or change your filters."}
              </p>

              {lessons.length ===
                0 && (
                <button
                  type="button"
                  onClick={
                    handleCreateLesson
                  }
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 hover:bg-cyan-400"
                >
                  <Plus
                    size={18}
                  />

                  Create Lesson
                </button>
              )}
            </div>
          )}

        {/* =================================================
            LESSON LIST
        ================================================= */}

        {!loading &&
          filteredLessons.length >
            0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-300">
                    {
                      filteredLessons.length
                    }
                  </span>{" "}
                  lesson
                  {filteredLessons.length ===
                  1
                    ? ""
                    : "s"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                {filteredLessons.map(
                  (
                    lesson,
                    index
                  ) => (
                    <LessonCard
                      key={
                        lesson.id ??
                        `${lesson.title}-${index}`
                      }
                      lesson={
                        lesson
                      }
                      index={
                        index
                      }
                      onView={() =>
                        setSelectedLesson(
                          lesson
                        )
                      }
                      onEdit={() =>
                        openEdit(
                          lesson
                        )
                      }
                      onDelete={() =>
                        setDeleteTarget(
                          lesson
                        )
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}
      </div>

      {/* ===================================================
          VIEW LESSON MODAL
      =================================================== */}

      <AnimatePresence>
        {selectedLesson && (
          <Modal
            onClose={() =>
              setSelectedLesson(
                null
              )
            }
          >
            <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-[#071426] shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5 sm:p-6">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                    <BookOpen
                      size={22}
                      className="text-cyan-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold text-white sm:text-2xl">
                      {getLessonTitle(
                        selectedLesson
                      )}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-cyan-400">
                        {getLessonSubject(
                          selectedLesson
                        )}
                      </span>

                      <span className="text-slate-700">
                        •
                      </span>

                      <span className="text-slate-400">
                        {getClassName(
                          selectedLesson
                        ) ||
                          "Class not set"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedLesson(
                      null
                    )
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-6">
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <InfoCard
                    icon={
                      GraduationCap
                    }
                    label="Class"
                    value={
                      getClassName(
                        selectedLesson
                      ) ||
                      "Not set"
                    }
                  />

                  <InfoCard
                    icon={
                      CalendarDays
                    }
                    label="Created"
                    value={formatDate(
                      getLessonDate(
                        selectedLesson
                      )
                    )}
                  />

                  <InfoCard
                    icon={
                      CheckCircle2
                    }
                    label="Status"
                    value={getLessonStatus(
                      selectedLesson
                    )}
                  />
                </div>

                <section>
                  <h3 className="mb-2 text-sm font-semibold text-slate-200">
                    Description
                  </h3>

                  <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-400">
                      {getDescription(
                        selectedLesson
                      ) ||
                        "No description provided."}
                    </p>
                  </div>
                </section>

                <section className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold text-slate-200">
                    Lesson Content
                  </h3>

                  <div className="rounded-xl border border-slate-800 bg-[#020617] p-4 sm:p-5">
                    <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                      {getLessonContent(
                        selectedLesson
                      ) ||
                        "No lesson content provided."}
                    </div>
                  </div>
                </section>

                <LessonResources
                  lesson={
                    selectedLesson
                  }
                />

                <section className="mt-6">
                  <p className="text-xs text-slate-600">
                    Last updated:{" "}
                    {formatDateTime(
                      selectedLesson.updated_at ||
                        selectedLesson.updatedAt ||
                        getLessonDate(
                          selectedLesson
                        )
                    )}
                  </p>
                </section>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-800 p-5 sm:flex-row sm:justify-end sm:p-6">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedLesson(
                      null
                    )
                  }
                  className="h-11 rounded-xl border border-slate-800 px-5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openEdit(
                      selectedLesson
                    );

                    setSelectedLesson(
                      null
                    );
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 hover:bg-cyan-400"
                >
                  <Edit3
                    size={17}
                  />

                  Edit Lesson
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===================================================
          EDIT LESSON MODAL
      =================================================== */}

      <AnimatePresence>
        {editingLesson && (
          <Modal
            closeDisabled={
              saving
            }
            onClose={() =>
              setEditingLesson(
                null
              )
            }
          >
            <form
              onSubmit={
                handleSaveEdit
              }
              className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-[#071426] shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5 sm:p-6">
                <div>
                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    Edit Lesson
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Update the lesson
                    information and
                    content.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={() =>
                    setEditingLesson(
                      null
                    )
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-6">
                <InputField
                  label="Lesson title"
                  value={
                    editingLesson.title ||
                    ""
                  }
                  required
                  onChange={(
                    value
                  ) =>
                    handleEditChange(
                      "title",
                      value
                    )
                  }
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <InputField
                    label="Subject"
                    value={
                      editingLesson.subject ||
                      ""
                    }
                    required
                    onChange={(
                      value
                    ) =>
                      handleEditChange(
                        "subject",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Class"
                    value={
                      editingLesson.class_name ||
                      editingLesson.className ||
                      editingLesson.grade ||
                      ""
                    }
                    required
                    onChange={(
                      value
                    ) => {
                      setEditingLesson(
                        (
                          current
                        ) => ({
                          ...current,

                          class_name:
                            value,

                          className:
                            value,

                          grade:
                            value,
                        })
                      );
                    }}
                  />
                </div>

                <TextAreaField
                  label="Description"
                  value={
                    editingLesson.description ||
                    ""
                  }
                  rows={4}
                  onChange={(
                    value
                  ) =>
                    handleEditChange(
                      "description",
                      value
                    )
                  }
                />

                <TextAreaField
                  label="Lesson content"
                  value={
                    editingLesson.content ||
                    ""
                  }
                  rows={14}
                  required
                  onChange={(
                    value
                  ) =>
                    handleEditChange(
                      "content",
                      value
                    )
                  }
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 p-5 sm:flex-row sm:justify-end sm:p-6">
                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={() =>
                    setEditingLesson(
                      null
                    )
                  }
                  className="h-11 rounded-xl border border-slate-800 px-5 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={17}
                      />

                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      <AnimatePresence>
        {deleteTarget && (
          <Modal
            closeDisabled={
              deleting
            }
            onClose={() =>
              setDeleteTarget(
                null
              )
            }
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#071426] p-6 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <Trash2
                  size={22}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                Delete lesson?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                This will permanently
                delete{" "}
                <span className="font-semibold text-white">
                  {getLessonTitle(
                    deleteTarget
                  )}
                </span>{" "}
                and its lesson
                resources.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={
                    deleting
                  }
                  onClick={() =>
                    setDeleteTarget(
                      null
                    )
                  }
                  className="h-11 rounded-xl border border-slate-800 px-5 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    deleting
                  }
                  onClick={
                    handleDelete
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2
                        size={17}
                      />

                      Delete Lesson
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   LESSON CARD
========================================================= */

function LessonCard({
  lesson,
  index,
  onView,
  onEdit,
  onDelete,
}) {
  const description =
    getDescription(
      lesson
    );

  const resources =
    getResources(
      lesson
    );

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
        delay: Math.min(
          index * 0.035,
          0.25
        ),
      }}
      className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#071426] transition hover:border-cyan-500/30"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
            <BookOpen
              size={22}
              className="text-cyan-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="break-words text-lg font-bold text-white">
                  {getLessonTitle(
                    lesson
                  )}
                </h2>

                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-cyan-400">
                    {getLessonSubject(
                      lesson
                    )}
                  </span>

                  <span className="text-slate-700">
                    •
                  </span>

                  <span className="text-slate-400">
                    {getClassName(
                      lesson
                    ) ||
                      "Class not set"}
                  </span>
                </div>
              </div>

              <StatusBadge
                status={getLessonStatus(
                  lesson
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm leading-6 text-slate-400">
            {description
              ? description.length >
                190
                ? `${description.slice(
                    0,
                    190
                  )}...`
                : description
              : "No description added for this lesson."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays
              size={14}
            />

            {formatDate(
              getLessonDate(
                lesson
              )
            )}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <FileText
              size={14}
            />

            {resources.length}{" "}
            resource
            {resources.length ===
            1
              ? ""
              : "s"}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Clock3
              size={14}
            />

            {getLessonStatus(
              lesson
            )}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onView}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 px-4 text-sm font-semibold text-slate-300 transition hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-400"
          >
            <Eye size={16} />

            View Lesson
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-800 px-4 text-sm font-semibold text-slate-300 transition hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-400 sm:flex-none"
            >
              <Edit3
                size={16}
              />

              Edit
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 sm:flex-none"
            >
              <Trash2
                size={16}
              />

              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
   RESOURCES
========================================================= */

function LessonResources({
  lesson,
}) {
  const resources =
    getResources(
      lesson
    );

  if (!resources.length) {
    return null;
  }

  return (
    <section className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">
        Lesson Resources
      </h3>

      <div className="space-y-2">
        {resources.map(
          (
            resource,
            index
          ) => {
            const Icon =
              getResourceIcon(
                resource
              );

            const name =
              getResourceName(
                resource
              );

            const url =
              getResourceUrl(
                resource
              );

            return (
              <div
                key={
                  resource?.id ||
                  `${name}-${index}`
                }
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#020617] p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Icon
                    size={18}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {name}
                  </p>

                  {resource?.file_size && (
                    <p className="mt-0.5 text-xs text-slate-600">
                      {
                        resource.file_size
                      }
                    </p>
                  )}
                </div>

                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-800 px-3 text-xs font-semibold text-cyan-400 transition hover:border-cyan-500/30 hover:bg-cyan-500/5"
                  >
                    <Eye
                      size={14}
                    />

                    Open
                  </a>
                )}
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}) {
  const normalized =
    clean(status)
      .toLowerCase();

  const published =
    normalized ===
    "published";

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        published
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-amber-500/20 bg-amber-500/10 text-amber-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          published
            ? "bg-emerald-400"
            : "bg-amber-400"
        }`}
      />

      {status ||
        "published"}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#071426] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-3.5">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={14} />

        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  value,
  onChange,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-cyan-400">
            *
          </span>
        )}
      </span>

      <input
        type="text"
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target
              .value
          )
        }
        className="h-11 w-full rounded-xl border border-slate-800 bg-[#020617] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
      />
    </label>
  );
}

/* =========================================================
   TEXT AREA
========================================================= */

function TextAreaField({
  label,
  value,
  onChange,
  rows = 6,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-cyan-400">
            *
          </span>
        )}
      </span>

      <textarea
        value={value}
        rows={rows}
        required={required}
        onChange={(event) =>
          onChange(
            event.target
              .value
          )
        }
        className="w-full resize-y rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
      />
    </label>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  children,
  onClose,
  closeDisabled = false,
}) {
  const handleClose =
    () => {
      if (
        !closeDisabled &&
        onClose
      ) {
        onClose();
      }
    };

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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 15,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 10,
          scale: 0.98,
        }}
        transition={{
          duration: 0.18,
        }}
        className="my-6 flex w-full justify-center"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
