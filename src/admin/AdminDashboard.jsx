
import React, { useEffect, useState } from "react";
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
  ClipboardCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    {
      title: "Total Users",
      value: 0,
      change: "Live",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Courses",
      value: 0,
      change: "Live",
      icon: GraduationCap,
      color: "from-indigo-500 to-violet-500",
    },
    {
      title: "Virtual Labs",
      value: 0,
      change: "Live",
      icon: FlaskConical,
      color: "from-emerald-500 to-green-500",
    },
    {
      title: "CBT Questions",
      value: 0,
      change: "Live",
      icon: FileQuestion,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Novels",
      value: 0,
      change: "Live",
      icon: BookOpen,
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "CBT Attempts",
      value: 0,
      change: "Live",
      icon: ClipboardCheck,
      color: "from-cyan-500 to-blue-500",
    },
  ]);

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // -------------------------------------------------------
  // FORMAT NUMBER
  // -------------------------------------------------------

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US").format(number || 0);
  };

  // -------------------------------------------------------
  // TIME AGO
  // -------------------------------------------------------

  const timeAgo = (date) => {
    if (!date) return "Recently";

    const now = new Date();
    const past = new Date(date);

    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return past.toLocaleDateString();
  };

  // -------------------------------------------------------
  // LIVE TABLE COUNT
  // -------------------------------------------------------

  const getCount = async (table) => {
    const { count, error } = await supabase
      .from(table)
      .select("*", {
        count: "exact",
        head: true,
      });

    if (error) {
      console.error(`Error counting ${table}:`, error);
      return 0;
    }

    return count || 0;
  };

  // -------------------------------------------------------
  // AUTHENTICATION USER COUNT
  // -------------------------------------------------------

  const getAuthUserCount = async () => {
    const { data, error } = await supabase.rpc(
      "get_auth_user_count"
    );

    if (error) {
      console.error(
        "Error fetching authentication user count:",
        error
      );

      return 0;
    }

    return Number(data || 0);
  };

  // -------------------------------------------------------
  // FETCH LIVE DASHBOARD DATA
  // -------------------------------------------------------

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);

      // ---------------------------------------------------
      // LIVE COUNTS
      // ---------------------------------------------------

      const [
        authUsersCount,
        coursesCount,
        labsCount,
        questionsCount,
        novelsCount,
        attemptsCount,
      ] = await Promise.all([
        // IMPORTANT:
        // This comes directly from Supabase auth.users
        getAuthUserCount(),

        getCount("courses"),
        getCount("virtual_labs"),
        getCount("cbt_questions"),
        getCount("novels"),
        getCount("cbt_attempts"),
      ]);

      setStats([
        {
          title: "Total Users",
          value: authUsersCount,
          change: "Authentication",
          icon: Users,
          color: "from-blue-500 to-cyan-500",
        },
        {
          title: "Courses",
          value: coursesCount,
          change: "Live",
          icon: GraduationCap,
          color: "from-indigo-500 to-violet-500",
        },
        {
          title: "Virtual Labs",
          value: labsCount,
          change: "Live",
          icon: FlaskConical,
          color: "from-emerald-500 to-green-500",
        },
        {
          title: "CBT Questions",
          value: questionsCount,
          change: "Live",
          icon: FileQuestion,
          color: "from-orange-500 to-red-500",
        },
        {
          title: "Novels",
          value: novelsCount,
          change: "Live",
          icon: BookOpen,
          color: "from-pink-500 to-rose-500",
        },
        {
          title: "CBT Attempts",
          value: attemptsCount,
          change: "Live",
          icon: ClipboardCheck,
          color: "from-cyan-500 to-blue-500",
        },
      ]);

      // ---------------------------------------------------
      // RECENT CBT ATTEMPTS
      // ---------------------------------------------------

      const {
        data: recentAttempts,
        error: attemptsError,
      } = await supabase
        .from("cbt_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (attemptsError) {
        console.error(
          "Error fetching recent CBT attempts:",
          attemptsError
        );
      }

      const liveActivities = [];

      if (recentAttempts?.length) {
        recentAttempts.forEach((attempt) => {
          liveActivities.push({
            title: "CBT examination attempt recorded",
            time: timeAgo(attempt.created_at),
            icon: ClipboardCheck,
            date: attempt.created_at,
          });
        });
      }

      // ---------------------------------------------------
      // RECENT NOVELS
      // ---------------------------------------------------

      const {
        data: recentNovels,
        error: novelsError,
      } = await supabase
        .from("novels")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(2);

      if (novelsError) {
        console.error(
          "Error fetching recent novels:",
          novelsError
        );
      }

      if (recentNovels?.length) {
        recentNovels.forEach((novel) => {
          liveActivities.push({
            title: `Novel added: ${novel.title}`,
            time: timeAgo(novel.created_at),
            icon: BookOpen,
            date: novel.created_at,
          });
        });
      }

      // ---------------------------------------------------
      // RECENT COURSES
      // ---------------------------------------------------

      const {
        data: recentCourses,
        error: coursesError,
      } = await supabase
        .from("courses")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(2);

      if (coursesError) {
        console.error(
          "Error fetching recent courses:",
          coursesError
        );
      }

      if (recentCourses?.length) {
        recentCourses.forEach((course) => {
          liveActivities.push({
            title: `Course added: ${course.title}`,
            time: timeAgo(course.created_at),
            icon: GraduationCap,
            date: course.created_at,
          });
        });
      }

      // ---------------------------------------------------
      // SORT ACTIVITIES BY ACTUAL DATE
      // ---------------------------------------------------

      liveActivities.sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      );

      setActivities(liveActivities.slice(0, 8));
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // -------------------------------------------------------
  // INITIAL LOAD
  // -------------------------------------------------------

  useEffect(() => {
    fetchDashboard();
  }, []);

  // -------------------------------------------------------
  // QUICK ACTIONS
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // LOADING
  // -------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-10 w-72 bg-slate-800 rounded-xl animate-pulse" />

          <div className="h-4 w-96 bg-slate-800 rounded-lg animate-pulse mt-3" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6 animate-pulse"
            >
              <div className="h-4 w-24 bg-slate-800 rounded" />

              <div className="h-10 w-32 bg-slate-800 rounded mt-4" />

              <div className="h-4 w-20 bg-slate-800 rounded mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // MAIN UI
  // -------------------------------------------------------

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>
          <h1 className="text-4xl font-bold">
            Welcome Back 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Here's what's happening across Scholiqen today.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Data"}
        </button>

      </div>

      {/* LIVE STATUS */}

      <div className="flex flex-wrap items-center gap-4 text-xs">

        <div className="flex items-center gap-2 text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Live database statistics
        </div>

        <div className="flex items-center gap-2 text-blue-400">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          Users sourced from Authentication
        </div>

      </div>

      {/* STATS */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {stats.map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 transition"
            >

              <div className="flex justify-between">

                <div>

                  <p className="text-slate-400">
                    {item.title}
                  </p>

                  <h2 className="mt-3 text-4xl font-bold">
                    {formatNumber(item.value)}
                  </h2>

                  <p className="mt-3 text-emerald-400 text-sm">
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

        })}

      </div>

      {/* MIDDLE */}

      <div className="grid gap-8 lg:grid-cols-3">

        {/* QUICK ACTIONS */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <div className="mt-6 space-y-4">

            {quickActions.map((action) => {

              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  to={action.link}
                  className="flex items-center justify-between rounded-2xl bg-slate-800 px-5 py-4 transition hover:bg-slate-700"
                >

                  <div className="flex items-center gap-3">

                    <Icon
                      className="text-blue-400"
                      size={20}
                    />

                    {action.title}

                  </div>

                  <ArrowUpRight size={18} />

                </Link>
              );

            })}

          </div>

        </div>

        {/* RECENT ACTIVITY */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Recent Activity
            </h2>

            <span className="text-xs text-emerald-400">
              Live
            </span>

          </div>

          <div className="mt-6 space-y-4">

            {activities.length > 0 ? (

              activities.map((activity, index) => {

                const Icon =
                  activity.icon || Clock;

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
                          {activity.title}
                        </p>

                        <p className="text-sm text-slate-400">
                          {activity.time}
                        </p>

                      </div>

                    </div>

                  </div>
                );

              })

            ) : (

              <div className="rounded-2xl bg-slate-800 px-5 py-8 text-center">

                <Clock
                  size={30}
                  className="mx-auto text-slate-500 mb-3"
                />

                <p className="text-slate-400">
                  No recent activity available.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
