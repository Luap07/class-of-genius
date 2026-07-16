// src/pages/admin/lms/CreateWeeklyTask.jsx

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Upload,
  Save,
  Loader2,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const CreateWeeklyTask = () => {
  const navigate = useNavigate();

  const { topicId } = useParams();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [course, setCourse] = useState(null);
  const [topic, setTopic] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    week: 1,
    due_date: "",
    estimated_time: 30,
    priority: "Medium",
    difficulty: "Easy",
    xp: 100,
    file: null,
  });

  /* ==========================================
      FETCH TOPIC + COURSE
  ========================================== */

  useEffect(() => {
    if (!topicId) return;

    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    const { data, error } = await supabase
      .from("course_topics")
      .select(`
        *,
        courses (
          id,
          title
        )
      `)
      .eq("id", topicId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setTopic(data);
    setCourse(data.courses);
  };

  /* ==========================================
      INPUTS
  ========================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((previous) => ({
      ...previous,
      file,
    }));
  };

  /* ==========================================
      UPLOAD FILE
  ========================================== */

  const uploadFile = async () => {
    if (!formData.file) return null;

    setUploading(true);

    const fileName = `${Date.now()}-${formData.file.name}`;

    const { error } = await supabase.storage
      .from("course-documents")
      .upload(fileName, formData.file);

    if (error) {
      console.error(error);
      alert(error.message);
      setUploading(false);
      return null;
    }

    const { data } = supabase.storage
      .from("course-documents")
      .getPublicUrl(fileName);

    setUploading(false);

    return data.publicUrl;
  };

  /* ==========================================
      SAVE TASK
  ========================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topicId) {
      alert("Missing Topic.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Task title is required.");
      return;
    }

    setLoading(true);

    let fileUrl = null;

    if (formData.file) {
      fileUrl = await uploadFile();

      if (!fileUrl) {
        setLoading(false);
        return;
      }
    }

    const taskData = {
      course_id: topic.course_id,
      topic_id: topicId,

      week: Number(formData.week),

      title: formData.title.trim(),

      description: formData.description.trim(),

      file_url: fileUrl,

      due_date: formData.due_date || null,

      estimated_time: Number(formData.estimated_time),

      priority: formData.priority,

      difficulty: formData.difficulty,

      xp: Number(formData.xp),

      progress: 0,

      completed: false,
    };

    console.log(taskData);

    const { error } = await supabase
      .from("weekly_tasks")
      .insert(taskData);

    setLoading(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    navigate(`/admin/lms/topic/${topicId}/tasks`);
  };
    return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">

      {/* HEADER */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Create Weekly Task
          </h1>

          <p className="mt-2 text-slate-400">
            {course?.title} {topic ? `• ${topic.title}` : ""}
          </p>
        </div>

        <AdminButton
          variant="secondary"
          onClick={() =>
            navigate(`/admin/lms/topic/${topicId}/tasks`)
          }
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </AdminButton>

      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl border border-slate-800 bg-slate-900 p-8"
      >

        {/* TITLE */}

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Task Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* DESCRIPTION */}

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Instructions
          </label>

          <textarea
            rows={6}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what students should do..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* GRID */}

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Week
            </label>

            <input
              type="number"
              min="1"
              name="week"
              value={formData.week}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Due Date
            </label>

            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Estimated Time (Minutes)
            </label>

            <input
              type="number"
              min="1"
              name="estimated_time"
              value={formData.estimated_time}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              XP Reward
            </label>

            <input
              type="number"
              min="0"
              name="xp"
              value={formData.xp}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Priority
            </label>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Difficulty
            </label>

            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

        </div>

        {/* FILE */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Upload Attachment
          </label>

          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-400 hover:border-blue-500">

            <Upload size={24} />

            <span>
              {formData.file
                ? formData.file.name
                : "Choose PDF, DOCX or other document"}
            </span>

            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

          </label>

        </div>

        {/* SUBMIT */}

        <div className="flex justify-end">

          <AdminButton
            type="submit"
            disabled={loading || uploading}
          >

            {loading || uploading ? (
              <Loader2
                size={18}
                className="mr-2 animate-spin"
              />
            ) : (
              <Save
                size={18}
                className="mr-2"
              />
            )}

            {uploading
              ? "Uploading..."
              : loading
              ? "Saving..."
              : "Create Weekly Task"}

          </AdminButton>

        </div>

      </form>

    </div>
  );
};

export default CreateWeeklyTask;