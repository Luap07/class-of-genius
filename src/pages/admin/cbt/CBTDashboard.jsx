import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

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

  const [subjectList, setSubjectList] = useState([]);

  const [loading, setLoading] = useState(true);

  const [live, setLive] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(null);

  /* ==========================================================================
     NORMALIZE
  ========================================================================== */

  const normalize = (value) =>
    String(value ?? "")
      .replace(/\u00a0/g, " ")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

  /* ==========================================================================
     DISPLAY NAME
  ========================================================================== */

  const formatSubjectName = (subject) => {
    const normalized = normalize(subject);

    const names = {
      english: "English",
      "english language": "English",
      mathematics: "Mathematics",
      maths: "Mathematics",
      math: "Mathematics",
      physics: "Physics",
      chemistry: "Chemistry",
      biology: "Biology",
      economics: "Economics",
      government: "Government",
      literature: "Literature",
      "literature in english": "Literature",
      "civic education": "Civic Education",
    };

    if (names[normalized]) {
      return names[normalized];
    }

    return String(subject)
      .trim()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  /* ==========================================================================
     FETCH ALL DISTINCT SUBJECTS

     Supabase/PostgREST may limit normal SELECT responses to 1,000 rows.

     Therefore we paginate through cbt_questions when we need the actual
     subject list.

     The QUESTION TOTAL itself is obtained using count: "exact".
  ========================================================================== */

  const fetchAllQuestionMetadata = async () => {
    const pageSize = 1000;

    let from = 0;
    let allRows = [];

    while (true) {
      const to = from + pageSize - 1;

      const {
        data,
        error,
      } = await supabase
        .from("cbt_questions")
        .select("subject, exam")
        .range(from, to);

      if (error) {
        throw error;
      }

      const rows = data || [];

      allRows = [...allRows, ...rows];

      if (rows.length < pageSize) {
        break;
      }

      from += pageSize;
    }

    return allRows;
  };

  /* ==========================================================================
     FETCH CBT STATS
  ========================================================================== */

  const fetchCBTStats = useCallback(
    async () => {
      try {
        setLoading(true);

        /* ======================================================================
           1. GET EXACT TOTAL QUESTION COUNT

           IMPORTANT:

           We do NOT use questions.length here.

           count: "exact" tells Supabase/PostgREST to return the actual
           number of rows in the table, even when there are more than 1,000.
        ====================================================================== */

        const {
          count: questionCount,
          error: questionCountError,
        } = await supabase
          .from("cbt_questions")
          .select("id", {
            count: "exact",
            head: true,
          });

        if (questionCountError) {
          console.error(
            "Question count error:",
            questionCountError
          );

          throw questionCountError;
        }

        /* ======================================================================
           2. GET ALL QUESTION METADATA

           This is only used to calculate:

           - unique subjects
           - unique exams

           It is paginated so it is not limited to 1,000 rows.
        ====================================================================== */

        const questionRows =
          await fetchAllQuestionMetadata();

        /* ======================================================================
           3. UNIQUE SUBJECTS
        ====================================================================== */

        const subjectMap = new Map();

        questionRows.forEach((row) => {
          const rawSubject = String(
            row?.subject ?? ""
          ).trim();

          if (!rawSubject) {
            return;
          }

          const normalized =
            normalize(rawSubject);

          if (!normalized) {
            return;
          }

          if (!subjectMap.has(normalized)) {
            subjectMap.set(
              normalized,
              formatSubjectName(rawSubject)
            );
          }
        });

        const uniqueSubjects = Array.from(
          subjectMap.values()
        ).sort((a, b) =>
          a.localeCompare(b)
        );

        /* ======================================================================
           4. UNIQUE EXAMS
        ====================================================================== */

        const examMap = new Map();

        questionRows.forEach((row) => {
          const rawExam = String(
            row?.exam ?? ""
          ).trim();

          if (!rawExam) {
            return;
          }

          const normalized =
            normalize(rawExam);

          if (!normalized) {
            return;
          }

          if (!examMap.has(normalized)) {
            examMap.set(
              normalized,
              rawExam
            );
          }
        });

        const uniqueExams = Array.from(
          examMap.values()
        );

        /* ======================================================================
           5. EXACT ATTEMPT COUNT
        ====================================================================== */

        const {
          count: attemptsCount,
          error: attemptsError,
        } = await supabase
          .from("cbt_attempts")
          .select("id", {
            count: "exact",
            head: true,
          });

        if (attemptsError) {
          console.error(
            "Attempts count error:",
            attemptsError
          );
        }

        /* ======================================================================
           6. UPDATE DASHBOARD

           questionCount = TRUE TOTAL

           NOT:

           questionRows.length
        ====================================================================== */

        setStats({
          subjects: uniqueSubjects.length,

          questions: questionCount || 0,

          exams: uniqueExams.length,

          attempts: attemptsCount || 0,
        });

        setSubjectList(
          uniqueSubjects
        );

        setLastUpdated(
          new Date()
        );

        /* ======================================================================
           DEBUG
        ====================================================================== */

        console.log(
          "================================="
        );

        console.log(
          "CBT DASHBOARD UPDATED"
        );

        console.log(
          "TOTAL QUESTIONS IN DATABASE:",
          questionCount
        );

        console.log(
          "ROWS FETCHED FOR METADATA:",
          questionRows.length
        );

        console.log(
          "TOTAL SUBJECTS:",
          uniqueSubjects.length
        );

        console.log(
          "SUBJECTS:",
          uniqueSubjects
        );

        console.log(
          "TOTAL EXAMS:",
          uniqueExams.length
        );

        console.log(
          "TOTAL ATTEMPTS:",
          attemptsCount || 0
        );

        console.log(
          "================================="
        );
      } catch (error) {
        console.error(
          "CBT dashboard error:",
          error
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ==========================================================================
     INITIAL LOAD
  ========================================================================== */

  useEffect(() => {
    fetchCBTStats();
  }, [fetchCBTStats]);

  /* ==========================================================================
     REALTIME

     When questions are inserted, updated or deleted,
     the dashboard refreshes automatically.
  ========================================================================== */

  useEffect(() => {
    const channel = supabase
      .channel(
        "cbt-dashboard-live"
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cbt_questions",
        },
        () => {
          console.log(
            "CBT questions changed"
          );

          fetchCBTStats();
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cbt_attempts",
        },
        () => {
          console.log(
            "CBT attempts changed"
          );

          fetchCBTStats();
        }
      )

      .subscribe((status) => {
        console.log(
          "CBT Realtime status:",
          status
        );

        if (
          status === "SUBSCRIBED"
        ) {
          setLive(true);
        } else {
          setLive(false);
        }
      });

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [fetchCBTStats]);

  /* ==========================================================================
     STAT CARDS
  ========================================================================== */

  const statsData = [
    {
      title: "Subjects",
      value: stats.subjects,
      icon: BookOpen,
      description:
        "Unique CBT subjects",
    },
    {
      title: "Questions",
      value: stats.questions,
      icon: HelpCircle,
      description:
        "Total questions in question bank",
    },
    {
      title: "Exams",
      value: stats.exams,
      icon: FileText,
      description:
        "Unique exams in question bank",
    },
    {
      title: "Attempts",
      value: stats.attempts,
      icon: BarChart3,
      description:
        "Recorded CBT attempts",
    },
  ];

  /* ==========================================================================
     FORMAT TIME
  ========================================================================== */

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      )
    : "";

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div className="space-y-8">

      {/* ======================================================================
          HEADER
      ====================================================================== */}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

        <div>

          <div className="flex items-center gap-3">

            <h1 className="text-3xl font-bold text-white">
              CBT Dashboard
            </h1>

            {/* LIVE STATUS */}

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
                {live
                  ? "LIVE"
                  : "CONNECTING"}
              </span>

            </div>

          </div>

          <p className="text-slate-400 mt-1">
            Manage computer based tests,
            questions and examinations.
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

      {/* ======================================================================
          STAT CARDS
      ====================================================================== */}

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

              <p className="text-xs text-slate-600 mt-2">
                {item.description}
              </p>

            </div>
          );
        })}

      </div>

      {/* ======================================================================
          SUBJECT OVERVIEW
      ====================================================================== */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          <div>

            <h2 className="text-xl font-semibold text-white">
              CBT Subjects
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Subjects detected directly from
              the CBT question bank.
            </p>

          </div>

          <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold">

            {stats.subjects}{" "}

            {stats.subjects === 1
              ? "Subject"
              : "Subjects"}

          </div>

        </div>

        {loading ? (

          <div className="flex items-center gap-2 text-slate-400">

            <Loader2
              size={18}
              className="animate-spin"
            />

            Loading subjects...

          </div>

        ) : subjectList.length > 0 ? (

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">

            {subjectList.map(
              (subject) => (
                <div
                  key={subject}
                  className="px-4 py-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-blue-500/30 transition"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">

                      <BookOpen
                        size={17}
                      />

                    </div>

                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {subject}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

        ) : (

          <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-center">

            <BookOpen
              size={28}
              className="mx-auto text-slate-600 mb-3"
            />

            <p className="text-slate-400 font-medium">
              No CBT subjects found
            </p>

            <p className="text-xs text-slate-600 mt-1">
              Add questions with a subject
              in the cbt_questions table.
            </p>

          </div>

        )}

      </div>

      {/* ======================================================================
          QUESTION BANK SUMMARY
      ====================================================================== */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <div className="flex items-center justify-between gap-4">

          <div>

            <h2 className="text-xl font-semibold text-white">
              Question Bank
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Total number of questions currently
              stored in the CBT question bank.
            </p>

          </div>

          <div className="text-right">

            <p className="text-3xl font-bold text-blue-400">

              {loading ? (
                <Loader2
                  size={25}
                  className="animate-spin inline-block"
                />
              ) : (
                stats.questions.toLocaleString()
              )}

            </p>

            <p className="text-xs text-slate-600 mt-1">
              Total Questions
            </p>

          </div>

        </div>

      </div>

      {/* ======================================================================
          RECENT CBT ACTIVITY
      ====================================================================== */}

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

            {live
              ? "Live"
              : "Offline"}

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

                {stats.attempts.toLocaleString()} CBT
                {" "}
                attempt
                {stats.attempts === 1
                  ? ""
                  : "s"}

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
                User attempts will appear
                here automatically.
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default CBTDashboard;