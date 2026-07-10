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
} from "react-router-dom";

import {
  supabase,
} from "../../../lib/supabaseClient";

import AdminButton from "../../../components/admin/ui/AdminButton";

const WeeklyTasksAdmin = () => {

  const navigate = useNavigate();

  /* ================= STATE ================= */

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);



  /* ================= FETCH TASKS ================= */

  const fetchTasks = async () => {

    try {

      setLoading(true);

      const {

        data,

        error,

      } = await supabase

        .from("weekly_tasks")

        .select("*")

        .order("created_at", {

          ascending: false,

        });

      if (error) throw error;

      setTasks(data || []);

    } catch (error) {

      console.error(error);

      alert(

        "Failed to load weekly tasks."

      );

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchTasks();

  }, []);




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

          (task) =>

            task.id !== id

        )

      );

    } catch (error) {

      console.error(error);

      alert(

        "Unable to delete task."

      );

    }

  };




  if (loading) {

    return (

      <div className="flex min-h-[400px] items-center justify-center">

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

            Create assignments, upload task instructions and
            manage student submissions.

          </p>

        </div>



        <AdminButton

          icon={<Plus size={18} />}

          onClick={() =>
            navigate("/admin/lms/tasks/create")
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

                Task

              </th>

              <th className="px-6 py-4">

                Course

              </th>

              <th className="px-6 py-4">

                Topic

              </th>

              <th className="px-6 py-4">

                Deadline

              </th>

              <th className="px-6 py-4">

                Status

              </th>

              <th className="px-6 py-4 text-center">

                Actions

              </th>

            </tr>

          </thead>

          <tbody>

            {

              tasks.length > 0 ? (

                tasks.map((task) => (

                  <tr

                    key={task.id}

                    className="
                      border-t
                      border-slate-800
                      hover:bg-slate-800/40
                    "

                  >

                    <td className="px-6 py-5">

                      <h3 className="font-semibold">

                        {task.title}

                      </h3>

                      <p className="mt-1 text-sm text-slate-400">

                        {task.description || "No description"}

                      </p>

                    </td>



                    <td className="px-6 py-5 text-slate-300">

                      {task.course_name ||

                        "Not Assigned"}

                    </td>



                    <td className="px-6 py-5 text-slate-300">

                      {task.topic_name ||

                        "Not Assigned"}

                    </td>



                    <td className="px-6 py-5 text-slate-300">

                      {

                        task.deadline

                          ?

                          new Date(

                            task.deadline

                          ).toLocaleDateString()

                          :

                          "-"

                      }

                    </td>



                    <td className="px-6 py-5">

                      <span

                        className={

                          task.status === "Published"

                            ?

                            "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"

                            :

                            "rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400"

                        }

                      >

                        {task.status ||

                          "Draft"}

                      </span>

                    </td>



                    <td className="px-6 py-5">

                      <div className="flex justify-center gap-3">

                        <button

                          onClick={() =>

                            navigate(

                              `/admin/lms/tasks/view/${task.id}`

                            )

                          }

                          className="text-blue-400 hover:text-blue-300"

                        >

                          <Eye size={18} />

                        </button>



                        <button

                          onClick={() =>

                            navigate(

                              `/admin/lms/tasks/edit/${task.id}`

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
                  colSpan={6}
                  className="px-6 py-20 text-center"
                >

                  <ClipboardList
                    size={48}
                    className="mx-auto mb-4 text-slate-600"
                  />

                  <h3 className="text-xl font-semibold text-white">

                    No Weekly Tasks Found

                  </h3>

                  <p className="mt-2 text-slate-400">

                    Create your first weekly task to get started.

                  </p>

                  <div className="mt-6">

                    <AdminButton
                      icon={<Plus size={18} />}
                      onClick={() =>
                        navigate("/admin/lms/tasks/create")
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