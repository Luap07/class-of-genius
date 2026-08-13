import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Users,
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Loader2,
  Activity,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const CBTAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalExams: 0,
    examAttempts: 0,
    averageScore: 0,
    passRate: 0,
    subjects: [],
    difficultQuestions: [],
  });

  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // =========================================================
  // FETCH ANALYTICS
  // =========================================================

  const fetchAnalytics = useCallback(async () => {
    try {
      // =======================================================
      // FETCH EXAMS
      // =======================================================

      const { count: examsCount, error: examsError } =
        await supabase
          .from("cbt_exams")
          .select("*", {
            count: "exact",
            head: true,
          });

      if (examsError) {
        console.error(
          "CBT exams analytics error:",
          examsError
        );
      }

      // =======================================================
      // FETCH ATTEMPTS
      // =======================================================

      const {
        data: attempts,
        error: attemptsError,
      } = await supabase
        .from("cbt_attempts")
        .select("*");

      if (attemptsError) {
        console.error(
          "CBT attempts analytics error:",
          attemptsError
        );
      }

      // =======================================================
      // FETCH QUESTIONS
      // =======================================================

      const {
        data: questions,
        error: questionsError,
      } = await supabase
        .from("cbt_questions")
        .select("*");

      if (questionsError) {
        console.error(
          "CBT questions analytics error:",
          questionsError
        );
      }

      const safeAttempts = attempts || [];
      const safeQuestions = questions || [];

      // =======================================================
      // TOTAL ATTEMPTS
      // =======================================================

      const examAttempts = safeAttempts.length;

      // =======================================================
      // SCORE CALCULATION
      // =======================================================

      let totalScore = 0;
      let scoredAttempts = 0;

      safeAttempts.forEach((attempt) => {
        const score =
          Number(
            attempt.score ??
              attempt.percentage ??
              attempt.mark ??
              0
          );

        if (!Number.isNaN(score)) {
          totalScore += score;
          scoredAttempts += 1;
        }
      });

      const averageScore =
        scoredAttempts > 0
          ? Math.round(
              totalScore / scoredAttempts
            )
          : 0;

      // =======================================================
      // PASS RATE
      // =======================================================

      let passed = 0;

      safeAttempts.forEach((attempt) => {
        const score = Number(
          attempt.score ??
            attempt.percentage ??
            attempt.mark ??
            0
        );

        if (score >= 50) {
          passed += 1;
        }
      });

      const passRate =
        examAttempts > 0
          ? Math.round(
              (passed / examAttempts) * 100
            )
          : 0;

      // =======================================================
      // SUBJECT PERFORMANCE
      // =======================================================

      const subjectMap = {};

      safeAttempts.forEach((attempt) => {
        const subject =
          attempt.subject ||
          attempt.exam_subject ||
          "Unknown";

        const score = Number(
          attempt.score ??
            attempt.percentage ??
            attempt.mark ??
            0
        );

        if (!subjectMap[subject]) {
          subjectMap[subject] = {
            name: subject,
            attempts: 0,
            totalScore: 0,
            passed: 0,
          };
        }

        subjectMap[subject].attempts += 1;
        subjectMap[subject].totalScore +=
          Number.isNaN(score) ? 0 : score;

        if (score >= 50) {
          subjectMap[subject].passed += 1;
        }
      });

      const subjects = Object.values(subjectMap)
        .map((subject) => ({
          name: subject.name,
          attempts: subject.attempts,
          average:
            subject.attempts > 0
              ? Math.round(
                  subject.totalScore /
                    subject.attempts
                )
              : 0,
          pass:
            subject.attempts > 0
              ? Math.round(
                  (subject.passed /
                    subject.attempts) *
                    100
                )
              : 0,
        }))
        .sort(
          (a, b) =>
            b.attempts - a.attempts
        );

      // =======================================================
      // DIFFICULT QUESTIONS
      // =======================================================
      //
      // This supports question-level attempt data if your
      // cbt_attempts table stores a questions/answers structure.
      //
      // Otherwise, it will safely return an empty list.
      // =======================================================

      const questionMap = {};

      safeAttempts.forEach((attempt) => {
        let answers = attempt.answers;

        if (typeof answers === "string") {
          try {
            answers = JSON.parse(answers);
          } catch {
            answers = null;
          }
        }

        if (!answers) return;

        if (Array.isArray(answers)) {
          answers.forEach((item) => {
            const questionId =
              item.question_id ||
              item.questionId ||
              item.id;

            if (!questionId) return;

            const question = safeQuestions.find(
              (q) =>
                q.id === questionId ||
                String(q.id) === String(questionId)
            );

            if (!question) return;

            const correct =
              item.correct ??
              item.is_correct ??
              item.isCorrect;

            if (!questionMap[questionId]) {
              questionMap[questionId] = {
                id: questionId,
                question:
                  question.question ||
                  "Untitled Question",
                subject:
                  question.subject ||
                  "Unknown",
                total: 0,
                failed: 0,
              };
            }

            questionMap[questionId].total += 1;

            if (!correct) {
              questionMap[questionId].failed += 1;
            }
          });
        }
      });

      const difficultQuestions = Object.values(
        questionMap
      )
        .map((item) => ({
          question: item.question,
          subject: item.subject,
          failure:
            item.total > 0
              ? Math.round(
                  (item.failed /
                    item.total) *
                    100
                )
              : 0,
        }))
        .filter(
          (item) => item.failure > 0
        )
        .sort(
          (a, b) =>
            b.failure - a.failure
        )
        .slice(0, 5);

      // =======================================================
      // UPDATE STATE
      // =======================================================

      setAnalytics({
        totalExams: examsCount || 0,
        examAttempts,
        averageScore,
        passRate,
        subjects,
        difficultQuestions,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        "CBT analytics error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // =========================================================
  // SUPABASE REALTIME
  // =========================================================

  useEffect(() => {
    const channel = supabase
      .channel("cbt-analytics-live")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cbt_exams",
        },
        () => {
          fetchAnalytics();
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
          fetchAnalytics();
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cbt_questions",
        },
        () => {
          fetchAnalytics();
        }
      )

      .subscribe((status) => {
        console.log(
          "CBT Analytics Realtime:",
          status
        );

        setLive(
          status === "SUBSCRIBED"
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAnalytics]);

  // =========================================================
  // STAT CARDS
  // =========================================================

  const stats = useMemo(
    () => [
      {
        title: "Total Exams",
        value: analytics.totalExams,
        icon: ClipboardCheck,
      },
      {
        title: "Exam Attempts",
        value: analytics.examAttempts,
        icon: Users,
      },
      {
        title: "Average Score",
        value: `${analytics.averageScore}%`,
        icon: Target,
      },
      {
        title: "Pass Rate",
        value: `${analytics.passRate}%`,
        icon: Trophy,
      },
    ],
    [analytics]
  );

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="p-6 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">

        <div>

          <div className="flex items-center gap-3">

            <h1 className="text-3xl font-bold">
              CBT Analytics
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

          <p className="text-gray-400 mt-2">
            Analyze examinations and student performance
          </p>

        </div>

        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Activity size={14} />
            Updated {formattedTime}
          </div>
        )}

      </div>


      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
        mb-10
      ">

        {stats.map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
                transition-all
                duration-300
                hover:border-blue-500/30
              "
            >

              <div className="
                p-3
                bg-slate-800
                rounded-xl
                w-fit
              ">

                <Icon size={24} />

              </div>

              <p className="
                text-gray-400
                mt-5
              ">
                {item.title}
              </p>

              <h2 className="
                text-3xl
                font-bold
                mt-2
              ">

                {loading ? (
                  <Loader2
                    size={26}
                    className="animate-spin text-blue-400"
                  />
                ) : (
                  typeof item.value === "number"
                    ? item.value.toLocaleString()
                    : item.value
                )}

              </h2>

            </div>
          );
        })}

      </div>


      {/* =====================================================
          MAIN ANALYTICS
      ===================================================== */}

      <div className="
        grid
        lg:grid-cols-3
        gap-6
      ">


        {/* ===================================================
            SUBJECT PERFORMANCE
        =================================================== */}

        <div className="
          lg:col-span-2
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-6
        ">

          <div className="
            flex
            justify-between
            items-center
            mb-6
          ">

            <div>

              <h2 className="
                text-xl
                font-bold
              ">
                Subject Performance
              </h2>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                Based on recorded CBT attempts
              </p>

            </div>

            <BarChart3 />

          </div>


          {loading ? (

            <div className="
              flex
              items-center
              justify-center
              py-12
              text-slate-400
            ">

              <Loader2
                size={24}
                className="animate-spin"
              />

            </div>

          ) : analytics.subjects.length === 0 ? (

            <div className="
              py-12
              text-center
              text-slate-500
            ">
              No subject performance data yet.
            </div>

          ) : (

            <div className="space-y-4">

              {analytics.subjects.map(
                (subject) => (

                  <div
                    key={subject.name}
                    className="
                      bg-slate-800/50
                      rounded-xl
                      p-4
                    "
                  >

                    <div className="
                      flex
                      justify-between
                      items-center
                    ">

                      <h3 className="font-semibold">
                        {subject.name}
                      </h3>

                      <span className="
                        text-green-400
                        font-medium
                      ">
                        {subject.pass}% pass
                      </span>

                    </div>


                    <div className="
                      grid
                      grid-cols-2
                      mt-3
                      text-sm
                      text-gray-400
                    ">

                      <p>

                        Attempts:

                        <span className="
                          text-white
                          ml-2
                        ">
                          {subject.attempts.toLocaleString()}
                        </span>

                      </p>


                      <p>

                        Average:

                        <span className="
                          text-white
                          ml-2
                        ">
                          {subject.average}%
                        </span>

                      </p>

                    </div>


                    {/* PERFORMANCE BAR */}

                    <div className="
                      mt-4
                      h-2
                      bg-slate-700
                      rounded-full
                      overflow-hidden
                    ">

                      <div
                        className="
                          h-full
                          bg-blue-500
                          rounded-full
                          transition-all
                          duration-500
                        "
                        style={{
                          width: `${Math.min(
                            subject.average,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* ===================================================
            DIFFICULT QUESTIONS
        =================================================== */}

        <div className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-6
        ">

          <div className="
            flex
            gap-2
            items-center
            mb-6
          ">

            <AlertTriangle
              className="text-yellow-400"
            />

            <h2 className="
              text-xl
              font-bold
            ">
              Difficult Questions
            </h2>

          </div>


          {loading ? (

            <div className="
              flex
              items-center
              justify-center
              py-12
              text-slate-400
            ">

              <Loader2
                size={24}
                className="animate-spin"
              />

            </div>

          ) : analytics.difficultQuestions.length === 0 ? (

            <div className="
              text-center
              py-12
              text-slate-500
            ">
              No question difficulty data yet.
            </div>

          ) : (

            <div className="space-y-4">

              {analytics.difficultQuestions.map(
                (item, index) => (

                  <div
                    key={`${item.question}-${index}`}
                    className="
                      bg-slate-800/50
                      rounded-xl
                      p-4
                    "
                  >

                    <h3 className="
                      font-semibold
                      text-white
                    ">
                      {item.question}
                    </h3>

                    <p className="
                      text-gray-400
                      text-sm
                      mt-1
                    ">
                      {item.subject}
                    </p>

                    <span className="
                      text-red-400
                      text-sm
                      inline-block
                      mt-2
                    ">
                      Failure Rate: {item.failure}%
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          SCORE TREND
      ===================================================== */}

      <div className="
        mt-6
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
      ">

        <div className="
          flex
          justify-between
          items-center
          mb-5
        ">

          <div>

            <h2 className="
              text-xl
              font-bold
            ">
              Score Improvement Trend
            </h2>

            <p className="
              text-sm
              text-slate-500
              mt-1
            ">
              Average performance over time
            </p>

          </div>

          <TrendingUp />

        </div>


        <div className="
          h-56
          bg-slate-800/50
          rounded-xl
          flex
          items-center
          justify-center
          text-gray-500
        ">

          <div className="
            text-center
          ">

            <BarChart3
              size={35}
              className="
                mx-auto
                mb-3
                text-slate-600
              "
            />

            <p>
              Score trend data will appear
              as students complete exams.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CBTAnalytics;