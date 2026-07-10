// src/pages/admin/lms/MonthlyQuizAdmin.jsx

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const MonthlyQuizAdmin = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("monthly_quizzes")
      .select("*, courses(title)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching quizzes:", error);
      alert("Failed to load quizzes.");
    } else {
      setQuizzes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const deleteQuiz = async (id) => {
    if (!window.confirm("Delete this quiz?")) return;

    const { error } = await supabase
      .from("monthly_quizzes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting quiz:", error);
      alert(error.message);
    } else {
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-white">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 text-white">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monthly Quizzes</h1>
          <p className="mt-2 text-slate-400">
            Create, manage and publish quizzes for your students.
          </p>
        </div>
        <AdminButton
          icon={<Plus size={18} />}
          onClick={() => navigate("/admin/lms/monthly-quizzes/create")}
        >
          Create Quiz
        </AdminButton>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-6 py-4">Quiz</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Month</th>
              <th className="px-6 py-4">Questions</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <tr
                  key={quiz.id}
                  className="border-t border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="px-6 py-4">
                    <h3 className="font-semibold">{quiz.title}</h3>
                    <p className="text-sm text-slate-400">
                      {quiz.description?.slice(0, 60)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {quiz.courses?.title || "No Course"}
                  </td>
                  <td className="px-6 py-4">{quiz.month || "-"}</td>
                  <td className="px-6 py-4">{quiz.question_count || 0}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      {quiz.status || "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => navigate(`/admin/lms/monthly-quizzes/view/${quiz.id}`)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-green-400 hover:text-green-300"
                        onClick={() => navigate(`/admin/lms/monthly-quizzes/edit/${quiz.id}`)}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-400 hover:text-red-300"
                        onClick={() => deleteQuiz(quiz.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="py-16 text-center text-slate-400"
                >
                  No quizzes created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyQuizAdmin;