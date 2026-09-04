import React, {
  useEffect,
  useState,
} from "react";

import {
  Users,
  GraduationCap,
  FlaskConical,
  BookOpen,
  FileQuestion,
  TrendingUp,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Activity,
  BarChart3,
} from "lucide-react";

import { Link } from "react-router-dom";

/* =========================================================
   API CONFIG
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY =
  "scholiqen_auth_token";

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

const AdminDashboard = () => {
  /* =======================================================
     STATS
  ======================================================= */

  const [stats, setStats] = useState([
    {
      title: "Total Users",
      value: 0,
      change: "Live",
      icon: Users,
      color:
        "from-blue-500 to-cyan-500",
    },

    {
      title: "Courses",
      value: 0,
      change: "Live",
      icon: GraduationCap,
      color:
        "from-indigo-500 to-violet-500",
    },

    {
      title: "Virtual Labs",
      value: 0,
      change: "Live",
      icon: FlaskConical,
      color:
        "from-emerald-500 to-green-500",
    },

    {
      title: "CBT Questions",
      value: 0,
      change: "Live",
      icon: FileQuestion,
      color:
        "from-orange-500 to-red-500",
    },

    {
      title: "Novels",
      value: 0,
      change: "Live",
      icon: BookOpen,
      color:
        "from-pink-500 to-rose-500",
    },

    {
      title: "Project Growth",
      value: 0,
      change: "Last 30 days",
      icon: TrendingUp,
      color:
        "from-cyan-500 to-blue-500",
    },
  ]);

  /* =======================================================
     ACTIVITIES
  ======================================================= */

  const [activities, setActivities] =
    useState([]);

  /* =======================================================
     STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     GROWTH
  ======================================================= */

  const [growth, setGrowth] =
    useState({
      users: 0,
      courses: 0,
      labs: 0,
      questions: 0,
      novels: 0,
      overall: 0,
    });

  /* =======================================================
     FORMAT NUMBER
  ======================================================= */

  const formatNumber = (number) => {
    return new Intl.NumberFormat(
      "en-US"
    ).format(
      Number(number) || 0
    );
  };

  /* =======================================================
     TIME AGO
  ======================================================= */

  const timeAgo = (date) => {
    if (!date) {
      return "Recently";
    }

    const now = new Date();

    const past =
      new Date(date);

    const seconds = Math.floor(
      (now - past) / 1000
    );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes} minute${
        minutes === 1
          ? ""
          : "s"
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours === 1
          ? ""
          : "s"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${
        days === 1
          ? ""
          : "s"
      } ago`;
    }

    return past.toLocaleDateString();
  };

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      setError("");

      /* ---------------------------------------------------
         GET AUTH TOKEN
      --------------------------------------------------- */

      const token =
        localStorage.getItem(
          AUTH_TOKEN_KEY
        );

      if (!token) {
        throw new Error(
          "Your admin session has expired. Please login again."
        );
      }

      /* ---------------------------------------------------
         FETCH FROM NEON BACKEND
      --------------------------------------------------- */

      const response =
        await fetch(
          `${API_URL}/api/admin/dashboard`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      /* ---------------------------------------------------
         READ RESPONSE
      --------------------------------------------------- */

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      /* ---------------------------------------------------
         HANDLE HTTP ERRORS
      --------------------------------------------------- */

      if (!response.ok) {
        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            AUTH_TOKEN_KEY
          );

          localStorage.removeItem(
            "scholiqen_current_user"
          );

          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "You do not have administrator access."
          );
        }

        throw new Error(
          data?.message ||
            data?.error ||
            `Dashboard request failed (${response.status}).`
        );
      }

      /* ---------------------------------------------------
         VALIDATE RESPONSE
      --------------------------------------------------- */

      if (
        !data ||
        data.success !== true
      ) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Dashboard data could not be loaded."
        );
      }

      /* ---------------------------------------------------
         STATS
      --------------------------------------------------- */

      const dashboardStats =
        data.stats || {};

      const users =
        Number(
          dashboardStats.users
        ) || 0;

      const courses =
        Number(
          dashboardStats.courses
        ) || 0;

      const labs =
        Number(
          dashboardStats.labs
        ) || 0;

      const questions =
        Number(
          dashboardStats.questions
        ) || 0;

      const novels =
        Number(
          dashboardStats.novels
        ) || 0;

      /* ---------------------------------------------------
         GROWTH
      --------------------------------------------------- */

      const dashboardGrowth =
        data.growth || {};

      const usersGrowth =
        Number(
          dashboardGrowth.users
        ) || 0;

      const coursesGrowth =
        Number(
          dashboardGrowth.courses
        ) || 0;

      const labsGrowth =
        Number(
          dashboardGrowth.labs
        ) || 0;

      const questionsGrowth =
        Number(
          dashboardGrowth.questions
        ) || 0;

      const novelsGrowth =
        Number(
          dashboardGrowth.novels
        ) || 0;

      const overallGrowth =
        Number(
          dashboardGrowth.overall
        ) ||
        (
          usersGrowth +
          coursesGrowth +
          labsGrowth +
          questionsGrowth +
          novelsGrowth
        );

      /* ---------------------------------------------------
         UPDATE STATS
      --------------------------------------------------- */

      setStats([
        {
          title: "Total Users",
          value: users,
          change: "Neon Database",
          icon: Users,
          color:
            "from-blue-500 to-cyan-500",
        },

        {
          title: "Courses",
          value: courses,
          change: "Live",
          icon: GraduationCap,
          color:
            "from-indigo-500 to-violet-500",
        },

        {
          title: "Virtual Labs",
          value: labs,
          change: "Live",
          icon: FlaskConical,
          color:
            "from-emerald-500 to-green-500",
        },

        {
          title: "CBT Questions",
          value: questions,
          change: "Live",
          icon: FileQuestion,
          color:
            "from-orange-500 to-red-500",
        },

        {
          title: "Novels",
          value: novels,
          change: "Live",
          icon: BookOpen,
          color:
            "from-pink-500 to-rose-500",
        },

        {
          title: "Project Growth",
          value: overallGrowth,
          change: "Last 30 days",
          icon: TrendingUp,
          color:
            "from-cyan-500 to-blue-500",
        },
      ]);

      /* ---------------------------------------------------
         UPDATE GROWTH
      --------------------------------------------------- */

      setGrowth({
        users: usersGrowth,
        courses: coursesGrowth,
        labs: labsGrowth,
        questions: questionsGrowth,
        novels: novelsGrowth,
        overall: overallGrowth,
      });

      /* ===================================================
         RECENT ACTIVITIES
      =================================================== */

      const liveActivities = [];

      const recent =
        data.recent || {};

      /* ---------------------------------------------------
         NOVELS
      --------------------------------------------------- */

      const recentNovels =
        Array.isArray(
          recent.novels
        )
          ? recent.novels
          : [];

      recentNovels.forEach(
        (novel) => {
          liveActivities.push({
            title:
              `Novel added: ${
                novel.title ||
                "Untitled novel"
              }`,

            time:
              timeAgo(
                novel.created_at
              ),

            icon: BookOpen,

            date:
              novel.created_at,
          });
        }
      );

      /* ---------------------------------------------------
         COURSES
      --------------------------------------------------- */

      const recentCourses =
        Array.isArray(
          recent.courses
        )
          ? recent.courses
          : [];

      recentCourses.forEach(
        (course) => {
          liveActivities.push({
            title:
              `Course added: ${
                course.title ||
                "Untitled course"
              }`,

            time:
              timeAgo(
                course.created_at
              ),

            icon:
              GraduationCap,

            date:
              course.created_at,
          });
        }
      );

      /* ---------------------------------------------------
         CBT QUESTIONS
      --------------------------------------------------- */

      const recentQuestions =
        Array.isArray(
          recent.questions
        )
          ? recent.questions
          : [];

      recentQuestions.forEach(
        (question) => {
          const subject =
            question.subject
              ? ` — ${question.subject}`
              : "";

          const exam =
            question.exam
              ? ` (${question.exam})`
              : "";

          liveActivities.push({
            title:
              `CBT question added${subject}${exam}`,

            time:
              timeAgo(
                question.created_at
              ),

            icon:
              FileQuestion,

            date:
              question.created_at,
          });
        }
      );

      /* ---------------------------------------------------
         SORT
      --------------------------------------------------- */

      liveActivities.sort(
        (a, b) =>
          new Date(
            b.date || 0
          ) -
          new Date(
            a.date || 0
          )
      );

      setActivities(
        liveActivities.slice(
          0,
          8
        )
      );
    } catch (error) {
      console.error(
        "Admin Dashboard Error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load dashboard data."
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
    fetchDashboard();
  }, []);

  /* =======================================================
     QUICK ACTIONS
  ======================================================= */

  const quickActions = [
    {
      title: "Create Course",
      link: "/admin/lms/create",
      icon: GraduationCap,
    },

    {
      title: "Upload Novel",
      link: "/admin/novels",
      icon: BookOpen,
    },

    {
      title: "Add Experiment",
      link: "/admin/labs/add",
      icon: FlaskConical,
    },

    {
      title: "Add CBT Questions",
      link: "/admin/cbt/questions",
      icon: FileQuestion,
    },
  ];

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="space-y-8">

        <div>
          <div className="h-10 w-72 rounded-xl bg-slate-800 animate-pulse" />

          <div className="mt-3 h-4 w-96 rounded-lg bg-slate-800 animate-pulse" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {[...Array(6)].map(
            (_, index) => (
              <div
                key={index}
                className="rounded-3xl border border-slate-800 bg-slate-900 p-6 animate-pulse"
              >
                <div className="h-4 w-24 rounded bg-slate-800" />

                <div className="mt-4 h-10 w-32 rounded bg-slate-800" />

                <div className="mt-4 h-4 w-20 rounded bg-slate-800" />
              </div>
            )
          )}

        </div>

      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="space-y-8">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            Welcome Back 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Here's what's happening across
            Scholiqen today.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Data"}
        </button>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="font-semibold text-red-400">
                Dashboard could not load
              </p>

              <p className="mt-1 text-sm text-red-300/80">
                {error}
              </p>
            </div>

            <button
              onClick={fetchDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>

        </div>
      )}

      {/* ===================================================
          LIVE STATUS
      =================================================== */}

      <div className="flex flex-wrap items-center gap-4 text-xs">

        <div className="flex items-center gap-2 text-emerald-400">

          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

          Live Neon database statistics

        </div>

        <div className="flex items-center gap-2 text-blue-400">

          <span className="h-2 w-2 rounded-full bg-blue-400" />

          Users sourced from Neon

        </div>

        <div className="flex items-center gap-2 text-violet-400">

          <span className="h-2 w-2 rounded-full bg-violet-400" />

          Growth calculated from live records

        </div>

      </div>

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {stats.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
              >

                <div className="flex justify-between">

                  <div>

                    <p className="text-slate-400">
                      {item.title}
                    </p>

                    <h2 className="mt-3 text-4xl font-bold">
                      {formatNumber(
                        item.value
                      )}
                    </h2>

                    <p className="mt-3 text-sm text-emerald-400">
                      {item.change}
                    </p>

                  </div>

                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${item.color}`}
                  >
                    <Icon size={30} />
                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* ===================================================
          PROJECT GROWTH
      =================================================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">

                <TrendingUp
                  size={24}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <h2 className="text-2xl font-bold">
                  Project Growth
                </h2>

                <p className="text-sm text-slate-400">
                  Live platform activity over the last 30 days
                </p>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">

            <Activity size={16} />

            {formatNumber(
              growth.overall
            )}{" "}
            new records

          </div>

        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* USERS */}

          <div className="rounded-2xl bg-slate-800 p-5">

            <Users
              size={20}
              className="text-blue-400"
            />

            <p className="mt-4 text-sm text-slate-400">
              Users
            </p>

            <p className="mt-1 text-2xl font-bold">
              {formatNumber(
                growth.users
              )}
            </p>

          </div>

          {/* COURSES */}

          <div className="rounded-2xl bg-slate-800 p-5">

            <GraduationCap
              size={20}
              className="text-indigo-400"
            />

            <p className="mt-4 text-sm text-slate-400">
              Courses
            </p>

            <p className="mt-1 text-2xl font-bold">
              {formatNumber(
                growth.courses
              )}
            </p>

          </div>

          {/* LABS */}

          <div className="rounded-2xl bg-slate-800 p-5">

            <FlaskConical
              size={20}
              className="text-emerald-400"
            />

            <p className="mt-4 text-sm text-slate-400">
              Labs
            </p>

            <p className="mt-1 text-2xl font-bold">
              {formatNumber(
                growth.labs
              )}
            </p>

          </div>

          {/* QUESTIONS */}

          <div className="rounded-2xl bg-slate-800 p-5">

            <FileQuestion
              size={20}
              className="text-orange-400"
            />

            <p className="mt-4 text-sm text-slate-400">
              CBT Questions
            </p>

            <p className="mt-1 text-2xl font-bold">
              {formatNumber(
                growth.questions
              )}
            </p>

          </div>

          {/* NOVELS */}

          <div className="rounded-2xl bg-slate-800 p-5">

            <BookOpen
              size={20}
              className="text-pink-400"
            />

            <p className="mt-4 text-sm text-slate-400">
              Novels
            </p>

            <p className="mt-1 text-2xl font-bold">
              {formatNumber(
                growth.novels
              )}
            </p>

          </div>

        </div>

      </div>

      {/* ===================================================
          MIDDLE SECTION
      =================================================== */}

      <div className="grid gap-8 lg:grid-cols-3">

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <div className="mt-6 space-y-4">

            {quickActions.map(
              (action) => {
                const Icon =
                  action.icon;

                return (
                  <Link
                    key={
                      action.title
                    }
                    to={
                      action.link
                    }
                    className="flex items-center justify-between rounded-2xl bg-slate-800 px-5 py-4 transition hover:bg-slate-700"
                  >

                    <div className="flex items-center gap-3">

                      <Icon
                        className="text-blue-400"
                        size={20}
                      />

                      {action.title}

                    </div>

                    <ArrowUpRight
                      size={18}
                    />

                  </Link>
                );
              }
            )}

          </div>

        </div>

        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <BarChart3
                size={22}
                className="text-blue-400"
              />

              <h2 className="text-2xl font-bold">
                Recent Activity
              </h2>

            </div>

            <span className="text-xs text-emerald-400">
              Live
            </span>

          </div>

          <div className="mt-6 space-y-4">

            {activities.length >
            0 ? (

              activities.map(
                (
                  activity,
                  index
                ) => {

                  const Icon =
                    activity.icon ||
                    Clock;

                  return (
                    <div
                      key={`${activity.title}-${index}`}
                      className="flex items-center justify-between rounded-2xl bg-slate-800 px-5 py-4"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

                          <Icon
                            size={18}
                            className="text-blue-400"
                          />

                        </div>

                        <div>

                          <p className="font-medium">
                            {
                              activity.title
                            }
                          </p>

                          <p className="text-sm text-slate-400">
                            {
                              activity.time
                            }
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )

            ) : (

              <div className="rounded-2xl bg-slate-800 px-5 py-8 text-center">

                <Clock
                  size={30}
                  className="mx-auto mb-3 text-slate-500"
                />

                <p className="text-slate-400">
                  No recent activity available.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

      {/* ===================================================
          REVENUE
      =================================================== */}

      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-6">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">

              <TrendingUp
                size={26}
                className="text-emerald-400"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold">
                Revenue & Monetization
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Payment analytics will appear here once the payment system is connected.
              </p>

            </div>

          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-400">
            Payment integration ready
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
