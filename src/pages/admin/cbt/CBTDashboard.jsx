import React, { useEffect, useState } from "react";
import {
  BookOpen,
  HelpCircle,
  FileText,
  BarChart3,
  Loader2,
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

  useEffect(() => {
    const fetchCBTStats = async () => {
      setLoading(true);

      try {
        // =========================
        // SUBJECTS
        // =========================
        const { count: subjectsCount, error: subjectsError } =
          await supabase
            .from("cbt_subjects")
            .select("*", { count: "exact", head: true });

        if (subjectsError) {
          console.error("Subjects count error:", subjectsError);
        }

        // =========================
        // QUESTIONS
        // =========================
        const { count: questionsCount, error: questionsError } =
          await supabase
            .from("cbt_questions")
            .select("*", { count: "exact", head: true });

        if (questionsError) {
          console.error("Questions count error:", questionsError);
        }

        // =========================
        // EXAMS
        // =========================
        const { count: examsCount, error: examsError } =
          await supabase
            .from("cbt_exams")
            .select("*", { count: "exact", head: true });

        if (examsError) {
          console.error("Exams count error:", examsError);
        }

        // =========================
        // USER ATTEMPTS
        // =========================
        const { count: attemptsCount, error: attemptsError } =
          await supabase
            .from("cbt_attempts")
            .select("*", { count: "exact", head: true });

        if (attemptsError) {
          console.error("Attempts count error:", attemptsError);
        }

        setStats({
          subjects: subjectsCount || 0,
          questions: questionsCount || 0,
          exams: examsCount || 0,
          attempts: attemptsCount || 0,
        });
      } catch (error) {
        console.error("CBT dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCBTStats();
  }, []);

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

  return (
    <div className="space-y-8">

      {/* =========================
          HEADER
      ========================= */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          CBT Dashboard
        </h1>

        <p className="text-slate-400 mt-1">
          Manage computer based tests, questions and exams.
        </p>
      </div>

      {/* =========================
          STAT CARDS
      ========================= */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

        {statsData.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
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

      {/* =========================
          RECENT CBT ACTIVITY
      ========================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <h2 className="text-xl font-semibold mb-4 text-white">
          Recent CBT Activity
        </h2>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            Loading activity...
          </div>
        ) : stats.attempts > 0 ? (
          <div className="text-slate-400">
            {stats.attempts.toLocaleString()} CBT attempt
            {stats.attempts === 1 ? "" : "s"} recorded by users.
          </div>
        ) : (
          <div className="text-slate-400">
            No CBT attempts have been recorded yet.
          </div>
        )}

      </div>

    </div>
  );
};

export default CBTDashboard;