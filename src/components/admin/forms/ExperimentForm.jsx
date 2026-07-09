import React, { useState } from "react";

const ExperimentForm = ({ initialData = {}, onSubmit }) => {
  const [form, setForm] = useState({
    title: initialData.title || "",
    subject: initialData.subject || "Physics",
    category: initialData.category || "",
    description: initialData.description || "",
    instructions: initialData.instructions || "",
    difficulty: initialData.difficulty || "Easy",
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
      <h2 className="text-xl font-semibold">Experiment Details</h2>

      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Experiment title"
        className="admin-input"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <select
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="admin-input"
        >
          <option>Physics</option>
          <option>Chemistry</option>
          <option>Biology</option>
          <option>Mathematics</option>
        </select>

        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Experiment category"
          className="admin-input"
        />
      </div>

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Experiment description"
        rows="4"
        className="admin-input resize-none"
      />

      <textarea
        name="instructions"
        value={form.instructions}
        onChange={handleChange}
        placeholder="Experiment instructions"
        rows="5"
        className="admin-input resize-none"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          className="admin-input"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="admin-input"
        >
          <option>Draft</option>
          <option>Published</option>
        </select>
      </div>

      <button
        type="submit"
        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
      >
        Save Experiment
      </button>
    </form>
  );
};

export default ExperimentForm;