// src/pages/admin/lms/WeeklyTasksAdmin.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  ClipboardList,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  supabase,
} from "../../../lib/supabaseClient";

import AdminButton from "../../../components/admin/ui/AdminButton";

const WeeklyTasksAdmin = () => {

  const navigate = useNavigate();

  const { topicId } = useParams();

  /* ================= STATE ================= */

  const [loading, setLoading] = useState(true);

  const [tasks, setTasks] = useState([]);

  const [topic, setTopic] = useState(null);

  /* ================= FETCH ================= */

  const fetchData = async () => {

    if (!topicId) return;

    try {

      setLoading(true);

      /* ---------- Topic ---------- */

      const {
        data: topicData,
        error: topicError,
      } = await supabase
        .from("course_topics")
        .select(`
          id,
          title,
          course_id,
          courses(
            title
          )
        `)
        .eq("id", topicId)
        .single();

      if (topicError) throw topicError;

      setTopic(topicData);

      /* ---------- Weekly Tasks ---------- */

      const {
        data,
        error,
      } = await supabase
        .from("weekly_tasks")
        .select("*")
        .eq("topic_id", topicId)
        .order("week", {
          ascending: true,
        });

      if (error) throw error;

      setTasks(data || []);

    } catch (error) {

      console.error(error);

      alert("Failed to load weekly tasks.");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchData();

  }, [topicId]);

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this weekly task?"
    );

    if (!confirmDelete) return;

    try {

      const {
        error,
      } = await supabase
        .from("weekly_tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTasks((previous) =>
        previous.filter(
          (task) => task.id !== id
        )
      );

    } catch (error) {

      console.error(error);

      alert("Unable to delete task.");

    }

  };

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div className="flex min-h-[450px] items-center justify-center">

        <Loader2
          size={42}
          className="animate-spin text-blue-500"
        />

      </div>

    );

  }
    return (

    <div className="space-y-8 p-6 text-white">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <ClipboardList
              size={30}
              className="text-blue-400"
            />

            <h1 className="text-3xl font-bold">

              Weekly Tasks

            </h1>

          </div>

          <p className="mt-3 text-slate-400">

            {topic?.courses?.title} • {topic?.title}

          </p>

        </div>

        <AdminButton
          icon={<Plus size={18} />}
          onClick={() =>
            navigate(`/admin/lms/topic/${topicId}/tasks/create`)
          }
        >
          Create Weekly Task
        </AdminButton>

      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

        <table className="w-full">

          <thead className="bg-slate-800 text-left text-slate-300">

            <tr>

              <th className="px-6 py-4">
                Week
              </th>

              <th className="px-6 py-4">
                Task
              </th>

              <th className="px-6 py-4">
                Due Date
              </th>

              <th className="px-6 py-4">
                Priority
              </th>

              <th className="px-6 py-4">
                Difficulty
              </th>

              <th className="px-6 py-4">
                XP
              </th>

              <th className="px-6 py-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {tasks.length > 0 ? (

              tasks.map((task) => (

                <tr
                  key={task.id}
                  className="border-t border-slate-800 hover:bg-slate-800/40"
                >

                  <td className="px-6 py-5">

                    Week {task.week}

                  </td>

                  <td className="px-6 py-5">

                    <h3 className="font-semibold">

                      {task.title}

                    </h3>

                    <p className="mt-1 text-sm text-slate-400">

                      {task.description || "No description"}

                    </p>

                  </td>

                  <td className="px-6 py-5 text-slate-300">

                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "-"}

                  </td>

                  <td className="px-6 py-5">

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">

                      {task.priority}

                    </span>

                  </td>

                  <td className="px-6 py-5 text-slate-300">

                    {task.difficulty}

                  </td>

                  <td className="px-6 py-5 text-yellow-400 font-semibold">

                    {task.xp} XP

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() =>
                          navigate(
                            `/admin/lms/topic/${topicId}/tasks/view/${task.id}`
                          )
                        }
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/admin/lms/topic/${topicId}/tasks/edit/${task.id}`
                          )
                        }
                        className="text-green-400 hover:text-green-300"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(task.id)
                        }
                        className="text-red-400 hover:text-red-300"
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
                  colSpan={7}
                  className="px-6 py-20 text-center"
                >

                  <ClipboardList
                    size={48}
                    className="mx-auto mb-4 text-slate-600"
                  />

                  <h3 className="text-xl font-semibold text-white">

                    No Weekly Tasks Yet

                  </h3>

                  <p className="mt-2 text-slate-400">

                    Create the first task for this topic.

                  </p>

                  <div className="mt-6">

                    <AdminButton
                      icon={<Plus size={18} />}
                      onClick={() =>
                        navigate(`/admin/lms/topic/${topicId}/tasks/create`)
                      }
                    >
                      Create Weekly Task
                    </AdminButton>

                  </div>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default WeeklyTasksAdmin;