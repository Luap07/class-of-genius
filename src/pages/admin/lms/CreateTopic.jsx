// src/pages/admin/lms/CreateTopic.jsx

import React, { useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const CreateTopic = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    position: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Learning Unit title is required.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("course_topics").insert({
      course_id: courseId,
      title: formData.title,
      description: formData.description,
      position: Number(formData.position) || 1,
    });

    setLoading(false);

    if (error) {
      console.error("Error creating topic:", error);
      alert(error.message);
      return;
    }

    navigate(`/admin/lms/course/${courseId}/topics`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Create Learning Unit</h1>
          <p className="mt-2 text-slate-400">Add a new learning unit to this course.</p>
        </div>
        <AdminButton
          variant="secondary"
          onClick={() => navigate(`/admin/lms/course/${courseId}/topics`)}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </AdminButton>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-800 bg-slate-900 p-8 space-y-8"
      >
        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Learning Unit Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Introduction to Algebra"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
          <textarea
            rows={6}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Briefly describe what students will learn..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Position */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Learning Unit Position</label>
          <input
            type="number"
            min="1"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="1"
            className="w-40 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          />
          <p className="mt-2 text-sm text-slate-500">
            Determines the order in which students will see this learning unit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => navigate(`/admin/lms/course/${courseId}/topics`)}
          >
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={loading}>
            {loading ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            {loading ? "Creating..." : "Create Learning Unit"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
};

export default CreateTopic;