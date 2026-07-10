// src/pages/admin/lms/CreateWeeklyTask.jsx

import React, { useEffect, useState } from "react";
import { ArrowLeft, Upload, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const CreateWeeklyTask = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    topic_id: "",
    title: "",
    description: "",
    deadline: "",
    file: null,
  });

  /* =========================
     FETCH DATA
  ========================== */
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .order("title");

    if (error) console.error("Error fetching courses:", error);
    else setCourses(data || []);
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
      .order("created_at");

    if (error) console.error("Error fetching topics:", error);
    else setTopics(data || []);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* =========================
     HANDLERS
  ========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "course_id") {
      fetchTopics(value);
      setFormData((prev) => ({ ...prev, course_id: value, topic_id: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, file }));
  };

  const uploadFile = async () => {
    if (!formData.file) return null;
    setUploading(true);
    
    const fileName = `${Date.now()}-${formData.file.name}`;
    const { error } = await supabase.storage
      .from("weekly-tasks")
      .upload(fileName, formData.file);

    if (error) {
      console.error("Upload error:", error);
      alert(error.message);
      setUploading(false);
      return null;
    }

    const { data } = supabase.storage.from("weekly-tasks").getPublicUrl(fileName);
    setUploading(false);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_id || !formData.topic_id || !formData.title.trim()) {
      return alert("Course, topic, and title are required.");
    }

    setLoading(true);
    let fileUrl = await uploadFile();

    const { error } = await supabase.from("weekly_tasks").insert({
      course_id: formData.course_id,
      topic_id: formData.topic_id,
      title: formData.title,
      description: formData.description,
      deadline: formData.deadline || null,
      file_url: fileUrl,
      status: "Published",
    });

    setLoading(false);
    if (error) {
      console.error("Insert error:", error);
      alert(error.message);
      return;
    }

    navigate("/admin/lms/tasks");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Create Weekly Task</h1>
          <p className="mt-2 text-slate-400">Add assignments for students and attach learning materials.</p>
        </div>
        <AdminButton variant="secondary" onClick={() => navigate("/admin/lms/tasks")}>
          <ArrowLeft size={18} className="mr-2" />
          Back
        </AdminButton>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Select Course</label>
          <select name="course_id" value={formData.course_id} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">
            <option value="">Choose Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Select Topic</label>
          <select name="topic_id" value={formData.topic_id} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">
            <option value="">Choose Topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>{topic.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Task Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" placeholder="Example: Solve Questions 1-20" />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Instructions</label>
          <textarea rows={5} name="description" value={formData.description} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" placeholder="Explain what students should do..." />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Submission Deadline</label>
          <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Upload Task File (PDF/DOCX)</label>
          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-400 hover:border-blue-500">
            <Upload size={25} />
            <span>{formData.file ? formData.file.name : "Choose file"}</span>
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div className="flex justify-end">
          <AdminButton type="submit" disabled={loading || uploading}>
            {(loading || uploading) ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
            {uploading ? "Uploading..." : loading ? "Saving..." : "Create Task"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
};

export default CreateWeeklyTask;