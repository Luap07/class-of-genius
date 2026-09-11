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
  Edit3,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  X,
  BookOpen,
  GraduationCap,
  Paperclip,
  Save,
  Eye,
  ClipboardList,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

/* =========================================================
   API
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const TASKS_URL =
  `${API_BASE_URL}/api/academy/tutor/tasks`;

/* =========================================================
   STORAGE
========================================================= */

function getStoredTutor() {
  try {
    const stored =
      localStorage.getItem(
        "scholiqen_academy_user"
      );

    if (!stored) {
      return {};
    }

    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function getTutorReference() {
  const storedUser =
    getStoredTutor();

  return (
    storedUser?.reference ||
    storedUser?.tutorReference ||
    storedUser?.tutor?.reference ||
    storedUser?.tutor?.tutorReference ||
    storedUser?.user?.reference ||
    ""
  );
}

/* =========================================================
   DATE HELPERS
========================================================= */

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
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
}

function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`;
}

function getDueStatus(dueDate) {
  if (!dueDate) {
    return {
      label: "No deadline",
      className:
        "text-slate-400 bg-slate-800/60 border-slate-700",
    };
  }

  const due =
    new Date(dueDate);

  if (
    Number.isNaN(
      due.getTime()
    )
  ) {
    return {
      label: "Deadline set",
      className:
        "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
    };
  }

  const now =
    new Date();

  if (
    due.getTime() <
    now.getTime()
  ) {
    return {
      label: "Past due",
      className:
        "text-red-300 bg-red-500/10 border-red-500/20",
    };
  }

  return {
    label: "Active",
    className:
      "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  };
}

/* =========================================================
   TASK NORMALIZATION
========================================================= */

function normalizeTask(task) {
  const metadata =
    task?.metadata &&
    typeof task.metadata ===
      "object"
      ? task.metadata
      : {};

  const attachments =
    Array.isArray(
      task?.attachments
    )
      ? task.attachments
      : Array.isArray(
          task?.files
        )
        ? task.files
        : Array.isArray(
            metadata?.attachments
          )
          ? metadata.attachments
          : [];

  const grade =
    task?.grade ||
    task?.class ||
    task?.className ||
    task?.class_name ||
    metadata?.grade ||
    metadata?.class ||
    "";

  const subject =
    task?.subject ||
    task?.subject_name ||
    metadata?.subject ||
    "";

  const dueDate =
    task?.dueDate ||
    task?.due_date ||
    metadata?.dueDate ||
    metadata?.due_date ||
    "";

  const maxScore =
    task?.maxScore ??
    task?.max_score ??
    metadata?.maxScore ??
    metadata?.max_score ??
    "";

  return {
    ...task,

    id:
      task?.id ||
      task?.taskId ||
      task?.task_id,

    taskId:
      task?.taskId ||
      task?.task_id ||
      task?.id,

    title:
      task?.title ||
      "Untitled task",

    description:
      task?.description ||
      "",

    instructions:
      task?.instructions ||
      metadata?.instructions ||
      "",

    grade,

    class:
      grade,

    subject,

    dueDate,

    maxScore,

    attachments,

    metadata,
  };
}

/* =========================================================
   API RESPONSE HELPER
========================================================= */

async function readResponse(response) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

  return {
    message:
      text ||
      `Request failed with status ${response.status}.`,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorMyTasks() {
  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [editingTask, setEditingTask] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  const tutorReference =
    useMemo(
      () => getTutorReference(),
      []
    );

  /* =======================================================
     FETCH TASKS
  ======================================================= */

  const fetchTasks =
    useCallback(
      async (
        showRefresh = false
      ) => {
        if (!tutorReference) {
          setError(
            "Your tutor reference could not be found. Please log in again."
          );

          setLoading(false);
          setRefreshing(false);

          return;
        }

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const url =
            `${TASKS_URL}?reference=${encodeURIComponent(
              tutorReference
            )}`;

          const response =
            await fetch(
              url,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await readResponse(
              response
            );

          if (!response.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                `Unable to load tasks. Server returned ${response.status}.`
            );
          }

          const rawTasks =
            Array.isArray(
              data?.tasks
            )
              ? data.tasks
              : Array.isArray(
                  data?.activities
                )
                ? data.activities
                : Array.isArray(
                    data
                  )
                  ? data
                  : [];

          setTasks(
            rawTasks.map(
              normalizeTask
            )
          );
        } catch (err) {
          console.error(
            "Tutor tasks error:",
            err
          );

          if (
            err?.name ===
            "TypeError"
          ) {
            setError(
              "Unable to connect to the Scholiqen server. Make sure the backend is running and VITE_API_URL points to the correct server."
            );
          } else {
            setError(
              err?.message ||
                "Unable to load your tasks. Please try again."
            );
          }
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [tutorReference]
    );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEdit =
    (task) => {
      setSelectedTask(null);
      setSaveError("");

      setEditingTask({
        ...task,

        title:
          task.title || "",

        description:
          task.description || "",

        instructions:
          task.instructions || "",

        dueDate:
          task.dueDate
            ? formatDateForInput(
                task.dueDate
              )
            : "",

        maxScore:
          task.maxScore ===
            null ||
          task.maxScore ===
            undefined
            ? ""
            : String(
                task.maxScore
              ),
      });
    };

  /* =======================================================
     SAVE / UPDATE TASK
  ======================================================= */

  const handleSave =
    async (event) => {
      event.preventDefault();

      if (!editingTask?.id) {
        setSaveError(
          "This task could not be identified."
        );

        return;
      }

      if (!tutorReference) {
        setSaveError(
          "Your tutor reference could not be found. Please log in again."
        );

        return;
      }

      const title =
        editingTask.title.trim();

      if (!title) {
        setSaveError(
          "Task title is required."
        );

        return;
      }

      setSaving(true);
      setSaveError("");

      try {
        const taskId =
          encodeURIComponent(
            editingTask.id
          );

        const url =
          `${TASKS_URL}/${taskId}`;

        const payload = {
          reference:
            tutorReference,

          title,

          description:
            editingTask.description?.trim() ||
            "",

          instructions:
            editingTask.instructions?.trim() ||
            "",

          dueDate:
            editingTask.dueDate ||
            "",

          maxScore:
            editingTask.maxScore ===
              ""
              ? null
              : Number(
                  editingTask.maxScore
                ),
        };

        console.log(
          "Updating tutor task:",
          {
            url,
            method: "PATCH",
            payload,
          }
        );

        const response =
          await fetch(
            url,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const data =
          await readResponse(
            response
          );

        console.log(
          "Update task response:",
          {
            status:
              response.status,
            data,
          }
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to update this task. Server returned ${response.status}.`
          );
        }

        setEditingTask(
          null
        );

        await fetchTasks(
          true
        );
      } catch (err) {
        console.error(
          "Update task error:",
          err
        );

        if (
          err?.name ===
          "TypeError"
        ) {
          setSaveError(
            "The browser could not connect to the backend while updating this task. This is usually a backend/CORS connection problem. Check that the server is running and that PATCH requests are allowed."
          );
        } else {
          setSaveError(
            err?.message ||
              "Unable to update this task. Please try again."
          );
        }
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete =
    async () => {
      if (!deleteTarget?.id) {
        return;
      }

      if (!tutorReference) {
        setError(
          "Your tutor reference could not be found. Please log in again."
        );

        return;
      }

      setDeleting(true);

      try {
        const url =
          `${TASKS_URL}/${encodeURIComponent(
            deleteTarget.id
          )}?reference=${encodeURIComponent(
            tutorReference
          )}`;

        const response =
          await fetch(
            url,
            {
              method: "DELETE",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await readResponse(
            response
          );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to delete this task. Server returned ${response.status}.`
          );
        }

        setTasks(
          (current) =>
            current.filter(
              (task) =>
                String(
                  task.id
                ) !==
                String(
                  deleteTarget.id
                )
            )
        );

        setDeleteTarget(
          null
        );
      } catch (err) {
        console.error(
          "Delete task error:",
          err
        );

        if (
          err?.name ===
          "TypeError"
        ) {
          setError(
            "Unable to connect to the backend while deleting this task."
          );
        } else {
          setError(
            err?.message ||
              "Unable to delete this task. Please try again."
          );
        }

        setDeleteTarget(
          null
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =======================================================
     COUNTS
  ======================================================= */

  const activeCount =
    tasks.filter(
      (task) => {
        const status =
          getDueStatus(
            task.dueDate
          );

        return (
          status.label ===
          "Active"
        );
      }
    ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-cyan-400">
              <ClipboardList size={18} />

              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                Tutor Workspace
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Tasks
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manage the tasks you have created for your
              classes. Edit task details, update deadlines,
              or remove tasks you no longer need.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchTasks(true)
            }
            disabled={
              refreshing ||
              loading
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#071426] px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-500/40 hover:bg-[#0b1a30] disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>

        {/* SUMMARY */}

        {!loading &&
          !error && (
            <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">

              <div className="rounded-2xl border border-slate-800 bg-[#071426] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Total Tasks
                    </p>

                    <p className="mt-1 text-2xl font-bold text-white">
                      {tasks.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-400">
                    <ClipboardList size={20} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#071426] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Active Tasks
                    </p>

                    <p className="mt-1 text-2xl font-bold text-white">
                      {activeCount}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </div>

            </div>
          )}

        {/* ERROR */}

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
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-300">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-200/80">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="text-red-300 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-800 bg-[#071426]">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2
                size={30}
                className="animate-spin text-cyan-400"
              />

              <p className="text-sm text-slate-400">
                Loading your tasks...
              </p>
            </div>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          tasks.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#071426] px-6 text-center">
              <div className="mb-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-400">
                <ClipboardList size={30} />
              </div>

              <h2 className="text-xl font-semibold text-white">
                No tasks yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Tasks you create from the tutor workspace
                will automatically appear here.
              </p>
            </div>
          )}

        {/* TASKS */}

        {!loading &&
          tasks.length > 0 && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {tasks.map(
                (task, index) => {
                  const dueStatus =
                    getDueStatus(
                      task.dueDate
                    );

                  return (
                    <motion.div
                      key={
                        task.id ||
                        index
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
                        duration: 0.25,
                        delay: Math.min(
                          index *
                            0.03,
                          0.3
                        ),
                      }}
                      className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#071426] transition hover:border-slate-700"
                    >
                      <div className="p-5">

                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">

                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                                <ClipboardList size={12} />
                                Task
                              </span>

                              <span
                                className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${dueStatus.className}`}
                              >
                                {dueStatus.label}
                              </span>
                            </div>

                            <h2 className="truncate text-lg font-bold text-white">
                              {task.title}
                            </h2>

                            {task.description && (
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* CLASS / SUBJECT */}

                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                          <div className="rounded-xl border border-slate-800 bg-[#020b18] p-3">
                            <div className="flex items-center gap-2 text-slate-500">
                              <GraduationCap size={15} />

                              <span className="text-[11px] font-semibold uppercase tracking-wider">
                                Class
                              </span>
                            </div>

                            <p className="mt-1.5 truncate text-sm font-semibold text-slate-200">
                              {task.class ||
                                "Not specified"}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-800 bg-[#020b18] p-3">
                            <div className="flex items-center gap-2 text-slate-500">
                              <BookOpen size={15} />

                              <span className="text-[11px] font-semibold uppercase tracking-wider">
                                Subject
                              </span>
                            </div>

                            <p className="mt-1.5 truncate text-sm font-semibold text-slate-200">
                              {task.subject ||
                                "Not specified"}
                            </p>
                          </div>

                        </div>

                        {/* DETAILS */}

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">

                          <div className="rounded-xl border border-slate-800/80 bg-[#020b18] px-3 py-2.5">
                            <div className="flex items-center gap-2 text-slate-500">
                              <CalendarDays size={14} />

                              <span className="text-[11px]">
                                Due
                              </span>
                            </div>

                            <p className="mt-1 text-xs font-medium text-slate-300">
                              {task.dueDate
                                ? formatDate(
                                    task.dueDate
                                  )
                                : "No deadline"}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-800/80 bg-[#020b18] px-3 py-2.5">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Clock3 size={14} />

                              <span className="text-[11px]">
                                Created
                              </span>
                            </div>

                            <p className="mt-1 truncate text-xs font-medium text-slate-300">
                              {formatDate(
                                task.createdAt ||
                                  task.created_at
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-800/80 bg-[#020b18] px-3 py-2.5">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Paperclip size={14} />

                              <span className="text-[11px]">
                                Files
                              </span>
                            </div>

                            <p className="mt-1 text-xs font-medium text-slate-300">
                              {task.attachments?.length ||
                                0}{" "}
                              attached
                            </p>
                          </div>

                        </div>

                        {/* ACTIONS */}

                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTask(
                                task
                              )
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0b1729] px-3.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-500/30 hover:text-cyan-300"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                task
                              )
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/15"
                          >
                            <Edit3 size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget(
                                task
                              )
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/15"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>

                        </div>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </div>
          )}
      </div>

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      <AnimatePresence>
        {selectedTask && (
          <ModalOverlay
            onClose={() =>
              setSelectedTask(null)
            }
          >
            <div className="max-h-[90vh] overflow-y-auto">

              <ModalHeader
                title="Task Details"
                onClose={() =>
                  setSelectedTask(null)
                }
              />

              <div className="space-y-5 p-5">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Task
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-white">
                    {selectedTask.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <InfoBox
                    icon={
                      <GraduationCap size={16} />
                    }
                    label="Class"
                    value={
                      selectedTask.class ||
                      "Not specified"
                    }
                  />

                  <InfoBox
                    icon={
                      <BookOpen size={16} />
                    }
                    label="Subject"
                    value={
                      selectedTask.subject ||
                      "Not specified"
                    }
                  />

                  <InfoBox
                    icon={
                      <CalendarDays size={16} />
                    }
                    label="Due Date"
                    value={
                      selectedTask.dueDate
                        ? formatDateTime(
                            selectedTask.dueDate
                          )
                        : "No deadline"
                    }
                  />

                  <InfoBox
                    icon={
                      <ClipboardList size={16} />
                    }
                    label="Maximum Score"
                    value={
                      selectedTask.maxScore ===
                        "" ||
                      selectedTask.maxScore ===
                        null ||
                      selectedTask.maxScore ===
                        undefined
                        ? "Not set"
                        : `${selectedTask.maxScore} marks`
                    }
                  />

                </div>

                {selectedTask.description && (
                  <ContentSection
                    title="Description"
                    content={
                      selectedTask.description
                    }
                  />
                )}

                {selectedTask.instructions && (
                  <ContentSection
                    title="Instructions"
                    content={
                      selectedTask.instructions
                    }
                  />
                )}

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Attachments
                  </p>

                  {selectedTask.attachments?.length ? (
                    <div className="space-y-2">
                      {selectedTask.attachments.map(
                        (
                          file,
                          index
                        ) => (
                          <div
                            key={
                              file?.id ||
                              index
                            }
                            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#020b18] p-3"
                          >
                            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                              <FileText size={16} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-200">
                                {file?.name ||
                                  file?.fileName ||
                                  file?.file_name ||
                                  "Attached file"}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-700 bg-[#020b18] p-4 text-sm text-slate-500">
                      No files attached.
                    </div>
                  )}
                </div>

                <div className="flex justify-end border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      openEdit(
                        selectedTask
                      )
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                  >
                    <Edit3 size={15} />
                    Edit Task
                  </button>
                </div>

              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      <AnimatePresence>
        {editingTask && (
          <ModalOverlay
            onClose={() =>
              saving
                ? null
                : setEditingTask(
                    null
                  )
            }
          >
            <div className="max-h-[92vh] overflow-y-auto">

              <ModalHeader
                title="Edit Task"
                onClose={() =>
                  saving
                    ? null
                    : setEditingTask(
                        null
                      )
                }
              />

              <form
                onSubmit={
                  handleSave
                }
                className="space-y-5 p-5"
              >

                {saveError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {saveError}
                    </span>
                  </div>
                )}

                <Field
                  label="Task Title"
                  required
                  value={
                    editingTask.title
                  }
                  onChange={
                    (value) =>
                      setEditingTask(
                        (
                          current
                        ) => ({
                          ...current,
                          title:
                            value,
                        })
                      )
                  }
                  placeholder="Enter task title"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <ReadOnlyField
                    label="Class"
                    value={
                      editingTask.class ||
                      "Not specified"
                    }
                    icon={
                      <GraduationCap size={15} />
                    }
                  />

                  <ReadOnlyField
                    label="Subject"
                    value={
                      editingTask.subject ||
                      "Not specified"
                    }
                    icon={
                      <BookOpen size={15} />
                    }
                  />

                </div>

                <Field
                  label="Description"
                  textarea
                  value={
                    editingTask.description
                  }
                  onChange={
                    (value) =>
                      setEditingTask(
                        (
                          current
                        ) => ({
                          ...current,
                          description:
                            value,
                        })
                      )
                  }
                  placeholder="Describe the task..."
                />

                <Field
                  label="Instructions"
                  textarea
                  value={
                    editingTask.instructions
                  }
                  onChange={
                    (value) =>
                      setEditingTask(
                        (
                          current
                        ) => ({
                          ...current,
                          instructions:
                            value,
                        })
                      )
                  }
                  placeholder="Add instructions for students..."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <Field
                    label="Due Date"
                    type="datetime-local"
                    value={
                      editingTask.dueDate
                    }
                    onChange={
                      (value) =>
                        setEditingTask(
                          (
                            current
                          ) => ({
                            ...current,
                            dueDate:
                              value,
                          })
                        )
                    }
                  />

                  <Field
                    label="Maximum Score"
                    type="number"
                    min="0"
                    value={
                      editingTask.maxScore
                    }
                    onChange={
                      (value) =>
                        setEditingTask(
                          (
                            current
                          ) => ({
                            ...current,
                            maxScore:
                              value,
                          })
                        )
                    }
                    placeholder="e.g. 20"
                  />

                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={() =>
                      setEditingTask(
                        null
                      )
                    }
                    className="h-11 rounded-xl border border-slate-700 bg-[#0b1729] px-4 text-sm font-semibold text-slate-300 transition hover:bg-[#101f35] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>

                </div>
              </form>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <AnimatePresence>
        {deleteTarget && (
          <ModalOverlay
            onClose={() =>
              deleting
                ? null
                : setDeleteTarget(
                    null
                  )
            }
          >
            <div className="p-6">

              <div className="flex items-start gap-4">

                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
                  <Trash2 size={22} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white">
                    Delete this task?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    You are about to delete{" "}
                    <span className="font-semibold text-slate-200">
                      "{deleteTarget.title}"
                    </span>
                    . This action cannot be undone.
                  </p>
                </div>

              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

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
                  className="h-11 rounded-xl border border-slate-700 bg-[#0b1729] px-4 text-sm font-semibold text-slate-300 transition hover:bg-[#101f35] disabled:opacity-50"
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
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Task
                    </>
                  )}
                </button>

              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function ModalOverlay({
  children,
  onClose,
}) {
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={
        (event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }
      }
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
        transition={{
          duration: 0.2,
        }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-[#071426] shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   MODAL HEADER
========================================================= */

function ModalHeader({
  title,
  onClose,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
      <h2 className="text-base font-bold text-white">
        {title}
      </h2>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
      >
        <X size={18} />
      </button>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020b18] p-3">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   CONTENT SECTION
========================================================= */

function ContentSection({
  title,
  content,
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <div className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-[#020b18] p-4 text-sm leading-7 text-slate-300">
        {content}
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  textarea = false,
  type = "text",
  min,
}) {
  const sharedClass =
    "w-full rounded-xl border border-slate-700 bg-[#020b18] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10";

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}

        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}
      </span>

      {textarea ? (
        <textarea
          value={
            value ?? ""
          }
          onChange={
            (event) =>
              onChange(
                event.target.value
              )
          }
          placeholder={
            placeholder
          }
          rows={4}
          className={`${sharedClass} resize-y py-3`}
        />
      ) : (
        <input
          type={type}
          value={
            value ?? ""
          }
          onChange={
            (event) =>
              onChange(
                event.target.value
              )
          }
          placeholder={
            placeholder
          }
          min={min}
          className={`${sharedClass} h-11`}
        />
      )}
    </label>
  );
}

/* =========================================================
   READ ONLY FIELD
========================================================= */

function ReadOnlyField({
  label,
  value,
  icon,
}) {
  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-800 bg-[#020b18] px-3.5 text-sm text-slate-300">
        <span className="text-slate-500">
          {icon}
        </span>

        <span className="truncate">
          {value}
        </span>
      </div>
    </div>
  );
}
