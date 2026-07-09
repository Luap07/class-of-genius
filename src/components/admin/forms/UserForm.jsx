import React, { useState } from "react";

const UserForm = ({ initialData = {}, onSubmit }) => {
  const [form, setForm] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    role: initialData.role || "Student",
    status: initialData.status || "Active",
    phone: initialData.phone || "",
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
      <h2 className="text-xl font-semibold">User Information</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full name"
          className="admin-input"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email address"
          type="email"
          className="admin-input"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone number"
          className="admin-input"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="admin-input"
        >
          <option>Student</option>
          <option>Instructor</option>
          <option>Admin</option>
          <option>Parent</option>
          <option>School</option>
        </select>
      </div>

      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="admin-input"
      >
        <option>Active</option>
        <option>Inactive</option>
        <option>Suspended</option>
      </select>

      <button
        type="submit"
        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
      >
        Save User
      </button>
    </form>
  );
};

export default UserForm;