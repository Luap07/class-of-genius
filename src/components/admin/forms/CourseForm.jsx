import React, { useState } from "react";

const CourseForm = ({ initialData = {}, onSubmit }) => {
  const [form, setForm] = useState({
    title: initialData.title || "",
    category: initialData.category || "",
    instructor: initialData.instructor || "",
    description: initialData.description || "",
    price: initialData.price || "",
    status: initialData.status || "Draft",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
    >
      <h2 className="text-xl font-semibold">Course Information</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Course title"
          className="admin-input"
        />

        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
          className="admin-input"
        />

        <input
          name="instructor"
          value={form.instructor}
          onChange={handleChange}
          placeholder="Instructor"
          className="admin-input"
        />

        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="admin-input"
        />
      </div>

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Course description"
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
        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
      >
        Save Course
      </button>
    </form>
  );
};

export default CourseForm;