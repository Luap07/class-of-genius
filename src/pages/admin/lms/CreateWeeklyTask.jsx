import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Save,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY = "scholiqen_auth_token";

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

const initialForm = {
  title: "",
  description: "",
  week: "",
  due_date: "",
  priority: "medium",
  difficulty: "medium",
  xp: 10,
};

const CreateWeeklyTask = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();

  const [form, setForm] = useState(initialForm);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     UPDATE FORM
  ========================================================= */

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =========================================================
     BACK
  ========================================================= */

  const goBack = () => {
    if (topicId) {
      navigate(
        `/admin/lms/topic/${encodeURIComponent(topicId)}/tasks`
      );
      return;
    }

    navigate("/admin/lms");
  };

  /* =========================================================
     CREATE TASK
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!topicId) {
      setError(
        "No topic was selected. Please open a topic before creating a weekly task."
      );
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!form.week) {
      setError("Please enter the week number.");
      return;
    }

    const weekNumber = Number(form.week);

    if (!Number.isInteger(weekNumber) || weekNumber < 1) {
      setError("Week must be a valid number starting from 1.");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not authenticated. Please log in again."
        );
      }

      /* =====================================================
         PAYLOAD
      ===================================================== */

      const payload = {
        topic_id: topicId,
        title: form.title.trim(),
        description: form.description.trim(),
        week: weekNumber,
        due_date: form.due_date || null,
        priority: form.priority,
        difficulty: form.difficulty,
        xp: Number(form.xp) || 0,
      };

      console.log("CREATE WEEKLY TASK PAYLOAD:", payload);

      /* =====================================================
         POST
      ===================================================== */

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(payload),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log(
        "CREATE WEEKLY TASK STATUS:",
        response.status
      );

      console.log(
        "CREATE WEEKLY TASK RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Unable to create weekly task (${response.status}).`
        );
      }

      setSuccess("Weekly task created successfully.");

      /*
       * Give the success message a moment to display,
       * then return to this topic's task list.
       */
      setTimeout(() => {
        navigate(
          `/admin/lms/topic/${encodeURIComponent(
            topicId
          )}/tasks`
        );
      }, 700);
    } catch (err) {
      console.error(
        "CREATE WEEKLY TASK ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to create weekly task."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     NO TOPIC
  ========================================================= */

  if (!topicId) {
    return (
      <div className="min-h-screen bg-[#070b14] px-6 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate("/admin/lms")}
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to LMS
          </button>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <ClipboardList
                size={24}
                className="text-red-400"
              />
            </div>

            <h1 className="mt-5 text-xl font-semibold">
              Topic Required
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Please open a course topic before creating
              a weekly task.
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
      </div>
    );
  }

  /* =========================================================
     FORM
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#070b14] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-8">
          <button
            type="button"
            onClick={goBack}
            disabled={saving}
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white disabled:opacity-50"
          >
            <ArrowLeft size={17} />
            Back to Weekly Tasks
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
              <ClipboardList
                size={24}
                className="text-purple-400"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Create Weekly Task
              </h1>

              <p className="mt-1 text-sm text-gray-400">
                Create a new weekly task for this topic.
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            TOPIC ID
        =================================================== */}

        <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-500/[0.05] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            Selected Topic
          </p>

          <p className="mt-2 text-sm text-gray-300">
            Topic ID:
            <span className="ml-2 font-mono text-purple-300">
              {topicId}
            </span>
          </p>

          <p className="mt-2 text-xs text-gray-500">
            This task will automatically be attached to
            this topic.
          </p>
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm leading-6 text-red-300">
            {error}
          </div>
        )}

        {/* ===================================================
            SUCCESS
        =================================================== */}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-sm text-emerald-300">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7"
        >

          {/* =================================================
              TITLE
          ================================================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Task Title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                updateField(
                  "title",
                  e.target.value
                )
              }
              placeholder="e.g. Read Chapter One and answer the questions"
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Description
            </label>

            <textarea
              rows={5}
              value={form.description}
              onChange={(e) =>
                updateField(
                  "description",
                  e.target.value
                )
              }
              placeholder="Describe what students need to do..."
              disabled={saving}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-gray-600 transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* =================================================
              WEEK + XP
          ================================================= */}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            {/* WEEK */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Week
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={form.week}
                onChange={(e) =>
                  updateField(
                    "week",
                    e.target.value
                  )
                }
                placeholder="1"
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* XP */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                XP Reward
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={form.xp}
                onChange={(e) =>
                  updateField(
                    "xp",
                    e.target.value
                  )
                }
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* =================================================
              DUE DATE
          ================================================= */}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Due Date
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  updateField(
                    "due_date",
                    e.target.value
                  )
                }
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* =================================================
              PRIORITY + DIFFICULTY
          ================================================= */}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            {/* PRIORITY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Priority
              </label>

              <select
                value={form.priority}
                onChange={(e) =>
                  updateField(
                    "priority",
                    e.target.value
                  )
                }
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-[#0b101b] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </div>

            {/* DIFFICULTY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Difficulty
              </label>

              <select
                value={form.difficulty}
                onChange={(e) =>
                  updateField(
                    "difficulty",
                    e.target.value
                  )
                }
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-[#0b101b] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>
              </select>
            </div>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={goBack}
              disabled={saving}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Creating...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Create Weekly Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWeeklyTask;