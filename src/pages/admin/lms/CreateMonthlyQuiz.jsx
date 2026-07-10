// src/pages/admin/lms/CreateMonthlyQuiz.jsx

import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const CreateMonthlyQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);

  const [formData, setFormData] = useState({
    course_id: "",
    topic_id: "",
    title: "",
    description: "",
    month: "",
    start_date: "",
    end_date: "",
    duration: 30,
    total_marks: 100,
    pass_mark: 50,
    status: "Draft",
  });

  /* ================= FETCH DATA ================= */
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .order("title");
    if (!error) setCourses(data || []);
  };

  const fetchTopics = async (courseId) => {
    if (!courseId) {
      setTopics([]);
      return;
    }
    const { data, error } = await supabase
      .from("topics")
      .select("id, title")
      .eq("course_id", courseId)
      .order("title");
    if (!error) setTopics(data || []);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "course_id") {
      fetchTopics(value);
      setFormData((prev) => ({ ...prev, course_id: value, topic_id: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course_id || !formData.title.trim() || !formData.month || !formData.start_date || !formData.end_date) {
      return alert("Please fill all required fields.");
    }

    setLoading(true);
    const { error } = await supabase.from("monthly_quizzes").insert({
      course_id: formData.course_id,
      topic_id: formData.topic_id || null,
      title: formData.title,
      description: formData.description,
      month: formData.month,
      start_date: formData.start_date,
      end_date: formData.end_date,
      duration: Number(formData.duration),
      total_marks: Number(formData.total_marks),
      pass_mark: Number(formData.pass_mark),
      question_count: 0,
      status: formData.status,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      return alert(error.message);
    }

    alert("Monthly Quiz created successfully.");
    navigate("/admin/lms/monthly-quizzes");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Create Monthly Quiz</h1>
          <p className="text-slate-400 mt-2">Create a new monthly assessment for your students.</p>
        </div>
        <AdminButton variant="secondary" onClick={() => navigate("/admin/lms/monthly-quizzes")}>
          <ArrowLeft size={18} className="mr-2" />
          Back
        </AdminButton>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="rounded-3xl bg-slate-900 border border-slate-800 p-8 space-y-6 text-slate-200">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm text-slate-300">Course *</label>
            <select name="course_id" value={formData.course_id} onChange={handleChange} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white">
              <option value="">Select Course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm text-slate-300">Topic</label>
            <select name="topic_id" value={formData.topic_id} onChange={handleChange} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white">
              <option value="">Select Topic</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm text-slate-300">Quiz Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. July Physics Assessment" className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white" />
        </div>

        <div>
          <label className="block mb-2 text-sm text-slate-300">Description</label>
          <textarea rows={4} name="description" value={formData.description} onChange={handleChange} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm">Month *</label>
            <input type="month" name="month" value={formData.month} onChange={handleChange} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white" />
          </div>
          <div>
            <label className="block mb-2 text-sm">Duration (Minutes)</label>
            <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm">Start Date</label>
            <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white" />
          </div>
          <div>
            <label className="block mb-2 text-sm">End Date</label>
            <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Total Marks</label>
            <input type="number" name="total_marks" value={formData.total_marks} onChange={handleChange} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white" />
          </div>
          <div>
            <label className="block mb-2 text-sm">Pass Mark</label>
            <input type="number" name="pass_mark" value={formData.pass_mark} onChange={handleChange} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white" />
          </div>
          <div>
            <label className="block mb-2 text-sm">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white">
              <option>Draft</option>
              <option>Published</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <AdminButton type="submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
            {loading ? "Saving..." : "Create Quiz"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
};

export default CreateMonthlyQuiz;