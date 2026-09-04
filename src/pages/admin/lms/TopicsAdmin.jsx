import React, { useEffect, useState } from "react";
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  FileText,
  Loader2,
  AlertCircle,
  ClipboardList,
  HelpCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdminButton from "../../../components/admin/ui/AdminButton";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const TopicsAdmin = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  /* =========================================================
     AUTH HEADERS
  ========================================================= */

  const getHeaders = () => {
    const token = localStorage.getItem("scholiqen_auth_token");

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  /* =========================================================
     FETCH COURSE
  ========================================================= */

  const fetchCourse = async () => {
    if (!courseId) return;

    try {
      const response = await fetch(
        `${API_URL}/api/courses/${encodeURIComponent(courseId)}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to load course."
        );
      }

      /*
       * Supports either:
       * { course: {...} }
       * or
       * {...course}
       */
      setCourse(data?.course || data);
    } catch (error) {
      console.error("COURSE FETCH ERROR:", error);
      setError(error.message || "Failed to load course.");
    }
  };

  /* =========================================================
     FETCH TOPICS
  ========================================================= */

  const fetchTopics = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/courses/${encodeURIComponent(courseId)}/topics`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to load topics."
        );
      }

      setTopics(data?.topics || []);
    } catch (error) {
      console.error("TOPICS FETCH ERROR:", error);
      setError(error.message || "Failed to load topics.");
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (!courseId) {
      setError("No course selected.");
      setLoading(false);
      return;
    }

    fetchCourse();
    fetchTopics();
  }, [courseId]);

  /* =========================================================
     DELETE TOPIC
  ========================================================= */

  const deleteTopic = async (topic) => {
    if (!topic?.id) return;

    const confirmDelete = window.confirm(
      `Delete "${topic.title}"?\n\nThis learning unit will be permanently removed.`
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(topic.id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/courses/topics/${encodeURIComponent(topic.id)}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to delete topic."
        );
      }

      setTopics((currentTopics) =>
        currentTopics.filter(
          (currentTopic) =>
            String(currentTopic.id) !== String(topic.id)
        )
      );
    } catch (error) {
      console.error("DELETE TOPIC ERROR:", error);

      alert(error.message || "Failed to delete topic.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const openResources = (topicId) => {
    navigate(`/admin/lms/topic/${topicId}/resources`);
  };

  const openWeeklyTasks = (topicId) => {
    /*
     * IMPORTANT:
     * Weekly Tasks always belongs to a topic.
     *
     * We intentionally do NOT navigate to:
     * /admin/lms/tasks
     *
     * Instead:
     * /admin/lms/topic/:topicId/tasks
     */
    navigate(`/admin/lms/topic/${topicId}/tasks`);
  };

  const openMonthlyQuiz = (topicId) => {
    navigate(`/admin/lms/topic/${topicId}/quizzes`);
  };

  const editTopic = (topicId) => {
    navigate(
      `/admin/lms/course/${courseId}/topics/edit/${topicId}`
    );
  };

  const createTopic = () => {
    navigate(`/admin/lms/course/${courseId}/topics/create`);
  };

  /* =========================================================
     MISSING COURSE
  ========================================================= */

  if (!courseId) {
    return (
      <div className="min-h-full bg-slate-950 p-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-500/20 bg-slate-900 p-10 text-center">
          <AlertCircle
            size={48}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-5 text-2xl font-bold text-white">
            No Course Selected
          </h1>

          <p className="mt-2 text-slate-400">
            Please open a course before managing its topics.
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/lms")}
            className="mt-6 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to LMS
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full space-y-8 bg-slate-950 p-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
              <BookOpen
                size={25}
                className="text-blue-400"
              />
            </div>

            <div>
              <h1 className="text-3xl font-black text-white">
                {course?.title || "Course"} Topics
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Manage learning units, resources, weekly tasks,
                and monthly quizzes.
              </p>
            </div>
          </div>
        </div>

        <AdminButton onClick={createTopic}>
          <Plus size={18} className="mr-2" />
          Add Topic
        </AdminButton>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-400"
          />

          <div>
            <p className="font-semibold text-red-400">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-red-300/80">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={42}
              className="mx-auto animate-spin text-blue-400"
            />

            <p className="mt-4 text-sm text-slate-400">
              Loading topics...
            </p>
          </div>
        </div>
      ) : topics.length === 0 ? (
        /* ===================================================
           EMPTY STATE
        =================================================== */

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-14 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10">
            <BookOpen
              size={40}
              className="text-blue-400"
            />
          </div>

          <h2 className="mt-6 text-2xl font-black text-white">
            No Topics Yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-slate-400">
            This course does not have any learning units yet.
            Create the first topic to begin adding resources,
            weekly tasks, and quizzes.
          </p>

          <div className="mt-7">
            <AdminButton onClick={createTopic}>
              <Plus size={18} className="mr-2" />
              Create First Topic
            </AdminButton>
          </div>
        </div>
      ) : (
        /* ===================================================
           TOPICS GRID
        =================================================== */

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic, index) => {
            const isDeleting =
              String(deletingId) === String(topic.id);

            return (
              <div
                key={topic.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/90"
              >
                {/* =================================================
                    TOPIC INFO
                ================================================= */}

                <div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                      <FileText
                        size={23}
                        className="text-blue-400"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-white">
                        {topic.title || "Untitled Topic"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Unit {topic.position ?? index + 1}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400">
                    {topic.description ||
                      "No description has been added for this learning unit."}
                  </p>
                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="mt-7 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {/* RESOURCES */}

                    <button
                      type="button"
                      onClick={() =>
                        openResources(topic.id)
                      }
                      className="flex min-h-[62px] flex-col items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/5 px-2 py-2 text-center transition hover:border-blue-500/20 hover:bg-blue-500/10"
                    >
                      <FileText
                        size={18}
                        className="text-blue-400"
                      />

                      <span className="mt-1 text-[11px] font-semibold text-blue-400">
                        Resources
                      </span>
                    </button>

                    {/* WEEKLY TASKS */}

                    <button
                      type="button"
                      onClick={() =>
                        openWeeklyTasks(topic.id)
                      }
                      className="flex min-h-[62px] flex-col items-center justify-center rounded-xl border border-purple-500/10 bg-purple-500/5 px-2 py-2 text-center transition hover:border-purple-500/20 hover:bg-purple-500/10"
                    >
                      <ClipboardList
                        size={18}
                        className="text-purple-400"
                      />

                      <span className="mt-1 text-[11px] font-semibold text-purple-400">
                        Weekly Tasks
                      </span>
                    </button>

                    {/* MONTHLY QUIZ */}

                    <button
                      type="button"
                      onClick={() =>
                        openMonthlyQuiz(topic.id)
                      }
                      className="flex min-h-[62px] flex-col items-center justify-center rounded-xl border border-green-500/10 bg-green-500/5 px-2 py-2 text-center transition hover:border-green-500/20 hover:bg-green-500/10"
                    >
                      <HelpCircle
                        size={18}
                        className="text-green-400"
                      />

                      <span className="mt-1 text-[11px] font-semibold text-green-400">
                        Monthly Quiz
                      </span>
                    </button>
                  </div>

                  {/* =================================================
                      EDIT / DELETE
                  ================================================= */}

                  <div className="flex items-center justify-end gap-2 border-t border-slate-800/70 pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        editTopic(topic.id)
                      }
                      disabled={isDeleting}
                      className="flex items-center gap-2 rounded-xl bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-400 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Edit Topic"
                    >
                      <Edit size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteTopic(topic)
                      }
                      disabled={isDeleting}
                      className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Delete Topic"
                    >
                      {isDeleting ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      {isDeleting
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =======================================================
          FOOTER INFO
      ======================================================= */}

      {!loading && topics.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <BookOpen
              size={18}
              className="text-slate-500"
            />

            <span className="text-sm text-slate-400">
              {topics.length}{" "}
              {topics.length === 1 ? "topic" : "topics"} in this
              course
            </span>
          </div>

          <button
            type="button"
            onClick={fetchTopics}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default TopicsAdmin;