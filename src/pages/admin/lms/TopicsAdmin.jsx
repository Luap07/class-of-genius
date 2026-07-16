import React, { useEffect, useState } from "react";
import { Plus, BookOpen, Edit, Trash2, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const TopicsAdmin = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    if (!courseId) return;
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) {
      console.error("Course fetch error:", error);
      return;
    }
    setCourse(data);
  };

  const fetchTopics = async () => {
    if (!courseId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("course_topics")
      .select("*")
      .eq("course_id", courseId)
      .order("position", { ascending: true });

    if (error) {
      console.error("Topics fetch error:", error);
      setLoading(false);
      return;
    }

    setTopics(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!courseId) {
      console.error("Missing courseId");
      return;
    }
    fetchCourse();
    fetchTopics();
  }, [courseId]);

  const deleteTopic = async (id) => {
    const confirmDelete = window.confirm("Delete this learning unit?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("course_topics")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }
    fetchTopics();
  };

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {course?.title || "Course"} Topics
          </h1>
          <p className="mt-2 text-slate-400">Manage learning units, resources, weekly tasks, and quizzes.</p>
        </div>

        <AdminButton
          onClick={() =>
            navigate(`/admin/lms/course/${courseId}/topics/create`)
          }
        >
          <Plus size={18} className="mr-2" />
          Add Topic
        </AdminButton>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading topics...</div>
      ) : topics.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">
          <BookOpen size={50} className="mx-auto text-slate-600" />
          <h2 className="mt-5 text-xl font-bold text-white">No Topics Yet</h2>
          <p className="mt-2 text-slate-400">Create your first learning unit.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                    <FileText className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{topic.title}</h3>
                    <p className="text-sm text-slate-400">Unit {topic.position}</p>
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 text-sm text-slate-400">
                  {topic.description || "No description"}
                </p>
              </div>

              {/* ACTION LINKS GRID */}
              <div className="mt-6 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {/* RESOURCES */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/admin/lms/topic/${topic.id}/resources`);
                    }}
                    className="rounded-xl bg-blue-500/10 py-2.5 text-center text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition"
                  >
                    Resources
                  </button>

                  {/* WEEKLY TASKS */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/admin/lms/topic/${topic.id}/tasks`);
                    }}
                    className="rounded-xl bg-purple-500/10 py-2.5 text-center text-xs font-semibold text-purple-400 hover:bg-purple-500/20 transition"
                  >
                    Weekly Tasks
                  </button>

                  {/* MONTHLY QUIZ */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/admin/lms/topic/${topic.id}/quizzes`);
                    }}
                    className="rounded-xl bg-green-500/10 py-2.5 text-center text-xs font-semibold text-green-400 hover:bg-green- green-500/20 transition"
                  >
                    Monthly Quiz
                  </button>
                </div>

                {/* EDIT & DELETE CONTROLS */}
                <div className="flex justify-end gap-2 border-t border-slate-800/60 pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/admin/lms/course/${courseId}/topics/edit/${topic.id}`)
                    }
                    className="rounded-xl bg-yellow-500/10 p-2 text-yellow-400 hover:bg-yellow-500/20 transition"
                    title="Edit Topic"
                  >
                    <Edit size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteTopic(topic.id)}
                    className="rounded-xl bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition"
                    title="Delete Topic"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicsAdmin;