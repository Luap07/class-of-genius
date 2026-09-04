import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  X,
  CalendarDays,
  BookOpen,
  Clock,
  Star,
  CheckCircle2,
} from "lucide-react";

// =========================================================
// API CONFIG
// =========================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY = "scholiqen_auth_token";

// =========================================================
// HELPERS
// =========================================================

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getTopicTitle(task) {
  return (
    task?.topic_title ||
    task?.topic?.title ||
    task?.course_topics?.title ||
    task?.course_topic?.title ||
    "No Topic"
  );
}

function getCourseTitle(task) {
  return (
    task?.course_title ||
    task?.course?.title ||
    task?.courses?.title ||
    "General"
  );
}

function formatDate(date) {
  if (!date) return "No due date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "No due date";
  }

  return parsed.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPriorityClass(priority) {
  switch (String(priority || "").toLowerCase()) {
    case "high":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "medium":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

    case "low":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    default:
      return "border-slate-700 bg-slate-800 text-slate-300";
  }
}

function getDifficultyClass(difficulty) {
  switch (String(difficulty || "").toLowerCase()) {
    case "hard":
      return "text-red-400";

    case "medium":
      return "text-yellow-400";

    case "easy":
      return "text-green-400";

    default:
      return "text-slate-400";
  }
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function WeeklyTasksAdmin() {
  const navigate = useNavigate();
  const { topicId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // =======================================================
  // FETCH TASKS
  // =======================================================

  const loadTasks = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const token = getToken();

        if (!token) {
          throw new Error("You are not logged in.");
        }

        let endpoint;

        if (topicId) {
          endpoint = `${API_URL}/api/tasks/topic/${encodeURIComponent(
            topicId
          )}`;
        } else {
          endpoint = `${API_URL}/api/tasks`;
        }

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Failed to load tasks (${response.status})`
          );
        }

        // ---------------------------------------------------
        // SUPPORT DIFFERENT API RESPONSE SHAPES
        // ---------------------------------------------------

        let taskList = [];

        if (Array.isArray(data)) {
          taskList = data;
        } else if (Array.isArray(data.tasks)) {
          taskList = data.tasks;
        } else if (Array.isArray(data.weeklyTasks)) {
          taskList = data.weeklyTasks;
        } else if (Array.isArray(data.weekly)) {
          taskList = data.weekly;
        } else if (Array.isArray(data.data)) {
          taskList = data.data;
        }

        setTasks(taskList);
      } catch (err) {
        console.error("Admin Tasks Error:", err);

        setError(
          err?.message ||
            "Unable to load weekly tasks."
        );

        setTasks([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [topicId]
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // =======================================================
  // CREATE
  // =======================================================

  const handleCreate = () => {
    if (!topicId) {
      alert(
        "Please open a course topic first before creating a weekly task."
      );
      return;
    }

    // DIRECTLY OPEN CREATE PAGE
    navigate(
      `/admin/lms/topic/${encodeURIComponent(
        topicId
      )}/tasks/create`
    );
  };

  // =======================================================
  // OPEN
  // =======================================================

  const handleView = (task) => {
    setSelectedTask(task);
  };

  // =======================================================
  // EDIT
  // =======================================================

  const handleEdit = (taskId) => {
    if (!taskId) return;

    if (topicId) {
      navigate(
        `/admin/lms/topic/${encodeURIComponent(
          topicId
        )}/tasks/edit/${encodeURIComponent(taskId)}`
      );
    } else {
      navigate(
        `/admin/lms/tasks/edit/${encodeURIComponent(taskId)}`
      );
    }
  };

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = async (taskId) => {
    if (!taskId) return;

    const task = tasks.find(
      (item) =>
        String(item.id) === String(taskId)
    );

    const confirmed = window.confirm(
      `Delete "${
        task?.title || "this task"
      }"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(taskId);

      const token = getToken();

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        `${API_URL}/api/tasks/${encodeURIComponent(
          taskId
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to delete task."
        );
      }

      setTasks((current) =>
        current.filter(
          (item) =>
            String(item.id) !==
            String(taskId)
        )
      );

      if (
        selectedTask &&
        String(selectedTask.id) ===
          String(taskId)
      ) {
        setSelectedTask(null);
      }
    } catch (err) {
      console.error(
        "Delete Task Error:",
        err
      );

      alert(
        err?.message ||
          "Unable to delete this task."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2
              size={38}
              className="animate-spin text-blue-400"
            />

            <p className="text-slate-400">
              Loading weekly tasks...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            {/* TITLE */}

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                  <ClipboardList
                    size={23}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold">
                    Weekly Tasks
                  </h1>

                  <p className="mt-1 text-sm text-slate-400">
                    Manage weekly learning activities
                  </p>
                </div>

              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  loadTasks(true)
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500"
              >
                <Plus size={18} />

                Add Task
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="p-6">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={21}
                className="mt-0.5 text-red-400"
              />

              <div className="flex-1">

                <h3 className="font-semibold text-red-300">
                  Unable to Load Tasks
                </h3>

                <p className="mt-1 text-sm text-red-300/80">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  loadTasks()
                }
                className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
              >
                Try Again
              </button>

            </div>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Total Tasks
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {tasks.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                <ClipboardList
                  size={21}
                  className="text-blue-400"
                />
              </div>

            </div>
          </div>

          {/* PENDING */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {tasks.filter(
                    (task) =>
                      String(
                        task.status ||
                          "pending"
                      ).toLowerCase() ===
                      "pending"
                  ).length}
                </p>
              </div>

              <Clock
                size={21}
                className="text-yellow-400"
              />

            </div>
          </div>

          {/* HIGH PRIORITY */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  High Priority
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {tasks.filter(
                    (task) =>
                      String(
                        task.priority ||
                          ""
                      ).toLowerCase() ===
                      "high"
                  ).length}
                </p>
              </div>

              <AlertCircle
                size={21}
                className="text-red-400"
              />

            </div>
          </div>

          {/* XP */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  XP Available
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {tasks.reduce(
                    (total, task) =>
                      total +
                      Number(
                        task.xp || 0
                      ),
                    0
                  )}
                </p>
              </div>

              <Star
                size={21}
                className="text-yellow-400"
              />

            </div>
          </div>

        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {tasks.length === 0 &&
        !error ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-14 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
              <ClipboardList
                size={30}
                className="text-blue-400"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              No Weekly Tasks
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-400">
              There are no weekly tasks for
              this topic yet. Create your first
              task to get started.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
            >
              <Plus size={18} />

              Add Task
            </button>

          </div>
        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900">

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Task
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Course
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Topic
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Week
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Due Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Priority
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {tasks.map((task) => (

                    <tr
                      key={task.id}
                      className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                    >

                      {/* TASK */}

                      <td className="px-6 py-5">

                        <div className="max-w-[260px]">

                          <p className="truncate font-semibold text-white">
                            {task.title ||
                              "Untitled Task"}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {task.description ||
                              "No description"}
                          </p>

                        </div>

                      </td>

                      {/* COURSE */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-slate-300">

                          <BookOpen
                            size={15}
                            className="text-blue-400"
                          />

                          {getCourseTitle(task)}

                        </div>

                      </td>

                      {/* TOPIC */}

                      <td className="px-6 py-5">

                        <span className="text-slate-300">
                          {getTopicTitle(task)}
                        </span>

                      </td>

                      {/* WEEK */}

                      <td className="px-6 py-5">

                        <span className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-sm text-slate-300">
                          Week{" "}
                          {task.week || "—"}
                        </span>

                      </td>

                      {/* DATE */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-slate-300">

                          <CalendarDays
                            size={15}
                            className="text-slate-500"
                          />

                          {formatDate(
                            task.due_date
                          )}

                        </div>

                      </td>

                      {/* PRIORITY */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${getPriorityClass(
                            task.priority
                          )}`}
                        >
                          {task.priority ||
                            "Normal"}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-5">

                        <div className="flex items-center justify-end gap-2">

                          {/* OPEN */}

                          <button
                            type="button"
                            onClick={() =>
                              handleView(task)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                          >
                            <Eye size={15} />
                            Open
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                task.id
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-600/10 px-3 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-600/20"
                          >
                            <Edit size={15} />
                            Edit
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                task.id
                              )
                            }
                            disabled={
                              deletingId ===
                              task.id
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                          >
                            {deletingId ===
                            task.id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={15}
                              />
                            )}

                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          TASK VIEW MODAL
      =================================================== */}

      {selectedTask && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedTask(null);
            }
          }}
        >

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/95 px-6 py-5 backdrop-blur">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Weekly Task
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {selectedTask.title ||
                    "Untitled Task"}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTask(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="space-y-6 p-6">

              {/* DESCRIPTION */}

              <div>

                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </p>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

                  <p className="whitespace-pre-wrap leading-7 text-slate-300">
                    {selectedTask.description ||
                      "No description available."}
                  </p>

                </div>
              </div>

              {/* INFORMATION */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* COURSE */}

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">

                    <BookOpen size={15} />

                    Course

                  </div>

                  <p className="mt-2 font-medium text-white">
                    {getCourseTitle(
                      selectedTask
                    )}
                  </p>

                </div>

                {/* TOPIC */}

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">

                    <ClipboardList
                      size={15}
                    />

                    Topic

                  </div>

                  <p className="mt-2 font-medium text-white">
                    {getTopicTitle(
                      selectedTask
                    )}
                  </p>

                </div>

                {/* WEEK */}

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">

                    <CalendarDays
                      size={15}
                    />

                    Week

                  </div>

                  <p className="mt-2 font-medium text-white">
                    Week{" "}
                    {selectedTask.week ||
                      "—"}
                  </p>

                </div>

                {/* DUE DATE */}

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">

                    <Clock size={15} />

                    Due Date

                  </div>

                  <p className="mt-2 font-medium text-white">
                    {formatDate(
                      selectedTask.due_date
                    )}
                  </p>

                </div>

                {/* XP */}

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">

                    <Star size={15} />

                    XP

                  </div>

                  <p className="mt-2 font-medium text-white">
                    {selectedTask.xp || 0} XP
                  </p>

                </div>

                {/* DIFFICULTY */}

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">

                    <CheckCircle2
                      size={15}
                    />

                    Difficulty

                  </div>

                  <p
                    className={`mt-2 font-medium capitalize ${getDifficultyClass(
                      selectedTask.difficulty
                    )}`}
                  >
                    {selectedTask.difficulty ||
                      "Normal"}
                  </p>

                </div>

              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-5">

              <button
                type="button"
                onClick={() =>
                  setSelectedTask(null)
                }
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-slate-200 transition hover:bg-slate-700"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  handleEdit(
                    selectedTask.id
                  );
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500"
              >
                <Edit size={17} />

                Edit Task
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}