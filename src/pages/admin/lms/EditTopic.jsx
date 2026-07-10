// src/pages/admin/lms/EditTopic.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../../../lib/supabaseClient";

import AdminButton from "../../../components/admin/ui/AdminButton";

const EditTopic = () => {

  const navigate = useNavigate();

  const {
    courseId,
    topicId,
  } = useParams();

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({

    title: "",

    description: "",

    position: "",

  });

  /* ===================================
      Fetch Learning Unit
  =================================== */

  const fetchTopic = async () => {

    setLoading(true);

    const { data, error } = await supabase

      .from("course_topics")

      .select("*")

      .eq("id", topicId)

      .single();

    if (error) {

      console.error(error);

      alert(error.message);

      setLoading(false);

      return;

    }

    setFormData({

      title: data.title || "",

      description:
        data.description || "",

      position:
        data.position || 1,

    });

    setLoading(false);

  };

  /* ===================================
      Initial Load
  =================================== */

  useEffect(() => {

    fetchTopic();

  }, [topicId]);

  /* ===================================
      Handle Inputs
  =================================== */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]: value,

    }));

  };

  /* ===================================
      Save Changes
  =================================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.title.trim()) {

      alert("Learning Unit title is required.");

      return;

    }

    setSaving(true);

    const { error } = await supabase

      .from("course_topics")

      .update({

        title: formData.title,

        description:
          formData.description,

        position:
          Number(formData.position),

      })

      .eq("id", topicId);

    setSaving(false);

    if (error) {

      console.error(error);

      alert(error.message);

      return;

    }

    navigate(

      `/admin/lms/course/${courseId}/topics`

    );

  };
    if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="mt-5 text-slate-400">

            Loading learning unit...

          </p>

        </div>

      </div>
    );
  }

  return (

    <div className="max-w-5xl mx-auto space-y-8">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-white">

            Edit Learning Unit

          </h1>

          <p className="mt-2 text-slate-400">

            Update this learning unit and save your changes.

          </p>

        </div>

        <AdminButton
          variant="secondary"
          icon={<ArrowLeft size={18} />}
          onClick={() =>
            navigate(
              `/admin/lms/course/${courseId}/topics`
            )
          }
        >
          Back
        </AdminButton>

      </div>

      {/* ================= FORM ================= */}

      <form

        onSubmit={handleSubmit}

        className="
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
          p-8
          space-y-8
        "

      >

        {/* Title */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">

            Learning Unit Title

          </label>

          <input

            type="text"

            name="title"

            value={formData.title}

            onChange={handleChange}

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              px-4
              py-3
              text-white
              outline-none
              transition
              focus:border-blue-500
            "

            placeholder="Learning Unit Title"

          />

        </div>

        {/* Description */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">

            Description

          </label>

          <textarea

            rows={6}

            name="description"

            value={formData.description}

            onChange={handleChange}

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              px-4
              py-3
              text-white
              outline-none
              transition
              focus:border-blue-500
            "

            placeholder="Describe this learning unit..."

          />

        </div>

        {/* Position */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">

            Position

          </label>

          <input

            type="number"

            min={1}

            name="position"

            value={formData.position}

            onChange={handleChange}

            className="
              w-40
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              px-4
              py-3
              text-white
              outline-none
              transition
              focus:border-blue-500
            "

          />

        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-4">

          <AdminButton

            type="button"

            variant="secondary"

            onClick={() =>
              navigate(
                `/admin/lms/course/${courseId}/topics`
              )
            }

          >

            Cancel

          </AdminButton>

          <AdminButton

            type="submit"

            icon={<Save size={18} />}

            disabled={saving}

          >

            {saving
              ? "Saving..."
              : "Update Learning Unit"}

          </AdminButton>

        </div>

      </form>

    </div>

  );

};

export default EditTopic;