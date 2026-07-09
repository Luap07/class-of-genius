import React, { useState } from "react";

const LessonForm = ({ initialData = {}, onSubmit }) => {
  const [form, setForm] = useState({
    title: initialData.title || "",
    course: initialData.course || "",
    video: initialData.video || "",
    content: initialData.content || "",
    duration: initialData.duration || "",
    status: initialData.status || "Draft",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold">Lesson Details</h2>

      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Lesson title"
        className="admin-input"
      />

      <input
        name="course"
        value={form.course}
        onChange={handleChange}
        placeholder="Course name"
        className="admin-input"
      />

      <input
        name="video"
        value={form.video}
        onChange={handleChange}
        placeholder="Video URL"
        className="admin-input"
      />

      <input
        name="duration"
        value={form.duration}
        onChange={handleChange}
        placeholder="Duration e.g. 20 mins"
        className="admin-input"
      />

      <textarea
        name="content"
        value={form.content}
        onChange={handleChange}
        placeholder="Lesson content"
        rows="5"
        className="admin-input resize-none"
      />

      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="admin-input"
      >
        <option value="Draft">Draft</option>
        <option value="Published">Published</option>
      </select>

      <button
        type="submit"
        className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition"
      >
        Save Lesson
      </button>
    </form>
  );
};

export default LessonForm;