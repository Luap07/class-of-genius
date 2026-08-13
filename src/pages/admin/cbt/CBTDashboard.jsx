import React, { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  HelpCircle,
  FileText,
  BarChart3,
  Loader2,
  Activity,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const CBTDashboard = () => {
  const [stats, setStats] = useState({
    subjects: 0,
    questions: 0,
    exams: 0,
    attempts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ==============================
  // FETCH CBT STATS
  // ==============================

  const fetchCBTStats = useCallback(async () => {
    try {
      const [
        subjectsResult,
        questionsResult,
        examsResult,
        attemptsResult,
      ] = await Promise.all([
        supabase
          .from("cbt_subjects")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("cbt_questions")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("cbt_exams")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("cbt_attempts")
          .select("*", {
            count: "exact",
            head: true,
          }),
      ]);

      if (subjectsResult.error) {
        console.error(
          "Subjects count error:",
          subjectsResult.error
        );
      }

      if (questionsResult.error) {
        console.error(
          "Questions count error:",
          questionsResult.error
        );
      }

      if (examsResult.error) {
        console.error(
          "Exams count error:",
          examsResult.error
        );
      }

      if (attemptsResult.error) {
        console.error(
          "Attempts count error:",
          attemptsResult.error
        );
      }

      setStats({
        subjects: subjectsResult.count || 0,
        questions: questionsResult.count || 0,
        exams: examsResult.count || 0,
        attempts: attemptsResult.count || 0,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        "CBT dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==============================
  // INITIAL LOAD
  // ==============================

  useEffect(() => {
    fetchCBTStats();
  }, [fetchCBTStats]);

  // ==============================
  // LIVE UPDATES
  // ==============================

  useEffect(() => {
    const channel = supabase
      .channel("cbt-dashboard-live")

      // QUESTIONS
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cbt_questions",
        },
        () => {
          console.log("CBT questions changed");
          fetchCBTStats();
        }
      )

      // SUBJECTS
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cbt_subjects",
        },
        () => {
          console.log("CBT subjects changed");
          fetchCBTStats();
        }
      )

      // EXAMS
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cbt_exams",
        },
        () => {
          console.log("CBT exams changed");
          fetchCBTStats();
        }
      )

      // ATTEMPTS
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cbt_attempts",
        },
        () => {
          console.log("CBT attempts changed");
          fetchCBTStats();
        }
      )

      .subscribe((status) => {
        console.log(
          "CBT Realtime status:",
          status
        );

        if (status === "SUBSCRIBED") {
          setLive(true);
        } else {
          setLive(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCBTStats]);

  // ==============================
  // STAT CARDS
  // ==============================

  const statsData = [
    {
      title: "Subjects",
      value: stats.subjects,
      icon: BookOpen,
    },
    {
      title: "Questions",
      value: stats.questions,
      icon: HelpCircle,
    },
    {
      title: "Exams",
      value: stats.exams,
      icon: FileText,
    },
    {
      title: "Attempts",
      value: stats.attempts,
      icon: BarChart3,
    },
  ];

  // ==============================
  // FORMAT TIME
  // ==============================

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  // ==============================
  // UI
  // ==============================

  return (
    <div className="space-y-8">

      {/* ==============================
          HEADER
      ============================== */}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

        <div>

          <div className="flex items-center gap-3">

            <h1 className="text-3xl font-bold text-white">
              CBT Dashboard
            </h1>

            {/* LIVE INDICATOR */}

            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                live
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-slate-800 border-slate-700 text-slate-500"
              }`}
            >

              <span className="relative flex h-2.5 w-2.5">

                {live && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}

                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    live
                      ? "bg-emerald-500"
                      : "bg-slate-500"
                  }`}
                />

              </span>

              <span className="text-xs font-medium">
                {live ? "LIVE" : "CONNECTING"}
              </span>

            </div>

          </div>

          <p className="text-slate-400 mt-1">
            Manage computer based tests, questions and exams.
          </p>

        </div>

        {/* LAST UPDATED */}

        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-slate-500">

            <Activity size={14} />

            Updated {formattedTime}

          </div>
        )}

      </div>


      {/* ==============================
          STAT CARDS
      ============================== */}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

        {statsData.map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:border-blue-500/30"
            >

              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Icon size={25} />
              </div>

              <h2 className="text-slate-400">
                {item.title}
              </h2>

              <p className="text-3xl font-bold mt-2 text-white">

                {loading ? (
                  <Loader2
                    size={25}
                    className="animate-spin text-blue-400"
                  />
                ) : (
                  item.value.toLocaleString()
                )}

              </p>

            </div>
          );

        })}

      </div>


      {/* ==============================
          RECENT CBT ACTIVITY
      ============================== */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <div className="flex items-center justify-between gap-4 mb-6">

          <div>

            <h2 className="text-xl font-semibold text-white">
              Recent CBT Activity
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Activity updates automatically.
            </p>

          </div>

          <div
            className={`flex items-center gap-2 text-sm ${
              live
                ? "text-emerald-400"
                : "text-slate-500"
            }`}
          >

            <span className="relative flex h-2 w-2">

              {live && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}

              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  live
                    ? "bg-emerald-500"
                    : "bg-slate-500"
                }`}
              />

            </span>

            {live ? "Live" : "Offline"}

          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="flex items-center gap-2 text-slate-400">

            <Loader2
              size={18}
              className="animate-spin"
            />

            Loading activity...

          </div>

        ) : stats.attempts > 0 ? (

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">

              <BarChart3 size={21} />

            </div>

            <div>

              <p className="text-white font-medium">

                {stats.attempts.toLocaleString()} CBT attempt
                {stats.attempts === 1 ? "" : "s"}

              </p>

              <p className="text-sm text-slate-500">
                Recorded by users
              </p>

            </div>

          </div>

        ) : (

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center">

              <BarChart3 size={21} />

            </div>

            <div>

              <p className="text-white font-medium">
                No CBT attempts yet
              </p>

              <p className="text-sm text-slate-500">
                User attempts will appear here automatically.
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default CBTDashboard;