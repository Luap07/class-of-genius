// src/pages/admin/lms/CoursesAdmin.jsx
import React, { useEffect, useState } from "react";
import { Plus, BookOpen, Layers, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const CoursesAdmin = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, level, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("FETCH COURSES ERROR:", error);
      setLoading(false);
      return;
    }
    setCourses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">LMS Courses</h1>
          <p className="mt-2 text-slate-400">Manage courses and topics.</p>
        </div>
        <AdminButton onClick={() => navigate("/admin/lms/create")}>
          <Plus size={18} className="mr-2" /> Create Course
        </AdminButton>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">
          <BookOpen size={55} className="mx-auto text-slate-600" />
          <h2 className="mt-5 text-xl font-bold text-white">No Courses Found</h2>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 hover:border-blue-500/40 transition">
              
              {/* COURSE HEADER */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20">
                  <BookOpen className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{course.title}</h3>
                  <p className="text-sm text-slate-400">{course.level || "General"}</p>
                </div>
              </div>

              {/* TOPICS ONLY */}
              <div className="mt-6">
                <button
                  onClick={() => navigate(`/admin/lms/course/${course.id}/topics`)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 px-4 py-3 text-blue-400 hover:bg-blue-500/20"
                >
                  <Layers size={17} /> Manage Topics
                </button>
              </div>

              {/* COURSE MANAGEMENT */}
              <div className="mt-5 flex gap-3">
                <button onClick={() => navigate(`/admin/lms/edit/${course.id}`)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500/10 py-3 text-green-400">
                  <Eye size={17} /> View
                </button>
                <button onClick={() => navigate(`/admin/lms/edit/${course.id}`)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-500/10 py-3 text-yellow-400">
                  <Edit size={17} /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesAdmin;