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
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

const CBTDashboard = () => {
  /* ==========================================================================
     STATE
  ========================================================================== */

  const [stats, setStats] = useState({
    subjects: 0,
    questions: 0,
    exams: 0,
    attempts: 0,
  });

  const [subjectList, setSubjectList] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deletingSubject, setDeletingSubject] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    subject: null,
    questionCount: 0,
  });

  const [live, setLive] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(null);

  /* ==========================================================================
     NORMALIZE
  ========================================================================== */

  const normalize = useCallback((value) => {
    return String(value ?? "")
      .replace(/\u00a0/g, " ")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }, []);

  /* ==========================================================================
     CANONICAL SUBJECT

     Agriculture and Agricultural Science are treated as the same subject.
  ========================================================================== */

  const getCanonicalSubject = useCallback(
    (subject) => {
      const normalized = normalize(subject);

      const aliases = {
        agriculture: "Agricultural Science",
        "agricultural science": "Agricultural Science",

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

        literature: "Literature in English",
        "literature in english": "Literature in English",

        "civic education": "Civic Education",

        "financial accounting": "Financial Accounting",

        accounting: "Financial Accounting",

        commerce: "Commerce",

        geography: "Geography",

        "computer studies": "Computer Studies",

        "computer science": "Computer Science",

        "information technology":
          "Information Technology",

        "information technology it":
          "Information Technology",

        "data processing": "Data Processing",

        "home economics": "Home Economics",

        "technical drawing": "Technical Drawing",

        "christian religious studies":
          "Christian Religious Studies",

        crs: "Christian Religious Studies",

        "islamic religious studies":
          "Islamic Religious Studies",

        irs: "Islamic Religious Studies",

        "social studies": "Social Studies",

        "further mathematics": "Further Mathematics",

        "yoruba language": "Yoruba",

        yoruba: "Yoruba",

        "igbo language": "Igbo",

        igbo: "Igbo",

        "hausa language": "Hausa",

        hausa: "Hausa",
      };

      if (aliases[normalized]) {
        return aliases[normalized];
      }

      return String(subject ?? "")
        .trim()
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        );
    },
    [normalize]
  );

  /* ==========================================================================
     FETCH ALL QUESTION METADATA

     We fetch IDs + subject + exam so that:

     - subjects can be grouped correctly
     - Agriculture and Agricultural Science can be merged
     - deleting a subject can delete all matching rows
  ========================================================================== */

  const fetchAllQuestionMetadata =
    useCallback(async () => {
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
          .select("id, subject, exam")
          .range(from, to);

        if (error) {
          throw error;
        }

        const rows = data || [];

        allRows = [
          ...allRows,
          ...rows,
        ];

        if (rows.length < pageSize) {
          break;
        }

        from += pageSize;
      }

      return allRows;
    }, []);

  /* ==========================================================================
     FETCH CBT STATS
  ========================================================================== */

  const fetchCBTStats = useCallback(
    async () => {
      try {
        setLoading(true);

        /* ======================================================================
           TOTAL QUESTIONS
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
           QUESTION METADATA
        ====================================================================== */

        const questionRows =
          await fetchAllQuestionMetadata();

        /* ======================================================================
           SUBJECTS

           Uses canonical subject names so:

           Agriculture
           Agricultural Science

           become one subject.
        ====================================================================== */

        const subjectMap = new Map();

        questionRows.forEach((row) => {
          const rawSubject = String(
            row?.subject ?? ""
          ).trim();

          if (!rawSubject) {
            return;
          }

          const canonical =
            getCanonicalSubject(rawSubject);

          if (!canonical) {
            return;
          }

          if (!subjectMap.has(canonical)) {
            subjectMap.set(canonical, {
              name: canonical,
              questionCount: 0,
              rawSubjects: new Set(),
            });
          }

          const subjectData =
            subjectMap.get(canonical);

          subjectData.questionCount += 1;

          subjectData.rawSubjects.add(
            normalize(rawSubject)
          );
        });

        const uniqueSubjects = Array.from(
          subjectMap.values()
        ).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        /* ======================================================================
           EXAMS
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

        const uniqueExams =
          Array.from(examMap.values());

        /* ======================================================================
           ATTEMPTS
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
           UPDATE STATE
        ====================================================================== */

        setStats({
          subjects:
            uniqueSubjects.length,

          questions:
            questionCount || 0,

          exams:
            uniqueExams.length,

          attempts:
            attemptsCount || 0,
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
          "TOTAL QUESTIONS:",
          questionCount
        );

        console.log(
          "METADATA ROWS:",
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
    [
      fetchAllQuestionMetadata,
      getCanonicalSubject,
      normalize,
    ]
  );

  /* ==========================================================================
     INITIAL LOAD
  ========================================================================== */

  useEffect(() => {
    fetchCBTStats();
  }, [fetchCBTStats]);

  /* ==========================================================================
     REALTIME
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
     OPEN DELETE MODAL
  ========================================================================== */

  const openDeleteModal = (
    subject
  ) => {
    setDeleteModal({
      open: true,
      subject: subject.name,
      questionCount:
        subject.questionCount,
    });
  };

  /* ==========================================================================
     CLOSE DELETE MODAL
  ========================================================================== */

  const closeDeleteModal = () => {
    if (deleteLoading) {
      return;
    }

    setDeleteModal({
      open: false,
      subject: null,
      questionCount: 0,
    });
  };

  /* ==========================================================================
     DELETE SUBJECT
     
     IMPORTANT:

     Because Agriculture and Agricultural Science are
     treated as the same subject, deleting:

     Agricultural Science

     will remove both:

     Agriculture
     Agricultural Science
  ========================================================================== */

  const deleteSubject = async () => {
    const subject =
      deleteModal.subject;

    if (!subject) {
      return;
    }

    try {
      setDeleteLoading(true);

      setDeletingSubject(subject);

      console.log(
        "Deleting subject:",
        subject
      );

      /* ======================================================================
         GET ALL QUESTION ROWS

         We need IDs because different raw subject values can represent
         the same canonical subject.
      ====================================================================== */

      const allRows =
        await fetchAllQuestionMetadata();

      /* ======================================================================
         FIND ALL ROWS BELONGING TO THIS CANONICAL SUBJECT
      ====================================================================== */

      const matchingRows =
        allRows.filter((row) => {
          const rowSubject =
            getCanonicalSubject(
              row?.subject
            );

          return (
            normalize(rowSubject) ===
            normalize(subject)
          );
        });

      const ids = matchingRows
        .map((row) => row.id)
        .filter(Boolean);

      console.log(
        "Questions to delete:",
        ids.length
      );

      if (ids.length === 0) {
        closeDeleteModal();

        await fetchCBTStats();

        return;
      }

      /* ======================================================================
         DELETE IN BATCHES

         This avoids creating an excessively large IN query.
      ====================================================================== */

      const batchSize = 500;

      for (
        let i = 0;
        i < ids.length;
        i += batchSize
      ) {
        const batch = ids.slice(
          i,
          i + batchSize
        );

        const {
          error,
        } = await supabase
          .from("cbt_questions")
          .delete()
          .in("id", batch);

        if (error) {
          console.error(
            "Delete batch error:",
            error
          );

          throw error;
        }
      }

      console.log(
        `Successfully deleted ${ids.length} questions from ${subject}`
      );

      /* ======================================================================
         CLOSE MODAL
      ====================================================================== */

      setDeleteModal({
        open: false,
        subject: null,
        questionCount: 0,
      });

      /* ======================================================================
         REFRESH DASHBOARD
      ====================================================================== */

      await fetchCBTStats();
    } catch (error) {
      console.error(
        "Delete subject error:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete this subject."
      );
    } finally {
      setDeleteLoading(false);

      setDeletingSubject(null);
    }
  };

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

  const formattedTime =
    lastUpdated
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
    <>
      <div className="space-y-8">

        {/* ====================================================================
            HEADER
        ==================================================================== */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-3xl font-bold text-white">
                CBT Dashboard
              </h1>

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

          {lastUpdated && (
            <div className="flex items-center gap-2 text-xs text-slate-500">

              <Activity size={14} />

              Updated {formattedTime}

            </div>
          )}

        </div>

        {/* ====================================================================
            STAT CARDS
        ==================================================================== */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

          {statsData.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-950/20"
              >

                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 transition group-hover:bg-blue-500/15">
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

        {/* ====================================================================
            SUBJECT OVERVIEW
        ==================================================================== */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

            <div>

              <h2 className="text-xl font-semibold text-white">
                CBT Subjects
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Manage subjects in your CBT question bank.
              </p>

            </div>

            <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold">

              {stats.subjects}{" "}

              {stats.subjects === 1
                ? "Subject"
                : "Subjects"}

            </div>

          </div>

          {/* ==================================================================
              SUBJECT GRID
          ================================================================== */}

          {loading ? (

            <div className="flex items-center gap-2 text-slate-400">

              <Loader2
                size={18}
                className="animate-spin"
              />

              Loading subjects...

            </div>

          ) : subjectList.length > 0 ? (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

              {subjectList.map(
                (subject) => {

                  const isDeleting =
                    deletingSubject ===
                    subject.name;

                  return (
                    <div
                      key={subject.name}
                      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-950/20"
                    >

                      {/* TOP GLOW */}

                      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

                      {/* HEADER */}

                      <div className="relative flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500/15">

                            <BookOpen
                              size={20}
                            />

                          </div>

                          <div className="min-w-0">

                            <h3 className="text-sm font-bold text-white truncate">
                              {subject.name}
                            </h3>

                            <p className="text-xs text-slate-500 mt-1">
                              CBT Subject
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* QUESTION COUNT */}

                      <div className="relative mt-5 flex items-end justify-between">

                        <div>

                          <p className="text-2xl font-bold text-white">
                            {subject.questionCount.toLocaleString()}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {subject.questionCount === 1
                              ? "Question"
                              : "Questions"}
                          </p>

                        </div>

                        <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400">
                          Question Bank
                        </div>

                      </div>

                      {/* DELETE BUTTON */}

                      <button
                        type="button"
                        onClick={() =>
                          openDeleteModal(
                            subject
                          )
                        }
                        disabled={
                          deleteLoading
                        }
                        className="relative w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >

                        {isDeleting &&
                        deleteLoading ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2
                            size={16}
                          />
                        )}

                        {isDeleting &&
                        deleteLoading
                          ? "Deleting..."
                          : "Delete Subject"}

                      </button>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-8 text-center">

              <BookOpen
                size={30}
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

        {/* ====================================================================
            QUESTION BANK SUMMARY
        ==================================================================== */}

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

        {/* ====================================================================
            RECENT CBT ACTIVITY
        ==================================================================== */}

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

      {/* ======================================================================
          DELETE CONFIRMATION MODAL
      ====================================================================== */}

      {deleteModal.open && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={
              deleteLoading
                ? undefined
                : closeDeleteModal
            }
          />

          {/* MODAL */}

          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">

            {/* TOP */}

            <div className="flex items-center justify-between p-6 border-b border-slate-800">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">

                  <AlertTriangle
                    size={22}
                  />

                </div>

                <div>

                  <h3 className="text-lg font-bold text-white">
                    Delete Subject
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    This action cannot be undone.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  deleteLoading
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
              >

                <X size={19} />

              </button>

            </div>

            {/* CONTENT */}

            <div className="p-6">

              <p className="text-slate-300 text-sm leading-6">

                Are you sure you want to delete all
                questions under{" "}

                <span className="font-bold text-white">
                  {deleteModal.subject}
                </span>
                ?

              </p>

              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-400">
                    Questions to delete
                  </span>

                  <span className="text-lg font-bold text-red-400">
                    {deleteModal.questionCount.toLocaleString()}
                  </span>

                </div>

              </div>

              <p className="text-xs text-slate-600 mt-4">
                If this subject contains both
                "Agriculture" and
                "Agricultural Science", both
                will be deleted together because
                they are treated as the same subject.
              </p>

            </div>

            {/* ACTIONS */}

            <div className="flex gap-3 p-6 pt-0">

              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  deleteLoading
                }
                className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  deleteSubject
                }
                disabled={
                  deleteLoading
                }
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {deleteLoading ? (
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

                    Delete
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
};

export default CBTDashboard;