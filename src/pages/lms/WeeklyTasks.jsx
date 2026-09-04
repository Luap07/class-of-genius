// src/pages/lms/Tasks.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  ClipboardList,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import TaskCard from "../../components/lms/WeeklyTaskCard";

/* =========================================================
   API CONFIG
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY = "scholiqen_auth_token";

/* =========================================================
   TASKS PAGE
========================================================= */

const Tasks = () => {
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [weeklyTasks, setWeeklyTasks] = useState([]);

  const [monthlyTasks, setMonthlyTasks] = useState([]);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD TASKS
  ======================================================= */

  const loadTasks = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem(
        AUTH_TOKEN_KEY
      );

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      /* ===================================================
         LOAD WEEKLY + MONTHLY TASKS
      =================================================== */

      const response = await fetch(
        `${API_URL}/api/tasks`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",

            Authorization: `Bearer ${token}`,
          },
        }
      );

      /* ===================================================
         HTTP ERROR
      =================================================== */

      if (!response.ok) {
        let message = `Failed to load tasks (${response.status}).`;

        try {
          const errorData =
            await response.json();

          if (errorData?.message) {
            message = errorData.message;
          }

          if (errorData?.error) {
            message = errorData.error;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      /* ===================================================
         RESPONSE
      =================================================== */

      const result = await response.json();

      /*
        Supported response formats:

        {
          weeklyTasks: [],
          monthlyTasks: []
        }

        OR

        {
          weekly: [],
          monthly: []
        }

        OR

        {
          data: {
            weeklyTasks: [],
            monthlyTasks: []
          }
        }
      */

      const data = result?.data || result || {};

      const weekly =
        data?.weeklyTasks ||
        data?.weekly ||
        [];

      const monthly =
        data?.monthlyTasks ||
        data?.monthly ||
        [];

      /* ===================================================
         FORMAT WEEKLY
      =================================================== */

      const formattedWeekly = (
        Array.isArray(weekly)
          ? weekly
          : []
      ).map((item) => ({
        ...item,

        task_type:
          item.task_type ||
          item.taskType ||
          "weekly",

        course_topics:
          item.course_topics ||
          item.course_topic ||
          item.topic ||
          null,

        courses:
          item.courses ||
          item.course ||
          null,
      }));

      /* ===================================================
         FORMAT MONTHLY
      =================================================== */

      const formattedMonthly = (
        Array.isArray(monthly)
          ? monthly
          : []
      ).map((item) => ({
        ...item,

        task_type: "monthly",

        month:
          item.month ||
          item.quiz_number ||
          item.quizNumber ||
          null,

        due_date:
          item.due_date ||
          item.available_until ||
          item.availableUntil ||
          null,

        course_topics:
          item.course_topics ||
          item.course_topic ||
          item.topic ||
          null,

        courses:
          item.courses ||
          item.course ||
          null,
      }));

      setWeeklyTasks(formattedWeekly);

      setMonthlyTasks(formattedMonthly);
    } catch (err) {
      console.error(
        "Tasks loading error:",
        err
      );

      setError(
        err?.message ||
          "Failed to load tasks."
      );
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadTasks();
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const normalizedSearch =
    search.trim().toLowerCase();

  /* =======================================================
     FILTER WEEKLY
  ======================================================= */

  const filteredWeekly = useMemo(() => {
    if (!normalizedSearch) {
      return weeklyTasks;
    }

    return weeklyTasks.filter((task) => {
      const title =
        task?.title || "";

      const description =
        task?.description || "";

      const topic =
        task?.course_topics?.title ||
        task?.topic_title ||
        "";

      const course =
        task?.courses?.title ||
        task?.course_title ||
        "";

      return (
        title
          .toLowerCase()
          .includes(normalizedSearch) ||
        description
          .toLowerCase()
          .includes(normalizedSearch) ||
        topic
          .toLowerCase()
          .includes(normalizedSearch) ||
        course
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [
    weeklyTasks,
    normalizedSearch,
  ]);

  /* =======================================================
     FILTER MONTHLY
  ======================================================= */

  const filteredMonthly = useMemo(() => {
    if (!normalizedSearch) {
      return monthlyTasks;
    }

    return monthlyTasks.filter((task) => {
      const title =
        task?.title || "";

      const description =
        task?.description || "";

      const topic =
        task?.course_topics?.title ||
        task?.topic_title ||
        "";

      const course =
        task?.courses?.title ||
        task?.course_title ||
        "";

      return (
        title
          .toLowerCase()
          .includes(normalizedSearch) ||
        description
          .toLowerCase()
          .includes(normalizedSearch) ||
        topic
          .toLowerCase()
          .includes(normalizedSearch) ||
        course
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [
    monthlyTasks,
    normalizedSearch,
  ]);

  /* =======================================================
     TOTALS
  ======================================================= */

  const totalTasks =
    filteredWeekly.length +
    filteredMonthly.length;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={46}
            className="animate-spin text-blue-500"
          />

          <p className="text-sm text-slate-500">
            Loading tasks...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Tasks
          </h1>

          <p className="mt-2 text-slate-400">
            Complete your weekly assignments
            and monthly assessments.
          </p>
        </div>

        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
          <AlertCircle
            size={52}
            className="mx-auto text-red-400"
          />

          <h2 className="mt-5 text-2xl font-bold text-white">
            Unable to Load Tasks
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadTasks()}
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-500
            "
          >
            <RefreshCw size={17} />

            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="space-y-8">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>
          <h1 className="text-4xl font-bold text-white">
            Tasks
          </h1>

          <p className="mt-2 text-slate-400">
            Complete your weekly assignments
            and monthly assessments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadTasks(true)}
          disabled={refreshing}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-700
            bg-slate-900
            px-4
            py-2.5
            text-sm
            font-medium
            text-slate-300
            transition
            hover:border-blue-500/40
            hover:bg-slate-800
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
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

      {/* ===================================================
          SEARCH
      =================================================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10">

        <div className="flex items-center gap-3">

          <Search
            size={20}
            className="shrink-0 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search tasks..."
            className="
              w-full
              bg-transparent
              text-white
              outline-none
              placeholder:text-slate-500
            "
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="
                shrink-0
                text-xs
                text-slate-500
                transition
                hover:text-white
              "
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="grid gap-6 md:grid-cols-3">

        {/* WEEKLY */}

        <div className="relative overflow-hidden rounded-3xl border border-blue-500/10 bg-slate-900 p-6">

          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-500/10 p-3">
                <ClipboardList
                  className="text-blue-400"
                  size={25}
                />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Weekly Tasks
              </h2>
            </div>

            <p className="mt-5 text-5xl font-bold text-white">
              {filteredWeekly.length}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Weekly activities available
            </p>
          </div>
        </div>

        {/* MONTHLY */}

        <div className="relative overflow-hidden rounded-3xl border border-purple-500/10 bg-slate-900 p-6">

          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-purple-500/10 p-3">
                <ClipboardCheck
                  className="text-purple-400"
                  size={25}
                />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Monthly Tasks
              </h2>
            </div>

            <p className="mt-5 text-5xl font-bold text-white">
              {filteredMonthly.length}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Monthly assessments available
            </p>
          </div>
        </div>

        {/* TOTAL */}

        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/10 bg-slate-900 p-6">

          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-cyan-500/10 p-3">
                <ClipboardList
                  className="text-cyan-400"
                  size={25}
                />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Total
              </h2>
            </div>

            <p className="mt-5 text-5xl font-bold text-white">
              {totalTasks}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Tasks matching your search
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================
          WEEKLY TASKS
      =================================================== */}

      <section className="space-y-5">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-500/10 p-2.5">
              <ClipboardList
                className="text-blue-400"
                size={23}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Weekly Tasks
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your weekly learning activities
              </p>
            </div>

          </div>

          <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
            {filteredWeekly.length}
          </span>

        </div>

        <div className="grid gap-6">

          {filteredWeekly.length === 0 ? (

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">

              <ClipboardList
                size={52}
                className="mx-auto text-slate-700"
              />

              <h3 className="mt-5 text-2xl font-bold text-white">
                No Weekly Tasks
              </h3>

              <p className="mx-auto mt-2 max-w-md text-slate-400">
                {search
                  ? "No weekly tasks match your search."
                  : "Your instructor hasn't assigned any weekly tasks yet."}
              </p>

            </div>

          ) : (

            filteredWeekly.map((task) => (

              <TaskCard
                key={`weekly-${task.id}`}
                task={task}
                type="weekly"
              />

            ))

          )}

        </div>

      </section>

      {/* ===================================================
          MONTHLY TASKS
      =================================================== */}

      <section className="space-y-5">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-purple-500/10 p-2.5">
              <ClipboardCheck
                className="text-purple-400"
                size={23}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Monthly Tasks
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your monthly assessments
              </p>
            </div>

          </div>

          <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
            {filteredMonthly.length}
          </span>

        </div>

        <div className="grid gap-6">

          {filteredMonthly.length === 0 ? (

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">

              <ClipboardCheck
                size={52}
                className="mx-auto text-slate-700"
              />

              <h3 className="mt-5 text-2xl font-bold text-white">
                No Monthly Tasks
              </h3>

              <p className="mx-auto mt-2 max-w-md text-slate-400">
                {search
                  ? "No monthly assessments match your search."
                  : "Your instructor hasn't published any monthly assessment yet."}
              </p>

            </div>

          ) : (

            filteredMonthly.map((task) => (

              <TaskCard
                key={`monthly-${task.id}`}
                task={task}
                type="monthly"
              />

            ))

          )}

        </div>

      </section>

    </div>
  );
};

export default Tasks;